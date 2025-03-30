import React, { useState } from 'react';
import './App.css';

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: originalUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to shorten URL');
      }

      const data = await response.json();
      setShortUrl(`http://localhost:5000/${data.shortCode}`);
      setError('');
    } catch (err) {
      setError(err.message || 'Error shortening URL');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>URL Shortener</h1>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="Enter URL to shorten"
            required
          />
          <button type="submit">Shorten</button>
        </form>
        
        {error && <p className="error">{error}</p>}
        {shortUrl && (
          <div className="result">
            <p>Short URL: <a href={shortUrl}>{shortUrl}</a></p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
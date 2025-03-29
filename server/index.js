const express = require("express");
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const shortid = require('shortid'); 
dotenv.config({ path: "./config.env" });
const cors = require('cors');
const app = express();

app.get("/", (req, res) => {
  res.send("URL Shortener API");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

mongoose.connect(process.env.CONN_STR).then(() => {
  console.log("DB Connected Successfully");
});

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  accessCount: { type: Number, default: 0 }
});

const Url = mongoose.model('Url', urlSchema);

app.use(express.json());
app.use(cors());

app.post('/shorten', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const shortCode = shortid.generate();
    const newUrl = new Url({
      originalUrl: url,
      shortCode
    });

    await newUrl.save();
    
    res.status(201).json({
      id: newUrl._id,
      url: newUrl.originalUrl,
      shortCode: newUrl.shortCode,
      createdAt: newUrl.createdAt,
      updatedAt: newUrl.updatedAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/:shortCode', async (req, res) => {
  try {
    const url = await Url.findOneAndUpdate(
      { shortCode: req.params.shortCode },
      { $inc: { accessCount: 1 } },
      { new: true }
    );

    if (url) {
      res.redirect(302, url.originalUrl);
    } else {
      res.status(404).json({ error: 'URL not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

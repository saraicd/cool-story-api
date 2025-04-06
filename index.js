require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const StoryEntry = require('./models/StoryEntry');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

//Rate limit- Help protect from DDoS attacks
const postLimiter = rateLimit({
    windowMs: 60 * 15000, 
    max: 1, 
    message: {
      status: 429,
      message: 'Too many submissions. Take your time to think about the next step of the story.',
    },
  });

// Helmet setts various HTTP headers
app.use(helmet());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Error:", err));

// Get test
app.get('/story/test', async (req, res) => {
    res.send("Test successful.")
});

// GET all story entries
app.get('/story/all', async (req, res) => {
    try {
      const entries = await StoryEntry.find().sort({ createdAt: 1 });
      res.json(entries);
    } catch (err) {
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// GET the latest story entry
app.get('/story/latest', async (req, res) => {
  const latest = await StoryEntry.findOne().sort({ createdAt: -1 });
  res.json(latest);
});

// POST Submit a new story entry
app.post('/story/entry', postLimiter, async (req, res) => {
  const { text, previousEntryId } = req.body;

  if (!text) return res.status(400).json({ message: 'Text is required.' });

  const latest = await StoryEntry.findOne().sort({ createdAt: -1 });

  if (latest && latest._id.toString() !== previousEntryId) {
    return res.status(409).json({
      message: 'Someone already added the next part. Please reload the story.',
      latestId: latest._id,
    });
  }

  const newEntry = new StoryEntry({ text, previousEntryId });
  await newEntry.save();

  res.status(201).json(newEntry);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

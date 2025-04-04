require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const StoryEntry = require('./models/StoryEntry');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Error:", err));

// Get the latest story entry
app.get('/story/latest', async (req, res) => {
  const latest = await StoryEntry.findOne().sort({ createdAt: -1 });
  res.json(latest);
});

// Submit a new story entry
app.post('/story/entry', async (req, res) => {
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

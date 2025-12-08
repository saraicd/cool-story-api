const mongoose = require('mongoose');

const storyEntrySchema = new mongoose.Schema({
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  previousEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoryEntry',
    default: null,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  contactEmail: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address'],
  },
});

module.exports = mongoose.model('StoryEntry', storyEntrySchema);

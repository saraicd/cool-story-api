const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  accessCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  maxEntries: {
    type: Number,
    default: null, // null = unlimited
  },
  editCode: {
    type: String,
    uppercase: true,
    trim: true,
    default: null, // Optional - allows limited editing if provided
  },
});

module.exports = mongoose.model('Story', storySchema);

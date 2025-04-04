const mongoose = require('mongoose');

const storyEntrySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 1000,
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
});

module.exports = mongoose.model('StoryEntry', storyEntrySchema);

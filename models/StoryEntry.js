const mongoose = require('mongoose');

const storyEntrySchema = new mongoose.Schema({
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
});

module.exports = mongoose.model('StoryEntry', storyEntrySchema);

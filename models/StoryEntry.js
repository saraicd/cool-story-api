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
  username: {
    type: String,
    required: false, 
  },
  contactEmail: {
    type: String,
    required: false, 
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address'],
  },
});

module.exports = mongoose.model('StoryEntry', storyEntrySchema);

const Story = require('../models/Story');

/**
 * Middleware to validate edit code for a specific story
 * Allows users with the edit code to make limited edits
 */
const editAuth = async (req, res, next) => {
  try {
    const editCode = req.headers['x-edit-code'];
    const { accessCode } = req.params;

    if (!editCode) {
      return res.status(401).json({ message: 'Edit code is required' });
    }

    if (!accessCode) {
      return res.status(400).json({ message: 'Access code is required' });
    }

    // Find the story by access code
    const story = await Story.findOne({ accessCode: accessCode.toUpperCase() });

    if (!story) {
      return res.status(404).json({ message: 'Story not found with that access code' });
    }

    // Check if story has an edit code configured
    if (!story.editCode) {
      return res.status(403).json({ message: 'This story does not allow edit code access' });
    }

    // Validate the edit code
    if (editCode.toUpperCase() !== story.editCode) {
      return res.status(403).json({ message: 'Invalid edit code' });
    }

    // Store the story in the request for use in the route handler
    req.story = story;
    next();
  } catch (error) {
    console.error('Edit auth error:', error);
    res.status(500).json({ message: 'Error validating edit code', error: error.message });
  }
};

module.exports = editAuth;

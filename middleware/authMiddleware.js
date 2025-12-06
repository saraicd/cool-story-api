const Story = require('../models/Story');

// Middleware to validate access code and attach story to request
const validateAccessCode = async (req, res, next) => {
  try {
    const { accessCode } = req.body;

    if (!accessCode) {
      return res.status(401).json({
        message: 'Access code is required to contribute to this story.'
      });
    }

    // Find story by access code
    const story = await Story.findOne({
      accessCode: accessCode.toUpperCase().trim()
    });

    if (!story) {
      return res.status(401).json({
        message: 'Invalid access code. Please check your code and try again.'
      });
    }

    // Check if story is still active
    if (story.status !== 'active') {
      return res.status(403).json({
        message: `This story is ${story.status}. No more contributions allowed.`
      });
    }

    // Attach story to request for use in route handlers
    req.story = story;
    next();
  } catch (error) {
    res.status(500).json({
      message: 'Error validating access code',
      error: error.message
    });
  }
};

module.exports = { validateAccessCode };

// Admin authentication middleware
// Checks for admin API key in request headers

const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];

  if (!adminKey) {
    return res.status(401).json({
      message: 'Admin API key is required. Please provide X-Admin-Key header.',
    });
  }

  if (adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({
      message: 'Invalid admin API key.',
    });
  }

  // Admin authenticated
  next();
};

module.exports = { adminAuth };

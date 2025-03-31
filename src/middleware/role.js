module.exports = (roles = []) => {
  return (req, res, next) => {
    // Ensure roles is an array
    if (typeof roles === 'string') {
      roles = [roles];
    }

    // Check if user has required roles
    if (roles.length > 0 && (!req.user.roles || !req.user.roles.some(role => roles.includes(role)))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have the required role to perform this action'
      });
    }

    next();
  };
}; 
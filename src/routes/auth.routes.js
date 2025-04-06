const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authMiddleware = require('../middleware/auth');

// Import user controller which already has auth functions
const userController = require('../controllers/user.controller');

// Register user
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('phone', 'Phone number is required').not().isEmpty()
  ],
  userController.register
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  userController.login
);

// Get current user (protected)
router.get('/me', authMiddleware, userController.getProfile);

// Forgot password
router.post(
  '/forgot-password',
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  userController.forgotPassword
);

// Reset password
router.put(
  '/reset-password/:resetToken',
  [
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  userController.resetPassword
);

// Change password (protected)
router.put(
  '/change-password',
  [
    authMiddleware,
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ],
  userController.changePassword
);

module.exports = router; 
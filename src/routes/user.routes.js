const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { check } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const uploadMiddleware = require('../middleware/upload');

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

// Get user profile (protected)
router.get('/profile', authMiddleware, userController.getProfile);

// Update user profile (protected)
router.put(
  '/profile',
  authMiddleware,
  uploadMiddleware.single('profileImage'),
  [
    check('name', 'Name is required').optional(),
    check('phone', 'Phone number is required').optional(),
    check('address', 'Address is required').optional(),
    check('city', 'City is required').optional(),
    check('state', 'State is required').optional(),
    check('pincode', 'Pincode is required').optional()
  ],
  userController.updateProfile
);

// Change password (protected)
router.put(
  '/change-password',
  authMiddleware,
  [
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ],
  userController.changePassword
);

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

// Admin routes
// Get all users (admin only)
router.get(
  '/admin/users',
  [authMiddleware, roleMiddleware(['admin'])],
  userController.getAllUsers
);

// Get user by ID (admin only)
router.get(
  '/admin/users/:id',
  [authMiddleware, roleMiddleware(['admin'])],
  userController.getUserById
);

// Update user (admin only)
router.put(
  '/admin/users/:id',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    check('name', 'Name is required').optional(),
    check('email', 'Please include a valid email').optional().isEmail(),
    check('isActive', 'isActive must be a boolean').optional().isBoolean(),
    check('roleIds', 'roleIds must be an array').optional().isArray()
  ],
  userController.updateUser
);

// Delete user (admin only)
router.delete(
  '/admin/users/:id',
  [authMiddleware, roleMiddleware(['admin'])],
  userController.deleteUser
);

module.exports = router; 
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { check } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const uploadMiddleware = require('../middleware/upload');

// Public routes
// Get all categories
router.get('/', categoryController.getAllCategories);

// Get category by ID
router.get('/:id', categoryController.getCategoryById);

// Get category by slug
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// Protected routes (admin only)
// Create category
router.post(
  '/',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    uploadMiddleware.single('image'),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('slug', 'Slug is required').not().isEmpty(),
      check('description', 'Description must be a string').optional().isString(),
      check('isActive', 'isActive must be a boolean').optional().isBoolean()
    ]
  ],
  categoryController.createCategory
);

// Update category
router.put(
  '/:id',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    uploadMiddleware.single('image'),
    [
      check('name', 'Name must be a string').optional().isString(),
      check('slug', 'Slug must be a string').optional().isString(),
      check('description', 'Description must be a string').optional().isString(),
      check('isActive', 'isActive must be a boolean').optional().isBoolean()
    ]
  ],
  categoryController.updateCategory
);

// Delete category
router.delete(
  '/:id',
  [authMiddleware, roleMiddleware(['admin'])],
  categoryController.deleteCategory
);

module.exports = router; 
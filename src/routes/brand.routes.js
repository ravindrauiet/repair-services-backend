const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brand.controller');
const { check } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const uploadMiddleware = require('../middleware/upload');

// Public routes
// Get all brands
router.get('/', brandController.getAllBrands);

// Get brand by ID
router.get('/:id', brandController.getBrandById);

// Get brand by slug
router.get('/slug/:slug', brandController.getBrandBySlug);

// Get brands by category
router.get('/category/:categoryId', brandController.getBrandsByCategory);

// Protected routes (admin only)
// Create brand
router.post(
  '/',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    uploadMiddleware.single('logo'),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('slug', 'Slug is required').not().isEmpty(),
      check('description', 'Description must be a string').optional().isString(),
      check('isActive', 'isActive must be a boolean').optional().isBoolean()
    ]
  ],
  brandController.createBrand
);

// Update brand
router.put(
  '/:id',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    uploadMiddleware.single('logo'),
    [
      check('name', 'Name must be a string').optional().isString(),
      check('slug', 'Slug must be a string').optional().isString(),
      check('description', 'Description must be a string').optional().isString(),
      check('isActive', 'isActive must be a boolean').optional().isBoolean()
    ]
  ],
  brandController.updateBrand
);

// Delete brand
router.delete(
  '/:id',
  [authMiddleware, roleMiddleware(['admin'])],
  brandController.deleteBrand
);

module.exports = router; 
const express = require('express');
const router = express.Router();
const deviceModelController = require('../controllers/deviceModel.controller');
const { check } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const uploadMiddleware = require('../middleware/upload');

// Public routes
// Get all device models
router.get('/', deviceModelController.getAllDeviceModels);

// Get device model by ID
router.get('/:id', deviceModelController.getDeviceModelById);

// Get device model by slug
router.get('/slug/:slug', deviceModelController.getDeviceModelBySlug);

// Get device models by brand
router.get('/brand/:brandId', deviceModelController.getDeviceModelsByBrand);

// Get device models by brand and category
router.get('/brand/:brandId/category/:categoryId', deviceModelController.getDeviceModelsByBrandAndCategory);

// Protected routes (admin only)
// Create device model
router.post(
  '/',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    uploadMiddleware.single('image'),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('slug', 'Slug is required').not().isEmpty(),
      check('brandId', 'Brand ID is required').isNumeric(),
      check('categoryId', 'Category ID is required').isNumeric(),
      check('description', 'Description must be a string').optional().isString(),
      check('specifications', 'Specifications must be a string').optional().isString(),
      check('isActive', 'isActive must be a boolean').optional().isBoolean()
    ]
  ],
  deviceModelController.createDeviceModel
);

// Update device model
router.put(
  '/:id',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    uploadMiddleware.single('image'),
    [
      check('name', 'Name must be a string').optional().isString(),
      check('slug', 'Slug must be a string').optional().isString(),
      check('brandId', 'Brand ID must be numeric').optional().isNumeric(),
      check('categoryId', 'Category ID must be numeric').optional().isNumeric(),
      check('description', 'Description must be a string').optional().isString(),
      check('specifications', 'Specifications must be a string').optional().isString(),
      check('isActive', 'isActive must be a boolean').optional().isBoolean()
    ]
  ],
  deviceModelController.updateDeviceModel
);

// Delete device model
router.delete(
  '/:id',
  [authMiddleware, roleMiddleware(['admin'])],
  deviceModelController.deleteDeviceModel
);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const uploadMiddleware = require('../middleware/upload');

// We'll use the existing deviceModel controller
const deviceModelController = require('../controllers/deviceModel.controller');

// Public routes
// Get all models
router.get('/', deviceModelController.getAllDeviceModels);

// Get a single model by ID
router.get('/:id', deviceModelController.getDeviceModelById);

// Get models by brand
router.get('/brand/:brandId', deviceModelController.getDeviceModelsByBrand);

// Admin routes
// Create model routes are already in deviceModel.routes.js but we'll add them here for API consistency
router.post(
  '/',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    uploadMiddleware.single('image'),
    check('name', 'Name is required').not().isEmpty(),
    check('brandId', 'Brand ID is required').not().isEmpty()
  ],
  deviceModelController.createDeviceModel
);

router.put(
  '/:id',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    uploadMiddleware.single('image'),
    check('name', 'Name is required if provided').optional()
  ],
  deviceModelController.updateDeviceModel
);

router.delete(
  '/:id',
  [authMiddleware, roleMiddleware(['admin'])],
  deviceModelController.deleteDeviceModel
);

module.exports = router; 
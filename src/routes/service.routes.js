const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const uploadMiddleware = require('../middleware/upload');

// We'll create this controller next
const serviceController = require('../controllers/service.controller');

// Public routes
// Get all services
router.get('/', serviceController.getAllServices);

// Get a single service by ID
router.get('/:id', serviceController.getServiceById);

// Get services by category
router.get('/category/:categoryId', serviceController.getServicesByCategory);

// Get services by device model
router.get('/model/:modelId', serviceController.getServicesByModel);

// Admin routes
// Create a new service (admin only)
router.post(
  '/',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    uploadMiddleware.single('image'),
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('price', 'Price is required and must be a number').isNumeric(),
    check('categoryId', 'Category ID is required').not().isEmpty()
  ],
  serviceController.createService
);

// Update a service (admin only)
router.put(
  '/:id',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    uploadMiddleware.single('image'),
    check('name', 'Name is required').optional(),
    check('description', 'Description is required').optional(),
    check('price', 'Price must be a number').optional().isNumeric(),
    check('categoryId', 'Category ID is required').optional()
  ],
  serviceController.updateService
);

// Delete a service (admin only)
router.delete(
  '/:id',
  [authMiddleware, roleMiddleware(['admin'])],
  serviceController.deleteService
);

module.exports = router; 
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const { check } = require('express-validator');

// Import controllers
const brandController = require('../controllers/brand.controller');
const categoryController = require('../controllers/category.controller');
const deviceModelController = require('../controllers/deviceModel.controller');
const userController = require('../controllers/user.controller');

// We'll create this controller next
const adminController = require('../controllers/admin.controller');

// Admin dashboard stats
router.get(
  '/stats',
  [authMiddleware, roleMiddleware(['admin'])],
  adminController.getAdminStats
);

// Admin brand management routes
router.get('/brands', [authMiddleware, roleMiddleware(['admin'])], brandController.getAllBrands);
router.post(
  '/brands',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    check('name', 'Brand name is required').not().isEmpty()
  ],
  brandController.createBrand
);
router.put(
  '/brands/:id',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    check('name', 'Brand name is required').not().isEmpty()
  ],
  brandController.updateBrand
);
router.delete(
  '/brands/:id',
  [authMiddleware, roleMiddleware(['admin'])],
  brandController.deleteBrand
);

// Admin category management routes
router.get('/categories', [authMiddleware, roleMiddleware(['admin'])], categoryController.getAllCategories);
router.post(
  '/categories',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    check('name', 'Category name is required').not().isEmpty()
  ],
  categoryController.createCategory
);
router.put(
  '/categories/:id',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    check('name', 'Category name is required').not().isEmpty()
  ],
  categoryController.updateCategory
);
router.delete(
  '/categories/:id',
  [authMiddleware, roleMiddleware(['admin'])],
  categoryController.deleteCategory
);

// Admin device model management routes
router.get('/models', [authMiddleware, roleMiddleware(['admin'])], deviceModelController.getAllDeviceModels);
router.post(
  '/models',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    check('name', 'Model name is required').not().isEmpty(),
    check('brandId', 'Brand ID is required').not().isEmpty()
  ],
  deviceModelController.createDeviceModel
);
router.put(
  '/models/:id',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    check('name', 'Model name is required').optional()
  ],
  deviceModelController.updateDeviceModel
);
router.delete(
  '/models/:id',
  [authMiddleware, roleMiddleware(['admin'])],
  deviceModelController.deleteDeviceModel
);

// Admin user management routes (these are also in user.routes.js but can be accessed here for convenience)
router.get('/users', [authMiddleware, roleMiddleware(['admin'])], userController.getAllUsers);
router.get('/users/:id', [authMiddleware, roleMiddleware(['admin'])], userController.getUserById);
router.put(
  '/users/:id',
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
router.delete('/users/:id', [authMiddleware, roleMiddleware(['admin'])], userController.deleteUser);

module.exports = router; 
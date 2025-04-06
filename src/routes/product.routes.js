const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const uploadMiddleware = require('../middleware/upload');

// We'll create this controller next
const productController = require('../controllers/product.controller');

// Public routes
// Get all products
router.get('/', productController.getAllProducts);

// Get a single product by ID
router.get('/:id', productController.getProductById);

// Get products by category
router.get('/category/:categoryId', productController.getProductsByCategory);

// Get products by brand
router.get('/brand/:brandId', productController.getProductsByBrand);

// Get featured products
router.get('/featured/list', productController.getFeaturedProducts);

// Search products
router.get('/search/:query', productController.searchProducts);

// Admin routes
// Create a new product (admin only)
router.post(
  '/',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    uploadMiddleware.array('images', 5),
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('price', 'Price is required and must be a number').isNumeric(),
    check('stockQuantity', 'Stock quantity is required and must be a number').isNumeric(),
    check('categoryId', 'Category ID is required').not().isEmpty(),
    check('brandId', 'Brand ID is required').not().isEmpty()
  ],
  productController.createProduct
);

// Update a product (admin only)
router.put(
  '/:id',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    uploadMiddleware.array('images', 5),
    check('name', 'Name is required').optional(),
    check('description', 'Description is required').optional(),
    check('price', 'Price must be a number').optional().isNumeric(),
    check('stockQuantity', 'Stock quantity must be a number').optional().isNumeric(),
    check('categoryId', 'Category ID is required').optional(),
    check('brandId', 'Brand ID is required').optional(),
    check('isFeatured', 'isFeatured must be a boolean').optional().isBoolean()
  ],
  productController.updateProduct
);

// Delete a product (admin only)
router.delete(
  '/:id',
  [authMiddleware, roleMiddleware(['admin'])],
  productController.deleteProduct
);

// Delete a product image (admin only)
router.delete(
  '/:productId/images/:imageId',
  [authMiddleware, roleMiddleware(['admin'])],
  productController.deleteProductImage
);

module.exports = router; 
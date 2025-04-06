const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authMiddleware = require('../middleware/auth');

// We'll create this controller next
const cartController = require('../controllers/cart.controller');

// User routes (protected)
// Get cart items
router.get('/', authMiddleware, cartController.getCart);

// Add product to cart
router.post(
  '/',
  [
    authMiddleware,
    check('productId', 'Product ID is required').not().isEmpty(),
    check('quantity', 'Quantity is required and must be a number').isInt({ min: 1 }),
    check('variant', 'Variant must be a string if provided').optional().isString()
  ],
  cartController.addToCart
);

// Update product quantity in cart
router.put(
  '/:productId',
  [
    authMiddleware,
    check('quantity', 'Quantity is required and must be a number').isInt({ min: 1 }),
    check('variant', 'Variant must be a string if provided').optional().isString()
  ],
  cartController.updateCartItem
);

// Remove product from cart
router.delete(
  '/:productId',
  [
    authMiddleware,
    check('variant', 'Variant must be a string if provided').optional().isString()
  ],
  cartController.removeFromCart
);

// Clear cart
router.delete('/', authMiddleware, cartController.clearCart);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authMiddleware = require('../middleware/auth');

// We'll create this controller next
const wishlistController = require('../controllers/wishlist.controller');

// User routes (protected)
// Get wishlist items
router.get('/', authMiddleware, wishlistController.getWishlist);

// Add product to wishlist
router.post(
  '/',
  [
    authMiddleware,
    check('productId', 'Product ID is required').not().isEmpty()
  ],
  wishlistController.addToWishlist
);

// Remove product from wishlist
router.delete(
  '/:productId',
  authMiddleware,
  wishlistController.removeFromWishlist
);

// Clear wishlist
router.delete('/', authMiddleware, wishlistController.clearWishlist);

module.exports = router; 
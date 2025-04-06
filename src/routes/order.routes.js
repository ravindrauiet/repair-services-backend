const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// We'll create this controller next
const orderController = require('../controllers/order.controller');

// User routes (protected)
// Create a new order
router.post(
  '/',
  [
    authMiddleware,
    check('items', 'Items are required').isArray({ min: 1 }),
    check('items.*.productId', 'Product ID is required').not().isEmpty(),
    check('items.*.quantity', 'Quantity is required and must be a number').isNumeric(),
    check('shippingAddress', 'Shipping address is required').not().isEmpty()
  ],
  orderController.createOrder
);

// Get all orders for current user
router.get('/me', authMiddleware, orderController.getUserOrders);

// Get a single order by ID for current user
router.get(
  '/:id',
  authMiddleware,
  orderController.getOrderById
);

// Cancel order
router.put(
  '/:id/cancel',
  authMiddleware,
  orderController.cancelOrder
);

// Admin routes
// Get all orders (admin only)
router.get(
  '/admin/orders',
  [authMiddleware, roleMiddleware(['admin'])],
  orderController.getAllOrders
);

// Update order status (admin only)
router.put(
  '/admin/:id/status',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    check('status', 'Status is required').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  ],
  orderController.updateOrderStatus
);

module.exports = router; 
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Import controllers
// We'll create this next
const dashboardController = require('../controllers/dashboard.controller');

// User dashboard routes
router.get(
  '/user/stats',
  authMiddleware,
  dashboardController.getUserDashboardStats
);

router.get(
  '/user/bookings',
  authMiddleware,
  dashboardController.getUserBookings
);

router.get(
  '/user/orders',
  authMiddleware,
  dashboardController.getUserOrders
);

router.get(
  '/user/wishlist',
  authMiddleware,
  dashboardController.getUserWishlist
);

// Admin dashboard routes (also available in admin.routes.js)
router.get(
  '/admin/stats',
  [authMiddleware, roleMiddleware(['admin'])],
  dashboardController.getAdminDashboardStats
);

module.exports = router; 
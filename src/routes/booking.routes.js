const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// We'll create this controller next
const bookingController = require('../controllers/booking.controller');

// Create a new booking (protected)
router.post(
  '/',
  [
    authMiddleware,
    check('serviceId', 'Service ID is required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
    check('time', 'Time is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty()
  ],
  bookingController.createBooking
);

// Get all bookings for current user (protected)
router.get('/me', authMiddleware, bookingController.getUserBookings);

// Get a single booking by ID (protected)
router.get(
  '/:id',
  authMiddleware,
  bookingController.getBookingById
);

// Update booking status (protected)
router.put(
  '/:id/status',
  [
    authMiddleware,
    check('status', 'Status is required').isIn(['pending', 'confirmed', 'cancelled', 'completed', 'in-progress'])
  ],
  bookingController.updateBookingStatus
);

// Cancel booking (protected)
router.put(
  '/:id/cancel',
  authMiddleware,
  bookingController.cancelBooking
);

// Admin routes
// Get all bookings (admin only)
router.get(
  '/admin/bookings',
  [authMiddleware, roleMiddleware(['admin'])],
  bookingController.getAllBookings
);

// Admin update booking
router.put(
  '/admin/:id',
  [
    authMiddleware,
    roleMiddleware(['admin']),
    check('status', 'Status is required').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed', 'in-progress']),
    check('notes', 'Notes must be a string').optional().isString()
  ],
  bookingController.adminUpdateBooking
);

module.exports = router; 
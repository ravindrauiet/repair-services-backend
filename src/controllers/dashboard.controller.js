const { User, Order, Booking, Product, Service, Wishlist, WishlistItem } = require('../models');
const { Op } = require('sequelize');

// Get user dashboard statistics
exports.getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user-related counts in parallel
    const [
      bookingCount,
      completedBookingCount,
      activeBookingCount,
      orderCount,
      wishlistCount
    ] = await Promise.all([
      // All bookings count
      Booking.count({
        where: { userId }
      }),
      // Completed bookings count
      Booking.count({
        where: { 
          userId,
          status: 'completed'
        }
      }),
      // Active bookings count
      Booking.count({
        where: { 
          userId,
          status: 'active'
        }
      }),
      // Orders count
      Order.count({
        where: { userId }
      }),
      // Wishlist items count
      WishlistItem.count({
        include: [{
          model: Wishlist,
          where: { userId }
        }]
      })
    ]);

    // Get recent bookings
    const recentBookings = await Booking.findAll({
      where: { userId },
      limit: 3,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Service,
          attributes: ['id', 'name', 'price', 'description']
        }
      ]
    });

    // Get recent orders
    const recentOrders = await Order.findAll({
      where: { userId },
      limit: 3,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      stats: {
        bookings: {
          total: bookingCount,
          completed: completedBookingCount,
          active: activeBookingCount
        },
        orders: {
          total: orderCount
        },
        wishlist: {
          total: wishlistCount
        },
        recentActivity: {
          bookings: recentBookings,
          orders: recentOrders
        }
      }
    });
  } catch (error) {
    console.error('Error getting user dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const bookings = await Booking.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Service,
          attributes: ['id', 'name', 'price', 'description']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user wishlist
exports.getUserWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find or create user's wishlist
    const [wishlist] = await Wishlist.findOrCreate({
      where: { userId }
    });

    // Get wishlist items
    const wishlistItems = await WishlistItem.findAll({
      where: { wishlistId: wishlist.id },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'price', 'description', 'image']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: wishlistItems.length,
      wishlistItems
    });
  } catch (error) {
    console.error('Error getting user wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get admin dashboard statistics - forwards to admin controller
exports.getAdminDashboardStats = async (req, res) => {
  try {
    // Import admin controller and forward request
    const adminController = require('./admin.controller');
    return adminController.getAdminStats(req, res);
  } catch (error) {
    console.error('Error in admin dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 
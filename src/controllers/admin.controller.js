const { User, Order, Booking, Product, Service, Brand, Category, DeviceModel } = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

// Get admin dashboard statistics
exports.getAdminStats = async (req, res) => {
  try {
    // Get date for filtering recent data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all counts in parallel
    const [
      userCount, 
      recentUserCount,
      orderCount,
      recentOrderCount,
      bookingCount,
      recentBookingCount,
      productCount,
      serviceCount,
      brandCount,
      categoryCount,
      modelCount,
      // Get revenue data
      totalRevenue,
      recentRevenue
    ] = await Promise.all([
      // Users
      User.count(),
      User.count({
        where: {
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      }),
      // Orders
      Order.count(),
      Order.count({
        where: {
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      }),
      // Bookings
      Booking.count(),
      Booking.count({
        where: {
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      }),
      // Products
      Product.count(),
      // Services
      Service.count(),
      // Brands
      Brand.count(),
      // Categories
      Category.count(),
      // Models
      DeviceModel.count(),
      // Total revenue
      Order.sum('totalAmount'),
      // Recent revenue
      Order.sum('totalAmount', {
        where: {
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      })
    ]);

    // Get recent bookings for display
    const recentBookings = await Booking.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: Service,
          attributes: ['id', 'name', 'price']
        }
      ]
    });

    // Get recent orders for display
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Return all stats
    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: userCount,
          recent: recentUserCount
        },
        orders: {
          total: orderCount,
          recent: recentOrderCount
        },
        bookings: {
          total: bookingCount,
          recent: recentBookingCount
        },
        products: {
          total: productCount
        },
        services: {
          total: serviceCount
        },
        brands: {
          total: brandCount
        },
        categories: {
          total: categoryCount
        },
        deviceModels: {
          total: modelCount
        },
        revenue: {
          total: totalRevenue || 0,
          recent: recentRevenue || 0
        },
        recentActivity: {
          bookings: recentBookings,
          orders: recentOrders
        }
      }
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 
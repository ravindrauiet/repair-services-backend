const { Wishlist, WishlistItem, Product } = require('../models');
const { validationResult } = require('express-validator');

// Get wishlist items
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find or create user's wishlist
    const [wishlist] = await Wishlist.findOrCreate({
      where: { userId }
    });

    // Get wishlist items with product details
    const wishlistItems = await WishlistItem.findAll({
      where: { wishlistId: wishlist.id },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'description', 'image']
      }]
    });

    res.status(200).json({
      success: true,
      count: wishlistItems.length,
      wishlistItems
    });
  } catch (error) {
    console.error('Error getting wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { productId } = req.body;
    const userId = req.user.id;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find or create user's wishlist
    const [wishlist] = await Wishlist.findOrCreate({
      where: { userId }
    });

    // Check if product is already in wishlist
    const existingItem = await WishlistItem.findOne({
      where: {
        wishlistId: wishlist.id,
        productId
      }
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add product to wishlist
    const wishlistItem = await WishlistItem.create({
      wishlistId: wishlist.id,
      productId
    });

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      wishlistItem
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user.id;

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({
      where: { userId }
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Remove product from wishlist
    const deleted = await WishlistItem.destroy({
      where: {
        wishlistId: wishlist.id,
        productId
      }
    });

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({
      where: { userId }
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Delete all wishlist items
    await WishlistItem.destroy({
      where: { wishlistId: wishlist.id }
    });

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared'
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 
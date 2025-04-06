const db = require('../models');
const { validationResult } = require('express-validator');
const Cart = db.Cart;
const Product = db.Product;

// Get cart items for the current user
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find or create a cart for the user
    const [cart, created] = await Cart.findOrCreate({
      where: { userId },
      defaults: { items: [] }
    });

    // If we need to fetch more detailed product info
    let cartWithDetails = { items: [] };
    
    if (cart.items && cart.items.length > 0) {
      // Get product details for each item in the cart
      const productIds = cart.items.map(item => item.productId);
      const products = await Product.findAll({
        where: { id: productIds }
      });
      
      const productMap = {};
      products.forEach(product => {
        productMap[product.id] = product;
      });
      
      // Combine cart items with product details
      cartWithDetails.items = cart.items.map(item => {
        const product = productMap[item.productId] || {};
        return {
          ...item,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            // Add any other needed product fields
          }
        };
      });
    }

    return res.status(200).json({
      success: true,
      cart: cartWithDetails
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add a product to cart
exports.addToCart = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { productId, quantity, variant } = req.body;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find or create cart
    const [cart, created] = await Cart.findOrCreate({
      where: { userId },
      defaults: { items: [] }
    });

    // Check if product already exists in cart
    const items = cart.items || [];
    const existingItemIndex = items.findIndex(item => 
      item.productId === productId && 
      (variant ? item.variant === variant : !item.variant)
    );

    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      items.push({
        productId,
        quantity,
        variant: variant || null,
        price: product.price, // Store the current price
        name: product.name,   // Store the product name
        image: product.image  // Store the product image
      });
    }

    // Update cart
    await cart.update({ items });

    return res.status(200).json({
      success: true,
      message: 'Product added to cart',
      cart: { items }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const productId = req.params.productId;
    const { quantity, variant } = req.body;

    // Find cart
    const cart = await Cart.findOne({
      where: { userId }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Update quantity
    const items = cart.items || [];
    const itemIndex = items.findIndex(item => 
      item.productId === productId && 
      (variant ? item.variant === variant : !item.variant)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    items[itemIndex].quantity = quantity;

    // Update cart
    await cart.update({ items });

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: { items }
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    const { variant } = req.body;

    // Find cart
    const cart = await Cart.findOne({
      where: { userId }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item
    const items = cart.items || [];
    const updatedItems = items.filter(item => 
      !(item.productId === productId && 
        (variant ? item.variant === variant : !item.variant))
    );

    // Update cart
    await cart.update({ items: updatedItems });

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: { items: updatedItems }
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find cart
    const cart = await Cart.findOne({
      where: { userId }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Clear items
    await cart.update({ items: [] });

    return res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart: { items: [] }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 
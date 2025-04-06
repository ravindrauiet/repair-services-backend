const { Product, Category, Brand, ProductImage } = require('../models');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { limit, page, sort } = req.query;
    
    // Set up pagination
    const pageSize = limit ? parseInt(limit) : 10;
    const currentPage = page ? parseInt(page) : 1;
    const offset = (currentPage - 1) * pageSize;
    
    // Set up sorting
    let order = [['createdAt', 'DESC']];
    if (sort) {
      const [field, direction] = sort.split(':');
      order = [[field, direction.toUpperCase()]];
    }

    // Get products with count
    const { count, rows: products } = await Product.findAndCountAll({
      limit: pageSize,
      offset: offset,
      order: order,
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: Brand,
          attributes: ['id', 'name', 'logo']
        },
        {
          model: ProductImage,
          attributes: ['id', 'url']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / pageSize),
      currentPage,
      products
    });
  } catch (error) {
    console.error('Error getting all products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: Brand,
          attributes: ['id', 'name', 'logo']
        },
        {
          model: ProductImage,
          attributes: ['id', 'url']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error getting product by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const products = await Product.findAll({
      where: { categoryId },
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: Brand,
          attributes: ['id', 'name', 'logo']
        },
        {
          model: ProductImage,
          attributes: ['id', 'url']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: products.length,
      category: category.name,
      products
    });
  } catch (error) {
    console.error('Error getting products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get products by brand
exports.getProductsByBrand = async (req, res) => {
  try {
    const brandId = req.params.brandId;

    // Check if brand exists
    const brand = await Brand.findByPk(brandId);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    const products = await Product.findAll({
      where: { brandId },
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: Brand,
          attributes: ['id', 'name', 'logo']
        },
        {
          model: ProductImage,
          attributes: ['id', 'url']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: products.length,
      brand: brand.name,
      products
    });
  } catch (error) {
    console.error('Error getting products by brand:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isFeatured: true },
      limit: 8,
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: Brand,
          attributes: ['id', 'name', 'logo']
        },
        {
          model: ProductImage,
          attributes: ['id', 'url']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error getting featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const query = req.params.query;

    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } }
        ]
      },
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: Brand,
          attributes: ['id', 'name', 'logo']
        },
        {
          model: ProductImage,
          attributes: ['id', 'url']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new product (admin only)
exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, description, price, stockQuantity, categoryId, brandId, isFeatured } = req.body;
    
    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      stockQuantity,
      categoryId,
      brandId,
      isFeatured: isFeatured === 'true' || isFeatured === true
    });

    // Process file uploads
    if (req.files && req.files.length > 0) {
      const productImages = req.files.map(file => ({
        productId: product.id,
        url: file.path
      }));

      await ProductImage.bulkCreate(productImages);
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update a product (admin only)
exports.updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const productId = req.params.id;
    const { name, description, price, stockQuantity, categoryId, brandId, isFeatured } = req.body;

    // Find product
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product details
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stockQuantity !== undefined) product.stockQuantity = stockQuantity;
    if (categoryId) product.categoryId = categoryId;
    if (brandId) product.brandId = brandId;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;

    await product.save();

    // Process file uploads
    if (req.files && req.files.length > 0) {
      const productImages = req.files.map(file => ({
        productId: product.id,
        url: file.path
      }));

      await ProductImage.bulkCreate(productImages);
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Find product
    const product = await Product.findByPk(productId, {
      include: [ProductImage]
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete product images from filesystem
    if (product.ProductImages && product.ProductImages.length > 0) {
      product.ProductImages.forEach(image => {
        try {
          fs.unlinkSync(image.url);
        } catch (err) {
          console.error('Error deleting image file:', err);
        }
      });
    }

    // Delete product
    await product.destroy();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a product image (admin only)
exports.deleteProductImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;

    // Find image
    const image = await ProductImage.findOne({
      where: {
        id: imageId,
        productId
      }
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete image from filesystem
    try {
      fs.unlinkSync(image.url);
    } catch (err) {
      console.error('Error deleting image file:', err);
    }

    // Delete image from database
    await image.destroy();

    res.status(200).json({
      success: true,
      message: 'Product image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 
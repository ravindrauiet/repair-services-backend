const db = require('../models');
const Brand = db.Brand;
const { validationResult } = require('express-validator');
const fs = require('fs');

// Get all brands
exports.getAllBrands = async (req, res) => {
  try {
    // Query parameters for filtering
    const { isActive } = req.query;
    const whereClause = {};
    
    // Filter by active status if provided
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }
    
    const brands = await Brand.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: brands.length,
      brands
    });
  } catch (error) {
    console.error('Error getting brands:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get brand by ID
exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    res.status(200).json({
      success: true,
      brand
    });
  } catch (error) {
    console.error('Error getting brand by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get brand by slug
exports.getBrandBySlug = async (req, res) => {
  try {
    const brand = await Brand.findOne({
      where: { slug: req.params.slug }
    });
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    res.status(200).json({
      success: true,
      brand
    });
  } catch (error) {
    console.error('Error getting brand by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get brands by category
exports.getBrandsByCategory = async (req, res) => {
  try {
    // Get all brands with devices for this category
    const brands = await Brand.findAll({
      include: [{
        model: db.DeviceModel,
        where: { categoryId: req.params.categoryId },
        required: true
      }],
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: brands.length,
      brands
    });
  } catch (error) {
    console.error('Error getting brands by category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new brand
exports.createBrand = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { name, slug, description, isActive } = req.body;
    
    // Check if brand with same name or slug already exists
    const existingBrand = await Brand.findOne({
      where: { 
        [db.Sequelize.Op.or]: [
          { name },
          { slug }
        ]
      }
    });
    
    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: 'Brand with this name or slug already exists'
      });
    }
    
    // Create brand object
    const brandData = {
      name,
      slug,
      description,
      isActive: isActive !== undefined ? isActive : true
    };
    
    // Add logo path if file was uploaded
    if (req.file) {
      brandData.logo = req.file.path.replace(/\\/g, '/');
    }
    
    // Create new brand
    const brand = await Brand.create(brandData);
    
    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      brand
    });
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update brand
exports.updateBrand = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { name, slug, description, isActive } = req.body;
    
    // Check if brand exists
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    // Check if updated name or slug conflicts with existing brands
    if (name !== brand.name || slug !== brand.slug) {
      const existingBrand = await Brand.findOne({
        where: {
          [db.Sequelize.Op.and]: [
            { id: { [db.Sequelize.Op.ne]: req.params.id } },
            {
              [db.Sequelize.Op.or]: [
                { name },
                { slug }
              ]
            }
          ]
        }
      });
      
      if (existingBrand) {
        return res.status(400).json({
          success: false,
          message: 'Brand with this name or slug already exists'
        });
      }
    }
    
    // Update brand fields
    if (name) brand.name = name;
    if (slug) brand.slug = slug;
    if (description !== undefined) brand.description = description;
    if (isActive !== undefined) brand.isActive = isActive;
    
    // Handle logo update
    if (req.file) {
      // Remove old logo if exists
      if (brand.logo && fs.existsSync(brand.logo)) {
        fs.unlinkSync(brand.logo);
      }
      
      // Set new logo path
      brand.logo = req.file.path.replace(/\\/g, '/');
    }
    
    // Save changes
    await brand.save();
    
    res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      brand
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete brand
exports.deleteBrand = async (req, res) => {
  try {
    // Check if brand exists
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    // Check if brand has associated device models
    const deviceModelsCount = await db.DeviceModel.count({ where: { brandId: req.params.id } });
    if (deviceModelsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete brand with associated device models'
      });
    }
    
    // Remove logo file if exists
    if (brand.logo && fs.existsSync(brand.logo)) {
      fs.unlinkSync(brand.logo);
    }
    
    // Delete brand
    await brand.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 
const db = require('../models');
const DeviceModel = db.DeviceModel;
const Brand = db.Brand;
const Category = db.Category;
const { validationResult } = require('express-validator');
const fs = require('fs');

// Get all device models
exports.getAllDeviceModels = async (req, res) => {
  try {
    // Query parameters for filtering
    const { brandId, categoryId, isActive } = req.query;
    const whereClause = {};
    
    // Filter by brand if provided
    if (brandId) {
      whereClause.brandId = brandId;
    }
    
    // Filter by category if provided
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    // Filter by active status if provided
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }
    
    const deviceModels = await DeviceModel.findAll({
      where: whereClause,
      include: [
        { model: Brand },
        { model: Category }
      ],
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: deviceModels.length,
      deviceModels
    });
  } catch (error) {
    console.error('Error getting device models:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get device model by ID
exports.getDeviceModelById = async (req, res) => {
  try {
    const deviceModel = await DeviceModel.findByPk(req.params.id, {
      include: [
        { model: Brand },
        { model: Category }
      ]
    });
    
    if (!deviceModel) {
      return res.status(404).json({
        success: false,
        message: 'Device model not found'
      });
    }
    
    res.status(200).json({
      success: true,
      deviceModel
    });
  } catch (error) {
    console.error('Error getting device model by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get device model by slug
exports.getDeviceModelBySlug = async (req, res) => {
  try {
    const deviceModel = await DeviceModel.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: Brand },
        { model: Category }
      ]
    });
    
    if (!deviceModel) {
      return res.status(404).json({
        success: false,
        message: 'Device model not found'
      });
    }
    
    res.status(200).json({
      success: true,
      deviceModel
    });
  } catch (error) {
    console.error('Error getting device model by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get device models by brand
exports.getDeviceModelsByBrand = async (req, res) => {
  try {
    const deviceModels = await DeviceModel.findAll({
      where: { brandId: req.params.brandId },
      include: [
        { model: Brand },
        { model: Category }
      ],
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: deviceModels.length,
      deviceModels
    });
  } catch (error) {
    console.error('Error getting device models by brand:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get device models by brand and category
exports.getDeviceModelsByBrandAndCategory = async (req, res) => {
  try {
    const deviceModels = await DeviceModel.findAll({
      where: { 
        brandId: req.params.brandId,
        categoryId: req.params.categoryId
      },
      include: [
        { model: Brand },
        { model: Category }
      ],
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: deviceModels.length,
      deviceModels
    });
  } catch (error) {
    console.error('Error getting device models by brand and category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new device model
exports.createDeviceModel = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { name, slug, description, specifications, brandId, categoryId, isActive } = req.body;
    
    // Check if device model with same name or slug already exists
    const existingDeviceModel = await DeviceModel.findOne({
      where: { 
        [db.Sequelize.Op.or]: [
          { name, brandId },
          { slug }
        ]
      }
    });
    
    if (existingDeviceModel) {
      return res.status(400).json({
        success: false,
        message: 'Device model with this name or slug already exists'
      });
    }
    
    // Verify brand exists
    const brand = await Brand.findByPk(brandId);
    if (!brand) {
      return res.status(400).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    // Verify category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Create device model object
    const deviceModelData = {
      name,
      slug,
      description,
      specifications,
      brandId,
      categoryId,
      isActive: isActive !== undefined ? isActive : true
    };
    
    // Add image path if file was uploaded
    if (req.file) {
      deviceModelData.image = req.file.path.replace(/\\/g, '/');
    }
    
    // Create new device model
    const deviceModel = await DeviceModel.create(deviceModelData);
    
    // Fetch with associations for response
    const createdDeviceModel = await DeviceModel.findByPk(deviceModel.id, {
      include: [
        { model: Brand },
        { model: Category }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Device model created successfully',
      deviceModel: createdDeviceModel
    });
  } catch (error) {
    console.error('Error creating device model:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update device model
exports.updateDeviceModel = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { name, slug, description, specifications, brandId, categoryId, isActive } = req.body;
    
    // Check if device model exists
    const deviceModel = await DeviceModel.findByPk(req.params.id);
    if (!deviceModel) {
      return res.status(404).json({
        success: false,
        message: 'Device model not found'
      });
    }
    
    // Check if updated name or slug conflicts with existing device models
    if ((name !== deviceModel.name && brandId === deviceModel.brandId) || 
        (brandId !== deviceModel.brandId && name === deviceModel.name) ||
        slug !== deviceModel.slug) {
      
      const existingDeviceModel = await DeviceModel.findOne({
        where: {
          [db.Sequelize.Op.and]: [
            { id: { [db.Sequelize.Op.ne]: req.params.id } },
            {
              [db.Sequelize.Op.or]: [
                { name, brandId: brandId || deviceModel.brandId },
                { slug }
              ]
            }
          ]
        }
      });
      
      if (existingDeviceModel) {
        return res.status(400).json({
          success: false,
          message: 'Device model with this name or slug already exists'
        });
      }
    }
    
    // Verify brand exists if changing
    if (brandId && brandId !== deviceModel.brandId) {
      const brand = await Brand.findByPk(brandId);
      if (!brand) {
        return res.status(400).json({
          success: false,
          message: 'Brand not found'
        });
      }
    }
    
    // Verify category exists if changing
    if (categoryId && categoryId !== deviceModel.categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
    }
    
    // Update device model fields
    if (name) deviceModel.name = name;
    if (slug) deviceModel.slug = slug;
    if (description !== undefined) deviceModel.description = description;
    if (specifications !== undefined) deviceModel.specifications = specifications;
    if (brandId) deviceModel.brandId = brandId;
    if (categoryId) deviceModel.categoryId = categoryId;
    if (isActive !== undefined) deviceModel.isActive = isActive;
    
    // Handle image update
    if (req.file) {
      // Remove old image if exists
      if (deviceModel.image && fs.existsSync(deviceModel.image)) {
        fs.unlinkSync(deviceModel.image);
      }
      
      // Set new image path
      deviceModel.image = req.file.path.replace(/\\/g, '/');
    }
    
    // Save changes
    await deviceModel.save();
    
    // Fetch with associations for response
    const updatedDeviceModel = await DeviceModel.findByPk(deviceModel.id, {
      include: [
        { model: Brand },
        { model: Category }
      ]
    });
    
    res.status(200).json({
      success: true,
      message: 'Device model updated successfully',
      deviceModel: updatedDeviceModel
    });
  } catch (error) {
    console.error('Error updating device model:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// In src/controllers/deviceModel.controller.js
// Add this function if it doesn't exist:

exports.getAllModels = async (req, res) => {
  try {
    const models = await DeviceModel.findAll({
      include: [
        { model: Brand },
        { model: Category }
      ]
    });
    
    res.json({
      success: true,
      models
    });
  } catch (err) {
    console.error('Error fetching models:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete device model
exports.deleteDeviceModel = async (req, res) => {
  try {
    // Check if device model exists
    const deviceModel = await DeviceModel.findByPk(req.params.id);
    if (!deviceModel) {
      return res.status(404).json({
        success: false,
        message: 'Device model not found'
      });
    }
    
    // Check if device model has associated services or products
    // (This check would depend on your actual model relationships)
    
    // Remove image file if exists
    if (deviceModel.image && fs.existsSync(deviceModel.image)) {
      fs.unlinkSync(deviceModel.image);
    }
    
    // Delete device model
    await deviceModel.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Device model deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting device model:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 
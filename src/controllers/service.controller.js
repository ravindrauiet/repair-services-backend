const { Service, Category, DeviceModel } = require('../models');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    console.error('Error getting all services:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single service by ID
exports.getServiceById = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Service.findByPk(serviceId, {
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: DeviceModel,
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Error getting service by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get services by category
exports.getServicesByCategory = async (req, res) => {
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

    const services = await Service.findAll({
      where: { categoryId },
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: services.length,
      category: category.name,
      services
    });
  } catch (error) {
    console.error('Error getting services by category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get services by device model
exports.getServicesByModel = async (req, res) => {
  try {
    const modelId = req.params.modelId;

    // Check if model exists
    const model = await DeviceModel.findByPk(modelId);
    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Device model not found'
      });
    }

    // Get services associated with this model
    const services = await model.getServices({
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: services.length,
      model: model.name,
      services
    });
  } catch (error) {
    console.error('Error getting services by model:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new service (admin only)
exports.createService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, description, price, categoryId, modelIds } = req.body;
    
    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Process file upload
    let imagePath = null;
    if (req.file) {
      imagePath = req.file.path;
    }

    // Create service
    const service = await Service.create({
      name,
      description,
      price,
      categoryId,
      image: imagePath
    });

    // Add device models if provided
    if (modelIds && Array.isArray(modelIds)) {
      const models = await DeviceModel.findAll({
        where: {
          id: modelIds
        }
      });
      
      await service.setDeviceModels(models);
    }

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update a service (admin only)
exports.updateService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const serviceId = req.params.id;
    const { name, description, price, categoryId, modelIds } = req.body;

    // Find service
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if category exists if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Process file upload
    if (req.file) {
      // Delete old image if exists
      if (service.image) {
        try {
          fs.unlinkSync(service.image);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      
      service.image = req.file.path;
    }

    // Update service details
    if (name) service.name = name;
    if (description) service.description = description;
    if (price) service.price = price;
    if (categoryId) service.categoryId = categoryId;

    await service.save();

    // Update device models if provided
    if (modelIds && Array.isArray(modelIds)) {
      const models = await DeviceModel.findAll({
        where: {
          id: modelIds
        }
      });
      
      await service.setDeviceModels(models);
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a service (admin only)
exports.deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Find service
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Delete image if exists
    if (service.image) {
      try {
        fs.unlinkSync(service.image);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    // Delete service
    await service.destroy();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 
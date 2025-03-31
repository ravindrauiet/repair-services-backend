const db = require('../models');
const Category = db.Category;
const { validationResult } = require('express-validator');
const fs = require('fs');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    // Query parameters for filtering
    const { isActive } = req.query;
    const whereClause = {};
    
    // Filter by active status if provided
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }
    
    const categories = await Category.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error getting category by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { slug: req.params.slug }
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error getting category by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { name, slug, description, isActive } = req.body;
    
    // Check if category with same name or slug already exists
    const existingCategory = await Category.findOne({
      where: { 
        [db.Sequelize.Op.or]: [
          { name },
          { slug }
        ]
      }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or slug already exists'
      });
    }
    
    // Create category object
    const categoryData = {
      name,
      slug,
      description,
      isActive: isActive !== undefined ? isActive : true
    };
    
    // Add image path if file was uploaded
    if (req.file) {
      categoryData.image = req.file.path.replace(/\\/g, '/');
    }
    
    // Create new category
    const category = await Category.create(categoryData);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { name, slug, description, isActive } = req.body;
    
    // Check if category exists
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if updated name or slug conflicts with existing categories
    if (name !== category.name || slug !== category.slug) {
      const existingCategory = await Category.findOne({
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
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name or slug already exists'
        });
      }
    }
    
    // Update category fields
    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;
    
    // Handle image update
    if (req.file) {
      // Remove old image if exists
      if (category.image && fs.existsSync(category.image)) {
        fs.unlinkSync(category.image);
      }
      
      // Set new image path
      category.image = req.file.path.replace(/\\/g, '/');
    }
    
    // Save changes
    await category.save();
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    // Check if category exists
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if category has associated products (to be implemented if needed)
    // const productsCount = await Product.count({ where: { categoryId: req.params.id } });
    // if (productsCount > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Cannot delete category with associated products'
    //   });
    // }
    
    // Remove image file if exists
    if (category.image && fs.existsSync(category.image)) {
      fs.unlinkSync(category.image);
    }
    
    // Delete category
    await category.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 
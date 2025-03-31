const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./models');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
db.sequelize.sync({ force: false })
  .then(() => {
    console.log('Database connected and synced.');
    
    // Initialize Roles
    initRoles();
  })
  .catch(err => {
    console.error('Failed to sync database:', err.message);
  });

// Function to initialize roles
const initRoles = async () => {
  try {
    const Role = db.Role;
    const count = await Role.count();
    
    if (count === 0) {
      // Create default roles
      await Role.bulkCreate([
        { name: 'user', description: 'Regular user with basic access' },
        { name: 'admin', description: 'Administrator with full access' },
        { name: 'technician', description: 'Repair technician with service access' },
        { name: 'customer', description: 'Customer with shopping access' }
      ]);
      console.log('Default roles created successfully.');
    }
  } catch (error) {
    console.error('Error initializing roles:', error);
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Repair Services API' });
});

// Register API routes
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/brands', require('./routes/brand.routes'));
app.use('/api/device-models', require('./routes/deviceModel.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 
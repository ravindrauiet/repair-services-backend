const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config.js');

// Initialize Sequelize with database config
const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    },
    logging: false
  }
);

// Initialize db object
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./user.model.js')(sequelize, Sequelize);
db.Role = require('./role.model.js')(sequelize, Sequelize);
db.Product = require('./product.model.js')(sequelize, Sequelize);
db.Category = require('./category.model.js')(sequelize, Sequelize);
db.Brand = require('./brand.model.js')(sequelize, Sequelize);
db.Service = require('./service.model.js')(sequelize, Sequelize);
db.Order = require('./order.model.js')(sequelize, Sequelize);
db.OrderItem = require('./orderItem.model.js')(sequelize, Sequelize);
db.DeviceModel = require('./deviceModel.model.js')(sequelize, Sequelize);
db.Booking = require('./booking.model.js')(sequelize, Sequelize);
db.Review = require('./review.model.js')(sequelize, Sequelize);
db.Wishlist = require('./wishlist.model.js')(sequelize, Sequelize);
db.WishlistItem = require('./wishlistItem.model.js')(sequelize, Sequelize);
db.ProductImage = require('./productImage.model.js')(sequelize, Sequelize);
db.Cart = require('./cart.model.js')(sequelize, Sequelize);

// Define associations

// User-Role many-to-many relationship
db.User.belongsToMany(db.Role, {
  through: 'user_roles',
  foreignKey: 'userId',
  otherKey: 'roleId'
});
db.Role.belongsToMany(db.User, {
  through: 'user_roles',
  foreignKey: 'roleId',
  otherKey: 'userId'
});

// Category-Product one-to-many relationship
db.Category.hasMany(db.Product, { foreignKey: 'categoryId' });
db.Product.belongsTo(db.Category, { foreignKey: 'categoryId' });

// Brand-Product many-to-many relationship
db.Brand.belongsToMany(db.Product, {
  through: 'product_brands',
  foreignKey: 'brandId',
  otherKey: 'productId'
});
db.Product.belongsToMany(db.Brand, {
  through: 'product_brands',
  foreignKey: 'productId',
  otherKey: 'brandId'
});

// Service-Category relationship
db.Category.hasMany(db.Service, { foreignKey: 'categoryId' });
db.Service.belongsTo(db.Category, { foreignKey: 'categoryId' });

// ProductImage-Product relationship
db.Product.hasMany(db.ProductImage, { foreignKey: 'productId' });
db.ProductImage.belongsTo(db.Product, { foreignKey: 'productId' });

// Brand-DeviceModel relationship
db.Brand.hasMany(db.DeviceModel, { foreignKey: 'brandId' });
db.DeviceModel.belongsTo(db.Brand, { foreignKey: 'brandId' });

// Category-DeviceModel relationship
db.Category.hasMany(db.DeviceModel, { foreignKey: 'categoryId' });
db.DeviceModel.belongsTo(db.Category, { foreignKey: 'categoryId' });

// User-Order relationship
db.User.hasMany(db.Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Order.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'CASCADE' });

// Order-OrderItem relationship
db.Order.hasMany(db.OrderItem, { foreignKey: 'orderId' });
db.OrderItem.belongsTo(db.Order, { foreignKey: 'orderId' });

// Product-OrderItem relationship
db.Product.hasMany(db.OrderItem, { foreignKey: 'productId' });
db.OrderItem.belongsTo(db.Product, { foreignKey: 'productId' });

// User-Booking relationship
db.User.hasMany(db.Booking, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Booking.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'CASCADE' });

// Service-Booking relationship
db.Service.hasMany(db.Booking, { foreignKey: 'serviceId' });
db.Booking.belongsTo(db.Service, { foreignKey: 'serviceId' });

// User-Review relationship
db.User.hasMany(db.Review, { foreignKey: 'userId' });
db.Review.belongsTo(db.User, { foreignKey: 'userId' });

// Product-Review relationship
db.Product.hasMany(db.Review, { foreignKey: 'productId' });
db.Review.belongsTo(db.Product, { foreignKey: 'productId' });

// User-Wishlist relationship
db.User.hasOne(db.Wishlist, { foreignKey: 'userId' });
db.Wishlist.belongsTo(db.User, { foreignKey: 'userId' });

// Wishlist-WishlistItem relationship
db.Wishlist.hasMany(db.WishlistItem, { foreignKey: 'wishlistId' });
db.WishlistItem.belongsTo(db.Wishlist, { foreignKey: 'wishlistId' });

// Product-WishlistItem relationship
db.Product.hasMany(db.WishlistItem, { foreignKey: 'productId' });
db.WishlistItem.belongsTo(db.Product, { foreignKey: 'productId' });

// User-Cart relationship
db.User.hasOne(db.Cart, { foreignKey: 'userId' });
db.Cart.belongsTo(db.User, { foreignKey: 'userId' });

module.exports = db; 
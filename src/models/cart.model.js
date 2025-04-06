module.exports = (sequelize, Sequelize) => {
  const Cart = sequelize.define('Cart', {
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true
    },
    items: {
      type: Sequelize.JSON,
      defaultValue: []
    },
    // Timestamps are added automatically (createdAt, updatedAt)
  });

  return Cart;
}; 
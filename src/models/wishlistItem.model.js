module.exports = (sequelize, DataTypes) => {
  const WishlistItem = sequelize.define('WishlistItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    itemType: {
      type: DataTypes.ENUM('product', 'service'),
      allowNull: false,
      defaultValue: 'product'
    },
    addedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true
  });

  return WishlistItem;
}; 
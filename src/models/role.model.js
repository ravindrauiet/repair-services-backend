module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return Role;
}; 
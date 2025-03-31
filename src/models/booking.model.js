module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bookingNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    bookingDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    scheduleDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'in-progress', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.ENUM('credit_card', 'debit_card', 'paypal', 'upi', 'cod'),
      allowNull: false,
      defaultValue: 'cod'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    pincode: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    technician: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    deviceProblem: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return Booking;
}; 
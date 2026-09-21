const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  date: {
    type: DataTypes.STRING, // 'YYYY-MM-DD'
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING, // 'HH:mm'
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  // Set by the mobile app when an appointment is created offline, so a retried
  // sync push can be recognized as the same record instead of duplicating it.
  clientUuid: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
});

module.exports = Appointment;

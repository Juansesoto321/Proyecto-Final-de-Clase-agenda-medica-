const sequelize = require('../config/database');
const User = require('./User');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');

User.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

module.exports = {
  sequelize,
  User,
  Doctor,
  Appointment,
};

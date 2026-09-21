require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { User, Doctor } = require('../models');

const ADMIN_EMAIL = 'admin@clinica.com';
const ADMIN_PASSWORD = 'admin123';

const SAMPLE_DOCTORS = [
  { name: 'Dra. Ana Gómez', specialty: 'Medicina General' },
  { name: 'Dr. Carlos Pérez', specialty: 'Pediatría' },
  { name: 'Dra. Laura Rodríguez', specialty: 'Dermatología' },
  { name: 'Dr. Miguel Torres', specialty: 'Cardiología' },
  { name: 'Dra. Sofía Ramírez', specialty: 'Ginecología' },
];

async function seed() {
  await sequelize.sync();

  const existingAdmin = await User.findOne({ where: { email: ADMIN_EMAIL } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      name: 'Administrador',
      email: ADMIN_EMAIL,
      password: hashed,
      role: 'admin',
    });
    console.log(`Usuario admin creado -> correo: ${ADMIN_EMAIL} / contraseña: ${ADMIN_PASSWORD}`);
  } else {
    console.log('El usuario admin ya existía, no se volvió a crear.');
  }

  const doctorCount = await Doctor.count();
  if (doctorCount === 0) {
    await Doctor.bulkCreate(SAMPLE_DOCTORS);
    console.log(`${SAMPLE_DOCTORS.length} doctores de ejemplo creados.`);
  } else {
    console.log('Ya existían doctores, no se volvieron a crear.');
  }

  await sequelize.close();
}

seed().catch((err) => {
  console.error('Error al sembrar la base de datos:', err);
  process.exit(1);
});

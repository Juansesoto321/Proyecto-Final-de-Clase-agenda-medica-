require('dotenv').config();

const app = require('./app');
const sequelize = require('./config/database');
require('./models');

const PORT = process.env.PORT || 3000;

async function start() {
  await sequelize.authenticate();
  await sequelize.sync(); // crea las tablas si no existen (suficiente para este proyecto)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API escuchando en http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err);
  process.exit(1);
});

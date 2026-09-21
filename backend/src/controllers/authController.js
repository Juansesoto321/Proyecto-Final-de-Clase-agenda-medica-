const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios' });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'Ya existe una cuenta con ese correo' });
  }

  const hashed = await bcrypt.hash(password, 10);
  // El registro público siempre crea pacientes; los admin se siembran aparte.
  const user = await User.create({ name, email, password: hashed, phone, role: 'patient' });

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json({ user: publicUser(user) });
});

module.exports = { register, login, me };

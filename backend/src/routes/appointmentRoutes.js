const express = require('express');
const {
  createAppointment,
  myAppointments,
  cancelMyAppointment,
  listAllAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Paciente
router.post('/', authMiddleware, createAppointment);
router.get('/me', authMiddleware, myAppointments);
router.patch('/:id/cancel', authMiddleware, cancelMyAppointment);

// Administrador
router.get('/', authMiddleware, requireRole('admin'), listAllAppointments);
router.patch('/:id/status', authMiddleware, requireRole('admin'), updateAppointmentStatus);

module.exports = router;

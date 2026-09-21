const { Appointment, Doctor, User } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

const doctorInclude = { model: Doctor, as: 'doctor', attributes: ['id', 'name', 'specialty'] };
const patientInclude = { model: User, as: 'patient', attributes: ['id', 'name', 'email', 'phone'] };

const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, time, reason, clientUuid } = req.body;

  if (!doctorId || !date || !time) {
    return res.status(400).json({ message: 'Doctor, fecha y hora son obligatorios' });
  }

  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor) {
    return res.status(404).json({ message: 'El doctor seleccionado no existe' });
  }

  const appointment = await Appointment.create({
    patientId: req.user.id,
    doctorId,
    date,
    time,
    reason: reason || null,
    clientUuid: clientUuid || null,
    status: 'pending',
  });

  const full = await Appointment.findByPk(appointment.id, { include: [doctorInclude] });
  res.status(201).json({ appointment: full });
});

const myAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.findAll({
    where: { patientId: req.user.id },
    include: [doctorInclude],
    order: [['date', 'DESC'], ['time', 'DESC']],
  });
  res.json({ appointments });
});

const cancelMyAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({
    where: { id: req.params.id, patientId: req.user.id },
  });

  if (!appointment) {
    return res.status(404).json({ message: 'Cita no encontrada' });
  }

  if (appointment.status !== 'cancelled') {
    appointment.status = 'cancelled';
    await appointment.save();
  }

  res.json({ appointment });
});

const listAllAppointments = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const appointments = await Appointment.findAll({
    where,
    include: [doctorInclude, patientInclude],
    order: [['date', 'DESC'], ['time', 'DESC']],
  });
  res.json({ appointments });
});

const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  const appointment = await Appointment.findByPk(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: 'Cita no encontrada' });
  }

  appointment.status = status;
  await appointment.save();

  const full = await Appointment.findByPk(appointment.id, { include: [doctorInclude, patientInclude] });
  res.json({ appointment: full });
});

module.exports = {
  createAppointment,
  myAppointments,
  cancelMyAppointment,
  listAllAppointments,
  updateAppointmentStatus,
};

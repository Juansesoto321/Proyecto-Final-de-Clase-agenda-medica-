const { Op } = require('sequelize');
const { Appointment, Doctor, User } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

const doctorInclude = { model: Doctor, as: 'doctor', attributes: ['id', 'name', 'specialty'] };
const patientInclude = { model: User, as: 'patient', attributes: ['id', 'name', 'email', 'phone'] };

// Devuelve las citas que cambiaron desde `since`, para refrescar la copia
// local (SQLite) del celular. El paciente solo ve las suyas; el admin, todas.
const pullAppointments = asyncHandler(async (req, res) => {
  const serverTime = new Date();
  const since = req.query.since ? new Date(req.query.since) : new Date(0);

  const where = { updatedAt: { [Op.gt]: since } };
  if (req.user.role !== 'admin') {
    where.patientId = req.user.id;
  }

  const appointments = await Appointment.findAll({
    where,
    include: [doctorInclude, patientInclude],
    order: [['updatedAt', 'ASC']],
  });

  res.json({ serverTime: serverTime.toISOString(), appointments });
});

// Recibe en un solo lote lo que el celular acumuló offline: citas nuevas
// (identificadas por un clientUuid generado en el celular) y cambios de
// estado (el paciente solo puede cancelar las suyas; el admin puede
// confirmar o cancelar cualquiera).
const pushAppointments = asyncHandler(async (req, res) => {
  const creates = Array.isArray(req.body.creates) ? req.body.creates : [];
  const updates = Array.isArray(req.body.updates) ? req.body.updates : [];

  const created = [];
  const updated = [];
  const errors = [];
  const clientUuidToId = {};

  for (const item of creates) {
    const { clientUuid, doctorId, date, time, reason } = item;

    if (clientUuid) {
      const existing = await Appointment.findOne({ where: { clientUuid } });
      if (existing) {
        clientUuidToId[clientUuid] = existing.id;
        const full = await Appointment.findByPk(existing.id, { include: [doctorInclude, patientInclude] });
        created.push({ clientUuid, appointment: full });
        continue;
      }
    }

    const doctor = doctorId ? await Doctor.findByPk(doctorId) : null;
    if (!doctor || !date || !time) {
      errors.push({ clientUuid, message: 'Cita inválida: falta doctor, fecha u hora' });
      continue;
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

    if (clientUuid) clientUuidToId[clientUuid] = appointment.id;
    const full = await Appointment.findByPk(appointment.id, { include: [doctorInclude, patientInclude] });
    created.push({ clientUuid, appointment: full });
  }

  for (const item of updates) {
    const { status } = item;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      errors.push({ id: item.id, clientUuid: item.clientUuid, message: 'Estado inválido' });
      continue;
    }

    const targetId = item.id || clientUuidToId[item.clientUuid];
    let appointment = null;

    if (targetId) {
      appointment = await Appointment.findByPk(targetId);
    } else if (item.clientUuid) {
      appointment = await Appointment.findOne({ where: { clientUuid: item.clientUuid } });
    }

    if (!appointment) {
      errors.push({ id: item.id, clientUuid: item.clientUuid, message: 'Cita a actualizar no encontrada' });
      continue;
    }

    const isOwner = appointment.patientId === req.user.id;
    if (req.user.role !== 'admin') {
      // Un paciente solo puede cancelar sus propias citas, nada más.
      if (!isOwner || status !== 'cancelled') {
        errors.push({ id: item.id, message: 'No tienes permiso para hacer ese cambio' });
        continue;
      }
    }

    if (appointment.status !== status) {
      appointment.status = status;
      await appointment.save();
    }
    updated.push({ id: appointment.id, clientUuid: item.clientUuid || null, status: appointment.status });
  }

  res.json({ created, updated, errors, serverTime: new Date().toISOString() });
});

module.exports = { pullAppointments, pushAppointments };

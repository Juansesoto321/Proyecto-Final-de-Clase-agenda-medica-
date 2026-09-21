import { getDb } from './database';
import { generateUuid } from '../utils/uuid';

export async function listAppointments() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM appointments ORDER BY date DESC, time DESC');
}

export async function createLocalAppointment({
  doctorId,
  doctorName,
  doctorSpecialty,
  patientId,
  patientName,
  patientEmail,
  date,
  time,
  reason,
}) {
  const db = await getDb();
  const clientUuid = generateUuid();
  const updatedAt = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO appointments
      (clientUuid, doctorId, doctorName, doctorSpecialty, patientId, patientName, patientEmail,
       date, time, reason, status, needsCreate, needsStatusPush, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 1, 0, ?)`,
    [clientUuid, doctorId, doctorName, doctorSpecialty, patientId, patientName, patientEmail, date, time, reason || null, updatedAt]
  );

  return db.getFirstAsync('SELECT * FROM appointments WHERE clientUuid = ?', [clientUuid]);
}

export async function setStatusLocal(localId, status) {
  const db = await getDb();
  await db.runAsync(
    'UPDATE appointments SET status = ?, needsStatusPush = 1, updatedAt = ? WHERE localId = ?',
    [status, new Date().toISOString(), localId]
  );
  return db.getFirstAsync('SELECT * FROM appointments WHERE localId = ?', [localId]);
}

export async function getPendingChanges() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM appointments WHERE needsCreate = 1 OR needsStatusPush = 1');
}

export async function getPendingCount() {
  const db = await getDb();
  const row = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM appointments WHERE needsCreate = 1 OR needsStatusPush = 1'
  );
  return row ? row.count : 0;
}

// Aplica la respuesta del servidor a una cita que acabábamos de crear.
export async function markCreated({ clientUuid, appointment }) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE appointments SET
       serverId = ?, doctorName = ?, doctorSpecialty = ?, status = ?,
       needsCreate = 0, needsStatusPush = 0, updatedAt = ?
     WHERE clientUuid = ?`,
    [
      appointment.id,
      appointment.doctor?.name || null,
      appointment.doctor?.specialty || null,
      appointment.status,
      appointment.updatedAt,
      clientUuid,
    ]
  );
}

// Aplica la respuesta del servidor a un cambio de estado ya confirmado.
export async function markStatusPushed({ id, status }) {
  const db = await getDb();
  await db.runAsync(
    'UPDATE appointments SET status = ?, needsStatusPush = 0, updatedAt = ? WHERE serverId = ?',
    [status, new Date().toISOString(), id]
  );
}

// Inserta o actualiza una cita que llegó del servidor (pull). Si ya existe
// localmente (por serverId o por clientUuid) la actualiza; si no, la crea.
export async function upsertFromServer(appointment) {
  const db = await getDb();

  const existing =
    (await db.getFirstAsync('SELECT * FROM appointments WHERE serverId = ?', [appointment.id])) ||
    (appointment.clientUuid
      ? await db.getFirstAsync('SELECT * FROM appointments WHERE clientUuid = ?', [appointment.clientUuid])
      : null);

  const patient = appointment.patient || null;

  if (existing) {
    // No pisar un cambio local que todavía no se ha subido.
    if (existing.needsStatusPush || existing.needsCreate) return;

    await db.runAsync(
      `UPDATE appointments SET
         serverId = ?, doctorId = ?, doctorName = ?, doctorSpecialty = ?,
         patientId = ?, patientName = ?, patientEmail = ?,
         date = ?, time = ?, reason = ?, status = ?, updatedAt = ?
       WHERE localId = ?`,
      [
        appointment.id,
        appointment.doctorId,
        appointment.doctor?.name || null,
        appointment.doctor?.specialty || null,
        appointment.patientId,
        patient?.name || existing.patientName,
        patient?.email || existing.patientEmail,
        appointment.date,
        appointment.time,
        appointment.reason,
        appointment.status,
        appointment.updatedAt,
        existing.localId,
      ]
    );
  } else {
    await db.runAsync(
      `INSERT INTO appointments
        (serverId, clientUuid, doctorId, doctorName, doctorSpecialty, patientId, patientName, patientEmail,
         date, time, reason, status, needsCreate, needsStatusPush, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`,
      [
        appointment.id,
        appointment.clientUuid || generateUuidPlaceholder(appointment.id),
        appointment.doctorId,
        appointment.doctor?.name || null,
        appointment.doctor?.specialty || null,
        appointment.patientId,
        patient?.name || null,
        patient?.email || null,
        appointment.date,
        appointment.time,
        appointment.reason,
        appointment.status,
        appointment.updatedAt,
      ]
    );
  }
}

// clientUuid es UNIQUE NOT NULL localmente; las citas que nunca pasaron por
// modo offline no traen uno del servidor, así que se genera uno estable solo
// para cumplir la restricción de la tabla local.
function generateUuidPlaceholder(serverId) {
  return `server-${serverId}`;
}

export async function clearAll() {
  const db = await getDb();
  await db.runAsync('DELETE FROM appointments');
}

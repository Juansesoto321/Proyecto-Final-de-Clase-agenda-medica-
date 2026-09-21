import NetInfo from '@react-native-community/netinfo';
import { pullAppointments, pushAppointments } from '../api/sync';
import { fetchDoctors } from '../api/doctors';
import * as appointmentsRepo from '../db/appointmentsRepo';
import * as doctorsRepo from '../db/doctorsRepo';
import * as metaRepo from '../db/metaRepo';

let syncing = false;

export async function isOnline() {
  const state = await NetInfo.fetch();
  // Solo miramos si hay una interfaz de red activa (WiFi/datos). No usamos
  // `isInternetReachable`: da falso negativo cuando el celular es a la vez
  // el hotspot y el que hace la petición, aunque el backend sea alcanzable
  // perfectamente por la red local. Si de verdad no hay forma de llegar al
  // servidor, la petición HTTP fallará y runSync ya lo maneja con try/catch.
  return Boolean(state.isConnected);
}

async function syncDoctors() {
  const doctors = await fetchDoctors();
  await doctorsRepo.replaceAllDoctors(doctors);
}

async function pushPendingChanges() {
  const pending = await appointmentsRepo.getPendingChanges();
  if (pending.length === 0) return;

  const creates = pending
    .filter((row) => row.needsCreate)
    .map((row) => ({
      clientUuid: row.clientUuid,
      doctorId: row.doctorId,
      date: row.date,
      time: row.time,
      reason: row.reason,
    }));

  const updates = pending
    .filter((row) => row.needsStatusPush)
    .map((row) => ({
      id: row.serverId || undefined,
      clientUuid: row.clientUuid,
      status: row.status,
    }));

  const result = await pushAppointments({ creates, updates });

  for (const item of result.created) {
    await appointmentsRepo.markCreated(item);
  }
  for (const item of result.updated) {
    await appointmentsRepo.markStatusPushed(item);
  }

  return result;
}

async function pullChanges() {
  const since = await metaRepo.getLastSyncedAt();
  const result = await pullAppointments(since);

  for (const appointment of result.appointments) {
    await appointmentsRepo.upsertFromServer(appointment);
  }

  await metaRepo.setLastSyncedAt(result.serverTime);
  return result;
}

// Empuja lo pendiente y luego trae los cambios del servidor. Se llama al
// recuperar conexión, al abrir la app, y manualmente (pull-to-refresh).
export async function runSync() {
  if (syncing) return { ok: false, skipped: true };
  const online = await isOnline();
  if (!online) return { ok: false, offline: true };

  syncing = true;
  try {
    await syncDoctors().catch(() => null); // catálogo de doctores: no bloquea el resto si falla
    await pushPendingChanges();
    await pullChanges();
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  } finally {
    syncing = false;
  }
}

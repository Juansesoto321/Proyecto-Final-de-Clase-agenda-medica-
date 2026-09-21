import client from './client';

export const pullAppointments = (since) =>
  client.get('/sync/appointments', { params: { since } }).then((r) => r.data);

export const pushAppointments = (payload) =>
  client.post('/sync/appointments', payload).then((r) => r.data);

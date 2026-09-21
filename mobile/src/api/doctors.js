import client from './client';

export const fetchDoctors = () => client.get('/doctors').then((r) => r.data.doctors);

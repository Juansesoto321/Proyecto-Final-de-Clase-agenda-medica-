import client from './client';

export const registerRequest = (data) => client.post('/auth/register', data).then((r) => r.data);
export const loginRequest = (data) => client.post('/auth/login', data).then((r) => r.data);

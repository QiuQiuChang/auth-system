import client from './client';

export const authApi = {
  login: (data) =>
    client.post('/api/auth/login', data),

  register: (data) =>
    client.post('/api/auth/register', data),

  getMe: () => client.get('/api/auth/me'),
};

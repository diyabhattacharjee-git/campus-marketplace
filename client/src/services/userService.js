import { api } from '@/lib/axios';

export const userService = {
  getMe: () => api.get('/users/me').then((res) => res.data),

  getPublicProfile: (id) => api.get(`/users/${id}`).then((res) => res.data),

  updateProfile: (payload) => api.patch('/users/me', payload).then((res) => res.data),

  updateAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api
      .post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data);
  },

  changePassword: (payload) => api.patch('/users/me/password', payload).then((res) => res.data),
};

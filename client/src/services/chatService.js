import { api } from '@/lib/axios';

export const chatService = {
  getChats: () => api.get('/chats').then((res) => res.data),

  startChat: (payload) => api.post('/chats', payload).then((res) => res.data),

  getChatById: (id) => api.get(`/chats/${id}`).then((res) => res.data),

  getMessages: (id, params) => api.get(`/chats/${id}/messages`, { params }).then((res) => res.data),

  sendMessage: (id, { text, image }) => {
    const formData = new FormData();
    if (text) formData.append('text', text);
    if (image) formData.append('image', image);
    return api
      .post(`/chats/${id}/messages`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data);
  },

  markSeen: (id) => api.patch(`/chats/${id}/seen`).then((res) => res.data),
};

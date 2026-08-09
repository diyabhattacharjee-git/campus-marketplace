import { api } from '@/lib/axios';

export const buyerRequestService = {
  getBuyerRequests: (params) => api.get('/buyer-requests', { params }).then((res) => res.data),

  getMyBuyerRequests: () => api.get('/buyer-requests/mine').then((res) => res.data),

  getBuyerRequestById: (id) => api.get(`/buyer-requests/${id}`).then((res) => res.data),

  createBuyerRequest: (payload) => api.post('/buyer-requests', payload).then((res) => res.data),

  updateBuyerRequest: (id, payload) => api.patch(`/buyer-requests/${id}`, payload).then((res) => res.data),

  cancelBuyerRequest: (id) => api.delete(`/buyer-requests/${id}`).then((res) => res.data),

  getBidsForRequest: (id) => api.get(`/buyer-requests/${id}/bids`).then((res) => res.data),

  acceptBid: (requestId, bidId) =>
    api.patch(`/buyer-requests/${requestId}/bids/${bidId}/accept`).then((res) => res.data),
};

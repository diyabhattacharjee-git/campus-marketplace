import { api } from '@/lib/axios';

export const bidService = {
  submitBid: (payload) => api.post('/bids', payload).then((res) => res.data),

  getMyBids: () => api.get('/bids/mine').then((res) => res.data),

  withdrawBid: (id) => api.patch(`/bids/${id}/withdraw`).then((res) => res.data),
};

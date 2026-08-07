import { api } from '@/lib/axios';

/**
 * Builds the multipart FormData shared by create/update — pulled out so
 * both call sites stay in sync instead of duplicating the append() calls.
 */
function toFormData(payload) {
  const formData = new FormData();
  const { images, ...fields } = payload;

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });

  (images || []).forEach((file) => formData.append('images', file));

  return formData;
}

export const listingService = {
  getListings: (params) => api.get('/products', { params }).then((res) => res.data),

  getListingById: (id) => api.get(`/products/${id}`).then((res) => res.data),

  getMyListings: () => api.get('/products/mine').then((res) => res.data),

  createListing: (payload) =>
    api
      .post('/products', toFormData(payload), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data),

  updateListing: (id, payload) =>
    api
      .put(`/products/${id}`, toFormData(payload), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data),

  deleteListing: (id) => api.delete(`/products/${id}`).then((res) => res.data),
};

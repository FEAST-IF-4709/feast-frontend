import api from './client';

export const voucherTemplatesApi = {
  list: (params = {}) => api.get('/customers/admin/vouchers/', { params }),
  retrieve: (id) => api.get(`/customers/admin/vouchers/${id}/`),
  create: (formData) =>
    api.post('/customers/admin/vouchers/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.patch(`/customers/admin/vouchers/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/customers/admin/vouchers/${id}/`),
};

import api from './client';

export const customersApi = {
  list: (params = {}) => api.get('/customers/', { params }),
  retrieve: (id) => api.get(`/customers/${id}/`),
  searchByPhone: (phone) => api.get('/customers/search/', { params: { phone } }),
};

import api from './client';

export const ordersApi = {
  list: (params = {}) => api.get('/orders/', { params }),
  retrieve: (id) => api.get(`/orders/${id}/`),
};

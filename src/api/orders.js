import api from './client';

export const ordersApi = {
  list: (params = {}) => api.get('/orders/', { params }),
  retrieve: (id) => api.get(`/orders/${id}/`),
  createCashierPos: (data) => api.post('/orders/cashier-pos/', data),
};

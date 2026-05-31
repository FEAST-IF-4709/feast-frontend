import api from './client';

export const paymentsApi = {
  initiateQris: (orderId) => api.post(`/payments/qris/initiate/`, { order_id: orderId }),
  getStatus: (orderId) => api.get(`/payments/qris/status/`, { params: { order_id: orderId } }),
  manualSettle: (data) => api.post('/payments/manual-settle/', data),
};

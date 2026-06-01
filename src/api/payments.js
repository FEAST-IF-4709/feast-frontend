import api from './client';

export const paymentsApi = {
  initiateQris: (orderId) => api.post('/payments/initiate-qris/', { order_id: orderId }),
  getStatus: (orderId) => api.get(`/payments/${orderId}/status/`),
  manualSettle: (data) => api.post('/payments/manual-settle/', data),
};

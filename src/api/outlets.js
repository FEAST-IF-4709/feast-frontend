import api from './client';

export const outletsApi = {
  list: (params = {}) => api.get('/outlets/', { params }),
  retrieve: (id) => api.get(`/outlets/${id}/`),
  create: (data) => api.post('/outlets/', data),
  update: (id, data) => api.patch(`/outlets/${id}/`, data),
  delete: (id) => api.delete(`/outlets/${id}/`),
};

export const tablesApi = {
  list: (outletId) => api.get(`/outlets/${outletId}/tables/`),
  create: (outletId, data) => api.post(`/outlets/${outletId}/tables/`, data),
  update: (tableId, data) => api.patch(`/tables/${tableId}/`, data),
  delete: (tableId) => api.delete(`/tables/${tableId}/`),
  rotateQr: (tableId) => api.post(`/tables/${tableId}/rotate-qr/`),
};

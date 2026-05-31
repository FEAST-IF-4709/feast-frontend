import api from './client';

export const outletsApi = {
  list: (params = {}) => api.get('/outlets/', { params }),
  retrieve: (id) => api.get(`/outlets/${id}/`),
  create: (data) => api.post('/outlets/', data),
  update: (id, data) => api.patch(`/outlets/${id}/`, data),
  delete: (id) => api.delete(`/outlets/${id}/`),
};

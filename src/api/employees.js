import api from './client';

export const employeesApi = {
  list: (params = {}) => api.get('/employees/', { params }),
  retrieve: (id) => api.get(`/employees/${id}/`),
  create: (data) => api.post('/employees/', data),
  update: (id, data) => api.patch(`/employees/${id}/`, data),
  delete: (id) => api.delete(`/employees/${id}/`),
};

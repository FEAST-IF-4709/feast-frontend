import api from './client';

export const brandsApi = {
  getMe: () => api.get('/brands/me/'),
  updateMe: (data) => api.patch('/brands/me/', data),
  updateMeWithImage: (formData) =>
    api.patch('/brands/me/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// SuperAdmin — Brand management (CRUD across all brands)
export const adminBrandsApi = {
  list: () => api.get('/admin/brands/'),
  create: (data) => api.post('/admin/brands/', data),
  get: (id) => api.get(`/admin/brands/${id}/`),
  update: (id, data) => api.patch(`/admin/brands/${id}/`, data),
  delete: (id) => api.delete(`/admin/brands/${id}/`),
  createOwner: (brandId, data) => api.post(`/admin/brands/${brandId}/create-owner/`, data),
};

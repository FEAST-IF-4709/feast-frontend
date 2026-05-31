import api from './client';

export const brandsApi = {
  getMe: () => api.get('/brands/me/'),
  updateMe: (data) => api.patch('/brands/me/', data),
  updateMeWithImage: (formData) =>
    api.patch('/brands/me/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

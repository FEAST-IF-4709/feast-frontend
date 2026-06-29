import api from './client';

export const categoriesApi = {
  list: (params = {}) => api.get('/catalog/categories/', { params }),
  retrieve: (id) => api.get(`/catalog/categories/${id}/`),
  create: (data) => api.post('/catalog/categories/', data),
  update: (id, data) => api.patch(`/catalog/categories/${id}/`, data),
  delete: (id) => api.delete(`/catalog/categories/${id}/`),
};

export const brandProductsApi = {
  list: (params = {}) => api.get('/catalog/brand-products/', { params }),
  retrieve: (id) => api.get(`/catalog/brand-products/${id}/`),
  create: (data) => api.post('/catalog/brand-products/', data),
  createWithImage: (formData) =>
    api.post('/catalog/brand-products/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.patch(`/catalog/brand-products/${id}/`, data),
  updateWithImage: (id, formData) =>
    api.patch(`/catalog/brand-products/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/catalog/brand-products/${id}/`),
};

export const outletProductsApi = {
  list: (outletId, params = {}) =>
    api.get('/catalog/outlet-products/', { params: { outlet_id: outletId, ...params } }),
  retrieve: (id) => api.get(`/catalog/outlet-products/${id}/`),
  create: (data) => api.post('/catalog/outlet-products/', data),
  update: (id, data) => api.patch(`/catalog/outlet-products/${id}/`, data),
  delete: (id) => api.delete(`/catalog/outlet-products/${id}/`),
};

export const promotionsApi = {
  list: (params = {}) => api.get('/catalog/promotions/', { params }),
  retrieve: (id) => api.get(`/catalog/promotions/${id}/`),
  create: (data) => api.post('/catalog/promotions/', data),
  update: (id, data) => api.patch(`/catalog/promotions/${id}/`, data),
  delete: (id) => api.delete(`/catalog/promotions/${id}/`),
};

export const featuredBannerApi = {
  get: () => api.get('/catalog/featured-banner/'),
  create: (data) => api.post('/catalog/featured-banner/', data),
  update: (data) => api.patch('/catalog/featured-banner/', data),
  delete: () => api.delete('/catalog/featured-banner/'),
};

export const advertisementApi = {
  sendPush: (data) => api.post('/catalog/push-notification/', data),
};

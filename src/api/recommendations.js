import api from './client';

export const recommendationsApi = {
  getPopular: (brandId, params = {}) =>
    api.get(`/recommendations/brands/${brandId}/popular/`, { params }),
  getPromotions: (brandId, params = {}) =>
    api.get(`/recommendations/brands/${brandId}/promotions/`, { params }),
};

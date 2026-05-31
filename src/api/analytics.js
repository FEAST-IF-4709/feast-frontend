import api from './client';

export const analyticsApi = {
  getDashboardSummary: (params = {}) => api.get('/analytics/dashboard/summary/', { params }),
  getDashboardDailyChart: (params = {}) => api.get('/analytics/dashboard/daily-chart/', { params }),
};

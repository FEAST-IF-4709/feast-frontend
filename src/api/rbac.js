import api from './client';

export const rbacApi = {
  roles: {
    list: () => api.get('/rbac/roles/'),
    retrieve: (id) => api.get(`/rbac/roles/${id}/`),
    create: (data) => api.post('/rbac/roles/', data),
    update: (id, data) => api.patch(`/rbac/roles/${id}/`, data),
    delete: (id) => api.delete(`/rbac/roles/${id}/`),
    setPermissions: (id, permissionIds) =>
      api.put(`/rbac/roles/${id}/permissions/`, { permission_ids: permissionIds }),
  },
  permissions: {
    list: () => api.get('/rbac/permissions/'),
  },
};

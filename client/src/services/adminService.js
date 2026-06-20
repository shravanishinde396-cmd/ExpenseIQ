import api from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getAllUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  toggleUserActivation: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/toggle`);
    return response.data;
  },
};

import api from './api';

export const profileService = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.patch('/profile/update', profileData);
    return response.data;
  },

  updateAvatar: async (formData) => {
    const response = await api.patch('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAccount: async (password) => {
    const response = await api.post('/profile/delete', { password });
    return response.data;
  },
};

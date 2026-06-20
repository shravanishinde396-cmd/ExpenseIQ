import api from './api';

export const transactionService = {
  getTransactions: async (params) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  bulkDeleteTransactions: async (ids) => {
    const response = await api.post('/transactions/bulk-delete', { ids });
    return response.data;
  }
};

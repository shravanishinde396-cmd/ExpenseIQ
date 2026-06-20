import api from './api';

export const incomeService = {
  getIncomes: async () => {
    const response = await api.get('/income');
    return response.data;
  },

  getIncomeById: async (id) => {
    const response = await api.get(`/income/${id}`);
    return response.data;
  },

  createIncome: async (incomeData) => {
    const response = await api.post('/income', incomeData);
    return response.data;
  },

  updateIncome: async (id, incomeData) => {
    const response = await api.put(`/income/${id}`, incomeData);
    return response.data;
  },

  deleteIncome: async (id) => {
    const response = await api.delete(`/income/${id}`);
    return response.data;
  }
};

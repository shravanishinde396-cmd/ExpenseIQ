import api from './api';

export const analyticsService = {
  getSummary: async (month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/analytics/summary', { params });
    return response.data;
  },

  getExpenseDistribution: async (month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/analytics/expense-distribution', { params });
    return response.data;
  },

  getIncomeVsExpense: async (year) => {
    const params = {};
    if (year) params.year = year;
    const response = await api.get('/analytics/income-expense', { params });
    return response.data;
  },

  getMonthlyTrend: async (month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/analytics/monthly-trend', { params });
    return response.data;
  },

  getSavingsGrowth: async (year) => {
    const params = {};
    if (year) params.year = year;
    const response = await api.get('/analytics/savings-growth', { params });
    return response.data;
  },

  getCategoryAnalysis: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/analytics/category-analysis', { params });
    return response.data;
  },

  getInsights: async () => {
    const response = await api.get('/analytics/insights');
    return response.data;
  },

  getRecentTransactions: async (limit = 10) => {
    const response = await api.get('/transactions', { params: { limit } });
    return response.data;
  }
};

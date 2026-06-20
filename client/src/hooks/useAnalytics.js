import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

export const useSummary = (month, year) => {
  return useQuery({
    queryKey: ['dashboard-summary', month, year],
    queryFn: () => analyticsService.getSummary(month, year),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useExpenseDistribution = (month, year) => {
  return useQuery({
    queryKey: ['expense-distribution', month, year],
    queryFn: () => analyticsService.getExpenseDistribution(month, year),
    staleTime: 1000 * 60 * 5,
  });
};

export const useIncomeVsExpense = (year) => {
  return useQuery({
    queryKey: ['income-expense', year],
    queryFn: () => analyticsService.getIncomeVsExpense(year),
    staleTime: 1000 * 60 * 5,
  });
};

export const useMonthlyTrend = (month, year) => {
  return useQuery({
    queryKey: ['monthly-trend', month, year],
    queryFn: () => analyticsService.getMonthlyTrend(month, year),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSavingsGrowth = (year) => {
  return useQuery({
    queryKey: ['savings-growth', year],
    queryFn: () => analyticsService.getSavingsGrowth(year),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCategoryAnalysis = (startDate, endDate) => {
  return useQuery({
    queryKey: ['category-analysis', startDate, endDate],
    queryFn: () => analyticsService.getCategoryAnalysis(startDate, endDate),
    staleTime: 1000 * 60 * 5,
  });
};

export const useInsights = () => {
  return useQuery({
    queryKey: ['financial-insights'],
    queryFn: () => analyticsService.getInsights(),
    staleTime: 1000 * 60 * 60, // 1 hour (insights are expensive)
  });
};

export const useRecentTransactions = (limit = 10) => {
  return useQuery({
    queryKey: ['recent-transactions', limit],
    queryFn: () => analyticsService.getRecentTransactions(limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

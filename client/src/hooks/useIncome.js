import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incomeService } from '../services/incomeService';

export const useIncomes = () => {
  return useQuery({
    queryKey: ['incomes'],
    queryFn: async () => {
      const res = await incomeService.getIncomes();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: incomeService.createIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
    },
  });
};

export const useUpdateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => incomeService.updateIncome(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['incomes', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
    },
  });
};

export const useDeleteIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: incomeService.deleteIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
    },
  });
};

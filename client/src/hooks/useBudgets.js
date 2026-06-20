import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService } from '../services/budgetService';

export const useBudgets = (month, year) => {
  return useQuery({
    queryKey: ['budgets', month, year],
    queryFn: async () => {
      const res = await budgetService.getBudgets(month, year);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateOrUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetService.createOrUpdateBudget,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetService.deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';

export const useTransactions = (params) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionService.getTransactions(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useBulkDeleteTransactions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionService.bulkDeleteTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { toast } from '../components/ui';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await adminService.getStats();
      return res.data;
    },
  });
};

export const useAdminUsers = (params) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const res = await adminService.getAllUsers(params);
      return res.data;
    },
  });
};

export const useToggleUserActivation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.toggleUserActivation,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success(res.message || 'User activation toggled successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to toggle user activation status');
    },
  });
};

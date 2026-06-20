import { useQuery, useMutation } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { useAuthStore } from '../store/authStore';
import { toast } from '../components/ui';

export const useProfile = () => {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await profileService.getProfile();
      return res.data;
    },
  });
};

export const useUpdateProfile = () => {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (res) => {
      updateUser(res.data);
      toast.success('Profile details updated successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile details');
    },
  });
};

export const useUpdateAvatar = () => {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: profileService.updateAvatar,
    onSuccess: (res) => {
      updateUser({ avatar: res.data.avatar });
      toast.success('Avatar updated successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    },
  });
};

export const useDeleteAccount = () => {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: profileService.deleteAccount,
    onSuccess: () => {
      logout();
      toast.success('Your account has been deleted permanently');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    },
  });
};

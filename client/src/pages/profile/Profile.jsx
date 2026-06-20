import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUpdateProfile, useUpdateAvatar, useDeleteAccount } from '../../hooks/useProfile';
import { Card, Input, Button, Modal, toast } from '../../components/ui';
import { Camera, User, Mail, ShieldAlert, Trash2, Key, Globe, Eye, EyeOff } from 'lucide-react';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  
  // Queries/Mutations
  const updateProfileMutation = useUpdateProfile();
  const updateAvatarMutation = useUpdateAvatar();
  const deleteAccountMutation = useDeleteAccount();

  // State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Modals/Ref
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [showDeletePwd, setShowDeletePwd] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error('Name cannot be empty');
    }
    if (!email.trim()) {
      return toast.error('Email cannot be empty');
    }

    const payload = { name, email, currency };
    updateProfileMutation.mutate(payload);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      return toast.error('Current password is required');
    }
    if (newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters long');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }

    updateProfileMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('File size exceeds the 2MB limit');
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return toast.error('Invalid image type. Use JPEG, PNG, or WEBP');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    updateAvatarMutation.mutate(formData);
  };

  const handleDeleteAccount = () => {
    if (!deleteConfirmPassword) {
      return toast.error('Password is required to confirm account deletion');
    }
    deleteAccountMutation.mutate(deleteConfirmPassword, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
      },
    });
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your identity, regional configurations, and account security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Avatar Section */}
            <div className="relative group cursor-pointer mt-4" onClick={triggerFileSelect}>
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-md relative">
                {updateAvatarMutation.isPending ? (
                  <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                    <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></span>
                  </div>
                ) : null}
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=6366F1&color=fff`}
                  alt={user?.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg border border-white dark:border-slate-900 transition-transform duration-200 group-hover:scale-110">
                <Camera className="h-4 w-4" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
              />
            </div>

            <div className="mt-4 space-y-1">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">{user?.name}</h3>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-primary rounded-full text-xs font-semibold capitalize">
                  {user?.role} Account
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Update Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Details Form */}
          <Card className="p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <User className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-slate-800 dark:text-white">Profile Information</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 mt-6">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-slate-400" />
                  Primary Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm font-medium"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-6 py-2.5 font-bold"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Password Reset Form */}
          <Card className="p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Key className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-slate-800 dark:text-white">Change Password</h2>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 mt-6">
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showCurrentPwd ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  className="absolute right-3.5 bottom-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="New Password"
                  type={showNewPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 8 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-3.5 bottom-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showConfirmPwd ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-3.5 bottom-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-6 py-2.5 font-bold"
                >
                  {updateProfileMutation.isPending ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-red-200 dark:border-red-950 bg-red-50/20 dark:bg-red-950/5">
            <div className="flex items-center gap-2 pb-4 border-b border-red-100 dark:border-red-900/30">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <h2 className="font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Delete Account</h4>
                <p className="text-xs text-muted-foreground max-w-md">
                  Permanently remove your account, transactions ledger, budgets, saving goals, and notifications settings. This action is irreversible.
                </p>
              </div>
              <Button
                variant="danger"
                onClick={() => {
                  setDeleteConfirmPassword('');
                  setIsDeleteModalOpen(true);
                }}
                className="font-bold flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Account Deletion Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 flex gap-3">
            <ShieldAlert className="h-6 w-6 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block text-sm mb-1">Warning: Irreversible action</span>
              Deleting your account is permanent. All your transactions, savings goals, analytical insights, and history will be cleared from our servers.
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Please enter your password to proceed with the account deletion:
          </p>

          <div className="relative">
            <Input
              label="Password"
              type={showDeletePwd ? 'text' : 'password'}
              value={deleteConfirmPassword}
              onChange={(e) => setDeleteConfirmPassword(e.target.value)}
              placeholder="Confirm account password"
            />
            <button
              type="button"
              onClick={() => setShowDeletePwd(!showDeletePwd)}
              className="absolute right-3.5 bottom-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showDeletePwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={deleteAccountMutation.isPending}
              onClick={handleDeleteAccount}
              className="font-bold flex items-center gap-1.5"
            >
              {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

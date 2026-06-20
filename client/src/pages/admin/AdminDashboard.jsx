import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Navigate } from 'react-router-dom';
import { useAdminStats, useAdminUsers, useToggleUserActivation } from '../../hooks/useAdmin';
import { Card, Input, Button, Badge } from '../../components/ui';
import {
  Users,
  UserCheck,
  UserMinus,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Ban,
  CheckCircle,
  Shield,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '../../utils/formatDate';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function AdminDashboard() {
  const currentUser = useAuthStore((state) => state.user);

  // Authorization Shield
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Filter States
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');

  // Queries
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useAdminUsers({
    search,
    role,
    status
  });

  // Mutations
  const toggleActivationMutation = useToggleUserActivation();

  const handleRefresh = () => {
    refetchStats();
    refetchUsers();
  };

  const handleToggleStatus = (userId, isActive) => {
    if (confirm(`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this user account?`)) {
      toggleActivationMutation.mutate(userId);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Admin Control Panel</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Global monitoring of user accounts, transactions, and system statuses.</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center justify-center gap-2 font-bold w-full sm:w-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Sync Data
        </Button>
      </div>

      {/* KPI Stats Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 space-y-4">
              <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
              <div className="h-8 w-3/4 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Registered Users */}
          <Card className="p-6 flex items-center justify-between border-l-4 border-primary">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Accounts</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats.users.total}</h3>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                {stats.users.admins} Administrator(s)
              </p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-primary rounded-xl">
              <Users className="h-6 w-6" />
            </div>
          </Card>

          {/* Active Accounts */}
          <Card className="p-6 flex items-center justify-between border-l-4 border-success">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Users</span>
              <h3 className="text-2xl font-black text-success">{stats.users.active}</h3>
              <p className="text-[10px] font-semibold text-success">
                {((stats.users.active / stats.users.total) * 100).toFixed(0)}% Retention Rate
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-success rounded-xl">
              <UserCheck className="h-6 w-6" />
            </div>
          </Card>

          {/* Global Incomes Volume */}
          <Card className="p-6 flex items-center justify-between border-l-4 border-warning">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Volume</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{formatCurrency(stats.financials.totalIncomes)}</h3>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                Across {stats.financials.totalIncomesCount + stats.financials.totalExpensesCount} tx ledger entries
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-warning rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
          </Card>

          {/* Average Savings Rate */}
          <Card className="p-6 flex items-center justify-between border-l-4 border-indigo-400">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Savings Rate</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats.financials.averageSavingsRate}%</h3>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                Average net surplus ratio
              </p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
          </Card>
        </div>
      ) : null}

      {/* Database Filter Panel */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-full md:w-1/3 relative">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="pl-10"
            />
            <Search className="absolute left-3.5 bottom-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
          </div>

          <div className="flex flex-wrap w-full md:w-auto items-center gap-4">
            {/* Filter by Role */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="inactive">Suspended Accounts</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Accounts Table */}
        <div className="overflow-x-auto">
          {usersLoading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : users && users.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No user records matched your criteria.</p>
            </div>
          ) : users ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">
                  <th className="py-4 px-4">User</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Joined At</th>
                  <th className="py-4 px-4">Last Active</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    {/* User Info */}
                    <td className="py-4 px-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                        <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-800 dark:text-white leading-tight">{u.name}</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 leading-none">{u.email}</p>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-full capitalize">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full capitalize">
                          User
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {u.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="danger">Suspended</Badge>
                      )}
                    </td>

                    {/* Joined At */}
                    <td className="py-4 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {formatDate(u.createdAt)}
                    </td>

                    {/* Last Login */}
                    <td className="py-4 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {u.lastLogin ? formatRelativeTime(u.lastLogin) : 'Never'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      {u._id === currentUser._id ? (
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-600 italic select-none">
                          Current Account
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(u._id, u.isActive)}
                          disabled={toggleActivationMutation.isPending}
                          className={`p-1.5 rounded-lg border transition-all ${
                            u.isActive
                              ? 'border-red-200 text-red-500 bg-red-50/30 hover:bg-red-50 dark:border-red-950/50 dark:text-red-400 dark:hover:bg-red-950/15'
                              : 'border-emerald-200 text-emerald-500 bg-emerald-50/30 hover:bg-emerald-50 dark:border-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-950/15'
                          }`}
                          title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {u.isActive ? <Ban className="h-4.5 w-4.5" /> : <CheckCircle className="h-4.5 w-4.5" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

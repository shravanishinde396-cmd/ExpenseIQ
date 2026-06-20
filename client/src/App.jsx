import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyOTP from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main App Pages
import Dashboard from './pages/dashboard/Dashboard';
import Expenses from './pages/expenses/Expenses';
import Income from './pages/income/Income';
import Budgets from './pages/budgets/Budgets';
import Goals from './pages/goals/Goals';
import Analytics from './pages/analytics/Analytics';
import Transactions from './pages/transactions/Transactions';
import Reports from './pages/reports/Reports';
import Profile from './pages/profile/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';

// Query Client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Configure Browser Router with routes
const router = createBrowserRouter([
  // Public/Auth routes
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'verify-otp', element: <VerifyOTP /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ResetPassword /> },
    ]
  },
  
  // Protected app routes
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'expenses', element: <Expenses /> },
      { path: 'income', element: <Income /> },
      { path: 'budgets', element: <Budgets /> },
      { path: 'goals', element: <Goals /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'reports', element: <Reports /> },
      { path: 'profile', element: <Profile /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> }
    ]
  }
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}

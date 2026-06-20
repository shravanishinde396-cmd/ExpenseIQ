import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Brand Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">
            EIQ
          </div>
          <h1 className="text-2xl font-bold mt-4 tracking-tight text-slate-900 dark:text-white">
            ExpenseIQ
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Precision Personal Finance SaaS
          </p>
        </div>

        {/* Auth Content Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden glass-panel p-6 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

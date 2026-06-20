import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { 
  LayoutDashboard, 
  TrendingDown, 
  TrendingUp, 
  Wallet, 
  Target, 
  BarChart3, 
  Receipt, 
  FileSpreadsheet, 
  User, 
  ShieldAlert,
  X
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export default function Sidebar({ isMobile = false, onClose }) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const theme = useUiStore((state) => state.theme);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: TrendingDown },
    { name: 'Income', path: '/income', icon: TrendingUp },
    { name: 'Budgets', path: '/budgets', icon: Wallet },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  // If user is admin, append Admin option
  if (user?.role === 'admin') {
    menuItems.push({ name: 'Admin Dashboard', path: '/admin', icon: ShieldAlert });
  }

  return (
    <aside className={twMerge(
      "w-64 h-full bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800",
      isMobile ? "w-full" : ""
    )}>
      <div>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold text-sm text-white">
              EIQ
            </div>
            <span className="font-bold text-lg tracking-tight">ExpenseIQ</span>
          </div>

          {isMobile && onClose && (
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Sidebar Links */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                className={twMerge(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Quick Info */}
      {user && (
        <div className="p-4 border-t border-slate-800 flex items-center gap-3 bg-slate-950/20">
          <img
            src={user.fullAvatarUrl || 'https://ui-avatars.com/api/?name=User'}
            alt="user avatar"
            className="h-10 w-10 rounded-full object-cover border border-slate-800"
          />
          <div className="overflow-hidden">
            <h5 className="text-sm font-bold truncate">{user.name}</h5>
            <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
          </div>
        </div>
      )}
    </aside>
  );
}

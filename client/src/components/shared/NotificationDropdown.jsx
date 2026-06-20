import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash, Info, Target, Wallet, Calendar } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { formatRelativeTime } from '../../utils/formatDate';
import { toast } from '../ui';
import api from '../../services/api';

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const containerRef = useRef(null);

  // Poll notifications count and recent notifications list
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      // Unread count
      const countRes = await api.get('/notifications/unread-count');
      setUnreadCount(countRes.data.data.count);

      // Latest 5 notifications
      const listRes = await api.get('/notifications?limit=5');
      setNotifications(listRes.data.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.patch(`/notifications/${notif._id}/read`);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }

      setIsOpen(false);

      // Navigate based on type
      if (notif.type === 'budget_alert') {
        navigate('/budgets');
      } else if (notif.type === 'goal_milestone') {
        navigate('/goals');
      } else if (notif.type === 'recurring_due') {
        navigate('/transactions');
      }
    } catch (error) {
      console.error('Error handling notification click', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'budget_alert':
        return <Wallet className="h-4 w-4 text-warning" />;
      case 'goal_milestone':
        return <Target className="h-4 w-4 text-success" />;
      case 'recurring_due':
        return <Calendar className="h-4 w-4 text-primary" />;
      default:
        return <Info className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 bg-danger text-white text-[10px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden glass-panel">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative ${
                    !notif.isRead 
                      ? 'bg-blue-50/50 dark:bg-blue-950/10 border-l-2 border-primary' 
                      : ''
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-grow space-y-0.5 overflow-hidden">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {notif.title}
                    </h5>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block pt-1">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* View All */}
          <div className="p-3 bg-slate-50/50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/transactions'); // or generic logs page
              }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

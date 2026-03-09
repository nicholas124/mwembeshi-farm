'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/time';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
  createdBy?: { id: string; name: string; role: string } | null;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=30');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // silently fail
    }
  }, []);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refresh when dropdown opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    setLoading(true);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
    setLoading(false);
  };

  const markOneRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes('ADDED')) return '➕';
    if (type.includes('UPDATED')) return '✏️';
    if (type.includes('DELETED')) return '🗑️';
    if (type.includes('BREEDING')) return '🐐';
    if (type.includes('DAILY_LOG')) return '📝';
    if (type.includes('INVENTORY')) return '📦';
    return '🔔';
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[70vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={loading}
                  className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors',
                    !n.isRead && 'bg-green-50/50 dark:bg-green-900/10'
                  )}
                >
                  <span className="text-lg mt-0.5 shrink-0">
                    {getTypeIcon(n.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm text-gray-900 dark:text-gray-100',
                      !n.isRead && 'font-semibold'
                    )}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        {formatDistanceToNow(n.createdAt)}
                      </span>
                      {n.createdBy && (
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                          by {n.createdBy.name}
                        </span>
                      )}
                    </div>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => markOneRead(n.id)}
                      className="shrink-0 p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

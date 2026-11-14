'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { NotificationItem } from '@/lib/types';
import { formatDateTime } from '@/lib/utils/formatters';
import { useRouter } from 'next/navigation';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export function NotificationsDrawer({ isOpen, onClose, currentUserId: _currentUserId }: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    try {
      if (!notif.is_read) {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: notif.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      }
      onClose();
      if (notif.link) {
        router.push(notif.link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Notifications
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-slate-500 hover:text-blue-600 transition-colors"
                title="Mark all as read"
              >
                Mark all read
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 italic">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    n.is_read
                      ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      : 'bg-blue-50/70 border-blue-200 text-slate-900 shadow-xs hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-bold flex items-center gap-1.5 text-slate-900">
                      {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                      {n.title}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {formatDateTime(n.created_at)}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

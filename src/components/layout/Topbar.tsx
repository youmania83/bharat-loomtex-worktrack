'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { QuickRoleSwitcher } from '../shared/QuickRoleSwitcher';
import { NotificationsDrawer } from './NotificationsDrawer';
import { Profile } from '@/lib/types';

interface TopbarProps {
  user: Profile;
}

export function Topbar({ user }: TopbarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Check notifications
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const unread = data.notifications.filter((n: any) => !n.is_read).length;
          setUnreadCount(unread);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {user.role === 'admin' ? 'Management Console' : 'Employee Workspace'}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {user.department}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Quick Role Switcher */}
          <QuickRoleSwitcher currentUserId={user.id} />
        </div>
      </header>

      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => {
          setNotificationsOpen(false);
          setUnreadCount(0);
        }}
        currentUserId={user.id}
      />
    </>
  );
}

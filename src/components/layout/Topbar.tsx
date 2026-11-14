'use client';

import React, { useState, useEffect } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { QuickRoleSwitcher } from '../shared/QuickRoleSwitcher';
import { NotificationsDrawer } from './NotificationsDrawer';
import { Profile } from '@/lib/types';

interface TopbarProps {
  user: Profile;
}

export function Topbar({ user }: TopbarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Check notifications & auto-detect overdue/delayed tasks
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      router.push('/logout');
      router.refresh();
    } catch (err) {
      console.error(err);
      window.location.href = '/logout';
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {user.role === 'admin' ? 'Management Console' : 'Employee Workspace'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-medium text-slate-700">
            {user.department}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            )}
          </button>

          {/* Quick Role Switcher */}
          <QuickRoleSwitcher currentUserId={user.id} />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            title="Log out of session"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
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

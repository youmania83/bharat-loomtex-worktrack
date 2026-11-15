'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Users,
  BarChart3,
  Sparkles,
  History,
  Shield,
  Layers,
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  role: 'admin' | 'employee' | 'manager';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/logout');
      router.refresh();
    } catch {
      window.location.href = '/logout';
    }
  };

  const adminNav = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Task Management', href: '/admin/tasks', icon: CheckSquare },
    { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
    { name: 'Employees', href: '/admin/employees', icon: Users },
    { name: 'Productivity Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'AI Executive Reports', href: '/admin/ai-reports', icon: Sparkles },
    { name: 'Audit Trail', href: '/admin/audit-log', icon: History },
  ];

  const employeeNav = [
    { name: 'My Workspace', href: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/employee/tasks', icon: CheckSquare },
    { name: 'Performance Score', href: '/employee/performance', icon: BarChart3 },
  ];

  const navItems = (role === 'admin' || role === 'manager') ? adminNav : employeeNav;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>BHARAT</span>
              <span className="text-blue-400 font-extrabold">LOOMTEX</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide">
              WorkTrack Operations
            </div>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700/60">
          <Shield className="w-3 h-3 text-blue-400" />
          <span>PORTAL: {role === 'manager' ? 'DIRECTOR' : role.toUpperCase()}</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-transform group-hover:scale-105',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Branding & Logout */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/70 hover:bg-red-950/40 hover:text-red-300 border border-slate-700/60 hover:border-red-800 text-xs text-slate-300 font-medium transition-colors"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-400" />
            <span>Sign Out Session</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Exit</span>
        </button>

        <div className="text-[11px] text-slate-400">
          <div className="font-semibold text-slate-300">Bharat Loomtex</div>
          <div className="text-[10px] text-slate-400">Production SaaS v1.0</div>
        </div>
      </div>
    </aside>
  );
}

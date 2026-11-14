'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ShieldAlert, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { Task } from '@/lib/types';

interface OverdueAlertBannerProps {
  onOpenTask?: (taskId: string) => void;
  tasks?: Task[];
}

export function OverdueAlertBanner({ onOpenTask, tasks: propTasks }: OverdueAlertBannerProps) {
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [delayedTasks, setDelayedTasks] = useState<Task[]>([]);
  const [blockedTasks, setBlockedTasks] = useState<Task[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(!propTasks);

  const processTasks = (allTasks: Task[]) => {
    const now = new Date();
    // 1. Overdue
    const overdue = allTasks.filter(
      (t) =>
        t.status !== 'completed' &&
        t.status !== 'submitted' &&
        (t.status === 'overdue' || new Date(t.due_date) < now)
    );
    setOverdueTasks(overdue);

    // 2. Delayed Risk (due in <= 36h with progress < 40%)
    const delayed = allTasks.filter((t) => {
      if (t.status === 'completed' || t.status === 'submitted' || t.status === 'overdue') return false;
      const diffHours = (new Date(t.due_date).getTime() - now.getTime()) / (1000 * 3600);
      return diffHours > 0 && diffHours <= 36 && (t.progress_percentage || 0) < 40;
    });
    setDelayedTasks(delayed);

    // 3. Blocked
    const blocked = allTasks.filter((t) => t.is_blocked && t.status !== 'completed');
    setBlockedTasks(blocked);
  };

  useEffect(() => {
    if (propTasks && propTasks.length > 0) {
      processTasks(propTasks);
      setLoading(false);
      return;
    }

    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.tasks)) {
          processTasks(data.tasks);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [propTasks]);

  if (dismissed || loading) return null;
  const totalAlerts = overdueTasks.length + delayedTasks.length + blockedTasks.length;
  if (totalAlerts === 0) return null;

  return (
    <div className="rounded-2xl border border-red-200/90 bg-gradient-to-r from-red-50/90 via-amber-50/70 to-red-50/90 p-4 shadow-xs relative overflow-hidden transition-all">
      {/* Accent strip */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Owner Attention Required:</span>
                <span className="text-red-700 font-extrabold">{totalAlerts} Critical Operational Alerts</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 uppercase tracking-wide border border-red-300">
                Live Alert
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Tasks past deadline or approaching deadline with insufficient progress. Automated notifications sent to Owner.
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg self-start sm:self-center"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Alert Cards Carousel / Grid */}
      <div className="mt-3.5 grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-3 border-t border-red-200/60">
        {/* Overdue Items */}
        {overdueTasks.length > 0 && (
          <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3 border border-red-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Overdue Tasks ({overdueTasks.length})
              </span>
              <span className="text-[10px] font-medium text-red-600 font-mono">Immediate Action</span>
            </div>
            <div className="space-y-1">
              {overdueTasks.slice(0, 2).map((t) => (
                <div
                  key={t.id}
                  onClick={() => onOpenTask?.(t.id)}
                  className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-red-50/70 hover:bg-red-100/70 text-slate-800 cursor-pointer transition-colors"
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-red-950 block truncate">{t.title}</span>
                    <span className="text-[10px] text-slate-500">
                      {t.assignee?.full_name || 'Assigned'} • Due {t.due_date.split('T')[0]}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-red-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delay Warnings */}
        {delayedTasks.length > 0 && (
          <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3 border border-amber-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Delay Risk ({delayedTasks.length})
              </span>
              <span className="text-[10px] font-medium text-amber-700 font-mono">&lt; 36h Left</span>
            </div>
            <div className="space-y-1">
              {delayedTasks.slice(0, 2).map((t) => (
                <div
                  key={t.id}
                  onClick={() => onOpenTask?.(t.id)}
                  className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-amber-50/70 hover:bg-amber-100/70 text-slate-800 cursor-pointer transition-colors"
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-amber-950 block truncate">{t.title}</span>
                    <span className="text-[10px] text-slate-500">
                      Progress: {t.progress_percentage || 0}% • {t.assignee?.full_name || 'Staff'}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blockers Reported */}
        {blockedTasks.length > 0 && (
          <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3 border border-purple-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Blockers ({blockedTasks.length})
              </span>
              <span className="text-[10px] font-medium text-purple-700 font-mono">Halted</span>
            </div>
            <div className="space-y-1">
              {blockedTasks.slice(0, 2).map((t) => (
                <div
                  key={t.id}
                  onClick={() => onOpenTask?.(t.id)}
                  className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-purple-50/70 hover:bg-purple-100/70 text-slate-800 cursor-pointer transition-colors"
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-purple-950 block truncate">{t.title}</span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {t.blocker_reason || 'Blocker reported by employee'}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-end">
        <Link
          href="/admin/tasks?status=overdue"
          className="text-[11px] font-bold text-red-700 hover:text-red-900 flex items-center gap-1"
        >
          <span>Open Full Tasks Queue & Assign Correction</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

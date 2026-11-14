'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmployeePerformance } from '@/lib/types';
import { formatHours } from '@/lib/utils/formatters';

export default function EmployeePerformancePage() {
  const [performance, setPerformance] = useState<EmployeePerformance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((meData) => {
        if (meData.success) {
          fetch('/api/analytics/performance')
            .then((res) => res.json())
            .then((pData) => {
              if (pData.success) {
                const myPerf = pData.performance.find((p: any) => p.employee_id === meData.user.id);
                if (myPerf) setPerformance(myPerf);
              }
            });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          My Performance & Productivity Scorecard
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Your personal productivity rating calculated objectively through task delivery and quality metrics.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : performance ? (
        <div className="space-y-6">
          {/* Main Score Card */}
          <Card className="p-6 bg-gradient-to-tr from-slate-900 via-slate-900 to-blue-950 text-white border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
                  COMPOSITE PRODUCTIVITY INDEX
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-extrabold font-mono text-white">
                    {performance.performance_score}
                  </span>
                  <span className="text-slate-400 text-lg font-medium">/ 100</span>
                </div>
                <p className="text-xs text-slate-300 max-w-md">
                  Status:{' '}
                  <strong className="text-emerald-400">
                    {performance.performance_score >= 80
                      ? 'Exceptional Output'
                      : performance.performance_score >= 60
                      ? 'Solid Delivery'
                      : 'Attention Needed'}
                  </strong>
                  . Workload distribution and turnaround times reflect strong discipline.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center min-w-[140px]">
                <div className="text-[10px] text-slate-300 uppercase font-semibold">Total Logged</div>
                <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
                  {formatHours(performance.total_logged_hours)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Verified Working Time</div>
              </div>
            </div>
          </Card>

          {/* Breakdown Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Task Completion Rate (30% weight)
                </span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  {performance.completion_rate}%
                </span>
              </div>
              <ProgressBar value={performance.completion_rate} size="md" />
              <p className="text-[11px] text-slate-500 font-medium">
                {performance.completed_count} out of {performance.assigned_count} assigned tasks completed.
              </p>
            </Card>

            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  On-Time Delivery Rate (30% weight)
                </span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {performance.on_time_rate}%
                </span>
              </div>
              <ProgressBar value={performance.on_time_rate} size="md" />
              <p className="text-[11px] text-slate-500 font-medium">
                Tasks delivered before target deadlines.
              </p>
            </Card>

            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Quality & Approval Rate (25% weight)
                </span>
                <span className="font-mono font-bold text-purple-700 text-sm">
                  {performance.quality_approval_rate}%
                </span>
              </div>
              <ProgressBar value={performance.quality_approval_rate} size="md" />
              <p className="text-[11px] text-slate-500 font-medium">
                Submissions approved by Admin without requiring revision.
              </p>
            </Card>

            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Average Turnaround Time
                </span>
                <span className="font-mono font-bold text-amber-700 text-sm">
                  {performance.avg_completion_time_hours} hrs
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-2">
                Average hours spent to bring a task from start to completed approval.
              </p>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, Copy, Check, Users, CheckCircle } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DailyReportData, WeeklyReportData } from '@/lib/ai/reportGenerator';
import { formatDate } from '@/lib/utils/formatters';

export default function AdminAiReportsPage() {
  const [reportType, setReportType] = useState<'daily' | 'weekly'>('daily');
  const [dailyReport, setDailyReport] = useState<DailyReportData | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportType]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai-report?type=${reportType}`);
      const data = await res.json();
      if (data.success) {
        if (reportType === 'daily') setDailyReport(data.report);
        else setWeeklyReport(data.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBrief = () => {
    const text = reportType === 'daily' ? dailyReport?.executiveBrief : weeklyReport?.executiveBrief;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              AI Operational & Executive Synthesis
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ground-truth deterministic intelligence synthesized directly from verified database events.
          </p>
        </div>

        {/* Report Period Toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setReportType('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                reportType === 'daily'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Daily Operational Brief
            </button>
            <button
              onClick={() => setReportType('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                reportType === 'weekly'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Weekly Performance Review
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleCopyBrief} disabled={loading}>
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Brief
              </>
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : reportType === 'daily' && dailyReport ? (
        /* DAILY REPORT */
        <div className="space-y-6">
          {/* Executive Brief Card */}
          <Card className="bg-slate-900 text-white p-6 border-slate-800 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
                DAILY EXECUTIVE SYNTHESIS • {formatDate(dailyReport.generatedAt)}
              </span>
              <span className="text-xs text-slate-400 font-medium">100% Deterministic Metrics</span>
            </div>
            <pre className="font-sans text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {dailyReport.executiveBrief}
            </pre>
          </Card>

          {/* Operational Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="p-4 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Assigned</div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {dailyReport.summary.totalAssigned}
              </div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Delivered / Done</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {dailyReport.summary.completedTodayOrRecent}
              </div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">In Progress</div>
              <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                {dailyReport.summary.pendingCount}
              </div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Review Queue</div>
              <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
                {dailyReport.summary.awaitingApprovalCount}
              </div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Overdue</div>
              <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">
                {dailyReport.summary.overdueCount}
              </div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Blockers</div>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {dailyReport.summary.blockedCount}
              </div>
            </Card>
          </div>

          {/* Critical Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overdue Tasks Drilldown */}
            <Card className="p-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2 mb-3 text-red-600">
                <AlertTriangle className="w-4 h-4" /> Overdue Tasks Requiring Intervention
              </CardTitle>
              {dailyReport.overdueTasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No tasks currently past deadline.</p>
              ) : (
                <div className="space-y-2.5">
                  {dailyReport.overdueTasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{t.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Assignee: {t.assigneeName} • Priority: {t.priority}
                        </div>
                      </div>
                      <Badge variant="danger">{t.daysOverdue}d overdue</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Personnel Requiring Attention */}
            <Card className="p-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2 mb-3 text-amber-600">
                <Users className="w-4 h-4" /> Employees Requiring Management Attention
              </CardTitle>
              {dailyReport.employeesRequiringAttention.length === 0 ? (
                <p className="text-xs text-slate-400 italic">All employee tracks running smoothly.</p>
              ) : (
                <div className="space-y-2.5">
                  {dailyReport.employeesRequiringAttention.map((e, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {e.employeeName}
                        </div>
                        <div className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                          {e.reason}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-amber-600">
                        {e.overdueCount + e.blockedCount} Flags
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : weeklyReport ? (
        /* WEEKLY REPORT */
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white p-6 border-slate-800 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                WEEKLY PERFORMANCE AUDIT • {weeklyReport.period}
              </span>
              <span className="text-xs text-slate-400 font-medium">Composite Team Score: {weeklyReport.overallScore}/100</span>
            </div>
            <pre className="font-sans text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {weeklyReport.executiveBrief}
            </pre>
          </Card>

          {/* Employee Summaries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyReport.employeeSummaries.map((emp) => (
              <Card key={emp.code} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{emp.name}</h4>
                    <span className="font-mono text-[10px] text-slate-400">{emp.code}</span>
                  </div>
                  <Badge
                    variant={
                      emp.statusBadge === 'Star Performer'
                        ? 'success'
                        : emp.statusBadge === 'Critical Attention'
                        ? 'danger'
                        : 'info'
                    }
                  >
                    {emp.statusBadge}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400">Completed</div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      {emp.completed}/{emp.total}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400">On-Time</div>
                    <div className="font-mono font-bold text-emerald-600">
                      {emp.onTimeRate}%
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400">Logged</div>
                    <div className="font-mono font-bold text-blue-600">
                      {emp.loggedHours}h
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Suggested Actions & Disparities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5">
              <CardTitle className="text-sm font-bold text-blue-600 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Recommended Executive Actions
              </CardTitle>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {weeklyReport.suggestedManagementActions.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="font-bold text-blue-600 font-mono mt-0.5">{idx + 1}.</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <CardTitle className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Workload & Velocity Disparities
              </CardTitle>
              {weeklyReport.workloadImbalanceAlerts.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Workload is evenly balanced across the roster.</p>
              ) : (
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {weeklyReport.workloadImbalanceAlerts.map((imb, idx) => (
                    <li key={idx} className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
                      {imb}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}

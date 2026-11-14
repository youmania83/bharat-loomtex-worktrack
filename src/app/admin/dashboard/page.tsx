'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  FolderKanban,
  CheckSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Inbox,
  Plus,
} from 'lucide-react';
import { MetricCard } from '@/components/analytics/MetricCard';
import { PerformanceChart } from '@/components/analytics/PerformanceChart';
import { EmployeePerformanceTable } from '@/components/analytics/EmployeePerformanceTable';
import { TaskDetailsDrawer } from '@/components/tasks/TaskDetailsDrawer';
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal';
import { Button } from '@/components/ui/Button';
import { DashboardMetrics, EmployeePerformance } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [performanceData, setPerformanceData] = useState<EmployeePerformance[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [mRes, pRes] = await Promise.all([
        fetch('/api/analytics/metrics'),
        fetch('/api/analytics/performance'),
      ]);
      const mData = await mRes.json();
      const pData = await pRes.json();

      if (mData.success) setMetrics(mData.metrics);
      if (pData.success) setPerformanceData(pData.performance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Operations & Productivity Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking for Rison AI Tech personnel, project deliverables, and quality approvals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/ai-reports')}>
            AI Operational Brief
          </Button>
          <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4" /> Assign New Task
          </Button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <MetricCard
            title="Total Staff"
            value={metrics.total_employees}
            subtitle="Active roster"
            icon={Users}
            variant="default"
            onClick={() => router.push('/admin/employees')}
          />
          <MetricCard
            title="Projects"
            value={metrics.active_projects}
            subtitle="Active tracks"
            icon={FolderKanban}
            variant="info"
            onClick={() => router.push('/admin/projects')}
          />
          <MetricCard
            title="Total Tasks"
            value={metrics.total_tasks}
            subtitle="Work items"
            icon={CheckSquare}
            variant="default"
            onClick={() => router.push('/admin/tasks')}
          />
          <MetricCard
            title="Completed"
            value={metrics.completed_tasks}
            subtitle={`${metrics.overall_completion_rate}% delivery`}
            icon={CheckCircle2}
            variant="success"
            trendText={`${metrics.overall_completion_rate}% rate`}
            onClick={() => router.push('/admin/tasks?status=completed')}
          />
          <MetricCard
            title="Pending"
            value={metrics.pending_tasks}
            subtitle="In progress / hold"
            icon={Clock}
            variant="info"
            onClick={() => router.push('/admin/tasks?status=in_progress')}
          />
          <MetricCard
            title="Overdue"
            value={metrics.overdue_tasks}
            subtitle="Past deadline"
            icon={AlertTriangle}
            variant="danger"
            onClick={() => router.push('/admin/tasks?status=overdue')}
          />
          <MetricCard
            title="Review Queue"
            value={metrics.tasks_awaiting_approval}
            subtitle="Needs sign-off"
            icon={Inbox}
            variant="purple"
            onClick={() => router.push('/admin/tasks?status=submitted')}
          />
        </div>
      )}

      {/* Recharts Data Visualizations */}
      <PerformanceChart performanceData={performanceData} />

      {/* Employee Performance Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Employee Performance & Output Index
            </h2>
            <p className="text-xs text-slate-500">
              Transparent multi-factor score: 30% Completion + 30% On-Time + 25% Quality + 15% Consistency.
            </p>
          </div>
        </div>

        <EmployeePerformanceTable
          data={performanceData}
          onSelectEmployee={(empId) => router.push(`/admin/tasks?employeeId=${empId}`)}
        />
      </div>

      {/* Modals & Drawers */}
      <TaskCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTaskCreated={loadDashboardData}
      />

      <TaskDetailsDrawer
        taskId={selectedTaskId}
        currentUserId="00000000-0000-0000-0000-000000000001"
        currentUserRole="admin"
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={loadDashboardData}
      />
    </div>
  );
}

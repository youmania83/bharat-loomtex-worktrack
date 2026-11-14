'use client';

import React, { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle2, Clock, ShieldCheck, ArrowRight, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MetricCard } from '@/components/analytics/MetricCard';
import { TaskListView } from '@/components/tasks/TaskListView';
import { TaskDetailsDrawer } from '@/components/tasks/TaskDetailsDrawer';
import { TaskTimerWidget } from '@/components/tasks/TaskTimerWidget';
import { Task, EmployeePerformance, Profile } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function EmployeeDashboardPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [performance, setPerformance] = useState<EmployeePerformance | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadEmployeeDashboard();
  }, []);

  const loadEmployeeDashboard = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success) {
        setCurrentUser(meData.user);

        const [tRes, pRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/analytics/performance'),
        ]);
        const tData = await tRes.json();
        const pData = await pRes.json();

        if (tData.success) setTasks(tData.tasks);
        if (pData.success) {
          const myPerf = pData.performance.find((p: any) => p.employee_id === meData.user.id);
          if (myPerf) setPerformance(myPerf);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;

  const currentRunningTask = tasks.find((t) => t.status === 'in_progress');

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Welcome back, {currentUser?.full_name || 'Team Member'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser?.designation} • {currentUser?.department}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Shift Active</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser?.id }),
              });
              router.push('/logout');
            }}
            className="text-xs hover:bg-red-50 hover:text-red-700 hover:border-red-300 border-slate-300"
          >
            <LogOut className="w-3.5 h-3.5" /> Clock Out & Exit
          </Button>
          <Button variant="primary" size="sm" onClick={() => router.push('/employee/tasks')} className="bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm">
            <CheckSquare className="w-4 h-4" /> View Tasks ({tasks.length})
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MetricCard
          title="Assigned Tasks"
          value={tasks.length}
          subtitle="My workload"
          icon={CheckSquare}
          variant="default"
        />
        <MetricCard
          title="Completed"
          value={completed}
          subtitle={`${performance?.completion_rate || 0}% rate`}
          icon={CheckCircle2}
          variant="success"
        />
        <MetricCard
          title="In Progress"
          value={inProgress}
          subtitle="Active items"
          icon={Clock}
          variant="info"
        />
        <MetricCard
          title="Total Hours Logged"
          value={`${performance?.total_logged_hours || 0}h`}
          subtitle="All tasks logged"
          icon={Clock}
          variant="default"
        />
        <MetricCard
          title="Productivity Score"
          value={`${performance?.performance_score || 0}/100`}
          subtitle="Multi-factor score"
          icon={ShieldCheck}
          variant="purple"
          onClick={() => router.push('/employee/performance')}
        />
      </div>

      {/* Active Focus / Quick Timer Widget */}
      {currentRunningTask && (
        <Card className="p-5 border-blue-200 bg-blue-50/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                CURRENT ACTIVE SPRINT FOCUS
              </span>
              <h2 className="text-base font-bold text-slate-900">
                {currentRunningTask.title}
              </h2>
              <p className="text-xs text-slate-500">
                {currentRunningTask.project ? `Project: ${currentRunningTask.project.name}` : 'Daily Task'}
              </p>
            </div>
            <TaskTimerWidget
              taskId={currentRunningTask.id}
              taskTitle={currentRunningTask.title}
              onTimerChange={loadEmployeeDashboard}
            />
          </div>
        </Card>
      )}

      {/* Today's Tasks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            My Active Priority Deliverables
          </h2>
          <Button variant="ghost" size="sm" onClick={() => router.push('/employee/tasks')}>
            Open Full Task Board <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <TaskListView
            tasks={tasks.slice(0, 6)}
            onSelectTask={(id) => setSelectedTaskId(id)}
            showAssignee={false}
          />
        )}
      </div>

      <TaskDetailsDrawer
        taskId={selectedTaskId}
        currentUserId={currentUser?.id || ''}
        currentUserRole="employee"
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={loadEmployeeDashboard}
      />
    </div>
  );
}

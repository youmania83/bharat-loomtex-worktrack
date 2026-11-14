'use client';

import React, { useState, useEffect } from 'react';
import {
  List,
  Kanban,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { TaskListView } from '@/components/tasks/TaskListView';
import { TaskKanbanView } from '@/components/tasks/TaskKanbanView';
import { TaskCalendarView } from '@/components/tasks/TaskCalendarView';
import { TaskDetailsDrawer } from '@/components/tasks/TaskDetailsDrawer';
import { Task, Profile } from '@/lib/types';

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentView, setCurrentView] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadMyTasks();
  }, [statusFilter]);

  const loadMyTasks = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success) {
        setCurrentUser(meData.user);

        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.append('status', statusFilter);

        const res = await fetch(`/api/tasks?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setTasks(data.tasks);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            My Assigned Tasks
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track daily tasks and project milestones. Log your work time and submit deliverables for approval.
          </p>
        </div>

        {/* View Switcher */}
        <div className="inline-flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setCurrentView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'list'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" /> List
          </button>
          <button
            onClick={() => setCurrentView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'kanban'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" /> Kanban
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'calendar'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" /> Calendar
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All My Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'in_progress'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('submitted')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'submitted'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Awaiting Approval
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'overdue'
                ? 'bg-red-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      {/* Main View */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : currentView === 'list' ? (
        <TaskListView
          tasks={tasks}
          onSelectTask={(id) => setSelectedTaskId(id)}
          showAssignee={false}
        />
      ) : currentView === 'kanban' ? (
        <TaskKanbanView
          tasks={tasks}
          onSelectTask={(id) => setSelectedTaskId(id)}
          showAssignee={false}
        />
      ) : (
        <TaskCalendarView
          tasks={tasks}
          onSelectTask={(id) => setSelectedTaskId(id)}
        />
      )}

      {/* Drawer */}
      <TaskDetailsDrawer
        taskId={selectedTaskId}
        currentUserId={currentUser?.id || ''}
        currentUserRole="employee"
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={loadMyTasks}
      />
    </div>
  );
}

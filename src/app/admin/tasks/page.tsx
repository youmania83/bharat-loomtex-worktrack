'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  List,
  Kanban,
  Calendar as CalendarIcon,
  Plus,
  Inbox,
} from 'lucide-react';
import { TaskListView } from '@/components/tasks/TaskListView';
import { TaskKanbanView } from '@/components/tasks/TaskKanbanView';
import { TaskCalendarView } from '@/components/tasks/TaskCalendarView';
import { TaskDetailsDrawer } from '@/components/tasks/TaskDetailsDrawer';
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal';
import { Button } from '@/components/ui/Button';
import { Task, Project, EmployeeExtended } from '@/lib/types';

function AdminTasksContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';
  const initialEmp = searchParams.get('employeeId') || 'all';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<EmployeeExtended[]>([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [currentView, setCurrentView] = useState<'list' | 'kanban' | 'calendar'>('list');

  // Filter states
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [projectFilter, setProjectFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState(initialEmp);

  // Modal / Drawer
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    loadFiltersData();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [statusFilter, projectFilter, employeeFilter]);

  const loadFiltersData = async () => {
    try {
      const [pRes, eRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/employees'),
      ]);
      const pData = await pRes.json();
      const eData = await eRes.json();
      if (pData.success) setProjects(pData.projects);
      if (eData.success) setEmployees(eData.employees);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (projectFilter !== 'all') params.append('projectId', projectFilter);
      if (employeeFilter !== 'all') params.append('employeeId', employeeFilter);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
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
            Task Orchestration & Workflows
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage daily assignments, sprint milestones, time audits, and review approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
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

          <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4" /> Create Task
          </Button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Quick Filters */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('submitted')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                statusFilter === 'submitted'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Inbox className="w-3 h-3" /> Review Queue
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === 'in_progress'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Completed
            </button>
          </div>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Employee Filter */}
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.profile_id} value={emp.profile_id}>
                {emp.profile?.full_name} ({emp.employee_code})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900 dark:text-white">{tasks.length}</span> items
        </div>
      </div>

      {/* Main View Display */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : currentView === 'list' ? (
        <TaskListView tasks={tasks} onSelectTask={(id) => setSelectedTaskId(id)} />
      ) : currentView === 'kanban' ? (
        <TaskKanbanView tasks={tasks} onSelectTask={(id) => setSelectedTaskId(id)} />
      ) : (
        <TaskCalendarView tasks={tasks} onSelectTask={(id) => setSelectedTaskId(id)} />
      )}

      {/* Modals & Drawers */}
      <TaskCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTaskCreated={loadTasks}
      />

      <TaskDetailsDrawer
        taskId={selectedTaskId}
        currentUserId="00000000-0000-0000-0000-000000000001"
        currentUserRole="admin"
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={loadTasks}
      />
    </div>
  );
}

export default function AdminTasksPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <AdminTasksContent />
    </Suspense>
  );
}

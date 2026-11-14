'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { EmployeeExtended, Project } from '@/lib/types';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

export function TaskCreateModal({ isOpen, onClose, onTaskCreated }: TaskCreateModalProps) {
  const [employees, setEmployees] = useState<EmployeeExtended[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<'daily' | 'project'>('project');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(4);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFormData();
      // Set default deadline to 2 days from now
      const d = new Date();
      d.setDate(d.getDate() + 2);
      setDueDate(d.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const loadFormData = async () => {
    try {
      const [empRes, projRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/projects'),
      ]);
      const empData = await empRes.json();
      const projData = await projRes.json();

      if (empData.success) {
        setEmployees(empData.employees);
        if (empData.employees.length > 0 && !assignedTo) {
          setAssignedTo(empData.employees[0].profile_id);
        }
      }
      if (projData.success) {
        setProjects(projData.projects);
        if (projData.projects.length > 0 && !projectId) {
          setProjectId(projData.projects[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!assignedTo) {
      setError('Please select an assigned employee');
      return;
    }
    if (!dueDate) {
      setError('Target deadline is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          task_type: taskType,
          project_id: taskType === 'project' ? projectId : undefined,
          assigned_to: assignedTo,
          priority,
          due_date: new Date(dueDate).toISOString(),
          estimated_hours: Number(estimatedHours),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTitle('');
        setDescription('');
        onTaskCreated();
        onClose();
      } else {
        setError(data.error || 'Failed to create task');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Employee Task"
      description="Assign a daily task or project milestone with deadlines and hour estimates."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Task Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Implement WebSocket Audio Pipeline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Task Type
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as 'daily' | 'project')}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="project">Project Task</option>
              <option value="daily">Daily Task</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {taskType === 'project' && (
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Project *
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.client_name ? `(${p.client_name})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Assign To Employee *
          </label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {employees.map((emp) => (
              <option key={emp.profile_id} value={emp.profile_id}>
                {emp.profile?.full_name} ({emp.employee_code} - {emp.profile?.designation})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Deadline / Due Date *
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Estimated Hours
            </label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Detailed Description & Instructions
          </label>
          <textarea
            rows={3}
            placeholder="Detail scope, acceptance criteria, APIs, or files to inspect..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={loading} className="bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm">
            Create & Assign Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}

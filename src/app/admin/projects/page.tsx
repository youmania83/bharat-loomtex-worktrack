'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { Project } from '@/lib/types';
import { formatDate, formatHours } from '@/lib/utils/formatters';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Project Form
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [budgetHours, setBudgetHours] = useState(120);
  const [targetEndDate, setTargetEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          client_name: clientName.trim(),
          description: description.trim(),
          budget_hours: Number(budgetHours),
          target_end_date: targetEndDate || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setName('');
        setClientName('');
        setDescription('');
        setCreateModalOpen(false);
        loadProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Project Deliverable Tracks
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage multi-employee project scopes, client milestones, and task completion rates.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm">
          <Plus className="w-4 h-4" /> Create New Project
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-sm text-slate-500">No active projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const total = proj.total_tasks_count || 0;
            const completed = proj.completed_tasks_count || 0;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Card key={proj.id} className="flex flex-col justify-between hover:shadow-md transition-shadow bg-white border border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={proj.status === 'active' ? 'info' : 'success'}>
                      {proj.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-mono text-slate-500 font-medium">
                      Budget: {formatHours(proj.budget_hours)}
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-base font-bold text-slate-900">{proj.name}</CardTitle>
                  {proj.client_name && (
                    <CardDescription className="font-semibold text-blue-700">
                      Client: {proj.client_name}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-4 pt-1">
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {proj.description || 'No detailed project notes provided.'}
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Progress ({completed}/{total} tasks)</span>
                      <span className="font-mono text-blue-700 font-bold">{progress}%</span>
                    </div>
                    <ProgressBar value={progress} size="md" />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Target: {formatDate(proj.target_end_date)}</span>
                    </div>
                    <div className="font-semibold text-slate-700">
                      {proj.members_count || 2} Contributors
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Project Track"
        description="Define project scope, client assignment, and target completion date."
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Enterprise Voice Bot Integration"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Client Name
            </label>
            <input
              type="text"
              placeholder="e.g. SkyPro Logistics / Internal"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Budgeted Hours
              </label>
              <input
                type="number"
                min={10}
                value={budgetHours}
                onChange={(e) => setBudgetHours(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Target End Date
              </label>
              <input
                type="date"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Description & Objectives
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of key milestones and client expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting} className="bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

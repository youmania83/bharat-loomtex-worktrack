'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatDate, formatHours } from '@/lib/utils/formatters';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface TaskListViewProps {
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
  showAssignee?: boolean;
}

export function TaskListView({ tasks, onSelectTask, showAssignee = true }: TaskListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-8">
        <p className="text-sm text-slate-500">No tasks match your selected criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Task Details</th>
              <th className="py-3 px-4">Project</th>
              {showAssignee && <th className="py-3 px-4">Assignee</th>}
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Deadline</th>
              <th className="py-3 px-4">Progress</th>
              <th className="py-3 px-4">Logged / Est</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const isOverdue =
                task.status === 'overdue' ||
                (task.status !== 'completed' &&
                  task.status !== 'submitted' &&
                  new Date(task.due_date) < new Date());

              return (
                <tr
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  className="hover:bg-slate-50/90 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs">
                    <div className="truncate font-semibold text-slate-900">{task.title}</div>
                    <div className="text-[11px] text-slate-500 font-normal flex items-center gap-2 mt-0.5">
                      <span className="capitalize">{task.task_type}</span>
                      {task.is_blocked && (
                        <span className="text-amber-700 flex items-center gap-0.5 font-medium">
                          <AlertTriangle className="w-3 h-3" /> Blocked
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {task.project?.name || <span className="text-slate-400">–</span>}
                  </td>
                  {showAssignee && (
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {task.assignee?.full_name || 'Unassigned'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {task.assignee?.department || ''}
                      </div>
                    </td>
                  )}
                  <td className="py-3.5 px-4">
                    <TaskPriorityBadge priority={task.priority} />
                  </td>
                  <td className="py-3.5 px-4">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-semibold ${
                        isOverdue
                          ? 'text-red-700 font-bold'
                          : 'text-slate-800'
                      }`}
                    >
                      {formatDate(task.due_date)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 w-28">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={task.progress_percentage || 0} size="sm" />
                      <span className="text-[11px] font-mono text-slate-600 font-medium">
                        {task.progress_percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-blue-700 font-bold">
                      {formatHours(task.actual_hours)}
                    </span>{' '}
                    <span className="text-slate-500 font-medium">/ {formatHours(task.estimated_hours)}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 p-1 inline-flex items-center gap-1 font-semibold">
                      <span className="text-[11px]">Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

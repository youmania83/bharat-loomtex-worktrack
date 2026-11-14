'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatDate, formatHours } from '@/lib/utils/formatters';
import { Clock, AlertTriangle } from 'lucide-react';

interface TaskKanbanViewProps {
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
  showAssignee?: boolean;
}

const COLUMNS = [
  { id: 'not_started', label: 'Not Started', color: 'border-slate-300' },
  { id: 'in_progress', label: 'In Progress', color: 'border-blue-500' },
  { id: 'on_hold', label: 'On Hold / Blocked', color: 'border-amber-500' },
  { id: 'submitted', label: 'Awaiting Review', color: 'border-purple-500' },
  { id: 'completed', label: 'Completed', color: 'border-emerald-500' },
];

export function TaskKanbanView({ tasks, onSelectTask, showAssignee = true }: TaskKanbanViewProps) {
  const getTasksForColumn = (colId: string) => {
    if (colId === 'on_hold') {
      return tasks.filter((t) => t.status === 'on_hold' || t.status === 'rejected' || t.is_blocked);
    }
    if (colId === 'completed') {
      return tasks.filter((t) => t.status === 'completed');
    }
    return tasks.filter((t) => t.status === colId && !t.is_blocked);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colTasks = getTasksForColumn(col.id);
        return (
          <div
            key={col.id}
            className="bg-slate-100/70 rounded-xl p-3 border border-slate-200 flex flex-col min-w-[260px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  col.id === 'completed' ? 'bg-emerald-600' :
                  col.id === 'submitted' ? 'bg-purple-600' :
                  col.id === 'on_hold' ? 'bg-amber-600' :
                  col.id === 'in_progress' ? 'bg-blue-600' : 'bg-slate-400'
                }`} />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {col.label}
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {colTasks.length}
              </span>
            </div>

            {/* Task Cards */}
            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
              {colTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 italic">No tasks</div>
              ) : (
                colTasks.map((task) => {
                  const isOverdue =
                    task.status === 'overdue' ||
                    (task.status !== 'completed' &&
                      task.status !== 'submitted' &&
                      new Date(task.due_date) < new Date());

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task.id)}
                      className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-500 cursor-pointer transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <TaskPriorityBadge priority={task.priority} />
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                          {task.task_type}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                        {task.title}
                      </h4>

                      {task.project && (
                        <div className="text-[11px] text-blue-700 font-medium truncate">
                          📁 {task.project.name}
                        </div>
                      )}

                      {task.is_blocked && (
                        <div className="text-[11px] text-amber-700 flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Blocker: {task.blocker_reason || 'Flagged'}</span>
                        </div>
                      )}

                      <div className="pt-1">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>Progress</span>
                          <span className="font-mono font-medium">{task.progress_percentage}%</span>
                        </div>
                        <ProgressBar value={task.progress_percentage} size="sm" />
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                        <div className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatHours(task.actual_hours)}</span>
                        </div>
                        <span className={isOverdue ? 'text-red-700 font-bold' : ''}>
                          {formatDate(task.due_date)}
                        </span>
                      </div>

                      {showAssignee && task.assignee && (
                        <div className="pt-1 text-[11px] font-medium text-slate-800 truncate">
                          👤 {task.assignee.full_name}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

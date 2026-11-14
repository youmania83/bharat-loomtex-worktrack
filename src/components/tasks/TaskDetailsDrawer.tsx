'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Clock, AlertTriangle, CheckCircle, Send, Check, RotateCcw } from 'lucide-react';
import { Task, TaskComment, TaskActivityLog } from '@/lib/types';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskTimerWidget } from './TaskTimerWidget';
import { Button } from '@/components/ui/Button';
import { formatDate, formatDateTime, formatHours } from '@/lib/utils/formatters';

interface TaskDetailsDrawerProps {
  taskId: string | null;
  currentUserId: string;
  currentUserRole: 'admin' | 'employee';
  onClose: () => void;
  onTaskUpdated?: () => void;
}

export function TaskDetailsDrawer({
  taskId,
  currentUserId: _currentUserId,
  currentUserRole,
  onClose,
  onTaskUpdated,
}: TaskDetailsDrawerProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activityLogs, setActivityLogs] = useState<TaskActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');

  // Form states
  const [newComment, setNewComment] = useState('');
  const [isBlocker, setIsBlocker] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [progressVal, setProgressVal] = useState(0);

  // Approval / Submission modal states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      const data = await res.json();
      if (data.success) {
        setTask(data.task);
        setProgressVal(data.task.progress_percentage || 0);
        setComments(data.comments || []);
        setActivityLogs(data.activityLogs || []);
      }
    } catch (err) {
      console.error('Error fetching task', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (val: number) => {
    if (!taskId) return;
    setProgressVal(val);
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress_percentage: val }),
      });
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !newComment.trim()) return;
    setCommentSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, isBlocker }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [...prev, data.comment]);
        setNewComment('');
        setIsBlocker(false);
        fetchTaskDetails();
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!taskId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: submissionNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setShowSubmitModal(false);
        fetchTaskDetails();
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!taskId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        fetchTaskDetails();
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!taskId || !rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRejectModal(false);
        fetchTaskDetails();
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (!taskId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task && <TaskStatusBadge status={task.status} />}
              {task && <TaskPriorityBadge priority={task.priority} />}
              <span className="text-xs font-mono text-slate-400 uppercase">
                {task?.task_type === 'daily' ? 'Daily Task' : 'Project Task'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : task ? (
            <>
              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Title & Project */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                    {task.title}
                  </h2>
                  {task.project && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
                      📁 {task.project.name}
                    </p>
                  )}
                </div>

                {/* Blocker Alert Banner if on hold or blocked */}
                {task.is_blocked && (
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-amber-900 dark:text-amber-200 uppercase">
                        Work Blocked
                      </div>
                      <div className="text-sm text-amber-800 dark:text-amber-300 mt-0.5">
                        {task.blocker_reason || 'This task is flagged with an active blocker.'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection / Correction Banner */}
                {task.status === 'rejected' && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-xl flex items-start gap-3">
                    <RotateCcw className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-red-900 dark:text-red-200 uppercase">
                        Revision Requested by Admin
                      </div>
                      <div className="text-sm text-red-800 dark:text-red-300 mt-0.5">
                        {task.rejection_reason}
                      </div>
                    </div>
                  </div>
                )}

                {/* Completion Notes Banner */}
                {task.completion_notes && (
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl">
                    <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 uppercase">
                      Submission Notes
                    </div>
                    <div className="text-sm text-emerald-800 dark:text-emerald-400 mt-0.5">
                      {task.completion_notes}
                    </div>
                  </div>
                )}

                {/* Task Timer Widget */}
                {task.status !== 'completed' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Active Time Tracking
                    </label>
                    <TaskTimerWidget
                      taskId={task.id}
                      taskTitle={task.title}
                      onTimerChange={fetchTaskDetails}
                    />
                  </div>
                )}

                {/* Progress Slider (Only if not completed) */}
                {task.status !== 'completed' && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Update Progress Percentage
                      </span>
                      <span className="text-sm font-bold text-blue-600 font-mono">
                        {progressVal}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={progressVal}
                      onChange={(e) => setProgressVal(Number(e.target.value))}
                      onMouseUp={() => handleUpdateProgress(progressVal)}
                      onTouchEnd={() => handleUpdateProgress(progressVal)}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>
                      Assignee: <strong className="text-slate-900 dark:text-white">{task.assignee?.full_name || '–'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                      Deadline: <strong className="text-slate-900 dark:text-white">{formatDate(task.due_date)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>
                      Est: <strong>{formatHours(task.estimated_hours)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>
                      Logged: <strong className="text-blue-600 dark:text-blue-400">{formatHours(task.actual_hours)}</strong>
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Description & Deliverables
                  </h3>
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl whitespace-pre-wrap">
                    {task.description || 'No detailed instructions provided.'}
                  </div>
                </div>

                {/* Tabs for Comments & Activity */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                  <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                    <button
                      onClick={() => setActiveTab('comments')}
                      className={`pb-2 text-xs font-semibold transition-colors border-b-2 ${
                        activeTab === 'comments'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Comments ({comments.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className={`pb-2 text-xs font-semibold transition-colors border-b-2 ${
                        activeTab === 'activity'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Audit Trail ({activityLogs.length})
                    </button>
                  </div>

                  {activeTab === 'comments' ? (
                    <div className="space-y-4">
                      {/* Comment stream */}
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {comments.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No comments yet.</p>
                        ) : (
                          comments.map((c) => (
                            <div
                              key={c.id}
                              className={`p-3 rounded-xl border text-xs ${
                                c.is_blocker
                                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {c.author?.full_name || 'Team Member'}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {formatDateTime(c.created_at)}
                                </span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300">{c.content}</p>
                              {c.is_blocker && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1">
                                  <AlertTriangle className="w-3 h-3" /> Flagged as Blocker
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add comment form */}
                      <form onSubmit={handleAddComment} className="space-y-2">
                        <textarea
                          rows={2}
                          placeholder="Type an update or blocker note..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-blue-500"
                        />
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isBlocker}
                              onChange={(e) => setIsBlocker(e.target.checked)}
                              className="accent-amber-500"
                            />
                            <span>Flag as Blocker</span>
                          </label>
                          <Button size="sm" type="submit" isLoading={commentSubmitting}>
                            <Send className="w-3.5 h-3.5" /> Post Update
                          </Button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    /* Activity Audit Trail */
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {activityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-2.5 text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <div className="flex-1">
                            <div className="text-slate-700 dark:text-slate-300 font-medium">
                              {log.details || `Action: ${log.action}`}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {log.actor?.full_name || 'System'} • {formatDateTime(log.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                {currentUserRole === 'admin' ? (
                  /* Admin Approval Actions */
                  <div className="flex items-center gap-2 w-full justify-end">
                    {task.status === 'submitted' ? (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setShowRejectModal(true)}
                          disabled={actionLoading}
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Return with Feedback
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={handleApprove}
                          isLoading={actionLoading}
                        >
                          <Check className="w-3.5 h-3.5" /> Approve & Complete
                        </Button>
                      </>
                    ) : task.status === 'completed' ? (
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Task Completed & Approved
                      </span>
                    ) : (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={handleApprove}
                        isLoading={actionLoading}
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Approved
                      </Button>
                    )}
                  </div>
                ) : (
                  /* Employee Actions */
                  <div className="flex items-center gap-2 w-full justify-end">
                    {task.status !== 'completed' && task.status !== 'submitted' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowSubmitModal(true)}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Submit for Approval
                      </Button>
                    ) : task.status === 'submitted' ? (
                      <span className="text-xs text-purple-600 font-medium flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Awaiting Management Approval
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Completed
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Submit for Review Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Submit Task for Review
            </h3>
            <p className="text-xs text-slate-500">
              Please enter deliverables, completion notes, or test results for management approval.
            </p>
            <textarea
              rows={4}
              placeholder="e.g. Completed feature implementation, verified with unit tests and deployed to preview environment."
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-blue-500"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitForReview}
                isLoading={actionLoading}
              >
                Confirm Submission
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject / Return with Feedback Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <RotateCcw className="w-5 h-5" /> Return Task for Correction
            </h3>
            <p className="text-xs text-slate-500">
              Provide actionable feedback for the employee on what needs revision before approval.
            </p>
            <textarea
              rows={4}
              placeholder="e.g. Unit tests are failing on edge cases, or missing required phone number format validation."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-red-500"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
                isLoading={actionLoading}
                disabled={!rejectionReason.trim()}
              >
                Return Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

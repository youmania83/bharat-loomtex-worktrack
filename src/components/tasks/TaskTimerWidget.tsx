'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/lib/utils/formatters';

interface TaskTimerWidgetProps {
  taskId: string;
  taskTitle?: string;
  isInitialRunning?: boolean;
  initialElapsedSeconds?: number;
  onTimerChange?: () => void;
  compact?: boolean;
}

export function TaskTimerWidget({
  taskId,
  taskTitle: _taskTitle,
  isInitialRunning = false,
  initialElapsedSeconds = 0,
  onTimerChange,
  compact = false,
}: TaskTimerWidgetProps) {
  const [isRunning, setIsRunning] = useState(isInitialRunning);
  const [elapsed, setElapsed] = useState(initialElapsedSeconds);
  const [loading, setLoading] = useState(false);

  // Synchronize if initial state updates
  useEffect(() => {
    setIsRunning(isInitialRunning);
    setElapsed(initialElapsedSeconds);
  }, [isInitialRunning, initialElapsedSeconds]);

  // Live seconds ticker while timer is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleToggleTimer = async () => {
    setLoading(true);
    try {
      const action = isRunning ? 'pause' : 'start';
      const res = await fetch(`/api/tasks/${taskId}/timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setIsRunning(!isRunning);
        if (onTimerChange) onTimerChange();
      } else {
        alert(data.error || 'Failed to update timer');
      }
    } catch (err) {
      console.error('Timer action failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStopTimer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });
      const data = await res.json();
      if (data.success) {
        setIsRunning(false);
        if (onTimerChange) onTimerChange();
      }
    } catch (err) {
      console.error('Failed to stop timer', err);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
        <Clock className={`w-3.5 h-3.5 ${isRunning ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
        <span className="font-mono text-xs font-bold text-slate-800">
          {formatDuration(elapsed)}
        </span>
        <Button
          size="sm"
          variant={isRunning ? 'danger' : 'primary'}
          onClick={handleToggleTimer}
          isLoading={loading}
          className="h-6 w-6 p-0 rounded-full"
          title={isRunning ? 'Pause Timer' : 'Start Timer'}
        >
          {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 gap-3">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isRunning
              ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/30'
              : 'bg-slate-200 text-slate-700'
          }`}
        >
          <Clock className={`w-5 h-5 ${isRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500">
            {isRunning ? 'Currently Tracking Work' : 'Task Work Timer'}
          </div>
          <div className="font-mono text-xl font-bold tracking-tight text-slate-900">
            {formatDuration(elapsed)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Button
          variant={isRunning ? 'outline' : 'primary'}
          size="sm"
          onClick={handleToggleTimer}
          isLoading={loading}
          className={isRunning ? '' : 'bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm'}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause Timer
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Start Timer
            </>
          )}
        </Button>
        {elapsed > 0 && isRunning && (
          <Button variant="danger" size="sm" onClick={handleStopTimer} isLoading={loading}>
            <Square className="w-3.5 h-3.5" /> Stop
          </Button>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ProgressBarProps {
  value: number; // 0 - 100
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export function ProgressBar({ value, size = 'md', className, showText = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const getColor = (v: number) => {
    if (v >= 80) return 'bg-emerald-500';
    if (v >= 40) return 'bg-blue-600';
    if (v > 0) return 'bg-amber-500';
    return 'bg-slate-300';
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full transition-all duration-300 ease-out rounded-full', getColor(clamped))}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showText && (
        <div className="flex justify-between items-center text-xs text-slate-500 mt-1 font-medium">
          <span>{clamped}% Complete</span>
        </div>
      )}
    </div>
  );
}

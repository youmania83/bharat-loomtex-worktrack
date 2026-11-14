import React from 'react';
import { Card } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  trendText?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trendText,
  onClick,
}: MetricCardProps) {
  const iconVariants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400',
    danger: 'bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400',
    info: 'bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400',
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-5 transition-all',
        onClick && 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          )}
          {trendText && (
            <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
              <span>{trendText}</span>
            </div>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl', iconVariants[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

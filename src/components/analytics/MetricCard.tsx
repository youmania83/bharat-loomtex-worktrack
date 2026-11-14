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
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-5 transition-all bg-white border border-slate-200/90 shadow-xs',
        onClick && 'cursor-pointer hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {value}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{subtitle}</p>
          )}
          {trendText && (
            <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 pt-1">
              <span>{trendText}</span>
            </div>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl shrink-0', iconVariants[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

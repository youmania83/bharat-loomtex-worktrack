import React from 'react';
import { Badge } from '@/lib/../components/ui/Badge';
import { TaskStatus } from '@/lib/types';
import { formatStatusLabel } from '@/lib/utils/formatters';

export function TaskStatusBadge({ status }: { status: TaskStatus | string }) {
  const getVariant = (s: string) => {
    switch (s) {
      case 'completed':
        return 'success';
      case 'submitted':
        return 'purple';
      case 'in_progress':
        return 'info';
      case 'on_hold':
        return 'warning';
      case 'overdue':
      case 'rejected':
        return 'danger';
      case 'not_started':
      default:
        return 'default';
    }
  };

  return <Badge variant={getVariant(status)}>{formatStatusLabel(status)}</Badge>;
}

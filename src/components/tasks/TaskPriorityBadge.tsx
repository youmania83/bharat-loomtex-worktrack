import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { TaskPriority } from '@/lib/types';
import { formatPriorityLabel } from '@/lib/utils/formatters';

export function TaskPriorityBadge({ priority }: { priority: TaskPriority | string }) {
  const getVariant = (p: string) => {
    switch (p) {
      case 'urgent':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
      default:
        return 'default';
    }
  };

  return <Badge variant={getVariant(priority)}>{formatPriorityLabel(priority)}</Badge>;
}

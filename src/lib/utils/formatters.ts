// Format dates, durations, and text for UI displays
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '–';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '–';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '–';
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '–';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '–';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '–';
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return [
    hrs.toString().padStart(2, '0'),
    mins.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
  ].join(':');
}

export function formatHours(hours: number | null | undefined): string {
  if (hours == null || isNaN(hours)) return '0.0h';
  return `${hours.toFixed(1)}h`;
}

export function formatStatusLabel(status: string): string {
  switch (status) {
    case 'not_started':
      return 'Not Started';
    case 'in_progress':
      return 'In Progress';
    case 'on_hold':
      return 'On Hold';
    case 'submitted':
      return 'Awaiting Approval';
    case 'completed':
      return 'Completed';
    case 'rejected':
      return 'Returned / Rejected';
    case 'overdue':
      return 'Overdue';
    case 'planning':
      return 'Planning';
    case 'active':
      return 'Active';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

export function formatPriorityLabel(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

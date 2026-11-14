import { EmployeePerformance } from '../types';

export function exportPerformanceToCSV(data: EmployeePerformance[]): string {
  const headers = [
    'Employee Code',
    'Full Name',
    'Department',
    'Designation',
    'Assigned Tasks',
    'Completed Tasks',
    'Pending Tasks',
    'Overdue Tasks',
    'Awaiting Approval',
    'Completion Rate (%)',
    'On-Time Rate (%)',
    'Quality Approval Rate (%)',
    'Total Logged Hours',
    'Avg Completion Hours',
    'Performance Score (100)',
    'Trend',
  ];

  const rows = data.map((item) => [
    `"${item.employee_code}"`,
    `"${item.full_name}"`,
    `"${item.department}"`,
    `"${item.designation}"`,
    item.assigned_count,
    item.completed_count,
    item.pending_count,
    item.overdue_count,
    item.awaiting_approval_count,
    `${item.completion_rate}%`,
    `${item.on_time_rate}%`,
    `${item.quality_approval_rate}%`,
    item.total_logged_hours,
    item.avg_completion_time_hours,
    item.performance_score,
    item.trend.toUpperCase(),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

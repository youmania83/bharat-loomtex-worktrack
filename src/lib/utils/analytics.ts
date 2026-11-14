import { Task, EmployeePerformance, DashboardMetrics, EmployeeExtended } from '../types';

/**
 * Calculates transparent, mathematically sound performance metrics for an employee.
 * Weighting:
 * - 30% Completion Rate (Completed tasks / Total assigned tasks)
 * - 30% On-Time Completion (Tasks finished on/before deadline / Total completed tasks)
 * - 25% Quality & Approval Rate (Tasks approved without rejection / Total submitted or completed)
 * - 15% Progress Consistency (Average progress % across active workload)
 */
export function calculateEmployeePerformance(
  emp: EmployeeExtended,
  tasks: Task[]
): EmployeePerformance {
  const empTasks = tasks.filter((t) => t.assigned_to === emp.profile_id);
  const assigned_count = empTasks.length;

  const completed_tasks = empTasks.filter((t) => t.status === 'completed');
  const completed_count = completed_tasks.length;

  const pending_count = empTasks.filter(
    (t) => t.status === 'not_started' || t.status === 'in_progress' || t.status === 'on_hold'
  ).length;

  const awaiting_approval_count = empTasks.filter((t) => t.status === 'submitted').length;

  // Overdue check: task marked overdue or due_date passed and not completed
  const now = new Date();
  const overdue_tasks = empTasks.filter((t) => {
    if (t.status === 'overdue') return true;
    if (t.status !== 'completed' && t.status !== 'submitted') {
      return new Date(t.due_date) < now;
    }
    return false;
  });
  const overdue_count = overdue_tasks.length;

  // 1. Completion Rate (0 - 100)
  const completion_rate =
    assigned_count > 0 ? Math.round((completed_count / assigned_count) * 100) : 0;

  // 2. On-Time Completion Rate (0 - 100)
  let on_time_completed = 0;
  completed_tasks.forEach((t) => {
    const finishedAt = t.completed_at ? new Date(t.completed_at) : new Date(t.updated_at);
    const deadline = new Date(t.due_date);
    if (finishedAt <= deadline) {
      on_time_completed++;
    }
  });
  const on_time_rate =
    completed_count > 0 ? Math.round((on_time_completed / completed_count) * 100) : 100;

  // 3. Quality / Approval Rate (0 - 100)
  const rejected_count = empTasks.filter((t) => t.status === 'rejected' || t.rejection_reason).length;
  const review_pool = completed_count + awaiting_approval_count + rejected_count;
  const quality_approval_rate =
    review_pool > 0
      ? Math.max(0, Math.round(((review_pool - rejected_count) / review_pool) * 100))
      : 100;

  // 4. Progress Consistency (0 - 100)
  const avg_progress =
    assigned_count > 0
      ? Math.round(empTasks.reduce((acc, t) => acc + (t.progress_percentage || 0), 0) / assigned_count)
      : 0;

  // Weighted Score Formula:
  // (30% * Completion) + (30% * On-Time) + (25% * Quality) + (15% * Progress Consistency)
  const rawScore =
    0.3 * completion_rate +
    0.3 * on_time_rate +
    0.25 * quality_approval_rate +
    0.15 * avg_progress;

  const performance_score = assigned_count > 0 ? Math.min(100, Math.max(0, Math.round(rawScore))) : 0;

  // Total hours & average completion time
  const total_logged_hours = empTasks.reduce((acc, t) => acc + (Number(t.actual_hours) || 0), 0);
  const avg_completion_time_hours =
    completed_count > 0
      ? Number((completed_tasks.reduce((acc, t) => acc + (Number(t.actual_hours) || 0), 0) / completed_count).toFixed(1))
      : 0;

  const trend: 'up' | 'stable' | 'down' =
    performance_score >= 80 ? 'up' : performance_score >= 60 ? 'stable' : 'down';

  return {
    employee_id: emp.profile_id,
    employee_code: emp.employee_code,
    full_name: emp.profile?.full_name || 'Employee',
    email: emp.profile?.email || '',
    department: emp.profile?.department || 'Engineering',
    designation: emp.profile?.designation || 'Specialist',
    assigned_count,
    completed_count,
    pending_count,
    overdue_count,
    awaiting_approval_count,
    completion_rate,
    on_time_rate,
    quality_approval_rate,
    avg_completion_time_hours,
    total_logged_hours: Number(total_logged_hours.toFixed(1)),
    performance_score,
    trend,
  };
}

/**
 * Calculates company-wide aggregate dashboard metrics from real database rows.
 */
export function calculateDashboardMetrics(
  employees: EmployeeExtended[],
  tasks: Task[],
  activeProjectsCount: number
): DashboardMetrics {
  const total_employees = employees.filter((e) => e.profile?.status === 'active').length;
  const total_tasks = tasks.length;
  const completed_tasks = tasks.filter((t) => t.status === 'completed').length;
  const pending_tasks = tasks.filter(
    (t) => t.status === 'not_started' || t.status === 'in_progress' || t.status === 'on_hold'
  ).length;

  const now = new Date();
  const overdue_tasks = tasks.filter((t) => {
    if (t.status === 'overdue') return true;
    if (t.status !== 'completed' && t.status !== 'submitted') {
      return new Date(t.due_date) < now;
    }
    return false;
  }).length;

  const tasks_awaiting_approval = tasks.filter((t) => t.status === 'submitted').length;

  const overall_completion_rate =
    total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;

  // On-time completion overall
  let on_time_completed = 0;
  tasks.filter((t) => t.status === 'completed').forEach((t) => {
    const finishedAt = t.completed_at ? new Date(t.completed_at) : new Date(t.updated_at);
    if (finishedAt <= new Date(t.due_date)) {
      on_time_completed++;
    }
  });
  const overall_on_time_rate =
    completed_tasks > 0 ? Math.round((on_time_completed / completed_tasks) * 100) : 100;

  const total_hours_logged = Number(
    tasks.reduce((acc, t) => acc + (Number(t.actual_hours) || 0), 0).toFixed(1)
  );

  return {
    total_employees,
    active_projects: activeProjectsCount,
    total_tasks,
    completed_tasks,
    pending_tasks,
    overdue_tasks,
    tasks_awaiting_approval,
    overall_completion_rate,
    overall_on_time_rate,
    total_hours_logged,
  };
}

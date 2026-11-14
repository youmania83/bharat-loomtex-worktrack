// ==============================================================================
// RISON WORKTRACK – TypeScript Types & Interfaces
// Product: Rison WorkTrack | Company: Rison AI Tech
// ==============================================================================

export type UserRole = 'admin' | 'employee';
export type UserStatus = 'active' | 'inactive';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type TaskType = 'daily' | 'project';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus =
  | 'not_started'
  | 'in_progress'
  | 'on_hold'
  | 'submitted'
  | 'completed'
  | 'rejected'
  | 'overdue';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  department: string;
  designation: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface EmployeeExtended {
  id: string;
  profile_id: string;
  employee_code: string;
  joining_date: string;
  hourly_rate: number;
  emergency_contact?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Project {
  id: string;
  name: string;
  client_name?: string;
  description: string;
  status: ProjectStatus;
  start_date: string;
  target_end_date?: string;
  budget_hours: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  members_count?: number;
  completed_tasks_count?: number;
  total_tasks_count?: number;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  employee_id: string;
  role_in_project: string;
  joined_at: string;
  profile?: Profile;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  task_type: TaskType;
  project_id?: string;
  assigned_by?: string;
  assigned_to: string;
  priority: TaskPriority;
  status: TaskStatus;
  start_date: string;
  due_date: string;
  estimated_hours: number;
  actual_hours: number;
  progress_percentage: number;
  completion_notes?: string;
  rejection_reason?: string;
  blocker_reason?: string;
  is_blocked: boolean;
  approved_by?: string;
  approved_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined relation details
  project?: Project;
  assignee?: Profile;
  creator?: Profile;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  is_blocker: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type?: string;
  created_at: string;
  uploader?: Profile;
}

export interface TaskTimeLog {
  id: string;
  task_id: string;
  employee_id: string;
  started_at: string;
  stopped_at?: string;
  duration_seconds: number;
  is_running: boolean;
  note?: string;
  created_at: string;
  task?: Task;
}

export interface TaskActivityLog {
  id: string;
  task_id: string;
  actor_id: string;
  action: string;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  details?: string;
  created_at: string;
  actor?: Profile;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type:
    | 'task_assigned'
    | 'task_submitted'
    | 'task_approved'
    | 'task_rejected'
    | 'deadline_approaching'
    | 'task_overdue'
    | 'comment_added';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface EmployeePerformance {
  employee_id: string;
  employee_code: string;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  assigned_count: number;
  completed_count: number;
  pending_count: number;
  overdue_count: number;
  awaiting_approval_count: number;
  completion_rate: number; // 0 - 100%
  on_time_rate: number; // 0 - 100%
  quality_approval_rate: number; // 0 - 100%
  avg_completion_time_hours: number;
  total_logged_hours: number;
  performance_score: number; // Calculated weighted score 0 - 100
  trend: 'up' | 'stable' | 'down';
}

export interface WorkSession {
  id: string;
  user_id: string;
  login_at: string;
  logout_at?: string;
  duration_seconds: number;
  is_active: boolean;
  notes?: string;
  user?: Profile;
}

export interface EmployeeAttendanceToday {
  employee_id: string;
  employee_code: string;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  is_online: boolean;
  first_login_at?: string;
  last_logout_at?: string;
  today_shift_hours: number;
  today_task_hours: number;
  active_tasks_count: number;
}

export interface DashboardMetrics {
  total_employees: number;
  active_projects: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  tasks_awaiting_approval: number;
  overall_completion_rate: number;
  overall_on_time_rate: number;
  total_hours_logged: number;
}

import { memoryDb } from './store';
import {
  Profile,
  EmployeeExtended,
  Project,
  Task,
  TaskComment,
  NotificationItem,
  TaskTimeLog,
  TaskActivityLog,
  EmployeePerformance,
  DashboardMetrics,
  WorkSession,
  EmployeeAttendanceToday,
} from '../types';
import { calculateEmployeePerformance, calculateDashboardMetrics } from '../utils/analytics';

export const db = {
  // Profiles & Users
  getProfiles: async (): Promise<Profile[]> => {
    return memoryDb.getProfiles();
  },

  getProfile: async (id: string): Promise<Profile | undefined> => {
    return memoryDb.getProfile(id);
  },

  getEmployees: async (): Promise<EmployeeExtended[]> => {
    return memoryDb.getEmployees();
  },

  createEmployee: async (data: {
    email: string;
    full_name: string;
    phone?: string;
    department: string;
    designation: string;
    employee_code: string;
    hourly_rate?: number;
    joining_date?: string;
  }): Promise<EmployeeExtended> => {
    return memoryDb.createEmployee(data);
  },

  updateEmployee: async (
    profileId: string,
    updates: Partial<Profile> & { hourly_rate?: number; employee_code?: string }
  ): Promise<EmployeeExtended | null> => {
    return memoryDb.updateEmployee(profileId, updates);
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    return memoryDb.getProjects();
  },

  getProject: async (id: string): Promise<Project | undefined> => {
    return memoryDb.getProject(id);
  },

  createProject: async (
    data: Omit<Project, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Project> => {
    return memoryDb.createProject(data);
  },

  updateProject: async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    return memoryDb.updateProject(id, updates);
  },

  // Tasks
  getTasks: async (filters?: {
    role?: 'admin' | 'employee';
    userId?: string;
    projectId?: string;
    status?: string;
    employeeId?: string;
  }): Promise<Task[]> => {
    return memoryDb.getTasks(filters);
  },

  getTask: async (id: string): Promise<Task | undefined> => {
    return memoryDb.getTask(id);
  },

  createTask: async (data: {
    title: string;
    description: string;
    task_type: 'daily' | 'project';
    project_id?: string;
    assigned_to: string;
    assigned_by: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date: string;
    estimated_hours?: number;
  }): Promise<Task> => {
    return memoryDb.createTask(data);
  },

  updateTask: async (
    id: string,
    updates: Partial<Task>,
    actorId: string
  ): Promise<Task | null> => {
    return memoryDb.updateTask(id, updates, actorId);
  },

  submitTaskForReview: async (
    id: string,
    notes: string,
    employeeId: string
  ): Promise<Task | null> => {
    return memoryDb.submitTaskForReview(id, notes, employeeId);
  },

  approveTask: async (id: string, adminId: string): Promise<Task | null> => {
    return memoryDb.approveTask(id, adminId);
  },

  rejectTask: async (
    id: string,
    reason: string,
    adminId: string
  ): Promise<Task | null> => {
    return memoryDb.rejectTask(id, reason, adminId);
  },

  // Timers & Time Logs
  startTaskTimer: async (taskId: string, employeeId: string) => {
    return memoryDb.startTaskTimer(taskId, employeeId);
  },

  pauseTaskTimer: async (taskId: string, employeeId: string) => {
    return memoryDb.pauseTaskTimer(taskId, employeeId);
  },

  stopTaskTimer: async (taskId: string, employeeId: string) => {
    return memoryDb.stopTaskTimer(taskId, employeeId);
  },

  getRunningTimer: async (employeeId: string) => {
    return memoryDb.getRunningTimer(employeeId);
  },

  getTimeLogsForTask: async (taskId: string): Promise<TaskTimeLog[]> => {
    return memoryDb.getTimeLogsForTask(taskId);
  },

  // Comments
  getComments: async (taskId: string): Promise<TaskComment[]> => {
    return memoryDb.getComments(taskId);
  },

  addComment: async (
    taskId: string,
    authorId: string,
    content: string,
    isBlocker?: boolean
  ): Promise<TaskComment> => {
    return memoryDb.addComment(taskId, authorId, content, isBlocker);
  },

  // Shift & Attendance Work Sessions
  clockIn: async (userId: string): Promise<WorkSession> => {
    return memoryDb.clockIn(userId);
  },

  clockOut: async (userId: string, notes?: string): Promise<WorkSession | null> => {
    return memoryDb.clockOut(userId, notes);
  },

  getWorkSessions: async (userId?: string): Promise<WorkSession[]> => {
    return memoryDb.getWorkSessions(userId);
  },

  getTodayAttendanceSummary: async (): Promise<EmployeeAttendanceToday[]> => {
    return memoryDb.getTodayAttendanceSummary();
  },

  // Notifications
  getNotifications: async (userId: string): Promise<NotificationItem[]> => {
    memoryDb.checkAndNotifyOverdueAndDelayedTasks();
    return memoryDb.getNotifications(userId);
  },

  checkAndNotifyOverdueAndDelayedTasks: async (): Promise<void> => {
    memoryDb.checkAndNotifyOverdueAndDelayedTasks();
  },

  markNotificationRead: async (id: string): Promise<void> => {
    memoryDb.markNotificationRead(id);
  },

  markAllNotificationsRead: async (userId: string): Promise<void> => {
    memoryDb.markAllNotificationsRead(userId);
  },

  // Activity Logs
  getActivityLogs: async (taskId?: string): Promise<TaskActivityLog[]> => {
    return memoryDb.getActivityLogs(taskId);
  },

  // Calculated Analytics & Metrics
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const employees = memoryDb.getEmployees();
    const tasks = memoryDb.getTasks();
    const projects = memoryDb.getProjects().filter((p) => p.status === 'active');
    return calculateDashboardMetrics(employees, tasks, projects.length);
  },

  getEmployeePerformanceList: async (): Promise<EmployeePerformance[]> => {
    const employees = memoryDb.getEmployees();
    const tasks = memoryDb.getTasks();
    return employees.map((emp) => calculateEmployeePerformance(emp, tasks));
  },

  getSingleEmployeePerformance: async (employeeId: string): Promise<EmployeePerformance | null> => {
    const employees = memoryDb.getEmployees();
    const emp = employees.find((e) => e.profile_id === employeeId);
    if (!emp) return null;
    const tasks = memoryDb.getTasks();
    return calculateEmployeePerformance(emp, tasks);
  },
};

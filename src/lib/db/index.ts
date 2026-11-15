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
    await memoryDb.syncFromStorage();
    return memoryDb.getProfiles();
  },

  getProfile: async (id: string): Promise<Profile | undefined> => {
    await memoryDb.syncFromStorage();
    return memoryDb.getProfile(id);
  },

  getEmployees: async (): Promise<EmployeeExtended[]> => {
    await memoryDb.syncFromStorage();
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
    await memoryDb.syncFromStorage();
    const result = memoryDb.createEmployee(data);
    await memoryDb.persist();
    return result;
  },

  updateEmployee: async (
    profileId: string,
    updates: Partial<Profile> & { hourly_rate?: number; employee_code?: string }
  ): Promise<EmployeeExtended | null> => {
    await memoryDb.syncFromStorage();
    const result = memoryDb.updateEmployee(profileId, updates);
    await memoryDb.persist();
    return result;
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    await memoryDb.syncFromStorage();
    return memoryDb.getProjects();
  },

  getProject: async (id: string): Promise<Project | undefined> => {
    await memoryDb.syncFromStorage();
    return memoryDb.getProject(id);
  },

  createProject: async (
    data: Omit<Project, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Project> => {
    await memoryDb.syncFromStorage();
    const result = memoryDb.createProject(data);
    await memoryDb.persist();
    return result;
  },

  updateProject: async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    await memoryDb.syncFromStorage();
    const result = memoryDb.updateProject(id, updates);
    await memoryDb.persist();
    return result;
  },

  // Tasks
  getTasks: async (filters?: {
    role?: 'admin' | 'manager' | 'employee';
    userId?: string;
    projectId?: string;
    status?: string;
    employeeId?: string;
  }): Promise<Task[]> => {
    await memoryDb.syncFromStorage();
    return memoryDb.getTasks(filters);
  },

  getTask: async (id: string): Promise<Task | undefined> => {
    await memoryDb.syncFromStorage();
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
    await memoryDb.syncFromStorage();
    const result = memoryDb.createTask(data);
    await memoryDb.persist();
    return result;
  },

  updateTask: async (
    id: string,
    updates: Partial<Task>,
    actorId: string
  ): Promise<Task | null> => {
    await memoryDb.syncFromStorage();
    const result = memoryDb.updateTask(id, updates, actorId);
    await memoryDb.persist();
    return result;
  },

  submitTaskForReview: async (
    id: string,
    notes: string,
    employeeId: string
  ): Promise<Task | null> => {
    await memoryDb.syncFromStorage();
    const result = memoryDb.submitTaskForReview(id, notes, employeeId);
    await memoryDb.persist();
    return result;
  },

  approveTask: async (id: string, adminId: string): Promise<Task | null> => {
    await memoryDb.syncFromStorage();
    const result = memoryDb.approveTask(id, adminId);
    await memoryDb.persist();
    return result;
  },

  rejectTask: async (
    id: string,
    reason: string,
    adminId: string
  ): Promise<Task | null> => {
    await memoryDb.syncFromStorage();
    const result = memoryDb.rejectTask(id, reason, adminId);
    await memoryDb.persist();
    return result;
  },

  // Timers & Time Logs
  startTaskTimer: async (taskId: string, employeeId: string) => {
    await memoryDb.syncFromStorage();
    const result = memoryDb.startTaskTimer(taskId, employeeId);
    await memoryDb.persist();
    return result;
  },

  pauseTaskTimer: async (taskId: string, employeeId: string) => {
    await memoryDb.syncFromStorage();
    const result = memoryDb.pauseTaskTimer(taskId, employeeId);
    await memoryDb.persist();
    return result;
  },

  stopTaskTimer: async (taskId: string, employeeId: string) => {
    await memoryDb.syncFromStorage();
    const result = memoryDb.stopTaskTimer(taskId, employeeId);
    await memoryDb.persist();
    return result;
  },

  getRunningTimer: async (employeeId: string) => {
    await memoryDb.syncFromStorage();
    return memoryDb.getRunningTimer(employeeId);
  },

  getTimeLogsForTask: async (taskId: string): Promise<TaskTimeLog[]> => {
    await memoryDb.syncFromStorage();
    return memoryDb.getTimeLogsForTask(taskId);
  },

  // Comments
  getComments: async (taskId: string): Promise<TaskComment[]> => {
    await memoryDb.syncFromStorage();
    return memoryDb.getComments(taskId);
  },

  addComment: async (
    taskId: string,
    authorId: string,
    content: string,
    isBlocker?: boolean
  ): Promise<TaskComment> => {
    await memoryDb.syncFromStorage();
    const result = memoryDb.addComment(taskId, authorId, content, isBlocker);
    await memoryDb.persist();
    return result;
  },

  // Shift & Attendance Work Sessions
  clockIn: async (userId: string): Promise<WorkSession> => {
    await memoryDb.syncFromStorage();
    const result = memoryDb.clockIn(userId);
    await memoryDb.persist();
    return result;
  },

  clockOut: async (userId: string, notes?: string): Promise<WorkSession | null> => {
    await memoryDb.syncFromStorage();
    const result = memoryDb.clockOut(userId, notes);
    await memoryDb.persist();
    return result;
  },

  getWorkSessions: async (userId?: string): Promise<WorkSession[]> => {
    await memoryDb.syncFromStorage();
    return memoryDb.getWorkSessions(userId);
  },

  getTodayAttendanceSummary: async (): Promise<EmployeeAttendanceToday[]> => {
    await memoryDb.syncFromStorage();
    return memoryDb.getTodayAttendanceSummary();
  },

  // Notifications
  getNotifications: async (userId: string): Promise<NotificationItem[]> => {
    await memoryDb.syncFromStorage();
    memoryDb.checkAndNotifyOverdueAndDelayedTasks();
    return memoryDb.getNotifications(userId);
  },

  checkAndNotifyOverdueAndDelayedTasks: async (): Promise<void> => {
    await memoryDb.syncFromStorage();
    memoryDb.checkAndNotifyOverdueAndDelayedTasks();
    await memoryDb.persist();
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await memoryDb.syncFromStorage();
    memoryDb.markNotificationRead(id);
    await memoryDb.persist();
  },

  markAllNotificationsRead: async (userId: string): Promise<void> => {
    await memoryDb.syncFromStorage();
    memoryDb.markAllNotificationsRead(userId);
    await memoryDb.persist();
  },

  // Activity Logs
  getActivityLogs: async (taskId?: string): Promise<TaskActivityLog[]> => {
    await memoryDb.syncFromStorage();
    return memoryDb.getActivityLogs(taskId);
  },

  // Calculated Analytics & Metrics
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    await memoryDb.syncFromStorage();
    const employees = memoryDb.getEmployees();
    const tasks = memoryDb.getTasks();
    const projects = memoryDb.getProjects().filter((p) => p.status === 'active');
    return calculateDashboardMetrics(employees, tasks, projects.length);
  },

  getEmployeePerformanceList: async (): Promise<EmployeePerformance[]> => {
    await memoryDb.syncFromStorage();
    const employees = memoryDb.getEmployees();
    const tasks = memoryDb.getTasks();
    return employees.map((emp) => calculateEmployeePerformance(emp, tasks));
  },

  getSingleEmployeePerformance: async (employeeId: string): Promise<EmployeePerformance | null> => {
    await memoryDb.syncFromStorage();
    const employees = memoryDb.getEmployees();
    const emp = employees.find((e) => e.profile_id === employeeId);
    if (!emp) return null;
    const tasks = memoryDb.getTasks();
    return calculateEmployeePerformance(emp, tasks);
  },
};

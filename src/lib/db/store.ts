import {
  Profile,
  EmployeeExtended,
  Project,
  Task,
  TaskComment,
  NotificationItem,
  TaskTimeLog,
  TaskActivityLog,
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_EMPLOYEES,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_COMMENTS,
  INITIAL_TIME_LOGS,
  INITIAL_NOTIFICATIONS,
} from './mockData';

// Global singleton in memory so changes persist across requests during the server lifecycle
class MemoryStore {
  profiles: Profile[] = [...INITIAL_PROFILES];
  employees: EmployeeExtended[] = [...INITIAL_EMPLOYEES];
  projects: Project[] = [...INITIAL_PROJECTS];
  tasks: Task[] = [...INITIAL_TASKS];
  comments: TaskComment[] = [...INITIAL_COMMENTS];
  timeLogs: TaskTimeLog[] = [...INITIAL_TIME_LOGS];
  activityLogs: TaskActivityLog[] = [];
  notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];

  constructor() {
    this.refreshProjectMetrics();
  }

  // --- Helpers ---
  private refreshProjectMetrics() {
    this.projects = this.projects.map((p) => {
      const pTasks = this.tasks.filter((t) => t.project_id === p.id);
      const completed = pTasks.filter((t) => t.status === 'completed').length;
      return {
        ...p,
        total_tasks_count: pTasks.length,
        completed_tasks_count: completed,
      };
    });
  }

  // --- Profiles & Employees ---
  getProfiles(): Profile[] {
    return [...this.profiles];
  }

  getProfile(id: string): Profile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  getEmployees(): EmployeeExtended[] {
    return this.employees.map((emp) => {
      const profile = this.profiles.find((p) => p.id === emp.profile_id);
      return { ...emp, profile };
    });
  }

  createEmployee(data: {
    email: string;
    full_name: string;
    phone?: string;
    department: string;
    designation: string;
    employee_code: string;
    hourly_rate?: number;
    joining_date?: string;
  }): EmployeeExtended {
    const profileId = `profile-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newProfile: Profile = {
      id: profileId,
      email: data.email,
      full_name: data.full_name,
      role: 'employee',
      phone: data.phone,
      department: data.department,
      designation: data.designation,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.profiles.push(newProfile);

    const newEmp: EmployeeExtended = {
      id: `emp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      profile_id: profileId,
      employee_code: data.employee_code,
      joining_date: data.joining_date || new Date().toISOString().split('T')[0],
      hourly_rate: data.hourly_rate || 600,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: newProfile,
    };
    this.employees.push(newEmp);
    return newEmp;
  }

  updateEmployee(profileId: string, updates: Partial<Profile> & { hourly_rate?: number; employee_code?: string }): EmployeeExtended | null {
    const pIndex = this.profiles.findIndex((p) => p.id === profileId);
    if (pIndex === -1) return null;

    this.profiles[pIndex] = {
      ...this.profiles[pIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const eIndex = this.employees.findIndex((e) => e.profile_id === profileId);
    if (eIndex !== -1) {
      this.employees[eIndex] = {
        ...this.employees[eIndex],
        employee_code: updates.employee_code || this.employees[eIndex].employee_code,
        hourly_rate: updates.hourly_rate !== undefined ? updates.hourly_rate : this.employees[eIndex].hourly_rate,
        updated_at: new Date().toISOString(),
        profile: this.profiles[pIndex],
      };
      return this.employees[eIndex];
    }
    return null;
  }

  // --- Projects ---
  getProjects(): Project[] {
    this.refreshProjectMetrics();
    return [...this.projects];
  }

  getProject(id: string): Project | undefined {
    this.refreshProjectMetrics();
    return this.projects.find((p) => p.id === id);
  }

  createProject(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Project {
    const newProject: Project = {
      ...data,
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      members_count: 0,
      completed_tasks_count: 0,
      total_tasks_count: 0,
    };
    this.projects.push(newProject);
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>): Project | null {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.projects[idx] = {
      ...this.projects[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.projects[idx];
  }

  // --- Tasks ---
  getTasks(filters?: {
    role?: 'admin' | 'employee';
    userId?: string;
    projectId?: string;
    status?: string;
    employeeId?: string;
  }): Task[] {
    let result = [...this.tasks];

    // Enforce role isolation: if role is employee, strictly show ONLY their assigned tasks
    if (filters?.role === 'employee' && filters.userId) {
      result = result.filter((t) => t.assigned_to === filters.userId);
    } else if (filters?.employeeId) {
      result = result.filter((t) => t.assigned_to === filters.employeeId);
    }

    if (filters?.projectId && filters.projectId !== 'all') {
      result = result.filter((t) => t.project_id === filters.projectId);
    }

    if (filters?.status && filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status);
    }

    // Join relations
    return result.map((task) => {
      const project = this.projects.find((p) => p.id === task.project_id);
      const assignee = this.profiles.find((p) => p.id === task.assigned_to);
      const creator = this.profiles.find((p) => p.id === task.assigned_by);
      return {
        ...task,
        project,
        assignee,
        creator,
      };
    });
  }

  getTask(id: string): Task | undefined {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return undefined;
    const project = this.projects.find((p) => p.id === task.project_id);
    const assignee = this.profiles.find((p) => p.id === task.assigned_to);
    const creator = this.profiles.find((p) => p.id === task.assigned_by);
    return { ...task, project, assignee, creator };
  }

  createTask(data: {
    title: string;
    description: string;
    task_type: 'daily' | 'project';
    project_id?: string;
    assigned_to: string;
    assigned_by: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date: string;
    estimated_hours?: number;
  }): Task {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newTask: Task = {
      id: taskId,
      title: data.title,
      description: data.description,
      task_type: data.task_type,
      project_id: data.project_id,
      assigned_to: data.assigned_to,
      assigned_by: data.assigned_by,
      priority: data.priority,
      status: 'not_started',
      start_date: new Date().toISOString(),
      due_date: data.due_date,
      estimated_hours: data.estimated_hours || 4,
      actual_hours: 0,
      progress_percentage: 0,
      is_blocked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.tasks.push(newTask);

    // Notify employee
    this.notifications.unshift({
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: data.assigned_to,
      title: 'New Task Assigned',
      message: `You have been assigned: "${data.title}"`,
      type: 'task_assigned',
      link: '/employee/tasks',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    this.logActivity(newTask.id, data.assigned_by, 'created', null, newTask, `Task created by Admin.`);
    this.refreshProjectMetrics();
    return this.getTask(newTask.id)!;
  }

  updateTask(id: string, updates: Partial<Task>, actorId: string): Task | null {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const old = { ...this.tasks[idx] };
    const updated = {
      ...this.tasks[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // If progress is 100% and was not_started, set in_progress or retain
    if (updated.progress_percentage > 0 && updated.status === 'not_started') {
      updated.status = 'in_progress';
    }

    this.tasks[idx] = updated;
    this.logActivity(id, actorId, 'updated', old, updated, 'Task details updated.');
    this.refreshProjectMetrics();
    return this.getTask(id)!;
  }

  submitTaskForReview(id: string, notes: string, employeeId: string): Task | null {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    // Safety: Stop any running timer for this employee on this task
    this.stopTaskTimer(id, employeeId);

    const old = { ...this.tasks[idx] };
    this.tasks[idx].status = 'submitted';
    this.tasks[idx].progress_percentage = 100;
    this.tasks[idx].completion_notes = notes;
    this.tasks[idx].updated_at = new Date().toISOString();

    // Notify Admin
    const admin = this.profiles.find((p) => p.role === 'admin');
    const emp = this.profiles.find((p) => p.id === employeeId);
    if (admin) {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        user_id: admin.id,
        title: 'Task Submitted for Review',
        message: `${emp?.full_name || 'An employee'} submitted "${this.tasks[idx].title}" for approval.`,
        type: 'task_submitted',
        link: '/admin/tasks?filter=submitted',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    this.logActivity(id, employeeId, 'submitted', old, this.tasks[idx], `Submitted for approval with notes: ${notes}`);
    return this.getTask(id)!;
  }

  approveTask(id: string, adminId: string): Task | null {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const old = { ...this.tasks[idx] };
    this.tasks[idx].status = 'completed';
    this.tasks[idx].completed_at = new Date().toISOString();
    this.tasks[idx].approved_by = adminId;
    this.tasks[idx].approved_at = new Date().toISOString();
    this.tasks[idx].rejection_reason = undefined;
    this.tasks[idx].updated_at = new Date().toISOString();

    // Notify employee
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: this.tasks[idx].assigned_to,
      title: 'Task Approved! 🎉',
      message: `Your task "${this.tasks[idx].title}" was approved by management.`,
      type: 'task_approved',
      link: '/employee/tasks',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    this.logActivity(id, adminId, 'approved', old, this.tasks[idx], 'Task approved by Admin.');
    this.refreshProjectMetrics();
    return this.getTask(id)!;
  }

  rejectTask(id: string, reason: string, adminId: string): Task | null {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const old = { ...this.tasks[idx] };
    this.tasks[idx].status = 'rejected';
    this.tasks[idx].rejection_reason = reason;
    this.tasks[idx].updated_at = new Date().toISOString();

    // Notify employee
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: this.tasks[idx].assigned_to,
      title: 'Task Returned for Revision',
      message: `Task "${this.tasks[idx].title}" requires correction: ${reason}`,
      type: 'task_rejected',
      link: '/employee/tasks',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    this.logActivity(id, adminId, 'rejected', old, this.tasks[idx], `Task rejected with feedback: ${reason}`);
    this.refreshProjectMetrics();
    return this.getTask(id)!;
  }

  // --- TIME TRACKING & TIMER SAFETY ENGINE ---
  startTaskTimer(taskId: string, employeeId: string): { activeTimer: TaskTimeLog; previousPausedTaskId?: string } {
    // CRITICAL SAFETY RULE:
    // Prevent multiple simultaneous active timers for the same employee!
    // Check if employee has any currently running timer anywhere
    let previousPausedTaskId: string | undefined;
    const runningLog = this.timeLogs.find((tl) => tl.employee_id === employeeId && tl.is_running);
    if (runningLog) {
      // Pause it automatically
      const now = new Date();
      const started = new Date(runningLog.started_at);
      const elapsed = Math.max(1, Math.round((now.getTime() - started.getTime()) / 1000));
      runningLog.duration_seconds += elapsed;
      runningLog.is_running = false;
      runningLog.stopped_at = now.toISOString();
      previousPausedTaskId = runningLog.task_id;

      // Update actual hours on previous task
      this.recalculateTaskActualHours(runningLog.task_id);
    }

    // Start new running timer log
    const newLog: TaskTimeLog = {
      id: `timer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      task_id: taskId,
      employee_id: employeeId,
      started_at: new Date().toISOString(),
      duration_seconds: 0,
      is_running: true,
      created_at: new Date().toISOString(),
    };
    this.timeLogs.unshift(newLog);

    // If task was 'not_started', transition to 'in_progress'
    const tIdx = this.tasks.findIndex((t) => t.id === taskId);
    if (tIdx !== -1 && this.tasks[tIdx].status === 'not_started') {
      this.tasks[tIdx].status = 'in_progress';
      this.tasks[tIdx].updated_at = new Date().toISOString();
    }

    this.logActivity(taskId, employeeId, 'timer_started', null, null, 'Live timer started.');
    return { activeTimer: newLog, previousPausedTaskId };
  }

  pauseTaskTimer(taskId: string, employeeId: string): TaskTimeLog | null {
    const running = this.timeLogs.find(
      (tl) => tl.task_id === taskId && tl.employee_id === employeeId && tl.is_running
    );
    if (!running) return null;

    const now = new Date();
    const started = new Date(running.started_at);
    const elapsed = Math.max(1, Math.round((now.getTime() - started.getTime()) / 1000));
    running.duration_seconds += elapsed;
    running.is_running = false;
    running.stopped_at = now.toISOString();

    this.recalculateTaskActualHours(taskId);
    this.logActivity(taskId, employeeId, 'timer_paused', null, null, `Timer paused. Logged ${Math.round(elapsed / 60)} minutes.`);
    return running;
  }

  stopTaskTimer(taskId: string, employeeId: string): TaskTimeLog | null {
    return this.pauseTaskTimer(taskId, employeeId);
  }

  getRunningTimer(employeeId: string): (TaskTimeLog & { currentElapsedSeconds: number; taskTitle: string }) | null {
    const running = this.timeLogs.find((tl) => tl.employee_id === employeeId && tl.is_running);
    if (!running) return null;

    const now = new Date();
    const started = new Date(running.started_at);
    const liveElapsed = Math.max(0, Math.round((now.getTime() - started.getTime()) / 1000));
    const totalElapsed = running.duration_seconds + liveElapsed;

    const task = this.tasks.find((t) => t.id === running.task_id);

    return {
      ...running,
      currentElapsedSeconds: totalElapsed,
      taskTitle: task?.title || 'Active Task',
    };
  }

  getTimeLogsForTask(taskId: string): TaskTimeLog[] {
    return this.timeLogs.filter((tl) => tl.task_id === taskId);
  }

  private recalculateTaskActualHours(taskId: string) {
    const logs = this.timeLogs.filter((tl) => tl.task_id === taskId);
    const totalSeconds = logs.reduce((acc, l) => acc + (l.duration_seconds || 0), 0);
    const hours = Number((totalSeconds / 3600).toFixed(2));

    const tIdx = this.tasks.findIndex((t) => t.id === taskId);
    if (tIdx !== -1) {
      this.tasks[tIdx].actual_hours = hours;
      this.tasks[tIdx].updated_at = new Date().toISOString();
    }
  }

  // --- COMMENTS & COLLABORATION ---
  getComments(taskId: string): TaskComment[] {
    return this.comments
      .filter((c) => c.task_id === taskId)
      .map((c) => ({
        ...c,
        author: this.profiles.find((p) => p.id === c.author_id),
      }));
  }

  addComment(taskId: string, authorId: string, content: string, isBlocker: boolean = false): TaskComment {
    const newComment: TaskComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      task_id: taskId,
      author_id: authorId,
      content,
      is_blocker: isBlocker,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.comments.push(newComment);

    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      if (isBlocker) {
        task.is_blocked = true;
        task.status = 'on_hold';
        task.blocker_reason = content;
        task.updated_at = new Date().toISOString();

        // Alert Admin
        const admin = this.profiles.find((p) => p.role === 'admin');
        const author = this.profiles.find((p) => p.id === authorId);
        if (admin) {
          this.notifications.unshift({
            id: `notif-${Date.now()}`,
            user_id: admin.id,
            title: '⚠️ Task Blocker Reported',
            message: `${author?.full_name || 'Employee'} reported a blocker on "${task.title}": ${content}`,
            type: 'comment_added',
            link: `/admin/tasks?id=${taskId}`,
            is_read: false,
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    this.logActivity(taskId, authorId, 'comment_added', null, null, content);
    return {
      ...newComment,
      author: this.profiles.find((p) => p.id === authorId),
    };
  }

  // --- NOTIFICATIONS ---
  getNotifications(userId: string): NotificationItem[] {
    return this.notifications.filter((n) => n.user_id === userId);
  }

  markNotificationRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.is_read = true;
  }

  markAllNotificationsRead(userId: string): void {
    this.notifications.forEach((n) => {
      if (n.user_id === userId) n.is_read = true;
    });
  }

  // --- ACTIVITY LOGS ---
  private logActivity(
    taskId: string,
    actorId: string,
    action: string,
    oldValue: unknown,
    newValue: unknown,
    details?: string
  ) {
    this.activityLogs.unshift({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      task_id: taskId,
      actor_id: actorId,
      action,
      old_value: oldValue as Record<string, unknown>,
      new_value: newValue as Record<string, unknown>,
      details,
      created_at: new Date().toISOString(),
    });
  }

  getActivityLogs(taskId?: string): TaskActivityLog[] {
    let list = this.activityLogs;
    if (taskId) {
      list = list.filter((l) => l.task_id === taskId);
    }
    return list.slice(0, 100).map((l) => ({
      ...l,
      actor: this.profiles.find((p) => p.id === l.actor_id),
    }));
  }
}

// Global variable across Hot Module Reloading in development
const globalForDb = globalThis as unknown as {
  worktrackDb: MemoryStore | undefined;
};

export const memoryDb = globalForDb.worktrackDb ?? new MemoryStore();
if (process.env.NODE_ENV !== 'production') globalForDb.worktrackDb = memoryDb;

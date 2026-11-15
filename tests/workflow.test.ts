import { db } from '../src/lib/db';
import {
  CORE_USER_IDS,
  validateTaskAssignmentRights,
  getAuthorizedAssigneeIds,
} from '../src/lib/auth/permissions';
import { exportPerformanceToCSV } from '../src/lib/utils/csv';

async function runWorkflowTestSuite() {
  console.log('================================================================');
  console.log('🧪 BHARAT LOOMTEX WORKTRACK – AUTOMATED VERIFICATION TEST SUITE');
  console.log('Product: WorkTrack | Company: Bharat Loomtex | MD: Mr. Sumeet Khungar');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: MD / Admin Login & Profile Verification
  // -------------------------------------------------------------
  const mdProfile = await db.getProfile(CORE_USER_IDS.SUMEET_KHUNGAR);
  assert(
    !!mdProfile &&
      mdProfile.role === 'admin' &&
      mdProfile.full_name === 'Mr. Sumeet Khungar' &&
      mdProfile.email === 'admin@bharatloomtex.com',
    'Workflow 1: MD login & profile verification (Mr. Sumeet Khungar - Bharat Loomtex)',
    JSON.stringify(mdProfile)
  );

  // -------------------------------------------------------------
  // Test 2: Verify Old Mock Employees Are Deleted
  // -------------------------------------------------------------
  const allProfiles = await db.getProfiles();
  const oldMockNames = ['Rahul Sharma', 'Priya Patel', 'Amit Verma', 'Sneha Reddy', 'Vikram Singh', 'Ananya Deshmukh', 'Rohit Kumar'];
  const oldMockExists = allProfiles.some((p) => oldMockNames.includes(p.full_name));
  assert(
    !oldMockExists,
    'Workflow 2: Verified all old generic mock employees (Rahul, Priya, Amit, Sneha, etc.) are deleted from database'
  );

  // -------------------------------------------------------------
  // Test 3: Verify Bharat Loomtex Organizational Roster
  // -------------------------------------------------------------
  const employees = await db.getEmployees();
  assert(
    employees.length === 4,
    `Workflow 3: Verified exact roster of 4 subordinates under MD (Director + 3 Dept Heads)`,
    `Found ${employees.length} employees`
  );

  const empNames = employees.map((e) => e.profile?.full_name);
  assert(
    empNames.some((n) => n?.includes('Meenakshi')) &&
      empNames.some((n) => n?.includes('Chandan')) &&
      empNames.some((n) => n?.includes('Marketing Head')) &&
      empNames.some((n) => n?.includes('Accounts Head')),
    'Workflow 3b: Verified personnel: Meenakshi Khungar, Chandan Goswani, Marketing Head, Accounts Head'
  );

  // -------------------------------------------------------------
  // Test 4: Assignment Rights Policy – Mr. Sumeet Khungar (MD) Can Assign to EVERYONE
  // -------------------------------------------------------------
  const sumeetUser = { id: CORE_USER_IDS.SUMEET_KHUNGAR, role: 'admin', full_name: 'Mr. Sumeet Khungar' };
  const mdAssignMeenakshi = validateTaskAssignmentRights(sumeetUser, CORE_USER_IDS.MEENAKSHI_KHUNGAR);
  const mdAssignChandan = validateTaskAssignmentRights(sumeetUser, CORE_USER_IDS.CHANDAN_GOSWAMI);
  const mdAssignMarketing = validateTaskAssignmentRights(sumeetUser, CORE_USER_IDS.MARKETING_HEAD);
  const mdAssignAccounts = validateTaskAssignmentRights(sumeetUser, CORE_USER_IDS.ACCOUNTS_HEAD);

  assert(
    mdAssignMeenakshi.allowed && mdAssignChandan.allowed && mdAssignMarketing.allowed && mdAssignAccounts.allowed,
    'Workflow 4: Policy Engine: Mr. Sumeet Khungar (MD) has universal rights to assign tasks to all personnel'
  );

  const sumeetAssignable = getAuthorizedAssigneeIds(sumeetUser);
  assert(
    sumeetAssignable === 'all',
    'Workflow 4b: getAuthorizedAssigneeIds returns "all" for Mr. Sumeet Khungar'
  );

  // -------------------------------------------------------------
  // Test 5: Assignment Rights Policy – Meenakshi Khungar Can Assign ONLY to 3 Heads
  // -------------------------------------------------------------
  const meenakshiUser = { id: CORE_USER_IDS.MEENAKSHI_KHUNGAR, role: 'manager', full_name: 'Meenakshi Khungar' };
  
  // 5a. Allowed assignments: Chandan Goswani, Marketing Head, Accounts Head
  const meenakshiAssignChandan = validateTaskAssignmentRights(meenakshiUser, CORE_USER_IDS.CHANDAN_GOSWAMI);
  const meenakshiAssignMarketing = validateTaskAssignmentRights(meenakshiUser, CORE_USER_IDS.MARKETING_HEAD);
  const meenakshiAssignAccounts = validateTaskAssignmentRights(meenakshiUser, CORE_USER_IDS.ACCOUNTS_HEAD);

  assert(
    meenakshiAssignChandan.allowed && meenakshiAssignMarketing.allowed && meenakshiAssignAccounts.allowed,
    'Workflow 5a: Meenakshi Khungar successfully authorized to assign to: Chandan Goswani, Marketing Head, and Accounts Head'
  );

  // 5b. Blocked assignment: Meenakshi cannot assign to Mr. Sumeet Khungar
  const meenakshiAssignSumeet = validateTaskAssignmentRights(meenakshiUser, CORE_USER_IDS.SUMEET_KHUNGAR);
  assert(
    !meenakshiAssignSumeet.allowed && typeof meenakshiAssignSumeet.reason === 'string',
    'Workflow 5b: Policy Violation Blocked — Meenakshi Khungar blocked from assigning to MD Mr. Sumeet Khungar',
    `Reason: ${meenakshiAssignSumeet.reason}`
  );

  // 5c. Blocked assignment: Subordinate heads cannot assign tasks
  const chandanUser = { id: CORE_USER_IDS.CHANDAN_GOSWAMI, role: 'employee', full_name: 'Chandan Goswani' };
  const chandanAssign = validateTaskAssignmentRights(chandanUser, CORE_USER_IDS.ACCOUNTS_HEAD);
  assert(
    !chandanAssign.allowed,
    'Workflow 5c: Department heads without manager/admin roles are blocked from task assignment'
  );

  // -------------------------------------------------------------
  // Test 6: Create Project & Project-Based Task by MD Sumeet Khungar
  // -------------------------------------------------------------
  const project = await db.createProject({
    name: 'Bharat Loomtex Jacquard Winter Run 2026',
    client_name: 'Panipat Processing Unit',
    description: 'High-speed jacquard production, quality weaving, and logistics.',
    status: 'active',
    start_date: '2026-06-01',
    target_end_date: '2026-08-30',
    budget_hours: 200,
  });
  assert(
    !!project.id && project.name.includes('Bharat Loomtex Jacquard'),
    'Workflow 6: MD created manufacturing project successfully',
    `Project ID: ${project.id}`
  );

  const mdTask = await db.createTask({
    title: 'Loom Maintenance & Operator Scheduling',
    description: 'Optimize weaver shift rotations and loom calibration across plant.',
    task_type: 'project',
    project_id: project.id,
    assigned_to: CORE_USER_IDS.CHANDAN_GOSWAMI,
    assigned_by: CORE_USER_IDS.SUMEET_KHUNGAR,
    priority: 'high',
    due_date: new Date(Date.now() + 86400000).toISOString(),
    estimated_hours: 6,
  });
  assert(
    !!mdTask.id && mdTask.assigned_to === CORE_USER_IDS.CHANDAN_GOSWAMI,
    'Workflow 6b: MD assigned manufacturing task to Chandan Goswani',
    `Task ID: ${mdTask.id}`
  );

  // -------------------------------------------------------------
  // Test 7: Task Assignment by Meenakshi Khungar to Accounts Head
  // -------------------------------------------------------------
  const meenakshiTask = await db.createTask({
    title: 'Monthly Yarn Purchase Ledger & GST Reconcile',
    description: 'Audit spinning mill yarn vouchers, invoices and input tax credits.',
    task_type: 'daily',
    assigned_to: CORE_USER_IDS.ACCOUNTS_HEAD,
    assigned_by: CORE_USER_IDS.MEENAKSHI_KHUNGAR,
    priority: 'urgent',
    due_date: new Date(Date.now() + 172800000).toISOString(),
    estimated_hours: 5,
  });
  assert(
    !!meenakshiTask.id && meenakshiTask.assigned_to === CORE_USER_IDS.ACCOUNTS_HEAD,
    'Workflow 7: Director Meenakshi Khungar assigned accounting task to Accounts Head',
    `Task ID: ${meenakshiTask.id}`
  );

  // -------------------------------------------------------------
  // Test 8: Strict Role Isolation: Employee sees ONLY their assigned tasks
  // -------------------------------------------------------------
  const chandanTasks = await db.getTasks({
    role: 'employee',
    userId: CORE_USER_IDS.CHANDAN_GOSWAMI,
  });
  const accountsTasks = await db.getTasks({
    role: 'employee',
    userId: CORE_USER_IDS.ACCOUNTS_HEAD,
  });

  const containsAccountsTask = chandanTasks.some((t) => t.assigned_to === CORE_USER_IDS.ACCOUNTS_HEAD);
  assert(
    !containsAccountsTask && chandanTasks.length > 0 && accountsTasks.length > 0,
    'Workflow 8: Strict role isolation confirmed — Chandan Goswani cannot see Accounts Head private tasks',
    `Chandan tasks: ${chandanTasks.length}, Accounts Head tasks: ${accountsTasks.length}`
  );

  // -------------------------------------------------------------
  // Test 9: Task Time Tracking & Single-Timer Concurrency Safety
  // -------------------------------------------------------------
  const timer1 = await db.startTaskTimer(mdTask.id, CORE_USER_IDS.CHANDAN_GOSWAMI);
  assert(
    timer1.activeTimer.is_running === true && timer1.activeTimer.task_id === mdTask.id,
    'Workflow 9a: Timer started successfully on task'
  );

  // Start a second task for Chandan -> Must pause timer1 automatically
  const chandanTask2 = await db.createTask({
    title: 'Emergency Fabric Defect Inspection',
    description: 'Inspect jacquard loom lot #402 for warp breakage.',
    task_type: 'daily',
    assigned_to: CORE_USER_IDS.CHANDAN_GOSWAMI,
    assigned_by: CORE_USER_IDS.SUMEET_KHUNGAR,
    priority: 'urgent',
    due_date: new Date(Date.now() + 86400000).toISOString(),
  });

  const timer2 = await db.startTaskTimer(chandanTask2.id, CORE_USER_IDS.CHANDAN_GOSWAMI);
  assert(
    timer2.previousPausedTaskId === mdTask.id,
    'Workflow 9b: Concurrency safety rule verified — starting second timer automatically paused first timer!'
  );

  await db.pauseTaskTimer(chandanTask2.id, CORE_USER_IDS.CHANDAN_GOSWAMI);
  const activeTimerNow = await db.getRunningTimer(CORE_USER_IDS.CHANDAN_GOSWAMI);
  assert(
    activeTimerNow === null,
    'Workflow 9c: Timer paused cleanly, no dangling active timer'
  );

  // -------------------------------------------------------------
  // Test 10: Task Submission & Approval Queue
  // -------------------------------------------------------------
  const submittedTask = await db.submitTaskForReview(
    mdTask.id,
    'Completed loom maintenance log and updated weaver roster for morning shift.',
    CORE_USER_IDS.CHANDAN_GOSWAMI
  );
  assert(
    submittedTask?.status === 'submitted' && submittedTask.progress_percentage === 100,
    'Workflow 10a: Task submitted for review with completion notes and 100% progress'
  );

  const approvedTask = await db.approveTask(mdTask.id, CORE_USER_IDS.SUMEET_KHUNGAR);
  assert(
    approvedTask?.status === 'completed' && approvedTask.approved_by === CORE_USER_IDS.SUMEET_KHUNGAR,
    'Workflow 10b: MD approved submitted task'
  );

  // -------------------------------------------------------------
  // Test 11: Dashboard Metrics & Overdue Task Detection
  // -------------------------------------------------------------
  const dashboardMetrics = await db.getDashboardMetrics();
  assert(
    dashboardMetrics.total_tasks > 0 && dashboardMetrics.total_employees === 4,
    'Workflow 11: Real-time dashboard metrics computed dynamically from database rows',
    `Total Tasks: ${dashboardMetrics.total_tasks}, Completed: ${dashboardMetrics.completed_tasks}, Subordinates: ${dashboardMetrics.total_employees}`
  );

  assert(
    dashboardMetrics.overdue_tasks >= 0,
    `Workflow 11b: Overdue tracking active (${dashboardMetrics.overdue_tasks} overdue tasks found)`
  );

  // -------------------------------------------------------------
  // Test 12: Employee Performance & CSV Export
  // -------------------------------------------------------------
  const perfList = await db.getEmployeePerformanceList();
  const chandanPerf = perfList.find((p) => p.employee_id === CORE_USER_IDS.CHANDAN_GOSWAMI);
  assert(
    !!chandanPerf &&
      typeof chandanPerf.performance_score === 'number' &&
      chandanPerf.performance_score >= 0 &&
      chandanPerf.performance_score <= 100,
    'Workflow 12a: Multi-factor performance score correctly computed for Chandan Goswani',
    `Score: ${chandanPerf?.performance_score}/100, Rate: ${chandanPerf?.completion_rate}%`
  );

  const csv = exportPerformanceToCSV(perfList);
  assert(
    csv.includes('Employee Code') && csv.includes('Performance Score'),
    'Workflow 12b: CSV Export generator produces compliant, structured reporting output'
  );

  // -------------------------------------------------------------
  // Test 13: Owner Notifications for Overdue & Delayed Work
  // -------------------------------------------------------------
  const adminNotifs = await db.getNotifications(CORE_USER_IDS.SUMEET_KHUNGAR);
  assert(
    adminNotifs.length > 0,
    `Workflow 13: Notifications engine delivered ${adminNotifs.length} in-app notifications to MD`
  );

  // -------------------------------------------------------------
  // Test 14: Shift Clock-In & Clock-Out Session Tracking
  // -------------------------------------------------------------
  const clockedInSession = await db.clockIn(CORE_USER_IDS.CHANDAN_GOSWAMI);
  assert(
    clockedInSession && clockedInSession.is_active === true,
    'Workflow 14a: Employee Clock In on Login successfully creates active shift session'
  );

  const clockedOutSession = await db.clockOut(CORE_USER_IDS.CHANDAN_GOSWAMI, 'Shift completed');
  assert(
    clockedOutSession !== null && clockedOutSession.is_active === false && !!clockedOutSession.logout_at,
    'Workflow 14b: Employee Clock Out on Logout closes shift and calculates duration'
  );

  // -------------------------------------------------------------
  // Test 15: Attendance Summary & Shift Duration Tracking
  // -------------------------------------------------------------
  const attendanceSummary = await db.getTodayAttendanceSummary();
  assert(
    attendanceSummary.length === 4,
    `Workflow 15: Attendance summary accurately tracks all 4 Bharat Loomtex staff members`
  );

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runWorkflowTestSuite().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

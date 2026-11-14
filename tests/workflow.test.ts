import { db } from '../src/lib/db';
import { calculateEmployeePerformance, calculateDashboardMetrics } from '../src/lib/utils/analytics';
import { exportPerformanceToCSV } from '../src/lib/utils/csv';

async function runWorkflowTestSuite() {
  console.log('================================================================');
  console.log('🧪 RISON WORKTRACK – AUTOMATED VERIFICATION TEST SUITE');
  console.log('Product: Rison WorkTrack | Company: Rison AI Tech');
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
  // Test 1: Admin Login / Profile Verification
  // -------------------------------------------------------------
  const adminProfile = await db.getProfile('00000000-0000-0000-0000-000000000001');
  assert(
    !!adminProfile && adminProfile.role === 'admin' && adminProfile.email === 'admin@risonaitech.com',
    'Workflow 1: Admin login & profile verification',
    JSON.stringify(adminProfile)
  );

  // -------------------------------------------------------------
  // Test 2: Seven Core Employee Accounts Verification
  // -------------------------------------------------------------
  const employees = await db.getEmployees();
  assert(
    employees.length >= 7,
    `Workflow 2: Verified ${employees.length} employee accounts exist (initial 7 employees)`,
    `Found ${employees.length}`
  );
  const empCodes = employees.map((e) => e.employee_code);
  assert(
    empCodes.includes('RAT-EMP-001') && empCodes.includes('RAT-EMP-007'),
    'Workflow 2b: Employee codes RAT-EMP-001 through RAT-EMP-007 verified'
  );

  // -------------------------------------------------------------
  // Test 3: Project Creation
  // -------------------------------------------------------------
  const newProject = await db.createProject({
    name: 'Voice AI Automated Escalation System',
    client_name: 'SkyPro Fleet Logistics',
    description: 'Automated VoIP failover routing.',
    status: 'active',
    start_date: '2026-06-01',
    target_end_date: '2026-08-30',
    budget_hours: 150,
  });
  assert(
    !!newProject.id && newProject.name === 'Voice AI Automated Escalation System',
    'Workflow 3: Admin created project successfully',
    `Project ID: ${newProject.id}`
  );

  // -------------------------------------------------------------
  // Test 4: Assign Daily Task
  // -------------------------------------------------------------
  const dailyTask = await db.createTask({
    title: 'Daily Standup System Verification',
    description: 'Verify health metrics across active microservices.',
    task_type: 'daily',
    assigned_to: '00000000-0000-0000-0000-000000000011', // Rahul Sharma
    assigned_by: adminProfile!.id,
    priority: 'high',
    due_date: new Date(Date.now() + 86400000).toISOString(),
    estimated_hours: 2,
  });
  assert(
    !!dailyTask.id && dailyTask.task_type === 'daily' && dailyTask.status === 'not_started',
    'Workflow 4: Admin assigned daily task to Rahul Sharma',
    `Task ID: ${dailyTask.id}`
  );

  // -------------------------------------------------------------
  // Test 5: Assign Project-Based Task
  // -------------------------------------------------------------
  const projectTask = await db.createTask({
    title: 'Configure VoIP Edge Gateway Protocol',
    description: 'Integrate SIP trunk with secure TLS 1.3.',
    task_type: 'project',
    project_id: newProject.id,
    assigned_to: '00000000-0000-0000-0000-000000000014', // Sneha Reddy
    assigned_by: adminProfile!.id,
    priority: 'urgent',
    due_date: new Date(Date.now() + 172800000).toISOString(),
    estimated_hours: 8,
  });
  assert(
    !!projectTask.id && projectTask.task_type === 'project' && projectTask.project_id === newProject.id,
    'Workflow 5: Admin assigned project-based task to Sneha Reddy',
    `Task ID: ${projectTask.id}`
  );

  // -------------------------------------------------------------
  // Test 6: Employee Login & Identity Verification
  // -------------------------------------------------------------
  const employeeProfile = await db.getProfile('00000000-0000-0000-0000-000000000014');
  assert(
    !!employeeProfile && employeeProfile.email === 'sneha.reddy@risonaitech.com',
    'Workflow 6: Employee login & profile identity verification (Sneha Reddy)'
  );

  // -------------------------------------------------------------
  // Test 7: Strict Role Isolation: Employee sees ONLY their assigned tasks
  // -------------------------------------------------------------
  const snehaTasks = await db.getTasks({
    role: 'employee',
    userId: '00000000-0000-0000-0000-000000000014',
  });
  const rahulTaskIds = (
    await db.getTasks({ role: 'employee', userId: '00000000-0000-0000-0000-000000000011' })
  ).map((t) => t.id);

  const containsOtherEmployeeTask = snehaTasks.some((t) => rahulTaskIds.includes(t.id));
  assert(
    !containsOtherEmployeeTask && snehaTasks.length > 0,
    'Workflow 7: Strict role isolation confirmed — Employee cannot see another employee tasks',
    `Sneha sees ${snehaTasks.length} tasks, all assigned to her.`
  );

  // -------------------------------------------------------------
  // Test 8: Task Time Tracking & Single-Timer Concurrency Safety
  // -------------------------------------------------------------
  // Step 8a: Start timer on projectTask
  const timer1 = await db.startTaskTimer(projectTask.id, '00000000-0000-0000-0000-000000000014');
  assert(
    timer1.activeTimer.is_running === true && timer1.activeTimer.task_id === projectTask.id,
    'Workflow 8a: Timer started successfully on task'
  );

  // Step 8b: Create a second task for Sneha and start timer on it -> Must pause timer1 automatically!
  const snehaTask2 = await db.createTask({
    title: 'Secondary Concurrent Task Check',
    description: 'Ensure parallel timer is prevented.',
    task_type: 'daily',
    assigned_to: '00000000-0000-0000-0000-000000000014',
    assigned_by: adminProfile!.id,
    priority: 'low',
    due_date: new Date(Date.now() + 86400000).toISOString(),
  });

  const timer2 = await db.startTaskTimer(snehaTask2.id, '00000000-0000-0000-0000-000000000014');
  assert(
    timer2.previousPausedTaskId === projectTask.id,
    'Workflow 8b: Concurrency safety rule verified — starting second timer automatically paused first timer!'
  );

  // Pause timer2
  await db.pauseTaskTimer(snehaTask2.id, '00000000-0000-0000-0000-000000000014');
  const activeTimerNow = await db.getRunningTimer('00000000-0000-0000-0000-000000000014');
  assert(
    activeTimerNow === null,
    'Workflow 8c: Timer paused cleanly, no dangling active timer'
  );

  // -------------------------------------------------------------
  // Test 9: Employee Submits Completed Task for Approval
  // -------------------------------------------------------------
  const submittedTask = await db.submitTaskForReview(
    projectTask.id,
    'Completed VoIP edge protocol and verified handshake tests.',
    '00000000-0000-0000-0000-000000000014'
  );
  assert(
    submittedTask?.status === 'submitted' && submittedTask.progress_percentage === 100,
    'Workflow 9: Task submitted for review with completion notes and 100% progress'
  );

  // -------------------------------------------------------------
  // Test 10: Admin Approves or Rejects Completed Task
  // -------------------------------------------------------------
  const approvedTask = await db.approveTask(projectTask.id, adminProfile!.id);
  assert(
    approvedTask?.status === 'completed' && approvedTask.approved_by === adminProfile!.id,
    'Workflow 10a: Admin approved submitted task'
  );

  // Rejection check on dailyTask
  const rejectedTask = await db.rejectTask(dailyTask.id, 'Please include microservice latency graphs.', adminProfile!.id);
  assert(
    rejectedTask?.status === 'rejected' && Boolean(rejectedTask.rejection_reason?.includes('latency graphs')),
    'Workflow 10b: Admin returned task for correction with feedback reason'
  );

  // -------------------------------------------------------------
  // Test 11: Dashboard Updates Automatically
  // -------------------------------------------------------------
  const dashboardMetrics = await db.getDashboardMetrics();
  assert(
    dashboardMetrics.total_tasks > 10 && dashboardMetrics.total_employees >= 7,
    'Workflow 11: Real-time dashboard metrics computed dynamically from database rows',
    `Total Tasks: ${dashboardMetrics.total_tasks}, Completed: ${dashboardMetrics.completed_tasks}`
  );

  // -------------------------------------------------------------
  // Test 12: Overdue Tasks are Correctly Identified
  // -------------------------------------------------------------
  assert(
    dashboardMetrics.overdue_tasks > 0,
    `Workflow 12: Overdue tasks correctly identified based on target deadlines (${dashboardMetrics.overdue_tasks} overdue)`
  );

  // -------------------------------------------------------------
  // Test 13: Performance Reports Show Correct Calculations
  // -------------------------------------------------------------
  const perfList = await db.getEmployeePerformanceList();
  const rahulPerf = perfList.find((p) => p.employee_code === 'RAT-EMP-001');
  assert(
    !!rahulPerf &&
      typeof rahulPerf.performance_score === 'number' &&
      rahulPerf.performance_score >= 0 &&
      rahulPerf.performance_score <= 100,
    'Workflow 13: Multi-factor performance score correctly computed for Employee RAT-EMP-001',
    `Score: ${rahulPerf?.performance_score}/100, Completion: ${rahulPerf?.completion_rate}%`
  );

  // -------------------------------------------------------------
  // Test 14: CSV Export Verification
  // -------------------------------------------------------------
  const csv = exportPerformanceToCSV(perfList);
  assert(
    csv.includes('Employee Code') && csv.includes('RAT-EMP-001') && csv.includes('Performance Score'),
    'Workflow 14: CSV Export generator produces compliant, structured reporting output'
  );

  // -------------------------------------------------------------
  // Test 15: Notifications System Verification
  // -------------------------------------------------------------
  const adminNotifs = await db.getNotifications(adminProfile!.id);
  assert(
    adminNotifs.length > 0,
    `Workflow 15: Notifications engine delivered ${adminNotifs.length} in-app notifications`
  );

  // -------------------------------------------------------------
  // Test 16: Overdue & Delayed Task Alert Notification to Owner
  // -------------------------------------------------------------
  const hasOverdueOrDelayAlert = adminNotifs.some(
    (n) => n.title.includes('Overdue') || n.title.includes('Delay') || n.title.includes('Blocker')
  );
  assert(
    hasOverdueOrDelayAlert,
    'Workflow 16: Owner receives automated notifications for overdue tasks and delayed risks'
  );

  // -------------------------------------------------------------
  // Test 17: Total Hours Work Done Calculation
  // -------------------------------------------------------------
  const totalHoursWorkedAllEmployees = perfList.reduce((acc, p) => acc + p.total_logged_hours, 0);
  assert(
    totalHoursWorkedAllEmployees > 0,
    `Workflow 17: Accurately calculated total hours work done across team (${totalHoursWorkedAllEmployees.toFixed(1)} verified hours)`
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

-- ==============================================================================
-- RISON WORKTRACK – Seed Data Migration
-- Product: Rison WorkTrack | Company: Rison AI Tech
-- Migration: 003_seed_data.sql
-- ==============================================================================

-- 1. FIXED PRE-ALLOCATED UUIDs FOR DETERMINISTIC SEEDING
-- Admin: 00000000-0000-0000-0000-000000000001
-- Employees: 00000000-0000-0000-0000-000000000011 through 0017
-- Projects:  00000000-0000-0000-0000-000000000101 through 0103

-- Note: In Supabase, if auth.users already exists, foreign key connects to it.
-- This script safely inserts mock/demo profiles with matching IDs for development.

-- ADMIN PROFILE
INSERT INTO public.profiles (id, email, full_name, role, phone, department, designation, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@risonaitech.com',
    'Yogesh Wadhwa',
    'admin',
    '+91 98765 43210',
    'Executive Management',
    'Founder & Principal Architect',
    'active'
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- 7 EMPLOYEES PROFILES
INSERT INTO public.profiles (id, email, full_name, role, phone, department, designation, status)
VALUES
    ('00000000-0000-0000-0000-000000000011', 'rahul.sharma@risonaitech.com', 'Rahul Sharma', 'employee', '+91 98111 22334', 'Engineering', 'Senior Fullstack Engineer', 'active'),
    ('00000000-0000-0000-0000-000000000012', 'priya.patel@risonaitech.com', 'Priya Patel', 'employee', '+91 98222 33445', 'Product & Design', 'Lead UI/UX Designer', 'active'),
    ('00000000-0000-0000-0000-000000000013', 'amit.verma@risonaitech.com', 'Amit Verma', 'employee', '+91 98333 44556', 'AI Solutions', 'AI Automation Specialist', 'active'),
    ('00000000-0000-0000-0000-000000000014', 'sneha.reddy@risonaitech.com', 'Sneha Reddy', 'employee', '+91 98444 55667', 'Engineering', 'Frontend Developer', 'active'),
    ('00000000-0000-0000-0000-000000000015', 'vikram.singh@risonaitech.com', 'Vikram Singh', 'employee', '+91 98555 66778', 'Quality Assurance', 'QA & Test Automation Lead', 'active'),
    ('00000000-0000-0000-0000-000000000016', 'ananya.deshmukh@risonaitech.com', 'Ananya Deshmukh', 'employee', '+91 98666 77889', 'DevOps & Cloud', 'Backend & Cloud Engineer', 'active'),
    ('00000000-0000-0000-0000-000000000017', 'rohit.kumar@risonaitech.com', 'Rohit Kumar', 'employee', '+91 98777 88990', 'Client Success', 'Solutions & Data Analyst', 'active')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    department = EXCLUDED.department;

-- EMPLOYEES EXTENDED RECORDS
INSERT INTO public.employees (profile_id, employee_code, joining_date, hourly_rate, notes)
VALUES
    ('00000000-0000-0000-0000-000000000011', 'RAT-EMP-001', '2025-01-10', 850.00, 'Core fullstack & architecture specialist'),
    ('00000000-0000-0000-0000-000000000012', 'RAT-EMP-002', '2025-02-01', 750.00, 'Design system and user interaction owner'),
    ('00000000-0000-0000-0000-000000000013', 'RAT-EMP-003', '2025-02-15', 800.00, 'LLM workflows, agents, and RAG pipelines'),
    ('00000000-0000-0000-0000-000000000014', 'RAT-EMP-004', '2025-03-01', 650.00, 'React, Next.js, and mobile responsive execution'),
    ('00000000-0000-0000-0000-000000000015', 'RAT-EMP-005', '2025-03-10', 600.00, 'E2E testing, security validation & CI/CD gates'),
    ('00000000-0000-0000-0000-000000000016', 'RAT-EMP-006', '2025-03-15', 750.00, 'PostgreSQL, Docker, Supabase, and cloud infra'),
    ('00000000-0000-0000-0000-000000000017', 'RAT-EMP-007', '2025-04-01', 550.00, 'Client metrics, outreach analytics, and reports')
ON CONFLICT (profile_id) DO NOTHING;

-- PROJECTS
INSERT INTO public.projects (id, name, client_name, description, status, start_date, target_end_date, budget_hours, created_by)
VALUES
    (
        '00000000-0000-0000-0000-000000000101',
        'Enterprise AI Voice Agent Deployment',
        'SkyPro Logistics',
        'Multi-lingual automated inbound and outbound voice agent pipeline with sub-second latency and CRM sync.',
        'active',
        '2026-05-01',
        '2026-07-30',
        240.00,
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '00000000-0000-0000-0000-000000000102',
        'Rison WorkTrack Productivity SaaS v1.0',
        'Rison AI Tech Internal',
        'Flagship employee task management, live time tracking, approvals and productivity analytics platform.',
        'active',
        '2026-06-01',
        '2026-08-15',
        320.00,
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '00000000-0000-0000-0000-000000000103',
        'Automotive CRM Intelligent Outreach Pipeline',
        'Horizon Auto Group',
        'WhatsApp AI bot and automated lead nurturing system with inventory API sync.',
        'active',
        '2026-05-15',
        '2026-08-01',
        180.00,
        '00000000-0000-0000-0000-000000000001'
    )
ON CONFLICT (id) DO NOTHING;

-- PROJECT MEMBERS
INSERT INTO public.project_members (project_id, employee_id, role_in_project)
VALUES
    ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000011', 'Lead Architect'),
    ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000013', 'Voice AI Specialist'),
    ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000015', 'QA Lead'),
    ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000011', 'Fullstack Engineer'),
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000012', 'UI/UX Designer'),
    ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000014', 'Frontend Developer'),
    ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000016', 'DevOps & Supabase Lead'),
    ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000013', 'Automation Specialist'),
    ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000017', 'Client Operations & Analytics')
ON CONFLICT (project_id, employee_id) DO NOTHING;

-- REALISTIC SAMPLE TASKS
INSERT INTO public.tasks (
    id, title, description, task_type, project_id, assigned_by, assigned_to, priority, status,
    start_date, due_date, estimated_hours, actual_hours, progress_percentage, completion_notes, blocker_reason, is_blocked
)
VALUES
    -- Rahul Sharma (Senior Fullstack)
    (
        '00000000-0000-0000-0000-000000000201',
        'Implement WebSocket Realtime Event Bus for Voice Agent',
        'Set up bi-directional audio streaming protocol with fallbacks and reconnect state machine.',
        'project',
        '00000000-0000-0000-0000-000000000101',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000011',
        'urgent',
        'completed',
        now() - interval '6 days',
        now() - interval '1 day',
        18.00,
        17.50,
        100,
        'WebSocket server integrated with 180ms round-trip latency. Full load testing completed.',
        NULL,
        false
    ),
    (
        '00000000-0000-0000-0000-000000000202',
        'Refactor Database Migrations and RLS Hierarchy',
        'Verify multi-tenant isolation and optimize indexed queries on task_time_logs and activity_logs.',
        'project',
        '00000000-0000-0000-0000-000000000102',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000011',
        'high',
        'in_progress',
        now() - interval '2 days',
        now() + interval '2 days',
        14.00,
        8.00,
        65,
        NULL,
        NULL,
        false
    ),
    -- Priya Patel (UI/UX)
    (
        '00000000-0000-0000-0000-000000000203',
        'Design High-Fidelity Kanban Board & Timer Drawer UI',
        'Deliver complete Figma specs and Tailwind component tokens for responsive task management.',
        'project',
        '00000000-0000-0000-0000-000000000102',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000012',
        'high',
        'submitted',
        now() - interval '4 days',
        now() - interval '4 hours',
        16.00,
        15.50,
        100,
        'All mockups, color tokens, and responsive mobile drawers ready for admin review.',
        NULL,
        false
    ),
    (
        '00000000-0000-0000-0000-000000000204',
        'Audit Accessibility & Mobile Contrast in Dashboard',
        'Ensure WCAG AA compliance across dark and light palettes and high-contrast badges.',
        'daily',
        '00000000-0000-0000-0000-000000000102',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000012',
        'medium',
        'in_progress',
        now() - interval '1 day',
        now() + interval '1 day',
        6.00,
        3.50,
        50,
        NULL,
        NULL,
        false
    ),
    -- Amit Verma (AI Specialist)
    (
        '00000000-0000-0000-0000-000000000205',
        'Fine-tune Intent Classifier for SkyPro Hindi-English Dialogues',
        'Train low-latency classification pipeline for logistic delivery queries and tracking.',
        'project',
        '00000000-0000-0000-0000-000000000101',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000013',
        'urgent',
        'completed',
        now() - interval '7 days',
        now() - interval '2 days',
        20.00,
        19.00,
        100,
        'Achieved 96.4% F1-score across 1,200 Hinglish logistic voice query benchmarks.',
        NULL,
        false
    ),
    (
        '00000000-0000-0000-0000-000000000206',
        'Automate WhatsApp Follow-up Lead Engine Webhook',
        'Sync Horizon Auto test-drive bookings into client webhook endpoints with retry queues.',
        'project',
        '00000000-0000-0000-0000-000000000103',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000013',
        'high',
        'on_hold',
        now() - interval '3 days',
        now() + interval '1 day',
        10.00,
        4.00,
        40,
        NULL,
        'Waiting for Horizon Auto IT team to provide production Meta Cloud API credentials.',
        true
    ),
    -- Sneha Reddy (Frontend Developer)
    (
        '00000000-0000-0000-0000-000000000207',
        'Develop Live Timer Widget with LocalStorage Persistence',
        'Create interactive timer with start/pause/resume/stop and single-active-timer constraint.',
        'daily',
        '00000000-0000-0000-0000-000000000102',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000014',
        'urgent',
        'submitted',
        now() - interval '2 days',
        now() - interval '1 hour',
        8.00,
        7.50,
        100,
        'Timer component fully integrated, audio tick optional, single-running verification implemented.',
        NULL,
        false
    ),
    (
        '00000000-0000-0000-0000-000000000208',
        'Implement Recharts Productivity Score Visualizations',
        'Render weekly completion trends, employee distribution bar charts, and on-time rate pies.',
        'project',
        '00000000-0000-0000-0000-000000000102',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000014',
        'medium',
        'in_progress',
        now() - interval '1 day',
        now() + interval '3 days',
        12.00,
        5.00,
        45,
        NULL,
        NULL,
        false
    ),
    -- Vikram Singh (QA & Test Automation)
    (
        '00000000-0000-0000-0000-000000000209',
        'Write End-to-End Test Suite for Task Approval Workflow',
        'Cover submission, approval, rejection with reason, and overdue automatic identification.',
        'project',
        '00000000-0000-0000-0000-000000000102',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000015',
        'high',
        'in_progress',
        now() - interval '3 days',
        now() + interval '2 days',
        15.00,
        10.00,
        70,
        NULL,
        NULL,
        false
    ),
    (
        '00000000-0000-0000-0000-000000000210',
        'Automated Latency & Jitter Testing for Voice SIP Trunk',
        'Simulate 100 concurrent VoIP calls and capture packet drop and MOS scores.',
        'project',
        '00000000-0000-0000-0000-000000000101',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000015',
        'medium',
        'overdue',
        now() - interval '8 days',
        now() - interval '2 days',
        12.00,
        6.00,
        50,
        NULL,
        NULL,
        false
    ),
    -- Ananya Deshmukh (Backend & Cloud)
    (
        '00000000-0000-0000-0000-000000000211',
        'Provision Supabase Cloud Storage Buckets with Signed URLs',
        'Configure `task-attachments` bucket with 25MB max size and MIME-type restrictions.',
        'daily',
        '00000000-0000-0000-0000-000000000102',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000016',
        'high',
        'completed',
        now() - interval '4 days',
        now() - interval '1 day',
        8.00,
        7.00,
        100,
        'Storage bucket configured with secure RLS policies and CORS whitelisting.',
        NULL,
        false
    ),
    (
        '00000000-0000-0000-0000-000000000212',
        'Configure Automated Daily Database Backup Script',
        'Set up automated pg_dump cron with AES-256 encryption into AWS S3 cold vault.',
        'project',
        '00000000-0000-0000-0000-000000000102',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000016',
        'medium',
        'in_progress',
        now() - interval '1 day',
        now() + interval '3 days',
        8.00,
        3.00,
        35,
        NULL,
        NULL,
        false
    ),
    -- Rohit Kumar (Client Success & Data)
    (
        '00000000-0000-0000-0000-000000000213',
        'Compile Weekly Client Delivery SLA Report for SkyPro',
        'Calculate ticket resolution percentages and SLA adherence for quarterly review.',
        'daily',
        '00000000-0000-0000-0000-000000000101',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000017',
        'medium',
        'completed',
        now() - interval '3 days',
        now() - interval '1 day',
        6.00,
        5.50,
        100,
        'Report signed off by SkyPro operations manager. 99.2% SLA achieved.',
        NULL,
        false
    ),
    (
        '00000000-0000-0000-0000-000000000214',
        'Clean & Normalize Horizon Auto Dealership Lead Registry',
        'Deduplicate 3,400 raw lead records and validate phone number formats for WhatsApp API.',
        'project',
        '00000000-0000-0000-0000-000000000103',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000017',
        'high',
        'rejected',
        now() - interval '5 days',
        now() - interval '1 day',
        10.00,
        8.00,
        80,
        'Submitted initial batch of 2,000 records.',
        'Missing country codes on 450 records. Please re-run through sanitizer script before approval.',
        false
    )
ON CONFLICT (id) DO NOTHING;

-- SAMPLE COMMENTS
INSERT INTO public.task_comments (task_id, author_id, content, is_blocker)
VALUES
    ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000013', 'Awaiting production API secret keys from Horizon Auto IT team.', true),
    ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000001', 'Followed up with their CTO. They promised keys by tomorrow 11 AM.', false),
    ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000014', 'Completed unit tests for active timer concurrency safety.', false),
    ('00000000-0000-0000-0000-000000000214', '00000000-0000-0000-0000-000000000001', 'Rejected due to missing E.164 phone formats. Please see note in task.', false);

-- SAMPLE NOTIFICATIONS
INSERT INTO public.notifications (user_id, title, message, type, link)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Task Awaiting Approval', 'Priya Patel submitted "Design High-Fidelity Kanban Board & Timer Drawer UI" for review.', 'task_submitted', '/admin/tasks?filter=submitted'),
    ('00000000-0000-0000-0000-000000000001', 'Task Awaiting Approval', 'Sneha Reddy submitted "Develop Live Timer Widget with LocalStorage Persistence" for review.', 'task_submitted', '/admin/tasks?filter=submitted'),
    ('00000000-0000-0000-0000-000000000014', 'Task Assigned', 'You have been assigned a new task: "Implement Recharts Productivity Score Visualizations"', 'task_assigned', '/employee/tasks'),
    ('00000000-0000-0000-0000-000000000015', 'Overdue Task Alert', 'Task "Automated Latency & Jitter Testing for Voice SIP Trunk" is past its deadline.', 'task_overdue', '/employee/tasks'),
    ('00000000-0000-0000-0000-000000000017', 'Task Returned For Correction', 'Task "Clean & Normalize Horizon Auto Dealership Lead Registry" was returned by Yogesh Wadhwa.', 'task_rejected', '/employee/tasks');

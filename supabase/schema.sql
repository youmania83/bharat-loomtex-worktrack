-- ==============================================================================
-- RISON WORKTRACK – Enterprise Database Schema Migration
-- Product: Rison WorkTrack | Company: Rison AI Tech
-- Migration: 001_initial_schema.sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'employee');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE task_type AS ENUM ('daily', 'project');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
        'not_started',
        'in_progress',
        'on_hold',
        'submitted',
        'completed',
        'rejected',
        'overdue'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    avatar_url TEXT,
    phone TEXT,
    department TEXT,
    designation TEXT,
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. EMPLOYEES EXTENDED TABLE
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_code TEXT UNIQUE NOT NULL,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    hourly_rate NUMERIC(10, 2) DEFAULT 0.00,
    emergency_contact TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    client_name TEXT,
    description TEXT,
    status project_status NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_end_date DATE,
    budget_hours NUMERIC(10, 2) DEFAULT 0.00,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. PROJECT MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_in_project TEXT DEFAULT 'Contributor',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(project_id, employee_id)
);

-- 7. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    task_type task_type NOT NULL DEFAULT 'project',
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    priority task_priority NOT NULL DEFAULT 'medium',
    status task_status NOT NULL DEFAULT 'not_started',
    start_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    due_date TIMESTAMPTZ NOT NULL,
    estimated_hours NUMERIC(6, 2) DEFAULT 0.00,
    actual_hours NUMERIC(6, 2) DEFAULT 0.00,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completion_notes TEXT,
    rejection_reason TEXT,
    blocker_reason TEXT,
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TASK ASSIGNMENTS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. TASK COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_blocker BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. TASK ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS public.task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER DEFAULT 0,
    file_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. TASK TIME LOGS TABLE
CREATE TABLE IF NOT EXISTS public.task_time_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    stopped_at TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0,
    is_running BOOLEAN NOT NULL DEFAULT true,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. TASK ACTIVITY LOGS (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.task_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_employees_code ON public.employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_time_logs_employee ON public.task_time_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_task ON public.task_time_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_running ON public.task_time_logs(is_running);
CREATE INDEX IF NOT EXISTS idx_comments_task ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_activity_task ON public.task_activity_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);

-- 15. AUTO-UPDATE UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_tasks_updated_at ON public.tasks;
CREATE TRIGGER trigger_update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ==============================================================================
-- RISON WORKTRACK – Row Level Security (RLS) Policies
-- Product: Rison WorkTrack | Company: Rison AI Tech
-- Migration: 002_rls_policies.sql
-- ==============================================================================

-- 1. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_assigned_to_task(target_task_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tasks
        WHERE id = target_task_id AND assigned_to = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ENABLE RLS ACROSS ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES POLICIES
-- Anyone authenticated can view profiles (to show assignee names/avatars)
CREATE POLICY "Profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- Users can update their own profile, or admins can update any
CREATE POLICY "Users can update own profile, admin all"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- Only admins or service role can insert profiles
CREATE POLICY "Admin can insert profiles"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin() OR auth.uid() = id);

-- 4. EMPLOYEES POLICIES
CREATE POLICY "Admins view all employees, employee views own"
    ON public.employees FOR SELECT
    TO authenticated
    USING (public.is_admin() OR profile_id = auth.uid());

CREATE POLICY "Only admin can insert or update employees"
    ON public.employees FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. PROJECTS POLICIES
-- Admin can view all projects. Employees can view projects where they are members or assigned tasks.
CREATE POLICY "Projects visibility"
    ON public.projects FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_id = projects.id AND employee_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.tasks
            WHERE project_id = projects.id AND assigned_to = auth.uid()
        )
    );

CREATE POLICY "Admin manage projects"
    ON public.projects FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. PROJECT MEMBERS POLICIES
CREATE POLICY "Project members select"
    ON public.project_members FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR employee_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_members.project_id AND pm.employee_id = auth.uid()
        )
    );

CREATE POLICY "Admin manage project members"
    ON public.project_members FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 7. TASKS POLICIES
-- Admins view all tasks. Employees ONLY view tasks assigned to them or created by them.
CREATE POLICY "Tasks view policy"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR assigned_to = auth.uid()
        OR assigned_by = auth.uid()
    );

-- Admin can create tasks
CREATE POLICY "Admin create tasks"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Updates: Admins can update any field. Employees can update their own task's status, progress, notes, blocker.
CREATE POLICY "Tasks update policy"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (
        public.is_admin()
        OR assigned_to = auth.uid()
    )
    WITH CHECK (
        public.is_admin()
        OR assigned_to = auth.uid()
    );

CREATE POLICY "Admin delete tasks"
    ON public.tasks FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 8. TASK ASSIGNMENTS POLICIES
CREATE POLICY "Task assignments view policy"
    ON public.task_assignments FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR assigned_to = auth.uid()
        OR public.is_assigned_to_task(task_id)
    );

CREATE POLICY "Admin manage task assignments"
    ON public.task_assignments FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 9. TASK COMMENTS POLICIES
-- View comments if admin or assigned to the task
CREATE POLICY "Task comments view"
    ON public.task_comments FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR public.is_assigned_to_task(task_id)
    );

-- Add comments if admin or assigned to the task
CREATE POLICY "Task comments insert"
    ON public.task_comments FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin()
        OR (author_id = auth.uid() AND public.is_assigned_to_task(task_id))
    );

-- 10. TASK ATTACHMENTS POLICIES
CREATE POLICY "Task attachments view"
    ON public.task_attachments FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR public.is_assigned_to_task(task_id)
    );

CREATE POLICY "Task attachments insert"
    ON public.task_attachments FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin()
        OR (uploaded_by = auth.uid() AND public.is_assigned_to_task(task_id))
    );

-- 11. TASK TIME LOGS POLICIES
-- Admin can view all time logs. Employee can only view and log their own.
CREATE POLICY "Time logs view"
    ON public.task_time_logs FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR employee_id = auth.uid()
    );

CREATE POLICY "Time logs insert"
    ON public.task_time_logs FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin()
        OR (employee_id = auth.uid() AND public.is_assigned_to_task(task_id))
    );

CREATE POLICY "Time logs update"
    ON public.task_time_logs FOR UPDATE
    TO authenticated
    USING (
        public.is_admin()
        OR employee_id = auth.uid()
    )
    WITH CHECK (
        public.is_admin()
        OR employee_id = auth.uid()
    );

-- 12. TASK ACTIVITY LOGS POLICIES
CREATE POLICY "Task activity view"
    ON public.task_activity_logs FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR public.is_assigned_to_task(task_id)
    );

CREATE POLICY "Task activity insert"
    ON public.task_activity_logs FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin()
        OR actor_id = auth.uid()
    );

-- 13. NOTIFICATIONS POLICIES
-- Each user only sees their own notifications
CREATE POLICY "User notifications view"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "User notifications update"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Notifications insert"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin() OR user_id = auth.uid());
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
    'admin@bharatloomtex.com',
    'Suneet Kumar',
    'admin',
    '+91 98765 43210',
    'Executive Management',
    'Owner & Managing Director',
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
    ('00000000-0000-0000-0000-000000000017', 'Task Returned For Correction', 'Task "Clean & Normalize Horizon Auto Dealership Lead Registry" was returned by Suneet Kumar.', 'task_rejected', '/employee/tasks');

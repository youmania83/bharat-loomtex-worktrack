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

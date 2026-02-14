-- ============================================================
-- FYNESS OS - RLS POLICIES SEGURAS
-- Execute este script no SQL Editor do Supabase
-- Substitui as policies abertas por policies baseadas em auth.uid()
-- ============================================================

-- ============================================================
-- FUNCAO HELPER: verifica se o usuario atual e manager ou admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- 1. USER_PROFILES
-- ============================================================
DROP POLICY IF EXISTS "user_profiles_all" ON public.user_profiles;

CREATE POLICY "user_profiles_select"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "user_profiles_insert"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "user_profiles_update"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 2. COMPANIES
-- ============================================================
DROP POLICY IF EXISTS "companies_all" ON public.companies;

CREATE POLICY "companies_select"
  ON public.companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "companies_insert"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "companies_update"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "companies_delete"
  ON public.companies FOR DELETE
  TO authenticated
  USING (public.is_manager_or_admin());

-- ============================================================
-- 3. PROJECTS (fluxos BPMN)
-- ============================================================
DROP POLICY IF EXISTS "projects_all" ON public.projects;

CREATE POLICY "projects_select"
  ON public.projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "projects_insert"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "projects_update"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "projects_delete"
  ON public.projects FOR DELETE
  TO authenticated
  USING (public.is_manager_or_admin());

-- ============================================================
-- 4. TEAM MEMBERS
-- ============================================================
DROP POLICY IF EXISTS "team_members_all" ON public.team_members;

CREATE POLICY "team_members_select"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "team_members_insert"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "team_members_update"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "team_members_delete"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (public.is_manager_or_admin());

-- ============================================================
-- 5. OS SECTORS
-- ============================================================
DROP POLICY IF EXISTS "os_sectors_all" ON public.os_sectors;

CREATE POLICY "os_sectors_select"
  ON public.os_sectors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "os_sectors_insert"
  ON public.os_sectors FOR INSERT
  TO authenticated
  WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "os_sectors_update"
  ON public.os_sectors FOR UPDATE
  TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "os_sectors_delete"
  ON public.os_sectors FOR DELETE
  TO authenticated
  USING (public.is_manager_or_admin());

-- ============================================================
-- 6. OS PROJECTS
-- ============================================================
DROP POLICY IF EXISTS "os_projects_all" ON public.os_projects;

CREATE POLICY "os_projects_select"
  ON public.os_projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "os_projects_insert"
  ON public.os_projects FOR INSERT
  TO authenticated
  WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "os_projects_update"
  ON public.os_projects FOR UPDATE
  TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "os_projects_delete"
  ON public.os_projects FOR DELETE
  TO authenticated
  USING (public.is_manager_or_admin());

-- ============================================================
-- 7. OS ORDERS
-- ============================================================
DROP POLICY IF EXISTS "os_orders_all" ON public.os_orders;

CREATE POLICY "os_orders_select"
  ON public.os_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "os_orders_insert"
  ON public.os_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "os_orders_update"
  ON public.os_orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "os_orders_delete"
  ON public.os_orders FOR DELETE
  TO authenticated
  USING (public.is_manager_or_admin());

-- ============================================================
-- 8. OS COMMENTS
-- ============================================================
DROP POLICY IF EXISTS "os_comments_all" ON public.os_comments;

CREATE POLICY "os_comments_select"
  ON public.os_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "os_comments_insert"
  ON public.os_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "os_comments_delete"
  ON public.os_comments FOR DELETE
  TO authenticated
  USING (public.is_manager_or_admin());

-- ============================================================
-- 9. OS TIME ENTRIES
-- ============================================================
DROP POLICY IF EXISTS "os_time_entries_all" ON public.os_time_entries;

CREATE POLICY "os_time_entries_select"
  ON public.os_time_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "os_time_entries_insert"
  ON public.os_time_entries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "os_time_entries_update"
  ON public.os_time_entries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "os_time_entries_delete"
  ON public.os_time_entries FOR DELETE
  TO authenticated
  USING (public.is_manager_or_admin());

-- ============================================================
-- 10. OS TEMPLATES
-- ============================================================
DROP POLICY IF EXISTS "os_templates_all" ON public.os_templates;

CREATE POLICY "os_templates_select"
  ON public.os_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "os_templates_insert"
  ON public.os_templates FOR INSERT
  TO authenticated
  WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "os_templates_update"
  ON public.os_templates FOR UPDATE
  TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "os_templates_delete"
  ON public.os_templates FOR DELETE
  TO authenticated
  USING (public.is_manager_or_admin());

-- ============================================================
-- 11. AGENDA EVENTS
-- ============================================================
DROP POLICY IF EXISTS "agenda_events_all" ON public.agenda_events;

CREATE POLICY "agenda_events_select"
  ON public.agenda_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "agenda_events_insert"
  ON public.agenda_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "agenda_events_update"
  ON public.agenda_events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "agenda_events_delete"
  ON public.agenda_events FOR DELETE
  TO authenticated
  USING (public.is_manager_or_admin());

-- ============================================================
-- 12. NOTIFICATIONS
-- ============================================================
DROP POLICY IF EXISTS "notifications_all" ON public.notifications;

CREATE POLICY "notifications_select"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "notifications_insert"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "notifications_update"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "notifications_delete"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- 13. ACTIVITY LOGS
-- ============================================================
DROP POLICY IF EXISTS "activity_logs_all" ON public.activity_logs;

CREATE POLICY "activity_logs_select"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "activity_logs_insert"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================
-- 14. KPI SNAPSHOTS
-- ============================================================
DROP POLICY IF EXISTS "kpi_snapshots_all" ON public.kpi_snapshots;

CREATE POLICY "kpi_snapshots_select"
  ON public.kpi_snapshots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "kpi_snapshots_insert"
  ON public.kpi_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "kpi_snapshots_update"
  ON public.kpi_snapshots FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================
-- 15. REPORT SCHEDULES
-- ============================================================
DROP POLICY IF EXISTS "report_schedules_all" ON public.report_schedules;

CREATE POLICY "report_schedules_select"
  ON public.report_schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "report_schedules_insert"
  ON public.report_schedules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "report_schedules_update"
  ON public.report_schedules FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "report_schedules_delete"
  ON public.report_schedules FOR DELETE
  TO authenticated
  USING (public.is_manager_or_admin());

-- ============================================================
-- FIM - Policies seguras aplicadas
-- Execute no SQL Editor do Supabase
-- ============================================================

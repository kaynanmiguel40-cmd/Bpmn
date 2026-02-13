-- ============================================================
-- FYNESS OS - TABELAS DO APP
-- Execute este script no SQL Editor do Supabase
-- Cria todas as tabelas que o frontend espera
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USER PROFILES (perfis do colaborador)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT,
    phone TEXT,
    role TEXT,
    bio TEXT,
    avatar TEXT,
    cpf TEXT,
    company_id TEXT,
    salary_month TEXT,
    hours_month INTEGER DEFAULT 176,
    start_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_profiles_all" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 2. COMPANIES (empresas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color_index INTEGER DEFAULT 0,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies_all" ON public.companies FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 3. PROJECTS (fluxos BPMN)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    xml TEXT,
    company_id TEXT,
    parent_id TEXT,
    level INTEGER DEFAULT 0,
    is_root BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_all" ON public.projects FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 4. TEAM MEMBERS (equipe)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    color TEXT DEFAULT '#3b82f6',
    work_start TEXT DEFAULT '08:00',
    work_end TEXT DEFAULT '18:00',
    work_days JSONB DEFAULT '[1,2,3,4,5]',
    salary_month NUMERIC DEFAULT 0,
    hours_month INTEGER DEFAULT 176,
    email TEXT,
    auth_user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_members_all" ON public.team_members FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 5. OS SECTORS (setores das O.S.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.os_sectors (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.os_sectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "os_sectors_all" ON public.os_sectors FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 6. OS PROJECTS (projetos das O.S.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.os_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sector_id TEXT,
    color TEXT DEFAULT '#3b82f6',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.os_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "os_projects_all" ON public.os_projects FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 7. OS ORDERS (ordens de servico)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.os_orders (
    id TEXT PRIMARY KEY,
    number INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'available',
    client TEXT,
    location TEXT,
    notes TEXT,
    assignee TEXT,
    assigned_to TEXT,
    sort_order INTEGER DEFAULT 0,
    estimated_start TEXT,
    estimated_end TEXT,
    actual_start TEXT,
    actual_end TEXT,
    attachments JSONB DEFAULT '[]',
    expenses JSONB DEFAULT '[]',
    project_id TEXT,
    type TEXT DEFAULT 'normal',
    parent_order_id TEXT,
    emergency_number INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.os_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "os_orders_all" ON public.os_orders FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 8. OS COMMENTS (comentarios nas O.S.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.os_comments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    user_name TEXT DEFAULT 'Anonimo',
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.os_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "os_comments_all" ON public.os_comments FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 9. OS TIME ENTRIES (registro de tempo nas O.S.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.os_time_entries (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    user_name TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.os_time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "os_time_entries_all" ON public.os_time_entries FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 10. OS TEMPLATES (modelos de O.S.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.os_templates (
    id TEXT PRIMARY KEY,
    name TEXT,
    title TEXT,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    notes TEXT,
    expenses JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.os_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "os_templates_all" ON public.os_templates FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 11. AGENDA EVENTS (eventos da agenda)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agenda_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date TEXT,
    end_date TEXT,
    assignee TEXT,
    type TEXT DEFAULT 'task',
    color TEXT DEFAULT '#3b82f6',
    attended BOOLEAN DEFAULT FALSE,
    was_late BOOLEAN DEFAULT FALSE,
    late_minutes INTEGER DEFAULT 0,
    recurrence_type TEXT,
    recurrence_config JSONB DEFAULT '{}',
    recurrence_end_type TEXT DEFAULT 'never',
    recurrence_end_value TEXT,
    recurrence_exceptions JSONB DEFAULT '[]',
    attendees JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agenda_events_all" ON public.agenda_events FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 12. NOTIFICATIONS (notificacoes)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    type TEXT DEFAULT 'info',
    title TEXT,
    message TEXT,
    entity_type TEXT,
    entity_id TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_all" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 13. ACTIVITY LOGS (log de atividades)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT DEFAULT 'Sistema',
    action TEXT,
    entity_type TEXT,
    entity_id TEXT,
    entity_title TEXT,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_logs_all" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 14. KPI SNAPSHOTS (historico de KPIs mensais)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.kpi_snapshots (
    id TEXT PRIMARY KEY,
    user_name TEXT,
    period TEXT,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.kpi_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kpi_snapshots_all" ON public.kpi_snapshots FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 15. REPORT SCHEDULES (agendamentos de relatorio)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.report_schedules (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    frequency TEXT,
    day_of_week INTEGER,
    day_of_month INTEGER,
    recipients JSONB DEFAULT '[]',
    filter_member TEXT DEFAULT 'all',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "report_schedules_all" ON public.report_schedules FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- INDICES PARA PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_os_orders_status ON public.os_orders(status);
CREATE INDEX IF NOT EXISTS idx_os_orders_number ON public.os_orders(number);
CREATE INDEX IF NOT EXISTS idx_os_orders_project ON public.os_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_os_orders_type ON public.os_orders(type);
CREATE INDEX IF NOT EXISTS idx_os_orders_parent ON public.os_orders(parent_order_id);
CREATE INDEX IF NOT EXISTS idx_os_comments_order ON public.os_comments(order_id);
CREATE INDEX IF NOT EXISTS idx_os_time_entries_order ON public.os_time_entries(order_id);
CREATE INDEX IF NOT EXISTS idx_agenda_events_start ON public.agenda_events(start_date);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_period ON public.kpi_snapshots(period);
CREATE INDEX IF NOT EXISTS idx_projects_company ON public.projects(company_id);

-- ============================================================
-- FIM - 15 tabelas criadas
-- ============================================================

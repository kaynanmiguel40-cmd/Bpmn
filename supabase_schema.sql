-- ============================================================
-- FYNESS OS — Schema Completo para Supabase
-- Execute este SQL inteiro no SQL Editor do Supabase Dashboard
-- ============================================================

-- 0. EXTENSOES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (complementar a tabela existente)
-- ============================================================
-- A tabela profiles ja pode existir. Adicionamos colunas faltantes.

DO $$
BEGIN
  -- Adicionar colunas que podem nao existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='hourly_rate') THEN
    ALTER TABLE public.profiles ADD COLUMN hourly_rate DECIMAL(10,2) DEFAULT 0.00;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='department') THEN
    ALTER TABLE public.profiles ADD COLUMN department TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_active') THEN
    ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='updated_at') THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END
$$;

-- ============================================================
-- 2. COMPANIES
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

CREATE POLICY "companies_select" ON public.companies FOR SELECT USING (true);
CREATE POLICY "companies_insert" ON public.companies FOR INSERT WITH CHECK (true);
CREATE POLICY "companies_update" ON public.companies FOR UPDATE USING (true);
CREATE POLICY "companies_delete" ON public.companies FOR DELETE USING (true);

-- ============================================================
-- 3. PROJECTS (BPMN)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  xml TEXT,
  company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
  parent_id TEXT,
  level INTEGER DEFAULT 0,
  is_root BOOLEAN DEFAULT FALSE,
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select" ON public.projects FOR SELECT USING (true);
CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "projects_update" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "projects_delete" ON public.projects FOR DELETE USING (true);

-- ============================================================
-- 4. PERMISSIONS + ROLE_PERMISSIONS (RBAC)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  module TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'collaborator', 'viewer')),
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permissions_select" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "role_permissions_select" ON public.role_permissions FOR SELECT USING (true);

-- ============================================================
-- 5. OS_SECTORS (Setores de O.S.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.os_sectors (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.os_sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "os_sectors_select" ON public.os_sectors FOR SELECT USING (true);
CREATE POLICY "os_sectors_insert" ON public.os_sectors FOR INSERT WITH CHECK (true);
CREATE POLICY "os_sectors_update" ON public.os_sectors FOR UPDATE USING (true);
CREATE POLICY "os_sectors_delete" ON public.os_sectors FOR DELETE USING (true);

-- ============================================================
-- 6. OS_PROJECTS (Projetos de O.S.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.os_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sector_id TEXT REFERENCES public.os_sectors(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#3b82f6',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.os_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "os_projects_select" ON public.os_projects FOR SELECT USING (true);
CREATE POLICY "os_projects_insert" ON public.os_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "os_projects_update" ON public.os_projects FOR UPDATE USING (true);
CREATE POLICY "os_projects_delete" ON public.os_projects FOR DELETE USING (true);

-- ============================================================
-- 7. OS_ORDERS (Ordens de Servico — Kanban)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.os_orders (
  id TEXT PRIMARY KEY,
  number INTEGER,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'doing', 'done', 'blocked', 'review')),
  client TEXT DEFAULT '',
  location TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  assignee TEXT,
  assigned_to UUID,
  sort_order INTEGER DEFAULT 0,
  estimated_start DATE,
  estimated_end DATE,
  actual_start DATE,
  actual_end DATE,
  attachments JSONB DEFAULT '[]'::jsonb,
  expenses JSONB DEFAULT '[]'::jsonb,
  project_id TEXT REFERENCES public.os_projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.os_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "os_orders_select" ON public.os_orders FOR SELECT USING (true);
CREATE POLICY "os_orders_insert" ON public.os_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "os_orders_update" ON public.os_orders FOR UPDATE USING (true);
CREATE POLICY "os_orders_delete" ON public.os_orders FOR DELETE USING (true);

-- ============================================================
-- 8. OS_TIME_ENTRIES (Apontamento de horas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.os_time_entries (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES public.os_orders(id) ON DELETE CASCADE,
  user_name TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.os_time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "os_time_entries_select" ON public.os_time_entries FOR SELECT USING (true);
CREATE POLICY "os_time_entries_insert" ON public.os_time_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "os_time_entries_update" ON public.os_time_entries FOR UPDATE USING (true);
CREATE POLICY "os_time_entries_delete" ON public.os_time_entries FOR DELETE USING (true);

-- ============================================================
-- 9. OS_COMMENTS (Comentarios nas O.S.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.os_comments (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES public.os_orders(id) ON DELETE CASCADE,
  user_name TEXT DEFAULT 'Anonimo',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.os_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "os_comments_select" ON public.os_comments FOR SELECT USING (true);
CREATE POLICY "os_comments_insert" ON public.os_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "os_comments_update" ON public.os_comments FOR UPDATE USING (true);
CREATE POLICY "os_comments_delete" ON public.os_comments FOR DELETE USING (true);

-- ============================================================
-- 10. OS_TEMPLATES (Templates de O.S.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.os_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  priority TEXT DEFAULT 'medium',
  notes TEXT DEFAULT '',
  expenses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.os_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "os_templates_select" ON public.os_templates FOR SELECT USING (true);
CREATE POLICY "os_templates_insert" ON public.os_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "os_templates_update" ON public.os_templates FOR UPDATE USING (true);
CREATE POLICY "os_templates_delete" ON public.os_templates FOR DELETE USING (true);

-- ============================================================
-- 11. AGENDA_EVENTS (Agenda / Calendario)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agenda_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  assignee UUID,
  type TEXT DEFAULT 'task',
  color TEXT DEFAULT '#3b82f6',
  attended BOOLEAN DEFAULT FALSE,
  was_late BOOLEAN DEFAULT FALSE,
  late_minutes INTEGER DEFAULT 0,
  recurrence_type TEXT,
  recurrence_config JSONB DEFAULT '{}'::jsonb,
  recurrence_end_type TEXT DEFAULT 'never',
  recurrence_end_value TEXT,
  recurrence_exceptions TEXT[] DEFAULT '{}',
  attendees JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agenda_events_select" ON public.agenda_events FOR SELECT USING (true);
CREATE POLICY "agenda_events_insert" ON public.agenda_events FOR INSERT WITH CHECK (true);
CREATE POLICY "agenda_events_update" ON public.agenda_events FOR UPDATE USING (true);
CREATE POLICY "agenda_events_delete" ON public.agenda_events FOR DELETE USING (true);

-- ============================================================
-- 12. TEAM_MEMBERS (Equipe)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT DEFAULT '',
  color TEXT DEFAULT '#3b82f6',
  work_start TEXT DEFAULT '08:00',
  work_end TEXT DEFAULT '18:00',
  work_days INTEGER[] DEFAULT '{1,2,3,4,5}',
  salary_month DECIMAL(10,2) DEFAULT 0,
  hours_month INTEGER DEFAULT 176,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_select" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "team_members_insert" ON public.team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "team_members_update" ON public.team_members FOR UPDATE USING (true);
CREATE POLICY "team_members_delete" ON public.team_members FOR DELETE USING (true);

-- ============================================================
-- 13. USER_PROFILES (Configuracoes de perfil do usuario)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY DEFAULT 'default',
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
  notification_prefs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_select" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "user_profiles_insert" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "user_profiles_update" ON public.user_profiles FOR UPDATE USING (true);

-- ============================================================
-- 14. KPI_SNAPSHOTS (Historico de metricas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.kpi_snapshots (
  id TEXT PRIMARY KEY,
  user_name TEXT,
  period TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.kpi_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kpi_snapshots_select" ON public.kpi_snapshots FOR SELECT USING (true);
CREATE POLICY "kpi_snapshots_insert" ON public.kpi_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "kpi_snapshots_update" ON public.kpi_snapshots FOR UPDATE USING (true);
CREATE POLICY "kpi_snapshots_delete" ON public.kpi_snapshots FOR DELETE USING (true);

-- ============================================================
-- 15. NOTIFICATIONS (Notificacoes)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id UUID,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  title TEXT,
  message TEXT,
  entity_type TEXT,
  entity_id TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (true);
CREATE POLICY "notifications_delete" ON public.notifications FOR DELETE USING (true);

-- ============================================================
-- 16. ACTIVITY_LOGS (Historico de atividades)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  user_id UUID,
  user_name TEXT DEFAULT 'Sistema',
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  entity_title TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_logs_select" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "activity_logs_insert" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- ============================================================
-- 17. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_os_orders_status ON public.os_orders(status);
CREATE INDEX IF NOT EXISTS idx_os_orders_project ON public.os_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_os_time_entries_order ON public.os_time_entries(order_id);
CREATE INDEX IF NOT EXISTS idx_os_comments_order ON public.os_comments(order_id);
CREATE INDEX IF NOT EXISTS idx_os_projects_sector ON public.os_projects(sector_id);
CREATE INDEX IF NOT EXISTS idx_agenda_events_date ON public.agenda_events(start_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- ============================================================
-- 18. TRIGGER: updated_at automatico
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'companies', 'projects', 'os_sectors', 'os_projects',
    'os_orders', 'agenda_events', 'team_members', 'user_profiles', 'notifications'
  ] LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
    ', t, t);
  END LOOP;
END
$$;

-- ============================================================
-- 19. TRIGGER: criar perfil automaticamente no signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    'collaborator',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 20. RPC: get_user_permissions
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_permissions()
RETURNS TABLE (name TEXT, module TEXT) AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT p.role INTO user_role
  FROM public.profiles p
  WHERE p.id = auth.uid();

  IF user_role IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT perm.name, perm.module
  FROM public.role_permissions rp
  JOIN public.permissions perm ON perm.id = rp.permission_id
  WHERE rp.role = user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 21. RPC: has_permission
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT p.role INTO user_role
  FROM public.profiles p
  WHERE p.id = auth.uid();

  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.role_permissions rp
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE rp.role = user_role AND perm.name = permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 22. SEED: Permissoes
-- ============================================================
INSERT INTO public.permissions (name, description, module) VALUES
  -- Dashboard
  ('dashboard.view', 'Ver dashboard', 'dashboard'),
  ('dashboard.view_metrics', 'Ver metricas do dashboard', 'dashboard'),
  -- Sales / BPMN
  ('sales.access', 'Acessar modulo comercial', 'sales'),
  ('sales.bpmn.edit', 'Editar fluxos BPMN', 'sales'),
  ('sales.bpmn.delete', 'Deletar fluxos BPMN', 'sales'),
  -- O.S.
  ('os.view', 'Ver ordens de servico', 'os'),
  ('os.create', 'Criar ordens de servico', 'os'),
  ('os.edit', 'Editar ordens de servico', 'os'),
  ('os.delete', 'Deletar ordens de servico', 'os'),
  ('os.assign', 'Atribuir ordens de servico', 'os'),
  -- Financeiro
  ('financial.view', 'Ver modulo financeiro', 'financial'),
  ('financial.view_costs', 'Ver custos', 'financial'),
  ('financial.view_salaries', 'Ver salarios', 'financial'),
  ('financial.reports', 'Gerar relatorios financeiros', 'financial'),
  -- Agenda
  ('agenda.view', 'Ver agenda', 'agenda'),
  ('agenda.create', 'Criar eventos', 'agenda'),
  ('agenda.edit', 'Editar eventos', 'agenda'),
  ('agenda.delete', 'Deletar eventos', 'agenda'),
  ('agenda.view_costs', 'Ver custos de reunioes', 'agenda'),
  -- Admin
  ('admin.users', 'Gerenciar usuarios', 'admin'),
  ('admin.roles', 'Gerenciar roles', 'admin'),
  ('admin.settings', 'Configuracoes do sistema', 'admin'),
  ('admin.audit', 'Ver logs de auditoria', 'admin'),
  -- Reports
  ('reports.view', 'Ver relatorios', 'reports'),
  -- Settings
  ('settings.view', 'Ver configuracoes', 'settings'),
  ('settings.edit', 'Editar configuracoes', 'settings')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 23. SEED: Role -> Permissions
-- ============================================================

-- Admin: TODAS as permissoes
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions
ON CONFLICT (role, permission_id) DO NOTHING;

-- Manager: tudo exceto admin.* e financial.view_salaries
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager', id FROM public.permissions
WHERE module != 'admin' AND name != 'financial.view_salaries'
ON CONFLICT (role, permission_id) DO NOTHING;

-- Collaborator: acesso basico
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'collaborator', id FROM public.permissions
WHERE name IN (
  'dashboard.view',
  'sales.access', 'sales.bpmn.edit',
  'os.view', 'os.create', 'os.edit',
  'agenda.view', 'agenda.create', 'agenda.edit',
  'settings.view'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- Viewer: somente visualizacao
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'viewer', id FROM public.permissions
WHERE name IN (
  'dashboard.view',
  'sales.access',
  'os.view',
  'agenda.view'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- ============================================================
-- PRONTO! Todas as 16 tabelas criadas com RLS, indexes,
-- triggers, funcoes RPC e permissoes pre-configuradas.
-- ============================================================

-- ============================================================
-- FYNESS OS - EAP (Estrutura Analítica do Projeto) + Gantt
-- Migration 010
--
-- Tabelas para gerenciamento de projetos com WBS e Gráfico
-- de Gantt estilo Microsoft Project.
-- ============================================================

-- ============================================================
-- 1. TABELA: eap_projects
-- Projetos de EAP independentes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eap_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on_hold')),
  color TEXT DEFAULT '#3b82f6',
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. TABELA: eap_tasks
-- Tarefas hierárquicas com suporte a Gantt
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eap_tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.eap_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  wbs_number TEXT DEFAULT '',
  parent_id TEXT REFERENCES public.eap_tasks(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  level INTEGER DEFAULT 0,
  is_milestone BOOLEAN DEFAULT FALSE,
  start_date DATE,
  end_date DATE,
  duration_days INTEGER DEFAULT 1,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  assigned_to TEXT DEFAULT '',
  predecessors JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  color TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_eap_tasks_project ON public.eap_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_eap_tasks_parent ON public.eap_tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_eap_tasks_sort ON public.eap_tasks(project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_eap_projects_status ON public.eap_projects(status);

-- ============================================================
-- 4. TRIGGERS: auto-update updated_at
-- ============================================================
CREATE TRIGGER eap_projects_updated_at
  BEFORE UPDATE ON public.eap_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER eap_tasks_updated_at
  BEFORE UPDATE ON public.eap_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. RLS POLICIES
-- ============================================================
ALTER TABLE public.eap_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eap_tasks ENABLE ROW LEVEL SECURITY;

-- Leitura para todos autenticados
CREATE POLICY "eap_projects_select" ON public.eap_projects
  FOR SELECT USING (true);

CREATE POLICY "eap_tasks_select" ON public.eap_tasks
  FOR SELECT USING (true);

-- Insert/Update/Delete para managers e admin
CREATE POLICY "eap_projects_insert" ON public.eap_projects
  FOR INSERT WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "eap_projects_update" ON public.eap_projects
  FOR UPDATE USING (public.is_manager_or_admin());

CREATE POLICY "eap_projects_delete" ON public.eap_projects
  FOR DELETE USING (public.is_manager_or_admin());

CREATE POLICY "eap_tasks_insert" ON public.eap_tasks
  FOR INSERT WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "eap_tasks_update" ON public.eap_tasks
  FOR UPDATE USING (public.is_manager_or_admin());

CREATE POLICY "eap_tasks_delete" ON public.eap_tasks
  FOR DELETE USING (public.is_manager_or_admin());

-- ============================================================
-- FIM - Migration 010
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- Migration: Adicionar status aos projetos de OS
-- Permite marcar projetos como 'active' ou 'finished'

ALTER TABLE public.os_projects
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

ALTER TABLE public.os_projects
  ADD CONSTRAINT os_projects_status_check
  CHECK (status IN ('active', 'finished'));

CREATE INDEX IF NOT EXISTS idx_os_projects_status
  ON public.os_projects(status);

-- 027_missing_columns.sql
-- Adiciona colunas que o codigo referencia mas nao existem no banco.

-- 1) os_projects.eap_project_id — vinculo EAP <-> OS Project (usado no bridge.js)
ALTER TABLE public.os_projects
  ADD COLUMN IF NOT EXISTS eap_project_id TEXT;

CREATE INDEX IF NOT EXISTS idx_os_projects_eap ON public.os_projects(eap_project_id);

-- 2) agenda_events.notes — notas textuais do evento
ALTER TABLE public.agenda_events
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- 3) agenda_events.attachments — anexos do evento (JSONB array)
ALTER TABLE public.agenda_events
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';

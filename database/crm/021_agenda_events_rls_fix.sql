-- =====================================================================
-- 021_agenda_events_rls_fix.sql
--
-- Ajuste de RLS (Row Level Security) em agenda_events.
-- Quando CRM activity e editada/excluida, agora propaga pra agenda_events
-- (via updateAgendaEvent/deleteAgendaEvent), mas a tabela nao tinha policy
-- de UPDATE/DELETE permissiva — bloqueava com "violates row-level security".
--
-- Policies permissivas — single-tenant. Mesmo padrao das outras tabelas.
-- =====================================================================

ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agenda_events_select" ON public.agenda_events;
DROP POLICY IF EXISTS "agenda_events_insert" ON public.agenda_events;
DROP POLICY IF EXISTS "agenda_events_update" ON public.agenda_events;
DROP POLICY IF EXISTS "agenda_events_delete" ON public.agenda_events;

CREATE POLICY "agenda_events_select" ON public.agenda_events
  FOR SELECT USING (true);

CREATE POLICY "agenda_events_insert" ON public.agenda_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "agenda_events_update" ON public.agenda_events
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "agenda_events_delete" ON public.agenda_events
  FOR DELETE USING (true);

-- Diagnostico opcional:
-- SELECT policyname, cmd, permissive FROM pg_policies WHERE tablename = 'agenda_events';

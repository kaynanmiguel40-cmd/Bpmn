-- ============================================================
-- 051_crm_activity_google_task.sql
--
-- Atividades do tipo "tarefa" (ligação, mensagem, e-mail, follow-up, tarefa)
-- passam a sincronizar com o Google Tasks (não com o Calendar). Guardamos o
-- id da tarefa no Google pra propagar edição/conclusão/exclusão.
--
-- Atividades do tipo "evento" (reunião, visita, almoço) continuam usando
-- agenda_event_id (Google Calendar).
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_activities
  ADD COLUMN IF NOT EXISTS google_task_id TEXT;

COMMENT ON COLUMN public.crm_activities.google_task_id IS
  'Id da tarefa no Google Tasks (atividades kind=task). Eventos usam agenda_event_id (Google Calendar).';

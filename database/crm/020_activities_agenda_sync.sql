-- =====================================================================
-- 020_activities_agenda_sync.sql
--
-- Adiciona coluna agenda_event_id em crm_activities para permitir sync
-- bidirecional: atualizar/excluir uma atividade CRM agora atualiza/remove
-- o evento correspondente na agenda principal (e no Google Calendar).
-- =====================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crm_activities' AND column_name = 'agenda_event_id'
  ) THEN
    ALTER TABLE public.crm_activities ADD COLUMN agenda_event_id TEXT;
  END IF;
END
$$;

-- Index para lookup rapido ao atualizar/deletar via agenda
CREATE INDEX IF NOT EXISTS idx_crm_activities_agenda_event_id
  ON public.crm_activities(agenda_event_id)
  WHERE agenda_event_id IS NOT NULL;

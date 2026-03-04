-- 013: Flag na pipeline stage que dispara modal de agendamento de reunião
ALTER TABLE crm_pipeline_stages
  ADD COLUMN IF NOT EXISTS triggers_meeting BOOLEAN DEFAULT FALSE;

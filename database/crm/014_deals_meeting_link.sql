-- 014: Link entre deals e eventos da agenda (reuniões agendadas)
ALTER TABLE crm_deals
  ADD COLUMN IF NOT EXISTS meeting_agenda_event_id TEXT DEFAULT NULL;

ALTER TABLE crm_deals
  ADD COLUMN IF NOT EXISTS meeting_date TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE crm_deals
  ADD COLUMN IF NOT EXISTS meeting_city TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_deals_meeting_date
  ON crm_deals(meeting_date) WHERE meeting_date IS NOT NULL;

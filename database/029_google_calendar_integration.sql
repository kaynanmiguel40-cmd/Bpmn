-- =============================================
-- 029: Google Calendar Integration
-- Tabelas para sincronizacao bidirecional
-- =============================================

-- 1. Tokens OAuth do Google Calendar (por usuario)
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  calendar_id TEXT DEFAULT 'primary',
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_token TEXT,  -- Google incremental sync token
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS: usuarios so veem seu proprio status (tokens reais so via service_role)
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gcal_tokens_select_own"
  ON google_calendar_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "gcal_tokens_delete_own"
  ON google_calendar_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Novas colunas em agenda_events para tracking de sync
ALTER TABLE agenda_events
  ADD COLUMN IF NOT EXISTS google_event_id TEXT,
  ADD COLUMN IF NOT EXISTS google_calendar_id TEXT,
  ADD COLUMN IF NOT EXISTS sync_source TEXT DEFAULT 'fyness';

CREATE INDEX IF NOT EXISTS idx_agenda_google_event_id
  ON agenda_events(google_event_id)
  WHERE google_event_id IS NOT NULL;

-- 3. Log de sincronizacao (debug e auditoria)
CREATE TABLE IF NOT EXISTS google_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  direction TEXT NOT NULL CHECK (direction IN ('push', 'pull')),
  event_id TEXT,
  google_event_id TEXT,
  action TEXT CHECK (action IN ('create', 'update', 'delete')),
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'conflict')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE google_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sync_log_select_own"
  ON google_sync_log FOR SELECT
  USING (auth.uid() = user_id);

-- Auto-cleanup: logs mais antigos que 30 dias
CREATE INDEX IF NOT EXISTS idx_sync_log_created
  ON google_sync_log(created_at);

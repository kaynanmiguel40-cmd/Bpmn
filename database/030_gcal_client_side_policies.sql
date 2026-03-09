-- =============================================
-- 030: Google Calendar — Client-Side RLS Policies
-- Adiciona INSERT/UPDATE para tokens e sync_log
-- Ajusta colunas para approach sem Edge Functions
-- =============================================

-- 1. Permitir INSERT/UPDATE nos tokens pelo proprio usuario
CREATE POLICY "gcal_tokens_insert_own"
  ON google_calendar_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gcal_tokens_update_own"
  ON google_calendar_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Permitir INSERT no sync_log pelo proprio usuario
CREATE POLICY "sync_log_insert_own"
  ON google_sync_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Tornar refresh_token nullable (GIS nao fornece refresh token)
ALTER TABLE google_calendar_tokens
  ALTER COLUMN refresh_token DROP NOT NULL;

ALTER TABLE google_calendar_tokens
  ALTER COLUMN refresh_token SET DEFAULT '';

-- 4. Adicionar colunas extras para client-side
ALTER TABLE google_calendar_tokens
  ADD COLUMN IF NOT EXISTS token_type TEXT DEFAULT 'Bearer',
  ADD COLUMN IF NOT EXISTS scope TEXT;

-- 5. Renomear coluna event_id para fyness_event_id no sync_log (se existir como event_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'google_sync_log' AND column_name = 'event_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'google_sync_log' AND column_name = 'fyness_event_id'
  ) THEN
    ALTER TABLE google_sync_log RENAME COLUMN event_id TO fyness_event_id;
  END IF;
END $$;

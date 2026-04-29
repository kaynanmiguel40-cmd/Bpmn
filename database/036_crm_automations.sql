-- ============================================================
-- 036_crm_automations.sql
-- Aba Automacoes do CRM: regras de disparo e logs de envio.
-- IDs em UUID (DEFAULT gen_random_uuid) alinhado com o padrao
-- das demais tabelas CRM (crm_deals, crm_pipelines, etc.).
-- Totalmente idempotente: pode ser reaplicado sem efeitos colaterais.
-- ============================================================

-- 1) Tabela de regras
CREATE TABLE IF NOT EXISTS crm_automations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  pipeline_id     UUID REFERENCES crm_pipelines(id) ON DELETE CASCADE,
  stage_id        UUID REFERENCES crm_pipeline_stages(id) ON DELETE CASCADE,
  channel         TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms')),
  message_type    TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'audio')),
  subject         TEXT,
  message_content TEXT,
  media_url       TEXT,
  segment_filter  TEXT,
  delay_minutes   INT NOT NULL DEFAULT 0,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Garante coluna `subject` mesmo se a tabela ja existia
ALTER TABLE crm_automations ADD COLUMN IF NOT EXISTS subject TEXT;

-- 2) Tabela de logs
CREATE TABLE IF NOT EXISTS crm_automation_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id    UUID REFERENCES crm_automations(id) ON DELETE SET NULL,
  deal_id          UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
  deal_title       TEXT,
  stage_name       TEXT,
  channel          TEXT NOT NULL,
  recipient        TEXT,
  message_snapshot TEXT,
  status           TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'error')),
  error_message    TEXT,
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Indices
CREATE INDEX IF NOT EXISTS idx_crm_automations_stage
  ON crm_automations(stage_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_automations_pipeline
  ON crm_automations(pipeline_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_automation_logs_automation
  ON crm_automation_logs(automation_id);
CREATE INDEX IF NOT EXISTS idx_crm_automation_logs_deal
  ON crm_automation_logs(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_automation_logs_sent_at
  ON crm_automation_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_automation_logs_status
  ON crm_automation_logs(status);

-- 4) RLS
ALTER TABLE crm_automations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_automation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_automations_all"     ON crm_automations;
DROP POLICY IF EXISTS "crm_automation_logs_all" ON crm_automation_logs;

CREATE POLICY "crm_automations_all" ON crm_automations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "crm_automation_logs_all" ON crm_automation_logs
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 018_automations.sql
-- Aba Automações do CRM: regras de disparo e logs de envio
-- ============================================================

-- Regras de automação vinculadas a etapas do pipeline
CREATE TABLE IF NOT EXISTS crm_automations (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  pipeline_id  TEXT REFERENCES crm_pipelines(id) ON DELETE CASCADE,
  stage_id     TEXT REFERENCES crm_pipeline_stages(id) ON DELETE CASCADE,
  channel      TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms')),
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'audio')),
  message_content TEXT,
  media_url    TEXT,
  -- Filtro de segmento: NULL = dispara para todos os deals da etapa
  -- Preenchido = só dispara se deal.segment = segment_filter
  segment_filter TEXT,
  delay_minutes  INT NOT NULL DEFAULT 0,
  active         BOOLEAN NOT NULL DEFAULT true,
  created_by     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ
);

-- Logs de cada disparo (histórico completo)
CREATE TABLE IF NOT EXISTS crm_automation_logs (
  id             TEXT PRIMARY KEY,
  automation_id  TEXT REFERENCES crm_automations(id) ON DELETE SET NULL,
  deal_id        TEXT REFERENCES crm_deals(id) ON DELETE SET NULL,
  deal_title     TEXT,
  stage_name     TEXT,
  channel        TEXT NOT NULL,
  recipient      TEXT,           -- email ou telefone do contato
  message_snapshot TEXT,         -- cópia exata da mensagem no momento do disparo
  status         TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'error')),
  error_message  TEXT,
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
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

-- RLS: habilitar segurança por linha (permissão via políticas existentes da conta)
ALTER TABLE crm_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_automation_logs ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (herdam o controle de acesso do tenant via auth)
CREATE POLICY "crm_automations_all" ON crm_automations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "crm_automation_logs_all" ON crm_automation_logs
  FOR ALL USING (true) WITH CHECK (true);

-- 012: Adiciona tipo de prospect (lead vs partner) e categoria de parceiro
ALTER TABLE crm_prospects
  ADD COLUMN IF NOT EXISTS prospect_type TEXT DEFAULT 'lead';

ALTER TABLE crm_prospects
  ADD COLUMN IF NOT EXISTS partner_category TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_prospects_type
  ON crm_prospects(prospect_type);

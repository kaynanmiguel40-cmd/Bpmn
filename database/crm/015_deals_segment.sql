-- 015: Adicionar campo segmento ao negocio (crm_deals)
ALTER TABLE crm_deals
  ADD COLUMN IF NOT EXISTS segment TEXT DEFAULT NULL;

COMMENT ON COLUMN crm_deals.segment IS 'Segmento de mercado do negocio (ex: Agro, Alimenticio, Tecnologia)';

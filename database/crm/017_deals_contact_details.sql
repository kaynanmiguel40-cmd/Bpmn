-- 017: Campos de telefone e email do contato direto no negocio
ALTER TABLE crm_deals
  ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT NULL;

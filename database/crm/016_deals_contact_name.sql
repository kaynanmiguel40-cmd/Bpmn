-- 016: Campo de nome de contato livre no negocio (sem exigir cadastro previo)
ALTER TABLE crm_deals
  ADD COLUMN IF NOT EXISTS contact_name TEXT DEFAULT NULL;

COMMENT ON COLUMN crm_deals.contact_name IS 'Nome do contato digitado livremente, usado quando nao ha contactId vinculado';

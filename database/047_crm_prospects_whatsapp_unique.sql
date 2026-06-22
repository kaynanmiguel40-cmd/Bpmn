-- ============================================================
-- 047_crm_prospects_whatsapp_unique.sql
--
-- Previne duplicatas de prospects criados via webhook WhatsApp quando
-- multiplas mensagens chegam simultaneamente (race condition no
-- evolution-webhook ao criar prospect inbound).
--
-- Indice unique parcial: garante que so existe 1 prospect ativo por
-- (phone) entre os com source='whatsapp_inbound'.
--
-- Idempotente.
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_prospects_whatsapp_phone
  ON public.crm_prospects(phone)
  WHERE source = 'whatsapp_inbound' AND deleted_at IS NULL;

COMMENT ON INDEX public.uq_crm_prospects_whatsapp_phone IS
  'Previne duplicatas em prospects inbound do WhatsApp (race condition no webhook).';

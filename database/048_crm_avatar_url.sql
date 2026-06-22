-- ============================================================
-- 048_crm_avatar_url.sql
--
-- Adiciona avatar_url em crm_contacts e crm_prospects para guardar
-- a URL da foto de perfil (ex: WhatsApp profile picture).
--
-- Observacao: URLs do WhatsApp (pps.whatsapp.net) tem expiracao
-- (~7 dias). MVP guarda direto; quando quebrar, o webhook refaz fetch
-- na proxima mensagem do contato. Ideal futuro: espelhar no Supabase
-- Storage.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_prospects
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.crm_prospects.avatar_url IS
  'Foto de perfil (ex: WhatsApp). URL externa que pode expirar.';
COMMENT ON COLUMN public.crm_contacts.avatar_url IS
  'Foto de perfil (ex: WhatsApp). URL externa que pode expirar.';

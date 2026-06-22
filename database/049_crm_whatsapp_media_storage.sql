-- ============================================================
-- 049_crm_whatsapp_media_storage.sql
--
-- Bucket Storage 'crm-whatsapp-media' pra hospedar midia enviada
-- pelo CRM no Inbox WhatsApp. A WAHA precisa de URL publica pra
-- enviar midia; usar Storage proprio evita dependencia de servicos
-- externos e da URL persistente (vs WhatsApp CDN que expira).
--
-- Bucket publico (qualquer um com URL pode ler). Acesso controlado
-- por obscuridade do path (UUID no nome do arquivo).
--
-- Idempotente.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'crm-whatsapp-media',
  'crm-whatsapp-media',
  true,
  52428800, -- 50MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/webm',
    'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policies: usuario autenticado le e escreve no bucket
DO $$ BEGIN
  CREATE POLICY "crm_wa_media_select"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'crm-whatsapp-media');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_wa_media_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'crm-whatsapp-media' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_wa_media_delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'crm-whatsapp-media' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

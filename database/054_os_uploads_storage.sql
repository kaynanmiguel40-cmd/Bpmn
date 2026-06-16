-- ============================================================
-- 054_os_uploads_storage.sql
--
-- Bucket Storage 'os-uploads' pra hospedar imagens (prints/fotos)
-- coladas nos briefings e nas entregas das tarefas de O.S.
--
-- Antes, cada print virava base64 DENTRO de os_orders.checklist (JSONB),
-- inchando o registro: payload pesado a cada save, refetch lento,
-- mensagem de realtime descartada por estourar o teto de payload.
-- Agora a imagem vai pro Storage e o checklist guarda so a URL (leve).
--
-- Bucket publico (qualquer um com a URL le). Acesso por obscuridade do
-- path (UUID no nome do arquivo) — mesmo padrao do bucket do CRM.
--
-- Idempotente. Rode no Supabase -> SQL Editor.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'os-uploads',
  'os-uploads',
  true,
  10485760, -- 10MB
  -- Formatos reais de print/foto. SVG fica de FORA de proposito: bucket publico
  -- + SVG = vetor de XSS (SVG carrega <script>). Print nunca e SVG.
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'image/heic', 'image/heif', 'image/bmp', 'image/avif'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policies: leitura publica (bucket publico) e escrita/exclusao por autenticado.
DO $$ BEGIN
  CREATE POLICY "os_uploads_select"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'os-uploads');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "os_uploads_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'os-uploads' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "os_uploads_delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'os-uploads' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

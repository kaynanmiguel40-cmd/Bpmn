-- 142: biblioteca de mídias (imagens/vídeos pré-prontos) pro Inbox
--
-- Banco de vídeos/imagens que o vendedor escolhe por filtro (categoria + tipo) e
-- manda na conversa sem precisar reenviar arquivo — a URL pública do storage já
-- vai direto pro evolution-send. Admin cria/gerencia; todo mundo escolhe.
-- Os arquivos vivem no bucket crm-whatsapp-media (prefixo 'library/').

CREATE TABLE IF NOT EXISTS crm_media_library (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  media_type  text NOT NULL,           -- 'image' | 'video'
  media_url   text NOT NULL,           -- URL pública no storage
  media_mime  text,
  category    text,                    -- filtro principal (ex.: "Contas a pagar e receber")
  created_by  uuid,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  deleted_at  timestamptz
);

CREATE INDEX IF NOT EXISTS idx_crm_media_library_active
  ON crm_media_library (category, media_type)
  WHERE deleted_at IS NULL;

-- Mesmo padrão de acesso das outras tabelas do CRM (RLS ligada + política
-- permissiva; o app já roda autenticado). Conteúdo é material de marketing
-- compartilhado, não é sensível.
ALTER TABLE crm_media_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crm_media_library_all ON crm_media_library;
CREATE POLICY crm_media_library_all ON crm_media_library
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON crm_media_library TO anon, authenticated;

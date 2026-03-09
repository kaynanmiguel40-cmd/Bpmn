-- ============================================================
-- META SOCIAL INTEGRATION — Schema para Instagram + Facebook
-- Execute este SQL no SQL Editor do Supabase Dashboard
-- ============================================================

-- ============================================================
-- 1. META SOCIAL TOKENS
-- Armazena tokens de acesso do Meta (Instagram + Facebook)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meta_social_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  facebook_user_id TEXT,
  facebook_page_id TEXT,
  facebook_page_token TEXT,
  instagram_account_id TEXT,
  instagram_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.meta_social_tokens ENABLE ROW LEVEL SECURITY;

-- Apenas o proprio usuario pode ver/editar seus tokens
CREATE POLICY "meta_tokens_select" ON public.meta_social_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meta_tokens_insert" ON public.meta_social_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meta_tokens_update" ON public.meta_social_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "meta_tokens_delete" ON public.meta_social_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 2. META PUBLISH LOGS
-- Historico de publicacoes no Instagram e Facebook
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meta_publish_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook')),
  media_id TEXT,
  content_post_id TEXT, -- Referencia ao content_posts (opcional)
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.meta_publish_logs ENABLE ROW LEVEL SECURITY;

-- Usuarios podem ver apenas seus proprios logs
CREATE POLICY "meta_logs_select" ON public.meta_publish_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meta_logs_insert" ON public.meta_publish_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index para consultas rapidas
CREATE INDEX IF NOT EXISTS idx_meta_publish_logs_user_id ON public.meta_publish_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meta_publish_logs_created_at ON public.meta_publish_logs(created_at DESC);

-- ============================================================
-- 3. ADICIONAR CAMPOS AO CONTENT_POSTS (se necessario)
-- ============================================================
DO $$
BEGIN
  -- Campo para armazenar URL da midia (video/imagem)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_posts' AND column_name='media_url') THEN
    ALTER TABLE public.content_posts ADD COLUMN media_url TEXT;
  END IF;

  -- Campo para armazenar thumbnail/cover
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_posts' AND column_name='thumbnail_url') THEN
    ALTER TABLE public.content_posts ADD COLUMN thumbnail_url TEXT;
  END IF;

  -- Campo para ID da publicacao na rede social (apos publicar)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_posts' AND column_name='external_id') THEN
    ALTER TABLE public.content_posts ADD COLUMN external_id TEXT;
  END IF;

  -- Campo para erros de publicacao
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_posts' AND column_name='publish_error') THEN
    ALTER TABLE public.content_posts ADD COLUMN publish_error TEXT;
  END IF;
END
$$;

-- ============================================================
-- 4. STORAGE BUCKET PARA MIDIAS SOCIAIS
-- Criar bucket para armazenar videos/imagens antes de publicar
-- ============================================================
-- NOTA: Criar o bucket via Dashboard ou CLI:
-- supabase storage create social-media --public

-- Ou via SQL (requer permissoes de admin):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('social-media', 'social-media', true);

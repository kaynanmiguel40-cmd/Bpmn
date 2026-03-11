-- ============================================================
-- SOCIAL TOKENS — Tabela genérica para tokens de redes sociais
-- TikTok, YouTube e outras plataformas que precisam OAuth
-- Execute este SQL no SQL Editor do Supabase Dashboard
-- ============================================================

-- ============================================================
-- 1. SOCIAL TOKENS
-- Armazena tokens OAuth de diversas plataformas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.social_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  open_id TEXT, -- TikTok usa open_id como identificador
  expires_at TIMESTAMPTZ NOT NULL,
  refresh_expires_at TIMESTAMPTZ,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

ALTER TABLE public.social_tokens ENABLE ROW LEVEL SECURITY;

-- Apenas o próprio usuário pode ver/editar seus tokens
CREATE POLICY "social_tokens_select" ON public.social_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "social_tokens_insert" ON public.social_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "social_tokens_update" ON public.social_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "social_tokens_delete" ON public.social_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Index para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_social_tokens_user_platform ON public.social_tokens(user_id, platform);

-- ============================================================
-- 2. ATUALIZAR META_PUBLISH_LOGS
-- Adicionar 'tiktok' como plataforma válida
-- ============================================================
DO $$
BEGIN
  -- Remover constraint antiga se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'meta_publish_logs_platform_check'
    AND table_name = 'meta_publish_logs'
  ) THEN
    ALTER TABLE public.meta_publish_logs DROP CONSTRAINT meta_publish_logs_platform_check;
  END IF;

  -- Adicionar nova constraint com tiktok
  ALTER TABLE public.meta_publish_logs
    ADD CONSTRAINT meta_publish_logs_platform_check
    CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'youtube'));
EXCEPTION
  WHEN others THEN
    -- Se a constraint não existir ou tiver outro nome, tentar criar direto
    BEGIN
      ALTER TABLE public.meta_publish_logs
        ADD CONSTRAINT meta_publish_logs_platform_check
        CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'youtube'));
    EXCEPTION
      WHEN others THEN NULL; -- Ignora se já existir
    END;
END
$$;

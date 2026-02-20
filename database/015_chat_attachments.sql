-- Migration 015: Chat attachments, user_id, and mentions
-- Transforma o chat de texto simples em estilo WhatsApp

DO $$ BEGIN
  ALTER TABLE public.os_comments ADD COLUMN attachments JSONB DEFAULT '[]';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.os_comments ADD COLUMN user_id UUID DEFAULT NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.os_comments ADD COLUMN mentions JSONB DEFAULT '[]';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_os_comments_user_id ON public.os_comments(user_id);

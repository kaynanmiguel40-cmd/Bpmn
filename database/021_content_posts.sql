-- 021: Calendario de Postagens (Content Calendar)
-- Tabela para agendar e acompanhar postagens em redes sociais

CREATE TABLE IF NOT EXISTS public.content_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date TEXT NOT NULL,
    scheduled_time TEXT DEFAULT '12:00',
    platform TEXT NOT NULL DEFAULT 'instagram',
    status TEXT NOT NULL DEFAULT 'scheduled',
    published_at TIMESTAMPTZ,
    assignee TEXT,
    media_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraints
ALTER TABLE public.content_posts
  ADD CONSTRAINT content_posts_platform_check
  CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'youtube'));

ALTER TABLE public.content_posts
  ADD CONSTRAINT content_posts_status_check
  CHECK (status IN ('scheduled', 'published', 'missed'));

ALTER TABLE public.content_posts
  ADD CONSTRAINT content_posts_media_type_check
  CHECK (media_type IS NULL OR media_type IN ('image', 'video', 'carousel', 'story', 'reel'));

-- Indices
CREATE INDEX IF NOT EXISTS idx_content_posts_scheduled_date ON public.content_posts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_posts_platform ON public.content_posts(platform);
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON public.content_posts(status);

-- RLS
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_posts_select" ON public.content_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "content_posts_insert" ON public.content_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "content_posts_update" ON public.content_posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "content_posts_delete" ON public.content_posts FOR DELETE TO authenticated USING (true);

-- Trigger updated_at (funcao definida em 001_rbac_schema.sql)
CREATE OR REPLACE TRIGGER set_content_posts_updated_at
  BEFORE UPDATE ON public.content_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

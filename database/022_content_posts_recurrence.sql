-- 022: Postagens recorrentes
-- Adiciona campo para agrupar posts de uma mesma serie recorrente

ALTER TABLE public.content_posts
  ADD COLUMN IF NOT EXISTS recurrence_group_id TEXT;

CREATE INDEX IF NOT EXISTS idx_content_posts_recurrence_group
  ON public.content_posts(recurrence_group_id);

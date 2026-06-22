-- ============================================================
-- 055_commercial_plan_actions.sql
--
-- Checklist de execucao do plano comercial (5W1H / kanban das 5 fases).
-- Guarda quais passos do "COMO" de cada fase ja foram concluidos.
--
-- Estado compartilhado (todo mundo ve o mesmo progresso). O id e a chave
-- estavel do passo (ex: 'f1-0'), definida no codigo (commercialPlanActions.js).
--
-- Idempotente. Rode no Supabase -> SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.commercial_plan_actions (
  id          text PRIMARY KEY,
  done        boolean NOT NULL DEFAULT false,
  done_by     text,
  done_at     timestamptz,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.commercial_plan_actions ENABLE ROW LEVEL SECURITY;

-- RLS aberto (mesmo padrao do resto do app).
DO $$ BEGIN
  CREATE POLICY "commercial_plan_actions_all"
    ON public.commercial_plan_actions
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

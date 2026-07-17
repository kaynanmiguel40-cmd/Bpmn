-- ============================================================
-- 080_crm_stage_playbook.sql
--
-- Playbook por etapa: o que o vendedor tem que fazer naquela etapa, com o
-- script da fala, e quando o lead deve avancar.
--
-- Modelo em duas metades, de proposito:
--
--   DEFINICAO (na etapa, igual pra todo lead)
--     crm_pipeline_stages.objetivo       -- por que essa etapa existe
--     crm_pipeline_stages.exit_criteria  -- quando mover o lead pra proxima
--     crm_stage_steps                    -- os passos, com script (1:N)
--
--   ESTADO (por negocio)
--     crm_deal_step_progress             -- quais passos ja foram feitos, por quem
--
-- Por que separado: o playbook e editado uma vez e vale pra todos; o checklist
-- e de cada lead. Guardar os dois juntos (ex: copiar os passos pra dentro do
-- deal na entrada da etapa) faria cada edicao do playbook so valer pra lead
-- novo, e o time ficaria com versoes diferentes do processo rodando ao mesmo
-- tempo, sem ninguem perceber.
--
-- Objetivo/exit_criteria vao como COLUNA na propria etapa (1:1, sempre editados
-- junto com ela) em vez de tabela separada — tabela 1:1 so adiciona join.
--
-- RLS permissiva (USING (true)), igual as outras tabelas deste banco: o
-- controle de acesso real do CRM e no app (crm_blocked_sections). Uma tabela
-- com RLS restritiva aqui se comportaria diferente de todas as outras e
-- quebraria de um jeito dificil de achar.
--
-- Idempotente: IF NOT EXISTS em tudo, pode rodar de novo sem estrago.
-- ============================================================

-- 1) Objetivo e criterio de saida da etapa.
ALTER TABLE public.crm_pipeline_stages ADD COLUMN IF NOT EXISTS objetivo TEXT;
ALTER TABLE public.crm_pipeline_stages ADD COLUMN IF NOT EXISTS exit_criteria TEXT;

-- 2) Passos do processo da etapa.
CREATE TABLE IF NOT EXISTS public.crm_stage_steps (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id   UUID NOT NULL REFERENCES public.crm_pipeline_stages(id) ON DELETE CASCADE,
  position   INTEGER NOT NULL DEFAULT 0,
  title      TEXT NOT NULL,
  script     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_stage_steps_stage
  ON public.crm_stage_steps(stage_id, position);

ALTER TABLE public.crm_stage_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_stage_steps_select" ON public.crm_stage_steps;
CREATE POLICY "crm_stage_steps_select" ON public.crm_stage_steps FOR SELECT USING (true);
DROP POLICY IF EXISTS "crm_stage_steps_insert" ON public.crm_stage_steps;
CREATE POLICY "crm_stage_steps_insert" ON public.crm_stage_steps FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "crm_stage_steps_update" ON public.crm_stage_steps;
CREATE POLICY "crm_stage_steps_update" ON public.crm_stage_steps FOR UPDATE USING (true);
DROP POLICY IF EXISTS "crm_stage_steps_delete" ON public.crm_stage_steps;
CREATE POLICY "crm_stage_steps_delete" ON public.crm_stage_steps FOR DELETE USING (true);

-- 3) Estado do checklist por negocio.
--
-- UNIQUE(deal_id, step_id): marcar/desmarcar vira INSERT/DELETE idempotente, e
-- dois cliques rapidos nao geram duas linhas.
--
-- step_id com ON DELETE CASCADE: apagar um passo do playbook leva junto o
-- progresso dele. E o certo — o passo nao existe mais, entao "fulano fez esse
-- passo" perdeu o referente.
-- done_by e TEXT, nao UUID: team_members.id e text neste banco (crm_deals.owner_id
-- tambem e). Declarar UUID aqui derruba a migration na criacao da FK.
CREATE TABLE IF NOT EXISTS public.crm_deal_step_progress (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.crm_stage_steps(id) ON DELETE CASCADE,
  done_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  done_by TEXT REFERENCES public.team_members(id),
  UNIQUE (deal_id, step_id)
);

CREATE INDEX IF NOT EXISTS idx_crm_deal_step_progress_deal
  ON public.crm_deal_step_progress(deal_id);

ALTER TABLE public.crm_deal_step_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_deal_step_progress_select" ON public.crm_deal_step_progress;
CREATE POLICY "crm_deal_step_progress_select" ON public.crm_deal_step_progress FOR SELECT USING (true);
DROP POLICY IF EXISTS "crm_deal_step_progress_insert" ON public.crm_deal_step_progress;
CREATE POLICY "crm_deal_step_progress_insert" ON public.crm_deal_step_progress FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "crm_deal_step_progress_update" ON public.crm_deal_step_progress;
CREATE POLICY "crm_deal_step_progress_update" ON public.crm_deal_step_progress FOR UPDATE USING (true);
DROP POLICY IF EXISTS "crm_deal_step_progress_delete" ON public.crm_deal_step_progress;
CREATE POLICY "crm_deal_step_progress_delete" ON public.crm_deal_step_progress FOR DELETE USING (true);

-- Recarrega o cache de schema do PostgREST.
NOTIFY pgrst, 'reload schema';

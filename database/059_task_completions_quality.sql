-- ============================================================
-- 059_task_completions_quality.sql
--
-- Qualidade MANUAL por tarefa: o supervisor da O.S. preenche um checklist de
-- critérios (cada um com peso) ao revisar a tarefa. Guardamos a nota de
-- qualidade (0–100) e as respostas, em cima da base de produtividade.
--
-- quality_pct      = pontos obtidos ÷ aplicáveis × 100 (null se não avaliado)
-- quality_answers  = { criterioId: 'sim'|'nao'|'na' }
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.task_completions ADD COLUMN IF NOT EXISTS quality_pct integer;
ALTER TABLE public.task_completions ADD COLUMN IF NOT EXISTS quality_answers jsonb;

COMMENT ON COLUMN public.task_completions.quality_pct IS
  'Nota de qualidade da tarefa (0–100) vinda do checklist manual do supervisor.';
COMMENT ON COLUMN public.task_completions.quality_answers IS
  'Respostas do checklist de qualidade: { criterioId: sim|nao|na }.';

-- ============================================================
-- 094_step_scheduling.sql
--
-- Agendamento automatico das tarefas do processo:
--
--   crm_stage_steps.day_offset  — em quantos dias apos entrar na etapa a tarefa
--                                 deve acontecer (D1 = 1, D3 = 3...). 0 = hoje.
--   crm_activities.stage_step_id — liga a atividade gerada de volta ao passo do
--                                 playbook. Serve pra (a) nao duplicar quando o
--                                 lead volta pra etapa e (b) marcar o passo como
--                                 feito quando a atividade e concluida na Agenda.
--
-- Preenche day_offset a partir do "D<N>" que ja esta nos titulos da cadencia
-- (ex: "D5 10h — Ligacao 4" -> 5). Titulos sem D<N> ficam 0 (mesmo dia).
--
-- Idempotente: ADD COLUMN IF NOT EXISTS + UPDATE por regex.
-- ============================================================

ALTER TABLE public.crm_stage_steps
  ADD COLUMN IF NOT EXISTS day_offset INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.crm_activities
  ADD COLUMN IF NOT EXISTS stage_step_id UUID REFERENCES public.crm_stage_steps(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_crm_activities_stage_step
  ON public.crm_activities(deal_id, stage_step_id);

-- Extrai o dia do titulo: "D1 9h — Ligacao 1" -> 1 ; "D14 19h ..." -> 14
UPDATE public.crm_stage_steps
SET day_offset = COALESCE(NULLIF(substring(title from '^D([0-9]+)'), '')::int, 0)
WHERE title ~ '^D[0-9]+';

-- "Mesmo dia, a tarde" e o 2o toque do mesmo dia — fica no dia 0 mas depois do
-- primeiro (a ordem de position ja garante isso na hora de agendar).
NOTIFY pgrst, 'reload schema';

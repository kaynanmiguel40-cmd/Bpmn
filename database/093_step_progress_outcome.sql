-- ============================================================
-- 093_step_progress_outcome.sql
--
-- Guarda o RESULTADO de cada tarefa do processo: o que o lead respondeu ou
-- como reagiu. Ao concluir um passo do playbook, o vendedor registra isso —
-- e o Historico do negocio passa a contar a conversa, nao so "feito".
--
-- Idempotente: ADD COLUMN IF NOT EXISTS.
-- ============================================================

ALTER TABLE public.crm_deal_step_progress
  ADD COLUMN IF NOT EXISTS outcome TEXT;

NOTIFY pgrst, 'reload schema';

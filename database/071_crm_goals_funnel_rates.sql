-- ============================================================
-- 071_crm_goals_funnel_rates.sql
--
-- Meta de FUNIL (crm_goals kind='funnel') ganha 4 taxas independentes no
-- lugar de uma taxa unica interpolada geometricamente. Etapas reais:
--
--   Lead -> Qualificado -> Reuniao agendada -> Reuniao realizada -> Fechamento
--
--   qual_rate     = % dos leads que qualificam
--   schedule_rate = % dos qualificados que agendam reuniao
--   show_rate     = % das reunioes agendadas que acontecem (100% - no-show)
--   close_rate    = % das reunioes realizadas que fecham
--
-- conversion_rate (065) fica como legado/nao usado em metas novas; funnel_base
-- ganha o valor 'leads' (planeja a partir do numero de leads, alem de 'sales'
-- e 'calls' que ja existiam). Sem CHECK constraint em funnel_base, entao nao
-- precisa migrar dado nenhum pra liberar o novo valor.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_goals
  ADD COLUMN IF NOT EXISTS qual_rate     NUMERIC,
  ADD COLUMN IF NOT EXISTS schedule_rate NUMERIC,
  ADD COLUMN IF NOT EXISTS show_rate     NUMERIC,
  ADD COLUMN IF NOT EXISTS close_rate    NUMERIC;

COMMENT ON COLUMN public.crm_goals.qual_rate IS
  'So p/ kind=funnel: % dos leads que qualificam (Lead -> Qualificado).';
COMMENT ON COLUMN public.crm_goals.schedule_rate IS
  'So p/ kind=funnel: % dos qualificados que agendam reuniao (Qualificado -> Reuniao agendada).';
COMMENT ON COLUMN public.crm_goals.show_rate IS
  'So p/ kind=funnel: % das reunioes agendadas que acontecem (Reuniao agendada -> Reuniao realizada). O complemento e a taxa de no-show.';
COMMENT ON COLUMN public.crm_goals.close_rate IS
  'So p/ kind=funnel: % das reunioes realizadas que fecham (Reuniao realizada -> Fechamento).';

-- Recarrega o cache de schema do PostgREST (pega as colunas novas na hora).
NOTIFY pgrst, 'reload schema';

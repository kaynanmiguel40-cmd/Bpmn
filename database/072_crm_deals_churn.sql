-- ============================================================
-- 072_crm_deals_churn.sql
--
-- Visibilidade de churn: crm_deals ganha `churned_at`. Um deal GANHO
-- (status='won') com churned_at NULL e um cliente ATIVO; com churned_at
-- preenchido, o cliente cancelou naquela data (o deal continua status='won'
-- pra preservar o historico de venda — churn e um estado A MAIS, nao troca
-- o status original).
--
-- Base pro Dashboard: "Clientes ativos" (won + churned_at IS NULL) e
-- "Cancelados no periodo" (churned_at dentro do range selecionado).
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_deals
  ADD COLUMN IF NOT EXISTS churned_at TIMESTAMPTZ;

COMMENT ON COLUMN public.crm_deals.churned_at IS
  'Data em que o cliente cancelou (deal status continua won). NULL = cliente ativo.';

-- Recarrega o cache de schema do PostgREST (pega a coluna nova na hora).
NOTIFY pgrst, 'reload schema';

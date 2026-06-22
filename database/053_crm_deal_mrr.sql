-- ============================================================
-- 053_crm_deal_mrr.sql
--
-- Adiciona `mrr` (mensalidade / receita recorrente mensal) em crm_deals.
--
-- Contexto: o Fyness e SaaS. O campo `value` continua sendo o VALOR TOTAL
-- DO CONTRATO (ex: 12x a mensalidade, setups, etc.). `mrr` e a parcela
-- recorrente mensal — base pra metrica de "MRR novo": soma do mrr dos
-- negocios GANHOS no mes.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_deals
  ADD COLUMN IF NOT EXISTS mrr NUMERIC;

COMMENT ON COLUMN public.crm_deals.mrr IS
  'Receita recorrente mensal (mensalidade) do negocio. value = contrato total; mrr = parcela mensal. Base pra "MRR novo".';

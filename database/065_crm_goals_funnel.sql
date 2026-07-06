-- ============================================================
-- 065_crm_goals_funnel.sql
--
-- Metas de FUNIL (planejador reverso) em cima da tabela crm_goals.
--
-- Ate aqui `crm_goals` so guardava meta de VALOR (R$): target_value em reais.
-- Agora a mesma tabela ganha um segundo "tipo" de meta, baseado em QUANTIDADE:
--
--   kind='funnel'  -> target_value = nº alvo (vendas OU ligacoes)
--                     funnel_base  = 'sales' | 'calls' (qual ponta o usuario digitou)
--                     conversion_rate = % de conversao (ligacao/lead -> venda)
--
-- Com o alvo de uma ponta + a taxa de conversao, o app calcula a meta de cada
-- etapa do funil (planejador reverso) e desenha por cima do Funil de Conversao.
--
-- kind='revenue' (default) = comportamento antigo, meta em R$. Nada muda pra ele.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_goals
  ADD COLUMN IF NOT EXISTS kind            TEXT    NOT NULL DEFAULT 'revenue',
  ADD COLUMN IF NOT EXISTS funnel_base     TEXT,
  ADD COLUMN IF NOT EXISTS conversion_rate NUMERIC;

COMMENT ON COLUMN public.crm_goals.kind IS
  'Tipo de meta: revenue (valor em R$, default) ou funnel (quantidade + taxa de conversao).';
COMMENT ON COLUMN public.crm_goals.funnel_base IS
  'So p/ kind=funnel: qual ponta foi digitada — sales (nº de vendas) ou calls (nº de ligacoes).';
COMMENT ON COLUMN public.crm_goals.conversion_rate IS
  'So p/ kind=funnel: taxa de conversao % (lead/ligacao -> venda). Base do planejador reverso.';

-- Recarrega o cache de schema do PostgREST (pega as colunas novas na hora).
NOTIFY pgrst, 'reload schema';

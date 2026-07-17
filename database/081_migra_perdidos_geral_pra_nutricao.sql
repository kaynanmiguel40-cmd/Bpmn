-- ============================================================
-- 081_migra_perdidos_geral_pra_nutricao.sql
--
-- Move os deals PERDIDOS da pipeline Geral pra Nurturing > "Em Nutricao"
-- (a 1a etapa), REATIVANDO-os (status open) pra equipe trabalhar a reativacao.
--
-- Por que: perder um lead no funil de vendas nao e morte, e handoff pra
-- nutricao. Ate agora esses 18 ficavam na coluna "Perdido" da Geral, parados.
-- A regra nova do markDealAsLost (crmDealsService) ja manda perdidos NOVOS pra
-- ca como ativos; esta migration traz os LEGADOS pro mesmo lugar.
--
-- status = 'open' + closed_at = NULL: viram card ativo em Em Nutricao (senao
-- cairiam na coluna Perdido da Nurturing e ninguem trabalharia). Mantem
-- lost_reason como contexto de por que entraram na nutricao.
--
-- Grava a transicao no historico ANTES de trocar o stage_id (from = onde se
-- perdeu, to = Em Nutricao), pra trilha nao mentir.
--
-- Idempotente: depois de rodar, nao ha mais lost na Geral, entao rodar de novo
-- nao pega ninguem.
-- ============================================================

-- O guard block_external_stage_change() barra mudanca de stage_id sem usuario
-- autenticado (service_role/bot). Esta migration muda stage_id em massa, entao
-- desliga o guard, migra e RESTAURA o valor original — tudo na mesma transacao:
-- a transacao enxerga a propria escrita (o UPDATE passa), e se algo falhar o
-- rollback devolve o guard ao que era. Nao assume que estava ligado.
DO $$
DECLARE
  v_geral uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8'; -- Geral
  v_nurt  uuid := '93dc0ff7-7897-4406-98ad-d3b5c53cbe2e'; -- Nurturing
  v_entry uuid := 'c1be52af-2a65-4194-a749-7fdc23de4679'; -- Em Nutricao (pos 1)
  v_prev_block boolean;
BEGIN
  SELECT blocked INTO v_prev_block FROM public.crm_cadence_block WHERE id = 1;
  UPDATE public.crm_cadence_block SET blocked = false WHERE id = 1;

  -- Historico: registra a transicao de cada perdido pra Em Nutricao.
  INSERT INTO crm_deal_stage_history (deal_id, from_stage_id, to_stage_id, pipeline_id)
  SELECT id, stage_id, v_entry, v_nurt
  FROM crm_deals
  WHERE pipeline_id = v_geral AND status = 'lost';

  -- Move + reativa.
  UPDATE crm_deals
  SET pipeline_id = v_nurt,
      stage_id    = v_entry,
      status      = 'open',
      closed_at   = NULL,
      probability = 0,
      updated_at  = now()
  WHERE pipeline_id = v_geral AND status = 'lost';

  -- Religa o guard no valor que estava antes.
  UPDATE public.crm_cadence_block SET blocked = v_prev_block WHERE id = 1;
END $$;

-- Confere: nao deve sobrar lost na Geral; devem ter entrado N em Em Nutricao.
SELECT 'perdidos_na_geral' AS check, count(*) AS n
FROM crm_deals WHERE pipeline_id = '44b978de-616a-4256-a4cd-40cd4ec8a4a8' AND status = 'lost'
UNION ALL
SELECT 'ativos_em_nutricao', count(*)
FROM crm_deals WHERE stage_id = 'c1be52af-2a65-4194-a749-7fdc23de4679' AND status = 'open';

NOTIFY pgrst, 'reload schema';

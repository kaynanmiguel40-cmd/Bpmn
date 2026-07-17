-- ============================================================
-- 082_nurturing_triagem_stage.sql
--
-- Cria a etapa "Triagem" no COMECO da pipeline Nurturing (posicao 1, empurrando
-- as demais +1) e traz pra ela os leads que a 081 tinha jogado em "Em Nutricao".
--
-- Mudanca de modelo: o lead perdido nao entra direto em "Em Nutricao" (etapa de
-- trabalho ativo). Ele cai em "Triagem" como PERDIDO e so vira ativo quando
-- alguem o arrasta pra frente (reativacao) — o moveDealToStage reabre deal
-- lost -> open ao mover pra etapa nao-ganho.
--
-- Reverte a parte de status da 081: os 18 voltam a status 'lost' (a 081 os
-- tinha reativado em Em Nutricao). closed_at volta a ser preenchido.
--
-- Guard: mexe em stage_id em massa, entao desliga/religa o crm_cadence_block na
-- mesma transacao, restaurando o valor original (ver 081 pro racional).
--
-- Idempotente: se "Triagem" ja existe, nao recria nem re-move.
-- ============================================================

DO $$
DECLARE
  v_nurt     uuid := '93dc0ff7-7897-4406-98ad-d3b5c53cbe2e'; -- Nurturing
  v_emnut    uuid := 'c1be52af-2a65-4194-a749-7fdc23de4679'; -- Em Nutricao
  v_triagem  uuid;
  v_prev_block boolean;
BEGIN
  IF EXISTS (SELECT 1 FROM crm_pipeline_stages WHERE pipeline_id = v_nurt AND name = 'Triagem') THEN
    RAISE NOTICE 'Triagem ja existe — nada a fazer.';
    RETURN;
  END IF;

  SELECT blocked INTO v_prev_block FROM public.crm_cadence_block WHERE id = 1;
  UPDATE public.crm_cadence_block SET blocked = false WHERE id = 1;

  -- Abre espaco na posicao 1 (sem constraint de posicao unica, shift em bloco).
  UPDATE crm_pipeline_stages SET position = position + 1 WHERE pipeline_id = v_nurt;

  INSERT INTO crm_pipeline_stages (pipeline_id, name, position, color, is_win_stage)
  VALUES (v_nurt, 'Triagem', 1, '#f43f5e', false)
  RETURNING id INTO v_triagem;

  -- Traz os 18 que a 081 deixou em Em Nutricao (ativos) de volta pra Triagem,
  -- como perdidos. Historico da transicao antes de trocar o stage.
  INSERT INTO crm_deal_stage_history (deal_id, from_stage_id, to_stage_id, pipeline_id)
  SELECT id, stage_id, v_triagem, v_nurt
  FROM crm_deals
  WHERE pipeline_id = v_nurt AND stage_id = v_emnut AND status = 'open';

  UPDATE crm_deals
  SET stage_id   = v_triagem,
      status     = 'lost',
      closed_at  = COALESCE(closed_at, now()),
      updated_at = now()
  WHERE pipeline_id = v_nurt AND stage_id = v_emnut AND status = 'open';

  UPDATE public.crm_cadence_block SET blocked = v_prev_block WHERE id = 1;
END $$;

-- Confere: etapas da Nurturing (Triagem deve ser a 1) e quantos perdidos nela.
SELECT position, name FROM crm_pipeline_stages
WHERE pipeline_id = '93dc0ff7-7897-4406-98ad-d3b5c53cbe2e' ORDER BY position;

SELECT count(*) AS perdidos_em_triagem
FROM crm_deals d JOIN crm_pipeline_stages s ON s.id = d.stage_id
WHERE s.pipeline_id = '93dc0ff7-7897-4406-98ad-d3b5c53cbe2e' AND s.name = 'Triagem' AND d.status = 'lost';

NOTIFY pgrst, 'reload schema';

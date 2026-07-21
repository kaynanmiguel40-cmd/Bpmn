-- ============================================================
-- 083_nurturing_resgatavel_reativado.sql
--
-- Modelo NOVO do lead perdido: a decisao "resgatavel?" na hora da perda ja
-- roteia (Em Nutricao se sim, Descarte se nao), entao a etapa "Triagem" perde a
-- funcao e sai. A reativacao usa a etapa "Reativou" que JA existe (win stage da
-- Nurturing): arrastar um lead pra la clona ele pro pipeline Geral como Cliente
-- (feito no app, em moveDealToStage), mantendo o original na Nurturing.
--
--   1. Move os 25 leads de "Triagem" pra "Descarte" (eram os parados aguardando
--      triagem no modelo antigo — #4 combinado). ANTES de remover a etapa: a FK
--      stage_id e ON DELETE CASCADE, entao deletar a etapa com deal apontando
--      pra ela APAGARIA o deal junto.
--   2. Remove a etapa "Triagem", limpando antes as refs do historico pra ela
--      (evita FK). So remove se ja estiver SEM deals ativos — trava de seguranca.
--
-- Idempotente. Guarda o crm_cadence_block (mexe em stage_id em massa) — mesmo
-- racional das migrations 081/082.
-- ============================================================

DO $$
DECLARE
  v_nurt       uuid := '93dc0ff7-7897-4406-98ad-d3b5c53cbe2e'; -- Nurturing
  v_triagem    uuid;
  v_descarte   uuid;
  v_prev_block boolean;
BEGIN
  SELECT id INTO v_triagem  FROM crm_pipeline_stages WHERE pipeline_id = v_nurt AND name = 'Triagem' LIMIT 1;
  SELECT id INTO v_descarte FROM crm_pipeline_stages WHERE pipeline_id = v_nurt AND name ILIKE 'descarte' LIMIT 1;

  IF v_triagem IS NULL THEN
    RAISE NOTICE 'Triagem nao existe — nada a fazer (ja aplicada?).';
    RETURN;
  END IF;
  IF v_descarte IS NULL THEN
    RAISE EXCEPTION 'Descarte nao encontrado na Nurturing — abortando pra nao perder os leads da Triagem.';
  END IF;

  SELECT blocked INTO v_prev_block FROM public.crm_cadence_block WHERE id = 1;
  UPDATE public.crm_cadence_block SET blocked = false WHERE id = 1;

  -- 1. Esvazia a Triagem -> Descarte ANTES de deletar a etapa. Sem historico
  --    (limpeza administrativa, nao uma transicao real de trabalho).
  UPDATE crm_deals
  SET stage_id = v_descarte, updated_at = now()
  WHERE pipeline_id = v_nurt AND stage_id = v_triagem AND deleted_at IS NULL;

  -- 2. Remove a Triagem — so se nao houver mais deals ATIVOS nela.
  IF NOT EXISTS (SELECT 1 FROM crm_deals WHERE stage_id = v_triagem AND deleted_at IS NULL) THEN
    DELETE FROM crm_deal_stage_history WHERE from_stage_id = v_triagem OR to_stage_id = v_triagem;
    DELETE FROM crm_pipeline_stages WHERE id = v_triagem;
    RAISE NOTICE 'Triagem esvaziada pra Descarte e removida.';
  ELSE
    RAISE EXCEPTION 'Triagem ainda tem deals ativos apos o move — abortando.';
  END IF;

  UPDATE public.crm_cadence_block SET blocked = v_prev_block WHERE id = 1;
END $$;

-- Confere as etapas finais da Nurturing.
SELECT position, name, is_win_stage,
  (SELECT count(*) FROM crm_deals d WHERE d.stage_id = s.id AND d.deleted_at IS NULL) AS deals
FROM crm_pipeline_stages s
WHERE s.pipeline_id = '93dc0ff7-7897-4406-98ad-d3b5c53cbe2e' ORDER BY position;

NOTIFY pgrst, 'reload schema';

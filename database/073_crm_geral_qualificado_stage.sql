-- ============================================================
-- 073_crm_geral_qualificado_stage.sql
--
-- Adiciona a etapa "Qualificado" ao pipeline Geral, entre "Respondeu" (pos 3)
-- e "Reunião / Demo" (pos 4) -- empurra as etapas seguintes uma posição pra
-- frente. Ate aqui, "Respondeu" contava como qualificado no funil de vendas
-- (getSalesFunnel, heuristico por nome) -- errado: responder nao e
-- qualificar, e so sinaliza engajamento. "Qualificado" agora e o limiar real
-- (ver src/modules/crm/services/crmDashboardService.js,
-- detectFunnelStagePositions).
--
-- Idempotente: nao faz nada se o pipeline Geral ja tiver uma etapa
-- "Qualificado".
-- ============================================================

DO $$
DECLARE
  v_pipeline_id uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8'; -- Geral
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM crm_pipeline_stages
    WHERE pipeline_id = v_pipeline_id AND name = 'Qualificado'
  ) THEN
    -- Ordem DESC: nunca ha 2 etapas com a mesma position ao mesmo tempo.
    UPDATE crm_pipeline_stages SET position = 9 WHERE pipeline_id = v_pipeline_id AND position = 8; -- Cliente
    UPDATE crm_pipeline_stages SET position = 8 WHERE pipeline_id = v_pipeline_id AND position = 7; -- Negociação
    UPDATE crm_pipeline_stages SET position = 7 WHERE pipeline_id = v_pipeline_id AND position = 6; -- Trial / Teste
    UPDATE crm_pipeline_stages SET position = 6 WHERE pipeline_id = v_pipeline_id AND position = 5; -- Proposta
    UPDATE crm_pipeline_stages SET position = 5 WHERE pipeline_id = v_pipeline_id AND position = 4; -- Reunião / Demo

    INSERT INTO crm_pipeline_stages (pipeline_id, name, position, color, is_win_stage)
    VALUES (v_pipeline_id, 'Qualificado', 4, '#8b5cf6', false);
  END IF;
END $$;

-- Recarrega o cache de schema do PostgREST.
NOTIFY pgrst, 'reload schema';

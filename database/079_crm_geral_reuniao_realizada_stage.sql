-- ============================================================
-- 079_crm_geral_reuniao_realizada_stage.sql
--
-- Adiciona a etapa "Reunião realizada" ao pipeline Geral, entre
-- "Reunião / Demo" (pos 5, a AGENDADA) e "Proposta" (pos 6) -- empurra as
-- etapas seguintes uma posicao pra frente.
--
-- Por que: o funil de vendas separa reuniao AGENDADA de REALIZADA (o lead
-- compareceu). Sem uma etapa que case com MEETING_HELD_RE
-- (/realiz|acontec|comparec|feita|ocorr/i, ver crmDashboardService.js), o
-- contador de "acontecidas" caia nos ganhos e virava copia de "Fechamento",
-- fazendo a taxa Realizada -> Fechamento exibir 100% fixo. Hoje o Comparativo
-- mostra a taxa como indisponivel nesse caso; com a etapa criada, ela passa a
-- ser medida de verdade (e a taxa de no-show tambem).
--
-- Escopo: so o pipeline Geral. O funil de vendas exclui "Nurturing" e
-- "Parceiros" por nome (salesPipelineIds em crmDashboardService.js), entao
-- criar a etapa neles nao afetaria a metrica.
--
-- Nao mexe em deal nenhum: a etapa nasce vazia e o time move os deals conforme
-- as reunioes acontecem.
--
-- Idempotente: nao faz nada se o pipeline Geral ja tiver a etapa.
-- ============================================================

DO $$
DECLARE
  v_pipeline_id uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8'; -- Geral
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM crm_pipeline_stages
    WHERE pipeline_id = v_pipeline_id AND name = 'Reunião realizada'
  ) THEN
    -- Ordem DESC: nunca ha 2 etapas com a mesma position ao mesmo tempo.
    UPDATE crm_pipeline_stages SET position = 10 WHERE pipeline_id = v_pipeline_id AND position = 9; -- Cliente
    UPDATE crm_pipeline_stages SET position = 9  WHERE pipeline_id = v_pipeline_id AND position = 8; -- Negociação
    UPDATE crm_pipeline_stages SET position = 8  WHERE pipeline_id = v_pipeline_id AND position = 7; -- Trial / Teste
    UPDATE crm_pipeline_stages SET position = 7  WHERE pipeline_id = v_pipeline_id AND position = 6; -- Proposta

    INSERT INTO crm_pipeline_stages (pipeline_id, name, position, color, is_win_stage)
    VALUES (v_pipeline_id, 'Reunião realizada', 6, '#2563eb', false);
  END IF;
END $$;

-- Recarrega o cache de schema do PostgREST.
NOTIFY pgrst, 'reload schema';

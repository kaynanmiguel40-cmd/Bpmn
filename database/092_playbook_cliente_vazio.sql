-- ============================================================
-- 092_playbook_cliente_vazio.sql
--
-- Etapa "Cliente" (Geral) fica SEM playbook: e o fim do funil de aquisicao —
-- o que vem depois (onboarding, pos-venda) nao e trabalho do comercial.
-- Limpa passos, objetivo e criterio de saida.
-- ============================================================

DO $$
DECLARE
  v_geral uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8';
  s8 uuid;
BEGIN
  SELECT id INTO s8 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=8; -- Cliente

  DELETE FROM crm_stage_steps WHERE stage_id = s8;

  UPDATE crm_pipeline_stages SET objetivo = NULL, exit_criteria = NULL WHERE id = s8;

  RAISE NOTICE 'Cliente: playbook limpo (etapa vazia).';
END $$;

SELECT s.position, s.name,
       (SELECT count(*) FROM crm_stage_steps st WHERE st.stage_id = s.id) AS passos,
       (s.objetivo IS NULL) AS sem_objetivo
FROM crm_pipeline_stages s
WHERE s.pipeline_id='44b978de-616a-4256-a4cd-40cd4ec8a4a8' AND s.position=8;

NOTIFY pgrst, 'reload schema';

-- ============================================================
-- 080_crm_geral_temperatura.sql
--
-- Renomeia as 4 primeiras etapas do pipeline Geral pro desenho de
-- temperatura:
--
--   A contatar   -> Leads    (pos 1)
--   Em cadência  -> Quente   (pos 2)
--   Respondeu    -> Morno    (pos 3)
--   Qualificado  -> Frio     (pos 4)
--
-- Por que: na pipeline, a FAIXA por cima e a etapa do FUNIL e a COLUNA e a
-- etapa do PROCESSO (ver PhaseBands em CrmPipelinePage.jsx). O desenho alvo e
-- "Leads" abraçando 1 coluna e "Qualificados" abraçando as 3 de temperatura.
-- Hoje ha 3 etapas antes do corte de qualificação, entao a faixa Leads abraça
-- 3 colunas. Com este rename o corte (qualPos) cai no Quente (pos 2) e as
-- faixas viram Leads(1) | Qualificados(3).
--
-- RENOMEIA, NAO REMOVE — de proposito. Remover uma etapa faria o
-- updateCrmPipeline reatribuir os negocios dela pro primeiro estagio
-- sobrevivente (survivors[0] = Leads) e apagar o historico que aponta pra ela:
-- os 5 negocios de "Qualificado" regrediriam pro topo do funil e o Dashboard
-- mostraria 5 qualificados a menos, em silencio. Renomeando, o id da etapa
-- sobrevive: nenhum negocio se move e nenhum historico se perde. Quem ja passou
-- pelo "Qualificado" (agora "Frio", ainda pos 4) segue contando como
-- qualificado, porque o corte agora e a pos 2.
--
-- ATENCAO — os negocios NAO sao re-triados por esta migration, e nao ha como
-- faze-lo automaticamente: as etapas antigas dizem ONDE NO PROCESSO o lead
-- esta, as novas dizem QUAO QUENTE ele e. Sao eixos diferentes, sem conversao.
-- Depois de aplicar, o time precisa arrastar os negocios pra temperatura certa.
-- O caso que mais doi: os 3 de "Respondeu" caem em "Morno", mas lead que
-- respondeu costuma ser o mais quente que existe.
--
-- Depende da detecção de QUAL_STAGE_TEMPERATURE_RE (/quente|morno|frio/i) em
-- crmDashboardService.js. Sem ela, nenhum nome casaria e qualPos cairia no
-- chute posicional de 33% — um lead Quente nao contaria como qualificado e um
-- Frio contaria. Nao aplique esta migration sem esse codigo no ar.
--
-- Idempotente: nao faz nada se o pipeline Geral ja tiver a etapa "Quente".
-- ============================================================

DO $$
DECLARE
  v_pipeline_id uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8'; -- Geral
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM crm_pipeline_stages
    WHERE pipeline_id = v_pipeline_id AND name = 'Quente'
  ) THEN
    -- Por nome, nao por posicao: se alguem ja mexeu na ordem, um UPDATE por
    -- position renomearia a etapa errada em silencio.
    UPDATE crm_pipeline_stages SET name = 'Leads',  color = '#64748b'
      WHERE pipeline_id = v_pipeline_id AND name = 'A contatar';
    UPDATE crm_pipeline_stages SET name = 'Quente', color = '#ef4444'
      WHERE pipeline_id = v_pipeline_id AND name = 'Em cadência';
    UPDATE crm_pipeline_stages SET name = 'Morno',  color = '#f59e0b'
      WHERE pipeline_id = v_pipeline_id AND name = 'Respondeu';
    UPDATE crm_pipeline_stages SET name = 'Frio',   color = '#3b82f6'
      WHERE pipeline_id = v_pipeline_id AND name = 'Qualificado';
  END IF;
END $$;

-- Confere o resultado (as 4 primeiras devem ser Leads/Quente/Morno/Frio).
SELECT s.position, s.name, count(d.id) AS negocios
FROM crm_pipeline_stages s
LEFT JOIN crm_deals d ON d.stage_id = s.id AND d.status = 'open'
WHERE s.pipeline_id = '44b978de-616a-4256-a4cd-40cd4ec8a4a8'
GROUP BY s.position, s.name
ORDER BY s.position;

-- Recarrega o cache de schema do PostgREST.
NOTIFY pgrst, 'reload schema';

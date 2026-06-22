-- ============================================================
-- cleanup_ficticios.sql
--
-- Remove os DADOS FICTICIOS / DE TESTE do CRM (hard-delete), mantendo:
--   - a ESTRUTURA: crm_pipelines, crm_pipeline_stages, crm_automations
--   - os LEADS REAIS (qualquer deal que NAO casa os marcadores abaixo)
--   - tudo fora do dominio de demo (team_members, os_*, agenda_events, ...)
--
-- O que conta como ficticio (marcadores):
--   1) Prefixo do "exemplo da semana": title LIKE '🧪%'
--      (crmDemoWeekService planta deals/atividades com esse prefixo)
--   2) Lista de titulos de demo conhecidos (DEMO_TITLES abaixo) — REVISE.
--   3) Atividades/contatos/empresas com o mesmo prefixo 🧪.
--   4) A ligacao de demo orfa com telefone fake +5511990000000.
--
-- Para cada deal ficticio, apaga tambem os dependentes (atividades, ligacoes,
-- mensagens, relatos diarios, historico de estagio, logs de automacao) e os
-- contatos/empresas vinculados A ELE — mas SO se nao restarem vinculados a
-- nenhum deal sobrevivente (guarda contra apagar a empresa de um cliente real
-- que compartilhe contato/empresa).
--
-- COMO USAR (Supabase -> SQL Editor):
--   1. Rode a PARTE 1 (PREVIEW) sozinha. Confira os numeros e a lista de
--      titulos. Se aparecer algum lead REAL na lista, ajuste DEMO_TITLES na
--      PARTE 2 (ou remova o titulo) antes de continuar.
--   2. Se estiver tudo certo, rode a PARTE 2 (DELETE). E transacional:
--      qualquer erro no meio faz ROLLBACK automatico.
--
-- AVISO: hard-delete nao tem volta. Faca um backup/snapshot antes se possivel.
-- ============================================================


-- ============================================================
-- PARTE 1 — PREVIEW (read-only). Rode isto PRIMEIRO.
-- ============================================================
WITH demo AS (
  SELECT id, title, value, contact_id, company_id, status
  FROM public.crm_deals
  WHERE title LIKE '🧪%'
     OR title = ANY (ARRAY[
          'Padaria Pão Quente',
          'Auto Peças Veloz',
          'Studio Bella Estética',
          'Mercado Bom Preço'
        ])
)
SELECT
  (SELECT count(*) FROM demo)                                              AS deals_ficticios,
  (SELECT count(*) FROM public.crm_deals)                                  AS deals_total,
  (SELECT count(*) FROM public.crm_deals) - (SELECT count(*) FROM demo)    AS deals_reais_que_ficam,
  (SELECT count(*) FROM public.crm_activities a  WHERE a.deal_id IN (SELECT id FROM demo)) AS atividades,
  (SELECT count(*) FROM public.crm_calls c       WHERE c.deal_id IN (SELECT id FROM demo)) AS ligacoes,
  (SELECT count(*) FROM public.crm_messages m     WHERE m.deal_id IN (SELECT id FROM demo)) AS mensagens,
  (SELECT count(*) FROM public.crm_deal_stage_history h WHERE h.deal_id IN (SELECT id FROM demo)) AS stage_history,
  (SELECT count(*) FROM public.crm_contacts  WHERE name LIKE '🧪%')        AS contatos_marcados_demo,
  (SELECT count(*) FROM public.crm_companies WHERE name LIKE '🧪%')        AS empresas_marcadas_demo;

-- Lista os deals que SERAO apagados (confira se nao ha nenhum real aqui):
SELECT title, status, value
FROM public.crm_deals
WHERE title LIKE '🧪%'
   OR title = ANY (ARRAY[
        'Padaria Pão Quente',
        'Auto Peças Veloz',
        'Studio Bella Estética',
        'Mercado Bom Preço'
      ])
ORDER BY title;


-- ============================================================
-- PARTE 2 — DELETE (transacional). Rode SO se a PARTE 1 estiver correta.
--
-- session_replication_role = replica: desliga os triggers nesta sessao.
-- Sem isso, o trigger de auditoria log_changes() colide PK em activity_logs
-- e aborta o DELETE (mesmo motivo do cleanup_demo_leads.sql). Para limpeza
-- de demo, nao logar essas exclusoes e o desejado.
-- ============================================================
BEGIN;

SET LOCAL session_replication_role = replica;

DO $$
DECLARE
  demo_titles TEXT[] := ARRAY[
    'Padaria Pão Quente',
    'Auto Peças Veloz',
    'Studio Bella Estética',
    'Mercado Bom Preço'
  ];
  d_ids   UUID[];
  c_ids   UUID[];
  co_ids  UUID[];
BEGIN
  -- 1) IDs dos deals ficticios + contatos/empresas vinculados a eles
  SELECT array_agg(id),
         array_remove(array_agg(contact_id), NULL),
         array_remove(array_agg(company_id), NULL)
    INTO d_ids, c_ids, co_ids
    FROM public.crm_deals
   WHERE title LIKE '🧪%'
      OR title = ANY (demo_titles);

  IF d_ids IS NOT NULL THEN
    -- 2) Dependentes dos deals ficticios (filhos primeiro)
    DELETE FROM public.crm_messages           WHERE deal_id = ANY (d_ids);

    BEGIN
      DELETE FROM public.crm_lead_daily_reports WHERE deal_id = ANY (d_ids);
    EXCEPTION WHEN undefined_table THEN NULL;  -- migration 050 nao aplicada
    END;

    BEGIN
      DELETE FROM public.crm_automation_logs    WHERE deal_id = ANY (d_ids);
    EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
    END;

    DELETE FROM public.crm_calls              WHERE deal_id = ANY (d_ids);
    DELETE FROM public.crm_activities         WHERE deal_id = ANY (d_ids);
    DELETE FROM public.crm_deal_stage_history WHERE deal_id = ANY (d_ids);

    -- 3) Os deals ficticios
    DELETE FROM public.crm_deals              WHERE id = ANY (d_ids);

    -- 4) Contatos/empresas que eram desses deals, SO se nao sobrar nenhum
    --    deal real apontando pra eles (guarda contra apagar dado real
    --    compartilhado).
    IF c_ids IS NOT NULL THEN
      DELETE FROM public.crm_contacts
       WHERE id = ANY (c_ids)
         AND id NOT IN (SELECT contact_id FROM public.crm_deals WHERE contact_id IS NOT NULL);
    END IF;

    IF co_ids IS NOT NULL THEN
      DELETE FROM public.crm_companies
       WHERE id = ANY (co_ids)
         AND id NOT IN (SELECT company_id FROM public.crm_deals WHERE company_id IS NOT NULL);
    END IF;
  END IF;

  -- 5) Sobras marcadas com 🧪 que nao estavam ligadas a deal
  DELETE FROM public.crm_activities WHERE title LIKE '🧪%';
  DELETE FROM public.crm_contacts   WHERE name  LIKE '🧪%';
  DELETE FROM public.crm_companies  WHERE name  LIKE '🧪%';

  -- 6) Ligacao de demo orfa (telefone fake, sem deal)
  DELETE FROM public.crm_calls
   WHERE phone_dialed = '+5511990000000' AND deal_id IS NULL;

  RAISE NOTICE 'Limpeza de ficticios concluida. Pipelines, automacoes e leads reais preservados.';
END $$;

-- Conferencia pos-limpeza: nao deve sobrar nada com 🧪
SELECT
  (SELECT count(*) FROM public.crm_deals      WHERE title LIKE '🧪%') AS deals_demo_restantes,
  (SELECT count(*) FROM public.crm_activities WHERE title LIKE '🧪%') AS ativ_demo_restantes,
  (SELECT count(*) FROM public.crm_deals)                              AS deals_reais_restantes,
  (SELECT count(*) FROM public.crm_pipelines)                          AS pipelines_preservadas,
  (SELECT count(*) FROM public.crm_automations)                        AS automacoes_preservadas;

COMMIT;

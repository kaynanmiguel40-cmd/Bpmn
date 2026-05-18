-- ============================================================
-- cleanup_crm.sql
--
-- LIMPEZA TOTAL DO CRM (hard-delete).
--
-- Apaga FISICAMENTE todas as linhas das tabelas crm_*. Reseta sequencias.
-- DEFENSIVO: pula qualquer tabela que nao exista no schema (zero erro
-- mesmo que o banco tenha apenas um subconjunto das tabelas listadas).
--
-- NAO MEXE EM:
--   - tabelas fora do dominio CRM (team_members, agenda_events, os_*, etc.)
--   - schemas (tabelas continuam existindo, so vazias)
--   - politicas RLS / triggers / indices
--
-- Rode no Supabase SQL Editor. Esta envolvido em transacao — se algo der
-- erro no meio, faz rollback automatico.
--
-- AVISO: Hard-delete nao tem volta. Se nao for backup, e definitivo.
-- ============================================================

BEGIN;

DO $$
DECLARE
  -- Ordem: filhas primeiro (CASCADE cuida das FKs mesmo assim, mas evita ruido)
  candidate_tables TEXT[] := ARRAY[
    'crm_calls',
    'crm_deal_stage_history',
    'crm_automation_logs',
    'crm_proposal_items',
    'crm_proposals',
    'crm_activities',
    'crm_paid_traffic',
    'crm_prospects',
    'crm_goals',
    'crm_automations',
    'crm_deals',
    'crm_pipeline_stages',
    'crm_pipelines',
    'crm_contacts',
    'crm_companies'
  ];
  existing_tables TEXT[] := ARRAY[]::TEXT[];
  t TEXT;
  joined TEXT;
BEGIN
  -- Filtra mantendo so as que existem no schema public
  FOREACH t IN ARRAY candidate_tables LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      existing_tables := array_append(existing_tables, 'public.' || t);
      RAISE NOTICE 'Vai truncar: %', t;
    ELSE
      RAISE NOTICE 'Pulando (nao existe): %', t;
    END IF;
  END LOOP;

  IF array_length(existing_tables, 1) IS NULL THEN
    RAISE NOTICE 'Nenhuma tabela CRM encontrada — nada a fazer.';
    RETURN;
  END IF;

  joined := array_to_string(existing_tables, ', ');
  EXECUTE 'TRUNCATE TABLE ' || joined || ' RESTART IDENTITY CASCADE';
  RAISE NOTICE 'TRUNCATE executado em % tabelas', array_length(existing_tables, 1);
END $$;

-- Conferencia pos-limpeza: linhas restantes em cada tabela CRM que existe
SELECT t AS tabela, (SELECT COUNT(*) FROM information_schema.tables i WHERE i.table_schema='public' AND i.table_name=t) AS existe,
       CASE WHEN to_regclass('public.' || t) IS NULL THEN NULL ELSE
         (SELECT n_live_tup FROM pg_stat_user_tables s WHERE s.schemaname='public' AND s.relname=t)
       END AS linhas_aprox
FROM unnest(ARRAY[
  'crm_calls','crm_deal_stage_history','crm_automation_logs','crm_proposal_items',
  'crm_proposals','crm_activities','crm_paid_traffic','crm_prospects','crm_goals',
  'crm_automations','crm_deals','crm_pipeline_stages','crm_pipelines','crm_contacts','crm_companies'
]) AS t
ORDER BY t;

COMMIT;

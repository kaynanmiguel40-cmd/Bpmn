-- =====================================================================
-- 022_fix_all_rls_policies.sql
--
-- Libera policies permissivas (SELECT/INSERT/UPDATE/DELETE) em TODAS as
-- tabelas do CRM e agenda_events, de uma vez. Resolve e previne erros
-- "new row violates row-level security policy" que estavam aparecendo ao
-- editar/excluir registros que foram criados via interface.
--
-- Padrao: USING (true) — single-tenant, qualquer usuario autenticado.
-- Idempotente: pode rodar varias vezes sem quebrar (DROP IF EXISTS).
-- =====================================================================

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'crm_contacts',
    'crm_companies',
    'crm_deals',
    'crm_pipelines',
    'crm_pipeline_stages',
    'crm_activities',
    'crm_proposals',
    'crm_prospects',
    'crm_goals',
    'crm_traffic_entries',
    'crm_automations',
    'crm_automation_logs',
    'crm_deal_stage_history',
    'agenda_events'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    -- So processa se a tabela existir (ignora silenciosamente as que nao existem)
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

      EXECUTE format('DROP POLICY IF EXISTS "%s_select" ON public.%I', tbl, tbl);
      EXECUTE format('DROP POLICY IF EXISTS "%s_insert" ON public.%I', tbl, tbl);
      EXECUTE format('DROP POLICY IF EXISTS "%s_update" ON public.%I', tbl, tbl);
      EXECUTE format('DROP POLICY IF EXISTS "%s_delete" ON public.%I', tbl, tbl);

      EXECUTE format('CREATE POLICY "%s_select" ON public.%I FOR SELECT USING (true)', tbl, tbl);
      EXECUTE format('CREATE POLICY "%s_insert" ON public.%I FOR INSERT WITH CHECK (true)', tbl, tbl);
      EXECUTE format('CREATE POLICY "%s_update" ON public.%I FOR UPDATE USING (true) WITH CHECK (true)', tbl, tbl);
      EXECUTE format('CREATE POLICY "%s_delete" ON public.%I FOR DELETE USING (true)', tbl, tbl);

      RAISE NOTICE 'Policies aplicadas em %', tbl;
    ELSE
      RAISE NOTICE 'Tabela % nao existe, pulando', tbl;
    END IF;
  END LOOP;
END
$$;

-- Diagnostico — lista todas as policies criadas acima:
-- SELECT tablename, policyname, cmd FROM pg_policies
-- WHERE tablename = ANY(ARRAY['crm_contacts','crm_companies','crm_deals','crm_pipelines',
--   'crm_pipeline_stages','crm_activities','crm_proposals','crm_prospects','crm_goals',
--   'crm_traffic_entries','crm_automations','crm_automation_logs','crm_deal_stage_history',
--   'agenda_events'])
-- ORDER BY tablename, cmd;

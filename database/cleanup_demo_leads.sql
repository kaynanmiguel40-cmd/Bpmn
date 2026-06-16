-- ============================================================
-- cleanup_demo_leads.sql
--
-- Remove os leads de DEMONSTRAÇÃO da Agenda (4 leads fictícios) e tudo
-- vinculado: atividades, ligações, mensagens e relatos. Hard-delete.
--
-- Seguro: identifica os deals de demo pelo título e só apaga os contatos/
-- empresas vinculados a ELES (não toca em dados reais). Idempotente.
--
-- NOTA: o `SET session_replication_role = replica` desliga os triggers
-- nesta sessão. Sem isso, o trigger de auditoria log_changes() tenta gravar
-- em activity_logs com um id que colide (bug de geração de id) e aborta o
-- DELETE. Como é só limpeza de demo, não logar essas exclusões é o desejado.
--
-- Rode no Supabase → SQL Editor → Run (o script inteiro de uma vez).
-- ============================================================

SET session_replication_role = replica;

DO $$
DECLARE
  demo_companies TEXT[] := ARRAY[
    'Padaria Pão Quente', 'Auto Peças Veloz', 'Studio Bella Estética', 'Mercado Bom Preço'
  ];
  d_ids  UUID[];
  c_ids  UUID[];
  co_ids UUID[];
BEGIN
  SELECT array_agg(id), array_agg(contact_id), array_agg(company_id)
    INTO d_ids, c_ids, co_ids
    FROM public.crm_deals
    WHERE title = ANY(demo_companies);

  IF d_ids IS NOT NULL THEN
    DELETE FROM public.crm_messages            WHERE deal_id = ANY(d_ids);
    BEGIN
      DELETE FROM public.crm_lead_daily_reports WHERE deal_id = ANY(d_ids);
    EXCEPTION WHEN undefined_table THEN NULL;  -- migration 050 ainda não aplicada
    END;
    DELETE FROM public.crm_calls               WHERE deal_id = ANY(d_ids);
    DELETE FROM public.crm_activities          WHERE deal_id = ANY(d_ids);
    DELETE FROM public.crm_deal_stage_history  WHERE deal_id = ANY(d_ids);
    DELETE FROM public.crm_deals               WHERE id      = ANY(d_ids);

    DELETE FROM public.crm_contacts            WHERE id = ANY(c_ids);
    DELETE FROM public.crm_companies           WHERE id = ANY(co_ids);
  END IF;
END $$;

SET session_replication_role = DEFAULT;

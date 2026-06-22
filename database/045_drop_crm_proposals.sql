-- ============================================================
-- 045_drop_crm_proposals.sql
--
-- Remove o modulo de Propostas do CRM Fyness.
-- A aba foi excluida da UI; estas tabelas nao sao mais usadas em codigo.
--
-- Rode no Supabase SQL Editor.
-- ============================================================

BEGIN;

-- Realtime: remover do publication antes de dropar a tabela
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.crm_proposals;
EXCEPTION WHEN undefined_table OR undefined_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.crm_proposal_items;
EXCEPTION WHEN undefined_table OR undefined_object THEN NULL; END $$;

-- Itens primeiro (FK pra proposals)
DROP TABLE IF EXISTS public.crm_proposal_items CASCADE;
DROP TABLE IF EXISTS public.crm_proposals       CASCADE;

COMMIT;

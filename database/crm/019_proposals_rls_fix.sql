-- =====================================================================
-- 019_proposals_rls_fix.sql
--
-- Ajuste de RLS (Row Level Security) em crm_proposals.
-- Bug: soft-delete (UPDATE set deleted_at) falhava com "new row violates
-- row-level security policy" porque nao havia policy de UPDATE na tabela.
--
-- Politicas permissivas — single-tenant. Qualquer usuario autenticado pode
-- ler/criar/atualizar/excluir propostas (mesmo padrao das demais tabelas CRM).
-- =====================================================================

ALTER TABLE public.crm_proposals ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem (idempotente)
DROP POLICY IF EXISTS "crm_proposals_select" ON public.crm_proposals;
DROP POLICY IF EXISTS "crm_proposals_insert" ON public.crm_proposals;
DROP POLICY IF EXISTS "crm_proposals_update" ON public.crm_proposals;
DROP POLICY IF EXISTS "crm_proposals_delete" ON public.crm_proposals;

CREATE POLICY "crm_proposals_select" ON public.crm_proposals
  FOR SELECT USING (true);

CREATE POLICY "crm_proposals_insert" ON public.crm_proposals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "crm_proposals_update" ON public.crm_proposals
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "crm_proposals_delete" ON public.crm_proposals
  FOR DELETE USING (true);

-- Diagnostico opcional — lista as policies apos a migration
-- SELECT policyname, cmd, permissive FROM pg_policies WHERE tablename = 'crm_proposals';

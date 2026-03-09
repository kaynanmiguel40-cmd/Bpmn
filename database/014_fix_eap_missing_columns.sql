-- ============================================================
-- Migration 014: Corrigir colunas faltantes em eap_tasks
--
-- Problemas corrigidos:
-- 1. estimated_hours nao existia (dados perdidos silenciosamente)
-- 2. attachments nao existia (anexos nunca salvos)
-- 3. os_order_id nao existia (vinculo EAP → OS perdido)
-- 4. start_date/end_date eram DATE (hora descartada) → TIMESTAMPTZ
-- ============================================================

-- 1. Adicionar coluna estimated_hours (horas estimadas)
DO $$ BEGIN
  ALTER TABLE public.eap_tasks ADD COLUMN estimated_hours NUMERIC DEFAULT NULL;
  RAISE NOTICE 'Coluna estimated_hours adicionada';
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'Coluna estimated_hours ja existe';
END $$;

-- 2. Adicionar coluna attachments (anexos como JSONB)
DO $$ BEGIN
  ALTER TABLE public.eap_tasks ADD COLUMN attachments JSONB DEFAULT '[]';
  RAISE NOTICE 'Coluna attachments adicionada';
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'Coluna attachments ja existe';
END $$;

-- 3. Adicionar coluna os_order_id (vinculo com OS)
DO $$ BEGIN
  ALTER TABLE public.eap_tasks ADD COLUMN os_order_id TEXT DEFAULT NULL;
  RAISE NOTICE 'Coluna os_order_id adicionada';
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'Coluna os_order_id ja existe';
END $$;

-- 4. Alterar start_date e end_date de DATE para TIMESTAMPTZ
--    (preserva valores existentes, adiciona suporte a hora)
DO $$ BEGIN
  ALTER TABLE public.eap_tasks ALTER COLUMN start_date TYPE TIMESTAMPTZ USING start_date::TIMESTAMPTZ;
  ALTER TABLE public.eap_tasks ALTER COLUMN end_date TYPE TIMESTAMPTZ USING end_date::TIMESTAMPTZ;
  RAISE NOTICE 'Colunas start_date e end_date convertidas para TIMESTAMPTZ';
EXCEPTION WHEN others THEN
  RAISE NOTICE 'start_date/end_date ja sao TIMESTAMPTZ ou erro: %', SQLERRM;
END $$;

-- 5. Indice para buscas por os_order_id
CREATE INDEX IF NOT EXISTS idx_eap_tasks_os_order ON public.eap_tasks(os_order_id);

-- ============================================================
-- FIM - Migration 014
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

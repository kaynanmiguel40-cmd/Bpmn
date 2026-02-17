-- ============================================================
-- FYNESS OS - Ponte EAP <-> Ordens de Servico
-- Migration 011
--
-- Vincula tarefas da EAP com Ordens de Servico existentes.
-- A EAP e a fonte de planejamento; a OS e a execucao.
-- ============================================================

-- 1. Adicionar campo de vinculo na eap_tasks
ALTER TABLE public.eap_tasks
  ADD COLUMN IF NOT EXISTS os_order_id TEXT REFERENCES public.os_orders(id) ON DELETE SET NULL;

-- 2. Indice para busca rapida
CREATE INDEX IF NOT EXISTS idx_eap_tasks_os_order ON public.eap_tasks(os_order_id);

-- ============================================================
-- FIM - Migration 011
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

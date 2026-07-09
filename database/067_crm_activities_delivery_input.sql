-- ============================================================
-- 067_crm_activities_delivery_input.sql
--
-- Separa o relato de entrega da tarefa em DOIS lados: o que o VENDEDOR fez/
-- disse (delivery_input) e o que o LEAD respondeu/reagiu (delivery_report,
-- ja existente desde 056 — vira o "output"). Cada tarefa continua com o seu
-- proprio par input/output.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_activities ADD COLUMN IF NOT EXISTS delivery_input TEXT;

COMMENT ON COLUMN public.crm_activities.delivery_input IS
  'O que o VENDEDOR fez/disse ao concluir a tarefa (input). Preenchido junto com delivery_report (output = o que o lead respondeu) no mesmo modal de conclusao.';

COMMENT ON COLUMN public.crm_activities.delivery_report IS
  'O que o LEAD respondeu/reagiu (output) ao concluir a tarefa. Par de delivery_input (input do vendedor). Preenchido ao concluir.';

-- ============================================================
-- 056_crm_activities_delivery_report.sql
--
-- Relatório de ENTREGA por TAREFA (não mais por lead/dia). Cada tarefa tem o
-- seu relato de entrega — atribuído ao lead (deal_id/contact_id) E à tarefa.
-- Outro dia / outra tarefa do mesmo lead = outro relatório de entrega.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_activities ADD COLUMN IF NOT EXISTS delivery_report TEXT;

COMMENT ON COLUMN public.crm_activities.delivery_report IS
  'Relatório de entrega da tarefa (o que foi feito). Preenchido ao concluir. Vira a "Entrega" da tarefa na O.S. comercial e agrupa por lead no relatório.';

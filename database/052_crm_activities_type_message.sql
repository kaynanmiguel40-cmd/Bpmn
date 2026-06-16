-- ============================================================
-- 052_crm_activities_type_message.sql
--
-- O CHECK de crm_activities.type não conhecia o tipo 'message' (Mensagem),
-- adicionado quando separamos Tarefa × Evento. INSERTs de atividade tipo
-- Mensagem batiam no constraint e caíam no fallback offline ("Salvo
-- localmente"). Recria o CHECK com todos os tipos atuais.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_activities
  DROP CONSTRAINT IF EXISTS crm_activities_type_check;

ALTER TABLE public.crm_activities
  ADD CONSTRAINT crm_activities_type_check
  CHECK (type IN ('call', 'email', 'message', 'meeting', 'task', 'lunch', 'visit', 'follow_up'));

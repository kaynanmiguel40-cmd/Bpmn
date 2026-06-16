-- ============================================================
-- 055_crm_activities_responsavel.sql
--
-- Atribuição por tarefa: quem é o RESPONSÁVEL por executar a atividade
-- (pode ser diferente de quem criou) + quem concluiu.
--
-- assigned_to      = id do responsável (auth user / team member). Sem FK de
--                    propósito (id pode vir de auth.users ou team_members).
-- assigned_to_name = nome do responsável (denormalizado, p/ exibir sem join).
-- completed_by     = quem marcou como concluída.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_activities ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE public.crm_activities ADD COLUMN IF NOT EXISTS assigned_to_name TEXT;
ALTER TABLE public.crm_activities ADD COLUMN IF NOT EXISTS completed_by UUID;

COMMENT ON COLUMN public.crm_activities.assigned_to IS
  'Responsável por executar a tarefa (pode diferir de created_by). Usado na atribuição por tarefa da O.S. comercial.';

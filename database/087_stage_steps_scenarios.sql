-- ============================================================
-- 087_stage_steps_scenarios.sql
--
-- Adiciona "cenarios" a cada passo do playbook: o que o cliente pode responder
-- e como reagir. Estrutura em vez de amontoar tudo no texto do script.
--
-- Formato (JSONB): [{ "when": "cliente diz X", "then": "voce faz/responde Y" }]
--
-- Idempotente: ADD COLUMN IF NOT EXISTS.
-- ============================================================

ALTER TABLE public.crm_stage_steps
  ADD COLUMN IF NOT EXISTS scenarios JSONB NOT NULL DEFAULT '[]'::jsonb;

NOTIFY pgrst, 'reload schema';

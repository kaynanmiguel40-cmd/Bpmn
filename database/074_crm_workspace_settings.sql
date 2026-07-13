-- ============================================================
-- 074_crm_workspace_settings.sql
--
-- Configuracao de workspace do CRM compartilhada entre todo mundo — ate aqui
-- a Meta de MRR do Dashboard vivia so no localStorage (crmWorkspaceSettings.js
-- no navegador). Quem definia numa maquina via mrrGoal=0 pra todo mundo em
-- qualquer outro device/usuario, e a barra de progresso simplesmente sumia.
--
-- Singleton (1 linha so, id sempre true) — mesmo padrao de estado
-- compartilhado ja usado em commercial_plan_actions (055).
--
-- Escopo desta migration: so a Meta de MRR. O plano do Funil (Planejamento)
-- continua no localStorage de proposito — e escrito a cada tecla digitada
-- (nome de etapa/contagem/taxa) e migrar isso sem debounce faria upsert no
-- Supabase por tecla; fica pra uma proxima leva com essa peca resolvida.
--
-- Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.crm_workspace_settings (
  id               boolean      PRIMARY KEY DEFAULT true,
  mrr_goal_monthly numeric      NOT NULL DEFAULT 0,
  updated_at       timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT crm_workspace_settings_singleton CHECK (id)
);

COMMENT ON TABLE public.crm_workspace_settings IS
  'Config de workspace do CRM compartilhada (1 linha so, id=true). Hoje so a Meta de MRR mensal do Dashboard.';

ALTER TABLE public.crm_workspace_settings ENABLE ROW LEVEL SECURITY;

-- RLS aberto (mesmo padrao do resto do app / commercial_plan_actions).
DO $$ BEGIN
  CREATE POLICY "crm_workspace_settings_all"
    ON public.crm_workspace_settings
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Garante a linha singleton (upsert de app depende dela existir).
INSERT INTO public.crm_workspace_settings (id) VALUES (true)
  ON CONFLICT (id) DO NOTHING;

-- Recarrega o cache de schema do PostgREST (pega a tabela nova na hora).
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- CRM_DEAL_STAGE_HISTORY
-- Registra cada transicao de estagio de um deal.
-- Usado para calcular a probabilidade aprendida com dados reais
-- em vez de inferencia por posicao.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.crm_deal_stage_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id       UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  from_stage_id UUID REFERENCES public.crm_pipeline_stages(id) ON DELETE SET NULL,
  to_stage_id   UUID NOT NULL REFERENCES public.crm_pipeline_stages(id) ON DELETE CASCADE,
  pipeline_id   UUID NOT NULL REFERENCES public.crm_pipelines(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_deal_stage_history ENABLE ROW LEVEL SECURITY;

-- RLS: mesma politica das outras tabelas CRM (equipe do usuario)
CREATE POLICY "crm_deal_stage_history_select"
  ON public.crm_deal_stage_history FOR SELECT
  USING (
    pipeline_id IN (
      SELECT id FROM public.crm_pipelines
      WHERE created_by IN (
        SELECT id FROM auth.users
        WHERE raw_user_meta_data->>'team_id' = (
          SELECT raw_user_meta_data->>'team_id'
          FROM auth.users WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "crm_deal_stage_history_insert"
  ON public.crm_deal_stage_history FOR INSERT
  WITH CHECK (true);

-- Indice para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_crm_deal_stage_history_deal
  ON public.crm_deal_stage_history(deal_id);

CREATE INDEX IF NOT EXISTS idx_crm_deal_stage_history_pipeline
  ON public.crm_deal_stage_history(pipeline_id);

CREATE INDEX IF NOT EXISTS idx_crm_deal_stage_history_to_stage
  ON public.crm_deal_stage_history(to_stage_id);

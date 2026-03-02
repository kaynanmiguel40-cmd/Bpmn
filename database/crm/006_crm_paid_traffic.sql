-- ============================================================
-- CRM_PAID_TRAFFIC
-- Registra investimentos em trafego pago por canal e periodo.
-- Permite visao completa do funil: investimento -> leads -> deals -> receita.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.crm_paid_traffic (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel           TEXT NOT NULL,
  pipeline_id       UUID REFERENCES public.crm_pipelines(id) ON DELETE SET NULL,
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  amount_spent      NUMERIC NOT NULL DEFAULT 0,
  impressions       INTEGER DEFAULT 0,
  clicks            INTEGER DEFAULT 0,
  leads_generated   INTEGER DEFAULT 0,
  conversions       INTEGER DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  notes             TEXT,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

-- Trigger para updated_at automatico
CREATE OR REPLACE FUNCTION update_crm_paid_traffic_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_crm_paid_traffic_updated_at
  BEFORE UPDATE ON public.crm_paid_traffic
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_paid_traffic_updated_at();

-- RLS (mesmo padrao das outras tabelas CRM)
ALTER TABLE public.crm_paid_traffic ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_paid_traffic_select"
  ON public.crm_paid_traffic FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "crm_paid_traffic_insert"
  ON public.crm_paid_traffic FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "crm_paid_traffic_update"
  ON public.crm_paid_traffic FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR public.is_manager_or_admin())
  WITH CHECK (auth.uid() = created_by OR public.is_manager_or_admin());

CREATE POLICY "crm_paid_traffic_delete"
  ON public.crm_paid_traffic FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by OR public.is_manager_or_admin());

-- Indices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_crm_paid_traffic_channel
  ON public.crm_paid_traffic(channel);

CREATE INDEX IF NOT EXISTS idx_crm_paid_traffic_pipeline
  ON public.crm_paid_traffic(pipeline_id);

CREATE INDEX IF NOT EXISTS idx_crm_paid_traffic_period
  ON public.crm_paid_traffic(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_crm_paid_traffic_deleted
  ON public.crm_paid_traffic(deleted_at);

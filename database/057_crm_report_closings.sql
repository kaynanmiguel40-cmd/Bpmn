-- ============================================================
-- 057_crm_report_closings.sql
--
-- Fechamento de relatório comercial por período. Quando o vendedor
-- (ou gestor) "fecha" o dia / a semana / o mês na página de Arquivos,
-- grava-se uma linha aqui: marca o período como entregue, com a data
-- do fechamento e um resumo (snapshot das métricas no momento).
--
-- O CONTEÚDO do relatório continua sendo montado na hora a partir da
-- agenda (crm_activities + crm_lead_daily_reports). Esta tabela só
-- registra o "marco" de fechamento (quando/quem) — não substitui os dados.
--
-- owner_id    = dono do relatório (auth_user_id do vendedor)
-- period      = 'daily' | 'weekly' | 'monthly'
-- period_key  = 'YYYY-MM-DD' (dia ou segunda da semana) | 'YYYY-MM' (mês)
--
-- Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.crm_report_closings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id    UUID NOT NULL,
  period      TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  period_key  TEXT NOT NULL,

  -- Snapshot resumido das métricas no momento do fechamento (reuniões, vendas, etc.)
  summary     JSONB,

  -- Audit
  closed_by   UUID,
  closed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Um fechamento por (dono, período, chave) — base do upsert
CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_report_closings
  ON public.crm_report_closings(owner_id, period, period_key);

-- Listar fechamentos de um dono
CREATE INDEX IF NOT EXISTS idx_crm_report_closings_owner
  ON public.crm_report_closings(owner_id, period);

-- Trigger updated_at (usa função existente do projeto; fallback se faltar)
DO $$ BEGIN
  CREATE TRIGGER trg_crm_report_closings_set_updated_at
    BEFORE UPDATE ON public.crm_report_closings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN undefined_function THEN
  CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $f$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $f$ LANGUAGE plpgsql;

  CREATE TRIGGER trg_crm_report_closings_set_updated_at
    BEFORE UPDATE ON public.crm_report_closings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
WHEN duplicate_object THEN NULL;
END $$;

-- RLS (alinhado com as demais tabelas crm_*)
ALTER TABLE public.crm_report_closings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "crm_report_closings_select" ON public.crm_report_closings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_report_closings_insert" ON public.crm_report_closings FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_report_closings_update" ON public.crm_report_closings FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_report_closings_delete" ON public.crm_report_closings FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Realtime (idempotente)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_report_closings;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON TABLE public.crm_report_closings IS
  'Marco de fechamento do relatório comercial (dia/semana/mês) por dono. Conteúdo segue dinâmico da agenda; aqui só registra quando/quem fechou + resumo.';

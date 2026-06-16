-- ============================================================
-- 050_crm_lead_daily_reports.sql
--
-- Relato diário por lead. O vendedor escreve, no painel da Agenda,
-- uma observação sobre cada lead que atendeu no dia ("o que rolou
-- com a Acme hoje"). No fim do dia, a página de Relatório Diário
-- junta todos os relatos + os dados do dia (ligações, mensagens,
-- atividades) num documento consolidado.
--
-- Um relato por (lead, dia, autor). lead_key = '<dealId>:<contactId>'
-- (um dos dois pode faltar) é preenchido pelo service e serve de
-- chave estável pro upsert, já que deal_id/contact_id são nullable.
--
-- Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.crm_lead_daily_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Chave estável do lead pro upsert: '<deal_id>:<contact_id>'
  lead_key      TEXT NOT NULL,
  deal_id       UUID REFERENCES public.crm_deals(id)    ON DELETE CASCADE,
  contact_id    UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,

  -- Dia do relato (data local do vendedor) + conteúdo escrito
  report_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  content       TEXT NOT NULL DEFAULT '',

  -- Audit
  created_by    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Um relato por lead/dia/autor (chave do upsert)
CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_lead_daily_reports
  ON public.crm_lead_daily_reports(lead_key, report_date, created_by);

-- Busca da página de relatório: "relatos de tal dia (deste autor)"
CREATE INDEX IF NOT EXISTS idx_crm_lead_daily_reports_date
  ON public.crm_lead_daily_reports(report_date, created_by);

-- Trigger updated_at (usa função existente do projeto; fallback se faltar)
DO $$ BEGIN
  CREATE TRIGGER trg_crm_lead_daily_reports_set_updated_at
    BEFORE UPDATE ON public.crm_lead_daily_reports
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN undefined_function THEN
  CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $f$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $f$ LANGUAGE plpgsql;

  CREATE TRIGGER trg_crm_lead_daily_reports_set_updated_at
    BEFORE UPDATE ON public.crm_lead_daily_reports
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
WHEN duplicate_object THEN NULL;
END $$;

-- RLS (alinhado com as demais tabelas crm_*)
ALTER TABLE public.crm_lead_daily_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "crm_lead_daily_reports_select" ON public.crm_lead_daily_reports FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_lead_daily_reports_insert" ON public.crm_lead_daily_reports FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_lead_daily_reports_update" ON public.crm_lead_daily_reports FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_lead_daily_reports_delete" ON public.crm_lead_daily_reports FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Realtime (idempotente)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_lead_daily_reports;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON TABLE public.crm_lead_daily_reports IS
  'Relato diário escrito pelo vendedor sobre cada lead atendido. Consolidado na página de Relatório Diário.';
COMMENT ON COLUMN public.crm_lead_daily_reports.lead_key IS
  'Chave estável do lead: ''<deal_id>:<contact_id>''. Preenchida pelo service; base do upsert (deal_id/contact_id são nullable).';

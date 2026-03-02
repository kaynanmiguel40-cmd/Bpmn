-- ============================================================
-- FYNESS CRM - TABELAS DO MÓDULO CRM
-- Execute este script no SQL Editor do Supabase
-- Cria todas as tabelas prefixadas com "crm_" para não conflitar
-- ============================================================

-- ============================================================
-- FUNÇÃO: auto updated_at para tabelas CRM
-- ============================================================
CREATE OR REPLACE FUNCTION public.crm_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNÇÃO: auditoria automática (CREATE OR REPLACE — seguro)
-- Reutilizada pelo sistema principal e pelo CRM
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_text TEXT;
  entity_title TEXT;
  log_id TEXT;
  rec_jsonb JSONB;
BEGIN
  log_id := 'log_' || extract(epoch from now())::bigint || '_' || floor(random() * 1000)::int;

  IF TG_OP = 'UPDATE' THEN
    action_text := 'updated';
    rec_jsonb := to_jsonb(NEW);
    entity_title := COALESCE(rec_jsonb->>'title', rec_jsonb->>'name', rec_jsonb->>'label', '');

    INSERT INTO public.activity_logs (id, user_name, action, entity_type, entity_id, entity_title, old_values, new_values, created_at)
    VALUES (
      log_id,
      'Sistema (trigger)',
      action_text,
      TG_TABLE_NAME,
      NEW.id,
      entity_title,
      to_jsonb(OLD),
      rec_jsonb,
      NOW()
    );
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    action_text := 'deleted';
    rec_jsonb := to_jsonb(OLD);
    entity_title := COALESCE(rec_jsonb->>'title', rec_jsonb->>'name', rec_jsonb->>'label', '');

    INSERT INTO public.activity_logs (id, user_name, action, entity_type, entity_id, entity_title, old_values, new_values, created_at)
    VALUES (
      log_id,
      'Sistema (trigger)',
      action_text,
      TG_TABLE_NAME,
      OLD.id,
      entity_title,
      rec_jsonb,
      NULL,
      NOW()
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 1. CRM_COMPANIES (empresas / contas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  cnpj        TEXT,
  segment     TEXT,
  size        TEXT,
  revenue     NUMERIC,
  phone       TEXT,
  email       TEXT,
  website     TEXT,
  address     TEXT,
  city        TEXT,
  state       TEXT,
  notes       TEXT,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_crm_companies_updated_at ON public.crm_companies;
CREATE TRIGGER trg_crm_companies_updated_at
  BEFORE UPDATE ON public.crm_companies
  FOR EACH ROW EXECUTE FUNCTION public.crm_set_updated_at();

-- ============================================================
-- 2. CRM_CONTACTS (contatos / leads)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  position     TEXT,
  avatar_color TEXT,
  status       TEXT DEFAULT 'lead'
    CHECK (status IN ('lead', 'active', 'inactive', 'customer')),
  company_id   UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  tags         JSONB DEFAULT '[]'::jsonb,
  address      TEXT,
  city         TEXT,
  state        TEXT,
  notes        TEXT,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_crm_contacts_updated_at ON public.crm_contacts;
CREATE TRIGGER trg_crm_contacts_updated_at
  BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION public.crm_set_updated_at();

-- ============================================================
-- 3. CRM_PIPELINES (funis de venda)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_pipelines (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  is_default  BOOLEAN DEFAULT FALSE,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_pipelines ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_crm_pipelines_updated_at ON public.crm_pipelines;
CREATE TRIGGER trg_crm_pipelines_updated_at
  BEFORE UPDATE ON public.crm_pipelines
  FOR EACH ROW EXECUTE FUNCTION public.crm_set_updated_at();

-- ============================================================
-- 4. CRM_PIPELINE_STAGES (etapas do funil)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_pipeline_stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES public.crm_pipelines(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  position    INTEGER NOT NULL,
  color       TEXT DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_pipeline_stages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. CRM_DEALS (negócios / oportunidades)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_deals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT NOT NULL,
  value               NUMERIC DEFAULT 0,
  probability         INTEGER DEFAULT 50
    CHECK (probability >= 0 AND probability <= 100),
  contact_id          UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  company_id          UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  pipeline_id         UUID REFERENCES public.crm_pipelines(id) ON DELETE SET NULL,
  stage_id            UUID REFERENCES public.crm_pipeline_stages(id) ON DELETE SET NULL,
  expected_close_date TIMESTAMPTZ,
  closed_at           TIMESTAMPTZ,
  status              TEXT DEFAULT 'open'
    CHECK (status IN ('open', 'won', 'lost')),
  lost_reason         TEXT,
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_crm_deals_updated_at ON public.crm_deals;
CREATE TRIGGER trg_crm_deals_updated_at
  BEFORE UPDATE ON public.crm_deals
  FOR EACH ROW EXECUTE FUNCTION public.crm_set_updated_at();

-- ============================================================
-- 6. CRM_ACTIVITIES (atividades / tarefas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  type         TEXT NOT NULL
    CHECK (type IN ('call', 'email', 'meeting', 'task', 'lunch', 'visit')),
  contact_id   UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  deal_id      UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  start_date   TIMESTAMPTZ NOT NULL,
  end_date     TIMESTAMPTZ,
  completed    BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_crm_activities_updated_at ON public.crm_activities;
CREATE TRIGGER trg_crm_activities_updated_at
  BEFORE UPDATE ON public.crm_activities
  FOR EACH ROW EXECUTE FUNCTION public.crm_set_updated_at();

-- ============================================================
-- 7. CRM_PROPOSALS (propostas comerciais)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_proposals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id         UUID REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  proposal_number SERIAL,
  status          TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected')),
  notes           TEXT,
  terms           TEXT,
  total_value     NUMERIC DEFAULT 0,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE public.crm_proposals ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_crm_proposals_updated_at ON public.crm_proposals;
CREATE TRIGGER trg_crm_proposals_updated_at
  BEFORE UPDATE ON public.crm_proposals
  FOR EACH ROW EXECUTE FUNCTION public.crm_set_updated_at();

-- ============================================================
-- 8. CRM_PROPOSAL_ITEMS (itens das propostas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_proposal_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id      UUID NOT NULL REFERENCES public.crm_proposals(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  quantity         NUMERIC DEFAULT 1,
  unit_price       NUMERIC DEFAULT 0,
  discount_percent NUMERIC DEFAULT 0,
  subtotal         NUMERIC DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_proposal_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. CRM_SETTINGS (configurações do CRM por usuário)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) UNIQUE,
  company_name    TEXT,
  company_phone   TEXT,
  company_email   TEXT,
  company_address TEXT,
  company_city    TEXT,
  company_state   TEXT,
  company_logo_url TEXT,
  accent_color    TEXT DEFAULT '#6366f1',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_settings ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_crm_settings_updated_at ON public.crm_settings;
CREATE TRIGGER trg_crm_settings_updated_at
  BEFORE UPDATE ON public.crm_settings
  FOR EACH ROW EXECUTE FUNCTION public.crm_set_updated_at();

-- ============================================================
-- CONSTRAINTS adicionais: tags deve ser array JSON
-- ============================================================
DO $$ BEGIN
  ALTER TABLE public.crm_contacts
    ADD CONSTRAINT chk_crm_contacts_tags_array
    CHECK (jsonb_typeof(tags) = 'array');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- TRIGGERS DE AUDITORIA (reutiliza log_changes existente)
-- ============================================================
DROP TRIGGER IF EXISTS audit_crm_companies ON public.crm_companies;
CREATE TRIGGER audit_crm_companies
  AFTER UPDATE OR DELETE ON public.crm_companies
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

DROP TRIGGER IF EXISTS audit_crm_contacts ON public.crm_contacts;
CREATE TRIGGER audit_crm_contacts
  AFTER UPDATE OR DELETE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

DROP TRIGGER IF EXISTS audit_crm_deals ON public.crm_deals;
CREATE TRIGGER audit_crm_deals
  AFTER UPDATE OR DELETE ON public.crm_deals
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

DROP TRIGGER IF EXISTS audit_crm_activities ON public.crm_activities;
CREATE TRIGGER audit_crm_activities
  AFTER UPDATE OR DELETE ON public.crm_activities
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

DROP TRIGGER IF EXISTS audit_crm_proposals ON public.crm_proposals;
CREATE TRIGGER audit_crm_proposals
  AFTER UPDATE OR DELETE ON public.crm_proposals
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- ============================================================
-- FIM - 9 tabelas CRM criadas
-- ============================================================

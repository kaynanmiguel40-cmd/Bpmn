-- ============================================================
-- FYNESS CRM - INDEXES PARA PERFORMANCE
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- ============================================================
-- CRM_COMPANIES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_crm_companies_name
  ON public.crm_companies(name);

CREATE INDEX IF NOT EXISTS idx_crm_companies_cnpj
  ON public.crm_companies(cnpj);

CREATE INDEX IF NOT EXISTS idx_crm_companies_segment
  ON public.crm_companies(segment);

CREATE INDEX IF NOT EXISTS idx_crm_companies_created_by
  ON public.crm_companies(created_by);

CREATE INDEX IF NOT EXISTS idx_crm_companies_deleted_at
  ON public.crm_companies(deleted_at)
  WHERE deleted_at IS NULL;

-- ============================================================
-- CRM_CONTACTS
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_crm_contacts_name
  ON public.crm_contacts(name);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_email
  ON public.crm_contacts(email);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_company_id
  ON public.crm_contacts(company_id);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_status
  ON public.crm_contacts(status);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_created_by
  ON public.crm_contacts(created_by);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_deleted_at
  ON public.crm_contacts(deleted_at)
  WHERE deleted_at IS NULL;

-- ============================================================
-- CRM_PIPELINES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_crm_pipelines_is_default
  ON public.crm_pipelines(is_default)
  WHERE is_default = TRUE;

-- ============================================================
-- CRM_PIPELINE_STAGES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stages_pipeline_id
  ON public.crm_pipeline_stages(pipeline_id);

CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stages_position
  ON public.crm_pipeline_stages(pipeline_id, position);

-- ============================================================
-- CRM_DEALS
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_crm_deals_pipeline_id
  ON public.crm_deals(pipeline_id);

CREATE INDEX IF NOT EXISTS idx_crm_deals_stage_id
  ON public.crm_deals(stage_id);

CREATE INDEX IF NOT EXISTS idx_crm_deals_contact_id
  ON public.crm_deals(contact_id);

CREATE INDEX IF NOT EXISTS idx_crm_deals_company_id
  ON public.crm_deals(company_id);

CREATE INDEX IF NOT EXISTS idx_crm_deals_status
  ON public.crm_deals(status);

CREATE INDEX IF NOT EXISTS idx_crm_deals_created_by
  ON public.crm_deals(created_by);

CREATE INDEX IF NOT EXISTS idx_crm_deals_deleted_at
  ON public.crm_deals(deleted_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_crm_deals_expected_close
  ON public.crm_deals(expected_close_date);

-- ============================================================
-- CRM_ACTIVITIES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_crm_activities_contact_id
  ON public.crm_activities(contact_id);

CREATE INDEX IF NOT EXISTS idx_crm_activities_deal_id
  ON public.crm_activities(deal_id);

CREATE INDEX IF NOT EXISTS idx_crm_activities_type
  ON public.crm_activities(type);

CREATE INDEX IF NOT EXISTS idx_crm_activities_completed
  ON public.crm_activities(completed);

CREATE INDEX IF NOT EXISTS idx_crm_activities_start_date
  ON public.crm_activities(start_date);

CREATE INDEX IF NOT EXISTS idx_crm_activities_created_by
  ON public.crm_activities(created_by);

CREATE INDEX IF NOT EXISTS idx_crm_activities_deleted_at
  ON public.crm_activities(deleted_at)
  WHERE deleted_at IS NULL;

-- Índice composto útil: atividades pendentes por data
CREATE INDEX IF NOT EXISTS idx_crm_activities_pending_by_date
  ON public.crm_activities(start_date)
  WHERE completed = FALSE AND deleted_at IS NULL;

-- ============================================================
-- CRM_PROPOSALS
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_crm_proposals_deal_id
  ON public.crm_proposals(deal_id);

CREATE INDEX IF NOT EXISTS idx_crm_proposals_status
  ON public.crm_proposals(status);

CREATE INDEX IF NOT EXISTS idx_crm_proposals_created_by
  ON public.crm_proposals(created_by);

CREATE INDEX IF NOT EXISTS idx_crm_proposals_deleted_at
  ON public.crm_proposals(deleted_at)
  WHERE deleted_at IS NULL;

-- ============================================================
-- CRM_PROPOSAL_ITEMS
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_crm_proposal_items_proposal_id
  ON public.crm_proposal_items(proposal_id);

-- ============================================================
-- CRM_SETTINGS
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_crm_settings_user_id
  ON public.crm_settings(user_id);

-- ============================================================
-- FIM - Indexes CRM criados
-- ============================================================

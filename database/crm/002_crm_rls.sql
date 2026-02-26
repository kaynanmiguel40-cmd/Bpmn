-- ============================================================
-- FYNESS CRM - ROW LEVEL SECURITY POLICIES
-- Execute este script no SQL Editor do Supabase
-- Reutiliza a função public.is_manager_or_admin() existente
--
-- Regras:
--   SELECT: todos autenticados (equipe vê tudo)
--   INSERT: auth.uid() = created_by
--   UPDATE: auth.uid() = created_by OU admin/manager
--   DELETE: auth.uid() = created_by OU admin/manager
-- ============================================================

-- ============================================================
-- 1. CRM_COMPANIES
-- ============================================================
DROP POLICY IF EXISTS "crm_companies_select" ON public.crm_companies;
DROP POLICY IF EXISTS "crm_companies_insert" ON public.crm_companies;
DROP POLICY IF EXISTS "crm_companies_update" ON public.crm_companies;
DROP POLICY IF EXISTS "crm_companies_delete" ON public.crm_companies;

CREATE POLICY "crm_companies_select"
  ON public.crm_companies FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "crm_companies_insert"
  ON public.crm_companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "crm_companies_update"
  ON public.crm_companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR public.is_manager_or_admin())
  WITH CHECK (auth.uid() = created_by OR public.is_manager_or_admin());

CREATE POLICY "crm_companies_delete"
  ON public.crm_companies FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by OR public.is_manager_or_admin());

-- ============================================================
-- 2. CRM_CONTACTS
-- ============================================================
DROP POLICY IF EXISTS "crm_contacts_select" ON public.crm_contacts;
DROP POLICY IF EXISTS "crm_contacts_insert" ON public.crm_contacts;
DROP POLICY IF EXISTS "crm_contacts_update" ON public.crm_contacts;
DROP POLICY IF EXISTS "crm_contacts_delete" ON public.crm_contacts;

CREATE POLICY "crm_contacts_select"
  ON public.crm_contacts FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "crm_contacts_insert"
  ON public.crm_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "crm_contacts_update"
  ON public.crm_contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR public.is_manager_or_admin())
  WITH CHECK (auth.uid() = created_by OR public.is_manager_or_admin());

CREATE POLICY "crm_contacts_delete"
  ON public.crm_contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by OR public.is_manager_or_admin());

-- ============================================================
-- 3. CRM_PIPELINES
-- ============================================================
DROP POLICY IF EXISTS "crm_pipelines_select" ON public.crm_pipelines;
DROP POLICY IF EXISTS "crm_pipelines_insert" ON public.crm_pipelines;
DROP POLICY IF EXISTS "crm_pipelines_update" ON public.crm_pipelines;
DROP POLICY IF EXISTS "crm_pipelines_delete" ON public.crm_pipelines;

CREATE POLICY "crm_pipelines_select"
  ON public.crm_pipelines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "crm_pipelines_insert"
  ON public.crm_pipelines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "crm_pipelines_update"
  ON public.crm_pipelines FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR public.is_manager_or_admin())
  WITH CHECK (auth.uid() = created_by OR public.is_manager_or_admin());

CREATE POLICY "crm_pipelines_delete"
  ON public.crm_pipelines FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by OR public.is_manager_or_admin());

-- ============================================================
-- 4. CRM_PIPELINE_STAGES
-- ============================================================
DROP POLICY IF EXISTS "crm_pipeline_stages_select" ON public.crm_pipeline_stages;
DROP POLICY IF EXISTS "crm_pipeline_stages_insert" ON public.crm_pipeline_stages;
DROP POLICY IF EXISTS "crm_pipeline_stages_update" ON public.crm_pipeline_stages;
DROP POLICY IF EXISTS "crm_pipeline_stages_delete" ON public.crm_pipeline_stages;

CREATE POLICY "crm_pipeline_stages_select"
  ON public.crm_pipeline_stages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "crm_pipeline_stages_insert"
  ON public.crm_pipeline_stages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.crm_pipelines p
      WHERE p.id = pipeline_id
      AND (p.created_by = auth.uid() OR public.is_manager_or_admin())
    )
  );

CREATE POLICY "crm_pipeline_stages_update"
  ON public.crm_pipeline_stages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_pipelines p
      WHERE p.id = pipeline_id
      AND (p.created_by = auth.uid() OR public.is_manager_or_admin())
    )
  );

CREATE POLICY "crm_pipeline_stages_delete"
  ON public.crm_pipeline_stages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_pipelines p
      WHERE p.id = pipeline_id
      AND (p.created_by = auth.uid() OR public.is_manager_or_admin())
    )
  );

-- ============================================================
-- 5. CRM_DEALS
-- ============================================================
DROP POLICY IF EXISTS "crm_deals_select" ON public.crm_deals;
DROP POLICY IF EXISTS "crm_deals_insert" ON public.crm_deals;
DROP POLICY IF EXISTS "crm_deals_update" ON public.crm_deals;
DROP POLICY IF EXISTS "crm_deals_delete" ON public.crm_deals;

CREATE POLICY "crm_deals_select"
  ON public.crm_deals FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "crm_deals_insert"
  ON public.crm_deals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "crm_deals_update"
  ON public.crm_deals FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR public.is_manager_or_admin())
  WITH CHECK (auth.uid() = created_by OR public.is_manager_or_admin());

CREATE POLICY "crm_deals_delete"
  ON public.crm_deals FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by OR public.is_manager_or_admin());

-- ============================================================
-- 6. CRM_ACTIVITIES
-- ============================================================
DROP POLICY IF EXISTS "crm_activities_select" ON public.crm_activities;
DROP POLICY IF EXISTS "crm_activities_insert" ON public.crm_activities;
DROP POLICY IF EXISTS "crm_activities_update" ON public.crm_activities;
DROP POLICY IF EXISTS "crm_activities_delete" ON public.crm_activities;

CREATE POLICY "crm_activities_select"
  ON public.crm_activities FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "crm_activities_insert"
  ON public.crm_activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "crm_activities_update"
  ON public.crm_activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR public.is_manager_or_admin())
  WITH CHECK (auth.uid() = created_by OR public.is_manager_or_admin());

CREATE POLICY "crm_activities_delete"
  ON public.crm_activities FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by OR public.is_manager_or_admin());

-- ============================================================
-- 7. CRM_PROPOSALS
-- ============================================================
DROP POLICY IF EXISTS "crm_proposals_select" ON public.crm_proposals;
DROP POLICY IF EXISTS "crm_proposals_insert" ON public.crm_proposals;
DROP POLICY IF EXISTS "crm_proposals_update" ON public.crm_proposals;
DROP POLICY IF EXISTS "crm_proposals_delete" ON public.crm_proposals;

CREATE POLICY "crm_proposals_select"
  ON public.crm_proposals FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "crm_proposals_insert"
  ON public.crm_proposals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "crm_proposals_update"
  ON public.crm_proposals FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR public.is_manager_or_admin())
  WITH CHECK (auth.uid() = created_by OR public.is_manager_or_admin());

CREATE POLICY "crm_proposals_delete"
  ON public.crm_proposals FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by OR public.is_manager_or_admin());

-- ============================================================
-- 8. CRM_PROPOSAL_ITEMS
-- ============================================================
DROP POLICY IF EXISTS "crm_proposal_items_select" ON public.crm_proposal_items;
DROP POLICY IF EXISTS "crm_proposal_items_insert" ON public.crm_proposal_items;
DROP POLICY IF EXISTS "crm_proposal_items_update" ON public.crm_proposal_items;
DROP POLICY IF EXISTS "crm_proposal_items_delete" ON public.crm_proposal_items;

CREATE POLICY "crm_proposal_items_select"
  ON public.crm_proposal_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_proposals p
      WHERE p.id = proposal_id AND p.deleted_at IS NULL
    )
  );

CREATE POLICY "crm_proposal_items_insert"
  ON public.crm_proposal_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.crm_proposals p
      WHERE p.id = proposal_id
      AND (p.created_by = auth.uid() OR public.is_manager_or_admin())
    )
  );

CREATE POLICY "crm_proposal_items_update"
  ON public.crm_proposal_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_proposals p
      WHERE p.id = proposal_id
      AND (p.created_by = auth.uid() OR public.is_manager_or_admin())
    )
  );

CREATE POLICY "crm_proposal_items_delete"
  ON public.crm_proposal_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_proposals p
      WHERE p.id = proposal_id
      AND (p.created_by = auth.uid() OR public.is_manager_or_admin())
    )
  );

-- ============================================================
-- 9. CRM_SETTINGS
-- ============================================================
DROP POLICY IF EXISTS "crm_settings_select" ON public.crm_settings;
DROP POLICY IF EXISTS "crm_settings_insert" ON public.crm_settings;
DROP POLICY IF EXISTS "crm_settings_update" ON public.crm_settings;
DROP POLICY IF EXISTS "crm_settings_delete" ON public.crm_settings;

CREATE POLICY "crm_settings_select"
  ON public.crm_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_manager_or_admin());

CREATE POLICY "crm_settings_insert"
  ON public.crm_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "crm_settings_update"
  ON public.crm_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "crm_settings_delete"
  ON public.crm_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_manager_or_admin());

-- ============================================================
-- FIM - RLS Policies aplicadas em todas as 9 tabelas CRM
-- ============================================================

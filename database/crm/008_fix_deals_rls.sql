-- ============================================================
-- 008: FIX RLS crm_deals — permitir UPDATE por qualquer membro
-- ============================================================
-- Problema: a policy de UPDATE exigia auth.uid() = created_by,
-- o que impede mover deals criados por outro usuario ou seedados.
-- Em um CRM de equipe, qualquer membro autenticado deve poder
-- mover deals entre estagios, marcar como ganho/perdido, etc.
-- ============================================================

-- UPDATE: qualquer autenticado pode atualizar deals
DROP POLICY IF EXISTS "crm_deals_update" ON public.crm_deals;
CREATE POLICY "crm_deals_update"
  ON public.crm_deals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: manter restritivo (so criador ou admin)
-- (nao precisa mexer, ja esta correto)

-- ==========================================================
-- 042_org_sector_members.sql
--
-- Permite que uma pessoa atue em multiplos setores (many-to-many).
--
-- Modelo:
--   - team_members.org_sector_id continua sendo o setor PRIMARIO
--     (a "casa" da pessoa, onde ela aparece com card cheio)
--   - org_sector_members lista os setores ADICIONAIS onde a pessoa
--     tambem atua (card aparece com borda tracejada)
--
-- Caso de uso real: vendedor pode atuar em Comercial e CS sem duplicar
-- o cadastro nem perder a referencia de gestor.
--
-- Idempotente.
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.org_sector_members (
  sector_id TEXT NOT NULL REFERENCES public.org_sectors(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (sector_id, member_id)
);

ALTER TABLE public.org_sector_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "org_sector_members_select" ON public.org_sector_members FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "org_sector_members_insert" ON public.org_sector_members FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "org_sector_members_update" ON public.org_sector_members FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "org_sector_members_delete" ON public.org_sector_members FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_osm_sector ON public.org_sector_members(sector_id);
CREATE INDEX IF NOT EXISTS idx_osm_member ON public.org_sector_members(member_id);

COMMENT ON TABLE public.org_sector_members IS
  'Setores adicionais (alem do primario em team_members.org_sector_id) onde a pessoa atua.';
COMMENT ON COLUMN public.org_sector_members.sector_id IS
  'Setor onde a pessoa atua como "secundario" — aparece com card tracejado.';

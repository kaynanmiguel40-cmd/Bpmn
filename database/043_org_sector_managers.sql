-- ==========================================================
-- 043_org_sector_managers.sql
--
-- Permite multiplos gestores por setor (co-liderança).
--
-- Substitui (logicamente) org_sectors.manager_id por uma relação
-- many-to-many. A coluna org_sectors.manager_id permanece no schema
-- por backward compat, mas a UI/service passam a usar esta tabela.
--
-- Idempotente. Inclui backfill dos managers atuais.
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.org_sector_managers (
  sector_id TEXT NOT NULL REFERENCES public.org_sectors(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (sector_id, member_id)
);

ALTER TABLE public.org_sector_managers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "org_sector_managers_select" ON public.org_sector_managers FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "org_sector_managers_insert" ON public.org_sector_managers FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "org_sector_managers_update" ON public.org_sector_managers FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "org_sector_managers_delete" ON public.org_sector_managers FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_osmg_sector ON public.org_sector_managers(sector_id);
CREATE INDEX IF NOT EXISTS idx_osmg_member ON public.org_sector_managers(member_id);

COMMENT ON TABLE public.org_sector_managers IS
  'Co-gestores de cada setor (substitui org_sectors.manager_id).';
COMMENT ON COLUMN public.org_sector_managers.position IS
  'Ordem de exibicao (0 = primeiro listado).';

-- Backfill: migra org_sectors.manager_id existente pra esta tabela
INSERT INTO public.org_sector_managers (sector_id, member_id, position)
SELECT id, manager_id, 0
FROM public.org_sectors
WHERE manager_id IS NOT NULL
ON CONFLICT (sector_id, member_id) DO NOTHING;

-- ==========================================================
-- 041_org_structure.sql
--
-- Estrutura organizacional da empresa (organograma).
--
-- Conceito distinto de os_sectors (que agrupa projetos de O.S.).
-- Aqui modelamos setores corporativos (Marketing, RH, etc.) com:
--   - gestor responsavel pelo setor (manager_id)
--   - membros alocados ao setor (team_members.org_sector_id)
--   - hierarquia interna dentro do setor (team_members.manager_id)
--
-- Idempotente.
-- ==========================================================

-- ============================================================
-- 1. Tabela org_sectors
-- ============================================================
CREATE TABLE IF NOT EXISTS public.org_sectors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  manager_id TEXT REFERENCES public.team_members(id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.org_sectors ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "org_sectors_select" ON public.org_sectors FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "org_sectors_insert" ON public.org_sectors FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "org_sectors_update" ON public.org_sectors FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "org_sectors_delete" ON public.org_sectors FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_org_sectors_position ON public.org_sectors(position);

COMMENT ON TABLE public.org_sectors IS
  'Setores corporativos do organograma (Marketing, RH, etc). Distinto de os_sectors.';
COMMENT ON COLUMN public.org_sectors.manager_id IS
  'Gestor responsavel pelo setor. NULL = sem gestor definido.';
COMMENT ON COLUMN public.org_sectors.position IS
  'Ordem de exibicao na arvore (menor primeiro).';

-- ============================================================
-- 2. Colunas em team_members
-- ============================================================
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS org_sector_id TEXT REFERENCES public.org_sectors(id) ON DELETE SET NULL;

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS manager_id TEXT REFERENCES public.team_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_team_members_org_sector_id
  ON public.team_members(org_sector_id) WHERE org_sector_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_team_members_manager_id
  ON public.team_members(manager_id) WHERE manager_id IS NOT NULL;

COMMENT ON COLUMN public.team_members.org_sector_id IS
  'Setor organizacional ao qual o membro pertence. NULL = raiz da empresa (ex: CEO).';
COMMENT ON COLUMN public.team_members.manager_id IS
  'Chefe direto dentro do organograma. NULL = sem chefe direto.';

-- ============================================================
-- 3. Seed dos 6 setores iniciais
-- ============================================================
INSERT INTO public.org_sectors (id, name, color, position) VALUES
  ('org_marketing', 'Marketing',  '#ec4899', 1),
  ('org_produto',   'Produto',    '#8b5cf6', 2),
  ('org_comercial', 'Comercial',  '#22c55e', 3),
  ('org_cs',        'CS',         '#06b6d4', 4),
  ('org_financeiro','Financeiro', '#f59e0b', 5),
  ('org_rh',        'RH',         '#ef4444', 6)
ON CONFLICT (id) DO NOTHING;

-- 026_eap_folders.sql
-- Adiciona nivel de "Pasta/Projeto" acima das EAPs individuais.
-- Cada pasta agrupa multiplas EAPs (eap_projects).

-- Tabela de pastas (container de EAPs)
CREATE TABLE IF NOT EXISTS public.eap_folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#3b82f6',
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning','active','completed','on_hold')),
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eap_folders_status ON public.eap_folders(status);

-- Trigger auto-update updated_at
CREATE TRIGGER trg_eap_folders_updated
  BEFORE UPDATE ON public.eap_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- FK: eap_projects pertence a uma pasta
ALTER TABLE public.eap_projects
  ADD COLUMN IF NOT EXISTS folder_id TEXT REFERENCES public.eap_folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_eap_projects_folder ON public.eap_projects(folder_id);

-- RLS
ALTER TABLE public.eap_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY eap_folders_all ON public.eap_folders FOR ALL USING (true) WITH CHECK (true);

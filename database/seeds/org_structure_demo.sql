-- ==========================================================
-- SEED DE DEMO — Estrutura Organizacional
--
-- Popula 5 pessoas em 2 setores pra visualizar a pagina
-- /equipe/estrutura com dados reais antes de cadastrar manualmente.
--
-- Estrutura criada:
--   Marketing   → Robert (gestor)
--                 └─ Kaua
--   Comercial   → Kaynan (gestor)
--                 ├─ Sergio
--                 └─ Lhonera
--
-- IDs prefixados com "demo_" pra facilitar limpeza:
--   DELETE FROM team_members WHERE id LIKE 'demo_%';
--
-- Idempotente — pode rodar varias vezes sem duplicar.
-- ==========================================================

-- 1. Inserir os membros (sem setor/chefe ainda — pra evitar ordem)
INSERT INTO public.team_members (id, name, role, color) VALUES
  ('demo_robert',  'Robert',  'Gestor de Marketing',  '#ec4899'),
  ('demo_kaua',    'Kaua',    'Designer',             '#f97316'),
  ('demo_kaynan',  'Kaynan',  'Gestor Comercial',     '#22c55e'),
  ('demo_sergio',  'Sergio',  'Vendedor',             '#3b82f6'),
  ('demo_lhonera', 'Lhonera', 'Vendedora',            '#8b5cf6')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  color = EXCLUDED.color;

-- 2. Atribuir setores
UPDATE public.team_members SET org_sector_id = 'org_marketing' WHERE id IN ('demo_robert', 'demo_kaua');
UPDATE public.team_members SET org_sector_id = 'org_comercial' WHERE id IN ('demo_kaynan', 'demo_sergio', 'demo_lhonera');

-- 3. Definir chefias diretas (manager_id)
UPDATE public.team_members SET manager_id = 'demo_robert' WHERE id = 'demo_kaua';
UPDATE public.team_members SET manager_id = 'demo_kaynan' WHERE id IN ('demo_sergio', 'demo_lhonera');

-- 4. Definir gestor de cada setor
UPDATE public.org_sectors SET manager_id = 'demo_robert'  WHERE id = 'org_marketing';
UPDATE public.org_sectors SET manager_id = 'demo_kaynan'  WHERE id = 'org_comercial';

-- ==========================================================
-- SEED DE DEMO v2 — Estrutura Organizacional (multi-setor)
--
-- Dependencias:
--   - 041_org_structure.sql aplicado
--   - 042_org_sector_members.sql aplicado
--
-- Estrutura final:
--   Marketing  → Robert (gestor) ─ Kaua
--   Produto    → Robert (gestor cross-setor) ─ Elias
--   Comercial  → Kaynan (gestor) ─ Sergio, Lhonera
--   CS         → Kaynan (gestor cross-setor) ─ Sergio (comp.), Lhonera (comp.)
--
-- Idempotente. Detecta automaticamente Robert/Kaynan existentes.
-- ==========================================================

DO $$
DECLARE
  v_robert TEXT;
  v_kaynan TEXT;
  v_elias  TEXT := 'demo_elias';
  v_kaua   TEXT;
  v_sergio TEXT;
  v_lhonera TEXT;
BEGIN
  -- 1. Resolve IDs (prefere o cadastro real, fallback pro demo)
  SELECT id INTO v_robert FROM team_members WHERE name ILIKE 'Robert%' ORDER BY (id LIKE 'demo_%') ASC LIMIT 1;
  SELECT id INTO v_kaynan FROM team_members WHERE name ILIKE 'Kaynan%' ORDER BY (id LIKE 'demo_%') ASC LIMIT 1;

  IF v_robert IS NULL THEN
    RAISE EXCEPTION 'Robert nao existe em team_members — rode o seed v1 primeiro';
  END IF;
  IF v_kaynan IS NULL THEN
    RAISE EXCEPTION 'Kaynan nao existe em team_members — rode o seed v1 primeiro';
  END IF;

  -- 2. Insere/atualiza demais membros (Elias novo; Kaua/Sergio/Lhonera reusados)
  INSERT INTO team_members (id, name, role, color) VALUES
    ('demo_elias',   'Elias',   'Dev de Produto', '#06b6d4')
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, color = EXCLUDED.color;

  SELECT id INTO v_kaua    FROM team_members WHERE name ILIKE 'Kaua%'    ORDER BY (id LIKE 'demo_%') ASC LIMIT 1;
  SELECT id INTO v_sergio  FROM team_members WHERE name ILIKE 'Sergio%'  ORDER BY (id LIKE 'demo_%') ASC LIMIT 1;
  SELECT id INTO v_lhonera FROM team_members WHERE name ILIKE 'Lhonera%' ORDER BY (id LIKE 'demo_%') ASC LIMIT 1;

  -- 3. Setores primarios
  UPDATE team_members SET org_sector_id = 'org_marketing', manager_id = NULL    WHERE id = v_robert;
  UPDATE team_members SET org_sector_id = 'org_marketing', manager_id = v_robert WHERE id = v_kaua;
  UPDATE team_members SET org_sector_id = 'org_produto',   manager_id = v_robert WHERE id = v_elias;
  UPDATE team_members SET org_sector_id = 'org_comercial', manager_id = NULL    WHERE id = v_kaynan;
  UPDATE team_members SET org_sector_id = 'org_comercial', manager_id = v_kaynan WHERE id IN (v_sergio, v_lhonera);

  -- 4. Gestores de cada setor (Robert em Mkt+Prod; Kaynan em Com+CS)
  UPDATE org_sectors SET manager_id = v_robert WHERE id IN ('org_marketing', 'org_produto');
  UPDATE org_sectors SET manager_id = v_kaynan WHERE id IN ('org_comercial', 'org_cs');

  -- 5. Setores SECUNDARIOS (compartilhamento)
  -- Kaynan, Sergio, Lhonera atuam tambem em CS
  INSERT INTO org_sector_members (sector_id, member_id) VALUES
    ('org_cs', v_kaynan),
    ('org_cs', v_sergio),
    ('org_cs', v_lhonera)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed v2 aplicado. Robert=%, Kaynan=%, Elias=%, Kaua=%, Sergio=%, Lhonera=%',
    v_robert, v_kaynan, v_elias, v_kaua, v_sergio, v_lhonera;
END $$;

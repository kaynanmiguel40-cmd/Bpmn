-- ============================================================
-- 098_deal_priority_stars.sql
--
-- Prioridade do lead em ESTRELAS (1 a 5). E leitura humana do vendedor —
-- "esse aqui merece minha atencao primeiro" — e nao se confunde com
-- `probability` (chance de fechar, calculada/estimada) nem com a etapa.
--
-- 0 = sem prioridade definida (default). Guarda como smallint com CHECK pra
-- nao entrar 7 estrelas por bug de front.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_deals
  ADD COLUMN IF NOT EXISTS priority SMALLINT NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'crm_deals_priority_range'
  ) THEN
    ALTER TABLE public.crm_deals
      ADD CONSTRAINT crm_deals_priority_range CHECK (priority BETWEEN 0 AND 5);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

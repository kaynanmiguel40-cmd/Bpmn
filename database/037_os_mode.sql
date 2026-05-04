-- ==========================================================
-- 037_os_mode.sql
-- Modo da O.S.: pool | solo | team
--
-- Regra:
--   pool  -> 0 atribuidos. Visivel a todos. Qualquer um pode "Pegar".
--   solo  -> 1 atribuido. Visivel so pra ele. Outro pega -> vira team.
--   team  -> 2+ atribuidos. Cada participante tem 1 bloco em os_blocks.
--
-- Sticky crescente: pool -> solo -> team em sentido unico.
-- Uma vez team, nao volta automaticamente.
--
-- Idempotente: pode ser reaplicado sem efeitos colaterais.
-- ==========================================================

ALTER TABLE public.os_orders
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'pool';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'os_orders' AND constraint_name = 'os_orders_mode_check'
  ) THEN
    ALTER TABLE public.os_orders DROP CONSTRAINT os_orders_mode_check;
  END IF;
END $$;

ALTER TABLE public.os_orders
  ADD CONSTRAINT os_orders_mode_check
  CHECK (mode IN ('pool', 'solo', 'team'));

-- Backfill conforme atribuicao existente
UPDATE public.os_orders
   SET mode = 'solo'
 WHERE mode = 'pool'
   AND (assigned_to IS NOT NULL OR (assignee IS NOT NULL AND assignee <> ''));

-- Backfill team depende de os_blocks existir (migration 035). Se ainda nao
-- rodou, pula sem erro — a 037 pode ser reaplicada depois.
DO $$
BEGIN
  IF to_regclass('public.os_blocks') IS NOT NULL THEN
    UPDATE public.os_orders o
       SET mode = 'team'
     WHERE EXISTS (
       SELECT 1 FROM public.os_blocks b
        WHERE b.order_id = o.id
          AND b.assignee_id IS NOT NULL
        GROUP BY b.order_id
       HAVING COUNT(DISTINCT b.assignee_id) > 1
     );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_os_orders_mode ON public.os_orders(mode);

COMMENT ON COLUMN public.os_orders.mode IS
  'Modo da O.S.: pool (sem atribuidos, qualquer um pega), solo (1 atribuido), team (2+ atribuidos com blocos individuais).';

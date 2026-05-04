-- ==========================================================
-- 038_os_blocks_due_at.sql
-- Prazo de entrega por bloco (due_at).
--
-- Antes:
--   - estimated_minutes: quanto o bloco leva (duracao)
--   - prazo unico para todos: os_orders.estimated_end
-- Agora:
--   - cada bloco tem seu proprio prazo (data/hora limite)
--   - se due_at = NULL, herda implicitamente o prazo da O.S.
--
-- Idempotente.
-- ==========================================================

ALTER TABLE public.os_blocks
  ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ;

COMMENT ON COLUMN public.os_blocks.due_at IS
  'Prazo de entrega individual do bloco. NULL = sem prazo proprio (UI pode exibir o prazo da O.S.).';

CREATE INDEX IF NOT EXISTS idx_os_blocks_due_at
  ON public.os_blocks(due_at) WHERE due_at IS NOT NULL;

-- ==========================================================
-- 040_os_signatures_delivery.sql
--
-- Adiciona coluna delivered_at em os_signatures.
--
-- Modelo de 2 etapas por participante:
--   1. signed_at    -> "Pegar O.S." (aceito o trabalho)
--   2. delivered_at -> "Entregar O.S." (terminei a minha parte)
--
-- Quando TODOS os participantes tem delivered_at preenchido,
-- a O.S. e marcada como concluida (status = 'done', actualEnd = now).
--
-- Idempotente.
-- ==========================================================

ALTER TABLE public.os_signatures
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

COMMENT ON COLUMN public.os_signatures.delivered_at IS
  'Timestamp em que o participante clicou "Entregar O.S.". NULL = ainda nao entregou.';

CREATE INDEX IF NOT EXISTS idx_os_signatures_delivered_at
  ON public.os_signatures(order_id, delivered_at) WHERE delivered_at IS NOT NULL;

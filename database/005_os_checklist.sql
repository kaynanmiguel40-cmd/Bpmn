-- ============================================================
-- FYNESS OS - CHECKLIST NAS O.S.
-- Adiciona campo checklist (JSONB) na tabela os_orders
-- Formato: [{ "id": 123, "text": "Tarefa 1", "done": false }]
-- ============================================================

ALTER TABLE public.os_orders ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]';

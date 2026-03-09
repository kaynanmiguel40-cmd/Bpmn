-- ============================================================
-- FYNESS OS - CAMPOS PARA O.S. EMERGENCIAIS
-- Execute este script no SQL Editor do Supabase
-- Adiciona suporte a O.S. emergenciais com numeracao propria
-- ============================================================

-- Tipo da O.S.: 'normal' (padrao) ou 'emergency'
ALTER TABLE public.os_orders ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'normal';

-- Vinculo com a O.S. pai (de onde surgiu a emergencia)
ALTER TABLE public.os_orders ADD COLUMN IF NOT EXISTS parent_order_id TEXT;

-- Numeracao separada para emergenciais (EMG-1, EMG-2...)
ALTER TABLE public.os_orders ADD COLUMN IF NOT EXISTS emergency_number INTEGER;

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_os_orders_type ON public.os_orders(type);
CREATE INDEX IF NOT EXISTS idx_os_orders_parent ON public.os_orders(parent_order_id);

-- ============================================================
-- FIM
-- ============================================================

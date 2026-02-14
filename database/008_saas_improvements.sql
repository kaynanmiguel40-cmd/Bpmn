-- ============================================================
-- FYNESS OS - MELHORIAS SAAS FINANCEIRO
-- Migration 008: clients table, category, SLA, block_reason
-- ============================================================

-- ============================================================
-- 1. CLIENTS (cadastro de clientes)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_all" ON public.clients FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);

-- ============================================================
-- 2. NOVOS CAMPOS EM os_orders
-- ============================================================

-- Categoria da tarefa (para SaaS financeiro)
ALTER TABLE public.os_orders ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'internal';

-- Motivo de bloqueio (quando status = blocked)
ALTER TABLE public.os_orders ADD COLUMN IF NOT EXISTS block_reason TEXT;

-- SLA deadline (calculado automaticamente com base na prioridade)
ALTER TABLE public.os_orders ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ;

-- Client ID (referencia a tabela clients)
ALTER TABLE public.os_orders ADD COLUMN IF NOT EXISTS client_id TEXT;

-- Lead time em horas (calculado ao concluir)
ALTER TABLE public.os_orders ADD COLUMN IF NOT EXISTS lead_time_hours NUMERIC;

-- ============================================================
-- 3. CHECK CONSTRAINTS
-- ============================================================

-- Categorias validas para SaaS
ALTER TABLE public.os_orders DROP CONSTRAINT IF EXISTS chk_os_category;
ALTER TABLE public.os_orders ADD CONSTRAINT chk_os_category
  CHECK (category IS NULL OR category IN ('bug', 'feature', 'support', 'compliance', 'campaign', 'internal'));

-- Motivos de bloqueio validos
ALTER TABLE public.os_orders DROP CONSTRAINT IF EXISTS chk_os_block_reason;
ALTER TABLE public.os_orders ADD CONSTRAINT chk_os_block_reason
  CHECK (block_reason IS NULL OR block_reason IN ('material', 'approval', 'resource', 'dependency', 'other'));

-- ============================================================
-- 4. INDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_os_orders_category ON public.os_orders(category);
CREATE INDEX IF NOT EXISTS idx_os_orders_client_id ON public.os_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_os_orders_sla ON public.os_orders(sla_deadline);

-- ============================================================
-- 5. TRIGGER: Calcular lead_time_hours ao concluir O.S.
-- ============================================================

CREATE OR REPLACE FUNCTION calc_lead_time()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando status muda para 'done', calcular lead time
  IF NEW.status = 'done' AND (OLD.status IS NULL OR OLD.status != 'done') THEN
    NEW.lead_time_hours := EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 3600.0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calc_lead_time ON public.os_orders;
CREATE TRIGGER trg_calc_lead_time
  BEFORE UPDATE ON public.os_orders
  FOR EACH ROW
  EXECUTE FUNCTION calc_lead_time();

-- ============================================================
-- FIM - Migration 008
-- ============================================================

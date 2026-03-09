-- 018: Adicionar coluna supervisor (responsavel por acompanhar/controlar) na os_orders
-- O supervisor e quem monitora a execucao da OS, diferente do assignee (executor)

ALTER TABLE public.os_orders
  ADD COLUMN IF NOT EXISTS supervisor TEXT DEFAULT NULL;

-- Indice para consultas filtradas por supervisor
CREATE INDEX IF NOT EXISTS idx_os_orders_supervisor ON public.os_orders(supervisor);

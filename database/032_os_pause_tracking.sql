-- Adicionar colunas para rastreamento preciso de pausa/retomada em OS
-- paused_at: ISO timestamp quando a OS foi pausada (null quando rodando)
-- resumed_at: ISO timestamp da ultima retomada (usado para calcular tempo desde retomar)
-- accumulated_ms: milissegundos acumulados trabalhados antes da pausa atual

ALTER TABLE os_orders ADD COLUMN IF NOT EXISTS paused_at timestamptz;
ALTER TABLE os_orders ADD COLUMN IF NOT EXISTS resumed_at timestamptz;
ALTER TABLE os_orders ADD COLUMN IF NOT EXISTS accumulated_ms bigint DEFAULT 0;

COMMENT ON COLUMN os_orders.paused_at IS 'Timestamp ISO de quando a OS foi pausada (null = rodando)';
COMMENT ON COLUMN os_orders.resumed_at IS 'Timestamp ISO da ultima retomada (para calculo de timer)';
COMMENT ON COLUMN os_orders.accumulated_ms IS 'Milissegundos acumulados trabalhados antes da pausa atual';

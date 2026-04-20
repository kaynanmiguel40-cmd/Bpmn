-- ==========================================================
-- Snapshots mensais de KPI imutaveis apos fechamento do mes
-- ==========================================================

ALTER TABLE kpi_snapshots
  ADD COLUMN IF NOT EXISTS is_closed boolean DEFAULT false;

ALTER TABLE kpi_snapshots
  ADD COLUMN IF NOT EXISTS closed_at timestamptz;

COMMENT ON COLUMN kpi_snapshots.is_closed IS
  'true = snapshot fechado, nao pode ser editado (historico imutavel)';
COMMENT ON COLUMN kpi_snapshots.closed_at IS
  'Timestamp de fechamento do snapshot';

-- Fechar snapshots de periodos anteriores ao mes atual
UPDATE kpi_snapshots
SET is_closed = true,
    closed_at = now()
WHERE is_closed = false
  AND period < to_char(now(), 'YYYY-MM');

CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_period
  ON kpi_snapshots(user_name, period DESC);

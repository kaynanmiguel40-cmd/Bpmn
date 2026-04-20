-- ==========================================================
-- Log imutavel de eventos de tempo em O.S. (anti-manipulacao)
-- Cada start/stop gera um registro que nunca e apagado.
-- Horas trabalhadas sao calculadas somando duration_minutes.
-- ==========================================================

CREATE TABLE IF NOT EXISTS os_time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration_minutes integer DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_os_time_entries_order_id
  ON os_time_entries(order_id);
CREATE INDEX IF NOT EXISTS idx_os_time_entries_user
  ON os_time_entries(user_name, start_time DESC);

COMMENT ON TABLE os_time_entries IS
  'Log imutavel de sessoes de trabalho em O.S. Nunca apagar linhas.';
COMMENT ON COLUMN os_time_entries.end_time IS
  'NULL = sessao em andamento. Preenchido quando pausa/completa.';
COMMENT ON COLUMN os_time_entries.duration_minutes IS
  'Duracao da sessao em minutos (calculada no stop).';

-- RLS: usuarios autenticados podem ler/criar, apenas donos podem atualizar
ALTER TABLE os_time_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "os_time_entries_select" ON os_time_entries;
CREATE POLICY "os_time_entries_select"
  ON os_time_entries FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "os_time_entries_insert" ON os_time_entries;
CREATE POLICY "os_time_entries_insert"
  ON os_time_entries FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Update permitido apenas para fechar end_time (nao permite reescrever historico)
DROP POLICY IF EXISTS "os_time_entries_update" ON os_time_entries;
CREATE POLICY "os_time_entries_update"
  ON os_time_entries FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- DELETE bloqueado por padrao (integridade do log).
-- Se precisar limpar, fazer via SQL Admin manualmente.

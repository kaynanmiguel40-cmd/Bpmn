-- Adicionar colunas de pausas programadas e dependencias nas OS
ALTER TABLE os_orders ADD COLUMN IF NOT EXISTS scheduled_pauses jsonb DEFAULT '[]'::jsonb;
ALTER TABLE os_orders ADD COLUMN IF NOT EXISTS depends_on text[] DEFAULT '{}';

-- Permitir leitura/escrita via RLS (as policies existentes de os_orders ja cobrem)
COMMENT ON COLUMN os_orders.scheduled_pauses IS 'Array JSON de pausas programadas: [{start, end, reason}]';
COMMENT ON COLUMN os_orders.depends_on IS 'Array de IDs de OS que esta OS depende (para caminho critico)';

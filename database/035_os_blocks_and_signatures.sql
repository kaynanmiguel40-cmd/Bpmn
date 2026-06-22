-- ==========================================================
-- O.S. semanal com blocos por participante e assinatura coletiva
--
-- Modelo novo:
--   1 O.S. (semanal) -> N blocos -> 1 participante por bloco
--   Cada bloco tem tempo previsto (em minutos) e status proprio
--   Assinatura registrada por participante quando todos blocos = 'done'
--
-- Compatibilidade:
--   - Tabelas/colunas antigas (assignee, estimated_*, paused_at, etc) ficam
--     intactas. UI nova ignora; UI legada (se houver) segue funcionando.
--   - os_time_entries permanece como log historico imutavel.
-- ==========================================================

-- ---------- BLOCOS ----------
CREATE TABLE IF NOT EXISTS public.os_blocks (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.os_orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assignee_id UUID,
  assignee_name TEXT,
  estimated_minutes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.os_blocks IS
  'Blocos de trabalho dentro de uma O.S. semanal. 1 bloco = 1 participante + tempo previsto.';
COMMENT ON COLUMN public.os_blocks.estimated_minutes IS
  'Tempo previsto em minutos (UI converte para horas+minutos).';

CREATE INDEX IF NOT EXISTS idx_os_blocks_order_id
  ON public.os_blocks(order_id);
CREATE INDEX IF NOT EXISTS idx_os_blocks_assignee
  ON public.os_blocks(assignee_id, status);

ALTER TABLE public.os_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "os_blocks_select" ON public.os_blocks;
CREATE POLICY "os_blocks_select" ON public.os_blocks FOR SELECT USING (true);

DROP POLICY IF EXISTS "os_blocks_insert" ON public.os_blocks;
CREATE POLICY "os_blocks_insert" ON public.os_blocks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "os_blocks_update" ON public.os_blocks;
CREATE POLICY "os_blocks_update" ON public.os_blocks FOR UPDATE USING (true);

DROP POLICY IF EXISTS "os_blocks_delete" ON public.os_blocks;
CREATE POLICY "os_blocks_delete" ON public.os_blocks FOR DELETE USING (true);

-- ---------- ASSINATURAS ----------
CREATE TABLE IF NOT EXISTS public.os_signatures (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.os_orders(id) ON DELETE CASCADE,
  user_id UUID,
  user_name TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(order_id, user_id)
);

COMMENT ON TABLE public.os_signatures IS
  'Assinaturas dos participantes ao final da O.S. semanal. 1 por participante por O.S.';

CREATE INDEX IF NOT EXISTS idx_os_signatures_order
  ON public.os_signatures(order_id);

ALTER TABLE public.os_signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "os_signatures_select" ON public.os_signatures;
CREATE POLICY "os_signatures_select" ON public.os_signatures FOR SELECT USING (true);

DROP POLICY IF EXISTS "os_signatures_insert" ON public.os_signatures;
CREATE POLICY "os_signatures_insert" ON public.os_signatures FOR INSERT WITH CHECK (true);

-- Assinatura nao pode ser editada (so deletada se o usuario quiser desfazer)
DROP POLICY IF EXISTS "os_signatures_delete" ON public.os_signatures;
CREATE POLICY "os_signatures_delete" ON public.os_signatures FOR DELETE USING (true);

-- ---------- O.S.: campos da semana ----------
ALTER TABLE public.os_orders
  ADD COLUMN IF NOT EXISTS week_start DATE,
  ADD COLUMN IF NOT EXISTS week_end DATE;

COMMENT ON COLUMN public.os_orders.week_start IS
  'Inicio da semana coberta pela O.S. (modelo novo: O.S. semanal).';
COMMENT ON COLUMN public.os_orders.week_end IS
  'Fim da semana coberta pela O.S.';

CREATE INDEX IF NOT EXISTS idx_os_orders_week
  ON public.os_orders(week_start, week_end);

-- ---------- FUNCAO set_updated_at (idempotente) ----------
-- Cria a funcao caso ainda nao exista neste banco (utility comum em Supabase).
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------- TRIGGER updated_at em os_blocks ----------
DROP TRIGGER IF EXISTS set_updated_at ON public.os_blocks;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.os_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

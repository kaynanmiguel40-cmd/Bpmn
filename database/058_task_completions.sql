-- ============================================================
-- 058_task_completions.sql
--
-- BASE de produtividade (camada 1). Cada vez que uma tarefa (item de
-- checklist) é marcada como CONCLUÍDA numa Ordem de Serviço, grava-se aqui
-- um registro achatado: pessoa que fez, setor do trabalho, prazo que estava
-- definido, tempo real gasto, e (depois) a qualidade da revisão.
--
-- É o banco em cima do qual a "inteligência" vai aprender padrões de tempo
-- por pessoa × tipo de tarefa (camada 2) e calcular a nota (camada 3).
--
-- Chave do upsert: (order_id, task_id) — reconcluir/atualizar não duplica;
-- desmarcar apaga a linha; a revisão atualiza os campos de qualidade.
--
-- Sem FKs de propósito (assignee/projeto/setor podem não existir mais) —
-- mesmo padrão das outras tabelas operacionais. Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.task_completions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id          text NOT NULL,   -- os_orders.id
  task_id           text NOT NULL,   -- id do item do checklist
  task_text         text,
  group_name        text,

  -- Pessoa que executou (responsável do item/grupo, ou da O.S.)
  assignee_id       text,
  assignee_name     text,

  -- Setor do TRABALHO (O.S. → projeto → setor)
  project_id        text,
  sector_id         text,
  sector_label      text,

  -- Tempo e prazo
  estimated_minutes integer,         -- estimativa (item/grupo), se houver
  real_minutes      integer,         -- tempo real trabalhado
  due_at            timestamptz,     -- prazo de entrega vigente
  started_at        timestamptz,
  completed_at      timestamptz,
  on_time           boolean,         -- completed_at <= due_at (null se sem prazo)

  completed_by      text,

  -- Qualidade (chega DEPOIS, quando o supervisor revisa)
  review_status     text,            -- 'approved' | 'changes' | 'review' | 'draft' | null
  reviewed_at       timestamptz,
  reviewed_by       text,

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Um registro por (O.S., tarefa) — base do upsert
CREATE UNIQUE INDEX IF NOT EXISTS uq_task_completions
  ON public.task_completions(order_id, task_id);

-- Padrões: por pessoa e por setor ao longo do tempo
CREATE INDEX IF NOT EXISTS idx_task_completions_assignee
  ON public.task_completions(assignee_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_task_completions_sector
  ON public.task_completions(sector_id, completed_at);

-- Trigger updated_at (usa função existente; fallback se faltar)
DO $$ BEGIN
  CREATE TRIGGER trg_task_completions_set_updated_at
    BEFORE UPDATE ON public.task_completions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN undefined_function THEN
  CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $f$
  BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
  $f$ LANGUAGE plpgsql;
  CREATE TRIGGER trg_task_completions_set_updated_at
    BEFORE UPDATE ON public.task_completions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
WHEN duplicate_object THEN NULL;
END $$;

-- RLS (permissivo, alinhado com as demais tabelas operacionais)
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "task_completions_select" ON public.task_completions FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "task_completions_insert" ON public.task_completions FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "task_completions_update" ON public.task_completions FOR UPDATE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "task_completions_delete" ON public.task_completions FOR DELETE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Realtime (idempotente)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.task_completions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON TABLE public.task_completions IS
  'Base de produtividade: 1 linha por tarefa de O.S. concluída (pessoa, setor, prazo, tempo real, qualidade). Alimenta os padrões de tempo e a nota.';
-- ============================================================
-- 058_task_completions.sql
--
-- BASE de produtividade (camada 1). Cada vez que uma tarefa (item de
-- checklist) é marcada como CONCLUÍDA numa Ordem de Serviço, grava-se aqui
-- um registro achatado: pessoa que fez, setor do trabalho, prazo que estava
-- definido, tempo real gasto, e (depois) a qualidade da revisão.
--
-- É o banco em cima do qual a "inteligência" vai aprender padrões de tempo
-- por pessoa × tipo de tarefa (camada 2) e calcular a nota (camada 3).
--
-- Chave do upsert: (order_id, task_id) — reconcluir/atualizar não duplica;
-- desmarcar apaga a linha; a revisão atualiza os campos de qualidade.
--
-- Sem FKs de propósito (assignee/projeto/setor podem não existir mais) —
-- mesmo padrão das outras tabelas operacionais. Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.task_completions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id          text NOT NULL,   -- os_orders.id
  task_id           text NOT NULL,   -- id do item do checklist
  task_text         text,
  group_name        text,

  -- Pessoa que executou (responsável do item/grupo, ou da O.S.)
  assignee_id       text,
  assignee_name     text,

  -- Setor do TRABALHO (O.S. → projeto → setor)
  project_id        text,
  sector_id         text,
  sector_label      text,

  -- Tempo e prazo
  estimated_minutes integer,         -- estimativa (item/grupo), se houver
  real_minutes      integer,         -- tempo real trabalhado
  due_at            timestamptz,     -- prazo de entrega vigente
  started_at        timestamptz,
  completed_at      timestamptz,
  on_time           boolean,         -- completed_at <= due_at (null se sem prazo)

  completed_by      text,

  -- Qualidade (chega DEPOIS, quando o supervisor revisa)
  review_status     text,            -- 'approved' | 'changes' | 'review' | 'draft' | null
  reviewed_at       timestamptz,
  reviewed_by       text,

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Um registro por (O.S., tarefa) — base do upsert
CREATE UNIQUE INDEX IF NOT EXISTS uq_task_completions
  ON public.task_completions(order_id, task_id);

-- Padrões: por pessoa e por setor ao longo do tempo
CREATE INDEX IF NOT EXISTS idx_task_completions_assignee
  ON public.task_completions(assignee_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_task_completions_sector
  ON public.task_completions(sector_id, completed_at);

-- Trigger updated_at (usa função existente; fallback se faltar)
DO $$ BEGIN
  CREATE TRIGGER trg_task_completions_set_updated_at
    BEFORE UPDATE ON public.task_completions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN undefined_function THEN
  CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $f$
  BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
  $f$ LANGUAGE plpgsql;
  CREATE TRIGGER trg_task_completions_set_updated_at
    BEFORE UPDATE ON public.task_completions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
WHEN duplicate_object THEN NULL;
END $$;

-- RLS (permissivo, alinhado com as demais tabelas operacionais)
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "task_completions_select" ON public.task_completions FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "task_completions_insert" ON public.task_completions FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "task_completions_update" ON public.task_completions FOR UPDATE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "task_completions_delete" ON public.task_completions FOR DELETE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Realtime (idempotente)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.task_completions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON TABLE public.task_completions IS
  'Base de produtividade: 1 linha por tarefa de O.S. concluída (pessoa, setor, prazo, tempo real, qualidade). Alimenta os padrões de tempo e a nota.';

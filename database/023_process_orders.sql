-- 023: Ordens de Processo (Process Orders)
-- Documentacao detalhada de cada etapa do processo BPMN
-- Permite detalhar, planejar e melhorar continuamente cada passo

CREATE TABLE IF NOT EXISTS public.process_orders (
    id TEXT PRIMARY KEY,

    -- Vinculo com o diagrama BPMN
    project_id TEXT NOT NULL,           -- FK para projects.id (diagrama BPMN)
    element_id TEXT NOT NULL,           -- ID do elemento BPMN (ex: "Activity_1a2b")
    element_type TEXT DEFAULT '',       -- Tipo: "bpmn:Task", "bpmn:SubProcess", etc.

    -- Informacoes basicas
    title TEXT NOT NULL,
    description TEXT DEFAULT '',

    -- Detalhamento do processo (O QUE / COMO fazer)
    objective TEXT DEFAULT '',                  -- Por que esta etapa existe
    steps JSONB DEFAULT '[]',                  -- [{id, order, text, details, required}]
    inputs TEXT DEFAULT '',                     -- Entradas necessarias
    outputs TEXT DEFAULT '',                    -- Saidas/entregas esperadas
    tools_resources TEXT DEFAULT '',            -- Ferramentas e recursos necessarios

    -- Responsabilidades (QUEM faz)
    responsible TEXT DEFAULT '',                -- Responsavel principal
    participants TEXT DEFAULT '',               -- Outros participantes/envolvidos

    -- Criterios e qualidade
    acceptance_criteria TEXT DEFAULT '',        -- Criterios de aceitacao

    -- Riscos e contingencias
    risks JSONB DEFAULT '[]',                  -- [{id, description, mitigation, severity}]

    -- Melhoria continua (APRENDIZADOS)
    improvements JSONB DEFAULT '[]',           -- [{id, date, description, result, author}]
    lessons_learned TEXT DEFAULT '',            -- Licoes aprendidas consolidadas

    -- Status e versionamento
    status TEXT NOT NULL DEFAULT 'draft',       -- draft, active, review, archived
    version INTEGER DEFAULT 1,

    -- Observacoes gerais
    notes TEXT DEFAULT '',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraint: um unico process order por elemento em cada projeto
ALTER TABLE public.process_orders
  ADD CONSTRAINT process_orders_unique_element
  UNIQUE (project_id, element_id);

-- Constraint: status validos
ALTER TABLE public.process_orders
  ADD CONSTRAINT process_orders_status_check
  CHECK (status IN ('draft', 'active', 'review', 'archived'));

-- Indices
CREATE INDEX IF NOT EXISTS idx_process_orders_project
  ON public.process_orders(project_id);

CREATE INDEX IF NOT EXISTS idx_process_orders_element
  ON public.process_orders(project_id, element_id);

CREATE INDEX IF NOT EXISTS idx_process_orders_status
  ON public.process_orders(status);

-- RLS
ALTER TABLE public.process_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "process_orders_all"
  ON public.process_orders FOR ALL
  USING (true) WITH CHECK (true);

-- Trigger updated_at (reutiliza funcao existente)
CREATE TRIGGER set_process_orders_updated_at
  BEFORE UPDATE ON public.process_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

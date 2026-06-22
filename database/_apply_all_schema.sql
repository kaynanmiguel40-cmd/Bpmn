-- ================================================================
-- _apply_all_schema.sql  (gerado automaticamente)
--
-- Reaplica TODAS as migrations de SCHEMA (035..063) em ordem.
-- Todas idempotentes (IF NOT EXISTS / DO ... EXCEPTION duplicate_object).
-- Seguro re-rodar: o que ja existe vira no-op.
--
-- NAO inclui seeds nem cleanups (mexem em DADOS): 062_seed_apresentacao,
-- cleanup_*, clear_crm_activities, seed_os_teste, seeds/org_structure_demo*.
-- ================================================================


-- ===== 035_os_blocks_and_signatures.sql =============================================
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


-- ===== 036_crm_automations.sql =============================================
-- ============================================================
-- 036_crm_automations.sql
-- Aba Automacoes do CRM: regras de disparo e logs de envio.
-- IDs em UUID (DEFAULT gen_random_uuid) alinhado com o padrao
-- das demais tabelas CRM (crm_deals, crm_pipelines, etc.).
-- Totalmente idempotente: pode ser reaplicado sem efeitos colaterais.
-- ============================================================

-- 1) Tabela de regras
CREATE TABLE IF NOT EXISTS crm_automations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  pipeline_id     UUID REFERENCES crm_pipelines(id) ON DELETE CASCADE,
  stage_id        UUID REFERENCES crm_pipeline_stages(id) ON DELETE CASCADE,
  channel         TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  message_type    TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'audio')),
  subject         TEXT,
  message_content TEXT,
  media_url       TEXT,
  segment_filter  TEXT,
  delay_minutes   INT NOT NULL DEFAULT 0,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Garante coluna `subject` mesmo se a tabela ja existia
ALTER TABLE crm_automations ADD COLUMN IF NOT EXISTS subject TEXT;

-- Remove canal SMS (nao suportado): apaga regras/logs antigos e recria CHECK.
UPDATE crm_automations
   SET deleted_at = NOW()
 WHERE channel = 'sms' AND deleted_at IS NULL;

DELETE FROM crm_automation_logs WHERE channel = 'sms';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'crm_automations' AND constraint_name = 'crm_automations_channel_check'
  ) THEN
    ALTER TABLE crm_automations DROP CONSTRAINT crm_automations_channel_check;
  END IF;
END $$;

ALTER TABLE crm_automations
  ADD CONSTRAINT crm_automations_channel_check
  CHECK (channel IN ('email', 'whatsapp'));

-- 2) Tabela de logs
CREATE TABLE IF NOT EXISTS crm_automation_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id    UUID REFERENCES crm_automations(id) ON DELETE SET NULL,
  deal_id          UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
  deal_title       TEXT,
  stage_name       TEXT,
  channel          TEXT NOT NULL,
  recipient        TEXT,
  message_snapshot TEXT,
  status           TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'error')),
  error_message    TEXT,
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Indices
CREATE INDEX IF NOT EXISTS idx_crm_automations_stage
  ON crm_automations(stage_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_automations_pipeline
  ON crm_automations(pipeline_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_automation_logs_automation
  ON crm_automation_logs(automation_id);
CREATE INDEX IF NOT EXISTS idx_crm_automation_logs_deal
  ON crm_automation_logs(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_automation_logs_sent_at
  ON crm_automation_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_automation_logs_status
  ON crm_automation_logs(status);

-- 4) RLS
ALTER TABLE crm_automations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_automation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_automations_all"     ON crm_automations;
DROP POLICY IF EXISTS "crm_automation_logs_all" ON crm_automation_logs;

CREATE POLICY "crm_automations_all" ON crm_automations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "crm_automation_logs_all" ON crm_automation_logs
  FOR ALL USING (true) WITH CHECK (true);


-- ===== 037_os_mode.sql =============================================
-- ==========================================================
-- 037_os_mode.sql
-- Modo da O.S.: pool | solo | team
--
-- Regra:
--   pool  -> 0 atribuidos. Visivel a todos. Qualquer um pode "Pegar".
--   solo  -> 1 atribuido. Visivel so pra ele. Outro pega -> vira team.
--   team  -> 2+ atribuidos. Cada participante tem 1 bloco em os_blocks.
--
-- Sticky crescente: pool -> solo -> team em sentido unico.
-- Uma vez team, nao volta automaticamente.
--
-- Idempotente: pode ser reaplicado sem efeitos colaterais.
-- ==========================================================

ALTER TABLE public.os_orders
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'pool';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'os_orders' AND constraint_name = 'os_orders_mode_check'
  ) THEN
    ALTER TABLE public.os_orders DROP CONSTRAINT os_orders_mode_check;
  END IF;
END $$;

ALTER TABLE public.os_orders
  ADD CONSTRAINT os_orders_mode_check
  CHECK (mode IN ('pool', 'solo', 'team'));

-- Backfill conforme atribuicao existente
UPDATE public.os_orders
   SET mode = 'solo'
 WHERE mode = 'pool'
   AND (assigned_to IS NOT NULL OR (assignee IS NOT NULL AND assignee <> ''));

-- Backfill team depende de os_blocks existir (migration 035). Se ainda nao
-- rodou, pula sem erro — a 037 pode ser reaplicada depois.
DO $$
BEGIN
  IF to_regclass('public.os_blocks') IS NOT NULL THEN
    UPDATE public.os_orders o
       SET mode = 'team'
     WHERE EXISTS (
       SELECT 1 FROM public.os_blocks b
        WHERE b.order_id = o.id
          AND b.assignee_id IS NOT NULL
        GROUP BY b.order_id
       HAVING COUNT(DISTINCT b.assignee_id) > 1
     );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_os_orders_mode ON public.os_orders(mode);

COMMENT ON COLUMN public.os_orders.mode IS
  'Modo da O.S.: pool (sem atribuidos, qualquer um pega), solo (1 atribuido), team (2+ atribuidos com blocos individuais).';


-- ===== 038_os_blocks_due_at.sql =============================================
-- ==========================================================
-- 038_os_blocks_due_at.sql
-- Prazo de entrega por bloco (due_at).
--
-- Antes:
--   - estimated_minutes: quanto o bloco leva (duracao)
--   - prazo unico para todos: os_orders.estimated_end
-- Agora:
--   - cada bloco tem seu proprio prazo (data/hora limite)
--   - se due_at = NULL, herda implicitamente o prazo da O.S.
--
-- Idempotente.
-- ==========================================================

ALTER TABLE public.os_blocks
  ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ;

COMMENT ON COLUMN public.os_blocks.due_at IS
  'Prazo de entrega individual do bloco. NULL = sem prazo proprio (UI pode exibir o prazo da O.S.).';

CREATE INDEX IF NOT EXISTS idx_os_blocks_due_at
  ON public.os_blocks(due_at) WHERE due_at IS NOT NULL;


-- ===== 039_os_participants_checklist_groups.sql =============================================
-- ==========================================================
-- 039_os_participants_checklist_groups.sql
--
-- Reformulacao: o "bloco" agora E o grupo do checklist.
--   - participants[]      : lista de quem trabalha na O.S. (autoridade unica)
--   - checklist_groups[]  : metadados por grupo (assignee, prazo, tempo previsto)
--
-- Os itens do checklist continuam em os_orders.checklist (JSONB),
-- agrupados pelo campo i.group. Aqui guardamos os METADADOS de cada grupo
-- (responsavel, prazo, etc) sem duplicar em cada item.
--
-- Estrutura participants:
--   [{ "id": "<uuid>", "name": "Alice" }, ...]
--
-- Estrutura checklist_groups:
--   [{ "name": "TT", "assigneeId": "<uuid>", "assigneeName": "Alice",
--      "dueAt": "2026-05-10T18:00:00Z", "estimatedMinutes": 120 }, ...]
--
-- Idempotente.
-- ==========================================================

ALTER TABLE public.os_orders
  ADD COLUMN IF NOT EXISTS participants JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.os_orders
  ADD COLUMN IF NOT EXISTS checklist_groups JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.os_orders.participants IS
  'Lista de participantes da O.S. (modo team). Cada item: { id, name }. Fonte unica de verdade pra "quem trabalha aqui".';

COMMENT ON COLUMN public.os_orders.checklist_groups IS
  'Metadados por grupo do checklist (1 grupo = 1 obrigacao de 1 pessoa). Cada item: { name, assigneeId, assigneeName, dueAt, estimatedMinutes }.';

-- Index GIN pra queries do tipo "minhas O.S. por grupo do checklist"
CREATE INDEX IF NOT EXISTS idx_os_orders_checklist_groups
  ON public.os_orders USING GIN (checklist_groups);
CREATE INDEX IF NOT EXISTS idx_os_orders_participants
  ON public.os_orders USING GIN (participants);

-- Backfill: O.S. que ja tem assignee/assigned_to (mode solo legado) ganham
-- o proprio dono em participants[] como conveniencia.
-- Em team antigo (com os_blocks) faria sentido migrar dali — mas mantemos
-- vazio e a UI nova pede pra reatribuir.
UPDATE public.os_orders
   SET participants = jsonb_build_array(
     jsonb_build_object('id', assigned_to, 'name', COALESCE(assignee, ''))
   )
 WHERE participants = '[]'::jsonb
   AND assigned_to IS NOT NULL;


-- ===== 040_os_signatures_delivery.sql =============================================
-- ==========================================================
-- 040_os_signatures_delivery.sql
--
-- Adiciona coluna delivered_at em os_signatures.
--
-- Modelo de 2 etapas por participante:
--   1. signed_at    -> "Pegar O.S." (aceito o trabalho)
--   2. delivered_at -> "Entregar O.S." (terminei a minha parte)
--
-- Quando TODOS os participantes tem delivered_at preenchido,
-- a O.S. e marcada como concluida (status = 'done', actualEnd = now).
--
-- Idempotente.
-- ==========================================================

ALTER TABLE public.os_signatures
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

COMMENT ON COLUMN public.os_signatures.delivered_at IS
  'Timestamp em que o participante clicou "Entregar O.S.". NULL = ainda nao entregou.';

CREATE INDEX IF NOT EXISTS idx_os_signatures_delivered_at
  ON public.os_signatures(order_id, delivered_at) WHERE delivered_at IS NOT NULL;


-- ===== 041_org_structure.sql =============================================
-- ==========================================================
-- 041_org_structure.sql
--
-- Estrutura organizacional da empresa (organograma).
--
-- Conceito distinto de os_sectors (que agrupa projetos de O.S.).
-- Aqui modelamos setores corporativos (Marketing, RH, etc.) com:
--   - gestor responsavel pelo setor (manager_id)
--   - membros alocados ao setor (team_members.org_sector_id)
--   - hierarquia interna dentro do setor (team_members.manager_id)
--
-- Idempotente.
-- ==========================================================

-- ============================================================
-- 1. Tabela org_sectors
-- ============================================================
CREATE TABLE IF NOT EXISTS public.org_sectors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  manager_id TEXT REFERENCES public.team_members(id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.org_sectors ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "org_sectors_select" ON public.org_sectors FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "org_sectors_insert" ON public.org_sectors FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "org_sectors_update" ON public.org_sectors FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "org_sectors_delete" ON public.org_sectors FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_org_sectors_position ON public.org_sectors(position);

COMMENT ON TABLE public.org_sectors IS
  'Setores corporativos do organograma (Marketing, RH, etc). Distinto de os_sectors.';
COMMENT ON COLUMN public.org_sectors.manager_id IS
  'Gestor responsavel pelo setor. NULL = sem gestor definido.';
COMMENT ON COLUMN public.org_sectors.position IS
  'Ordem de exibicao na arvore (menor primeiro).';

-- ============================================================
-- 2. Colunas em team_members
-- ============================================================
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS org_sector_id TEXT REFERENCES public.org_sectors(id) ON DELETE SET NULL;

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS manager_id TEXT REFERENCES public.team_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_team_members_org_sector_id
  ON public.team_members(org_sector_id) WHERE org_sector_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_team_members_manager_id
  ON public.team_members(manager_id) WHERE manager_id IS NOT NULL;

COMMENT ON COLUMN public.team_members.org_sector_id IS
  'Setor organizacional ao qual o membro pertence. NULL = raiz da empresa (ex: CEO).';
COMMENT ON COLUMN public.team_members.manager_id IS
  'Chefe direto dentro do organograma. NULL = sem chefe direto.';

-- ============================================================
-- 3. Seed dos 6 setores iniciais
-- ============================================================
INSERT INTO public.org_sectors (id, name, color, position) VALUES
  ('org_marketing', 'Marketing',  '#ec4899', 1),
  ('org_produto',   'Produto',    '#8b5cf6', 2),
  ('org_comercial', 'Comercial',  '#22c55e', 3),
  ('org_cs',        'CS',         '#06b6d4', 4),
  ('org_financeiro','Financeiro', '#f59e0b', 5),
  ('org_rh',        'RH',         '#ef4444', 6)
ON CONFLICT (id) DO NOTHING;


-- ===== 042_org_sector_members.sql =============================================
-- ==========================================================
-- 042_org_sector_members.sql
--
-- Permite que uma pessoa atue em multiplos setores (many-to-many).
--
-- Modelo:
--   - team_members.org_sector_id continua sendo o setor PRIMARIO
--     (a "casa" da pessoa, onde ela aparece com card cheio)
--   - org_sector_members lista os setores ADICIONAIS onde a pessoa
--     tambem atua (card aparece com borda tracejada)
--
-- Caso de uso real: vendedor pode atuar em Comercial e CS sem duplicar
-- o cadastro nem perder a referencia de gestor.
--
-- Idempotente.
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.org_sector_members (
  sector_id TEXT NOT NULL REFERENCES public.org_sectors(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (sector_id, member_id)
);

ALTER TABLE public.org_sector_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "org_sector_members_select" ON public.org_sector_members FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "org_sector_members_insert" ON public.org_sector_members FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "org_sector_members_update" ON public.org_sector_members FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "org_sector_members_delete" ON public.org_sector_members FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_osm_sector ON public.org_sector_members(sector_id);
CREATE INDEX IF NOT EXISTS idx_osm_member ON public.org_sector_members(member_id);

COMMENT ON TABLE public.org_sector_members IS
  'Setores adicionais (alem do primario em team_members.org_sector_id) onde a pessoa atua.';
COMMENT ON COLUMN public.org_sector_members.sector_id IS
  'Setor onde a pessoa atua como "secundario" — aparece com card tracejado.';


-- ===== 043_org_sector_managers.sql =============================================
-- ==========================================================
-- 043_org_sector_managers.sql
--
-- Permite multiplos gestores por setor (co-liderança).
--
-- Substitui (logicamente) org_sectors.manager_id por uma relação
-- many-to-many. A coluna org_sectors.manager_id permanece no schema
-- por backward compat, mas a UI/service passam a usar esta tabela.
--
-- Idempotente. Inclui backfill dos managers atuais.
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.org_sector_managers (
  sector_id TEXT NOT NULL REFERENCES public.org_sectors(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (sector_id, member_id)
);

ALTER TABLE public.org_sector_managers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "org_sector_managers_select" ON public.org_sector_managers FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "org_sector_managers_insert" ON public.org_sector_managers FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "org_sector_managers_update" ON public.org_sector_managers FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "org_sector_managers_delete" ON public.org_sector_managers FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_osmg_sector ON public.org_sector_managers(sector_id);
CREATE INDEX IF NOT EXISTS idx_osmg_member ON public.org_sector_managers(member_id);

COMMENT ON TABLE public.org_sector_managers IS
  'Co-gestores de cada setor (substitui org_sectors.manager_id).';
COMMENT ON COLUMN public.org_sector_managers.position IS
  'Ordem de exibicao (0 = primeiro listado).';

-- Backfill: migra org_sectors.manager_id existente pra esta tabela
INSERT INTO public.org_sector_managers (sector_id, member_id, position)
SELECT id, manager_id, 0
FROM public.org_sectors
WHERE manager_id IS NOT NULL
ON CONFLICT (sector_id, member_id) DO NOTHING;


-- ===== 044_crm_calls.sql =============================================
-- ============================================================
-- 044_crm_calls.sql
--
-- Discador do CRM: registro de ligacoes feitas pelos vendedores.
--
-- Modelado pensando nas 3 versoes do produto:
--   V1 - discador via celular do vendedor (channel = 'device').
--        Cronometro/duracao manual. Sem gravacao.
--   V2 - click-to-call via provedor VoIP (channel = 'voip').
--        Preenche provider, provider_call_id, recording_url.
--   V3 - IA analisa gravacao e preenche transcript, ai_summary,
--        ai_objections, ai_sentiment, ai_score, ai_analyzed_at.
--
-- crm_calls eh fonte primaria. Pra nao quebrar a timeline do lead,
-- toda chamada espelha uma linha em crm_activities (type='call')
-- via activity_id. Isso eh feito pelo service em codigo, nao por
-- trigger, pra manter ownership/log claros.
--
-- Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.crm_calls (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relacionamentos (snapshots; ligacao sobrevive a soft-delete do contato)
  contact_id                  UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  deal_id                     UUID REFERENCES public.crm_deals(id)    ON DELETE SET NULL,
  company_id                  UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,

  -- Numero efetivamente discado (snapshot do phone no momento da chamada)
  phone_dialed                TEXT NOT NULL,

  -- Direcao da chamada (V1 = sempre outbound)
  direction                   TEXT NOT NULL DEFAULT 'outbound'
                              CHECK (direction IN ('outbound', 'inbound')),

  -- Mecanismo da chamada
  channel                     TEXT NOT NULL DEFAULT 'device'
                              CHECK (channel IN ('device', 'voip')),
  provider                    TEXT,           -- 'twilio', 'zenvia', etc. (V2+)
  provider_call_id            TEXT,           -- id externo (V2+)

  -- Timing
  started_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at                    TIMESTAMPTZ,
  duration_seconds            INTEGER,        -- cronometro manual (V1); provider (V2+)

  -- Resultado da chamada
  outcome                     TEXT CHECK (outcome IN (
                                'answered',
                                'no_answer',
                                'voicemail',
                                'busy',
                                'wrong_number',
                                'callback_scheduled',
                                'meeting_scheduled',
                                'not_interested',
                                'deal_advanced'
                              )),

  notes                       TEXT,

  -- Agendamento de retorno (V1 ja usa; cria activity espelho)
  follow_up_at                TIMESTAMPTZ,
  follow_up_activity_id       UUID REFERENCES public.crm_activities(id) ON DELETE SET NULL,

  -- V2+: gravacao
  recording_url               TEXT,
  recording_duration_seconds  INTEGER,

  -- V3+: analise por IA
  transcript                  TEXT,
  ai_summary                  TEXT,
  ai_objections               JSONB,          -- array de strings
  ai_sentiment                TEXT CHECK (ai_sentiment IS NULL
                              OR ai_sentiment IN ('positive', 'neutral', 'negative')),
  ai_score                    INTEGER CHECK (ai_score IS NULL
                              OR (ai_score >= 0 AND ai_score <= 100)),
  ai_analyzed_at              TIMESTAMPTZ,

  -- Espelho na timeline (crm_activities type='call')
  activity_id                 UUID REFERENCES public.crm_activities(id) ON DELETE SET NULL,

  -- Audit
  created_by                  UUID,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                  TIMESTAMPTZ
);

-- Indices uteis pra fila/relatorios
CREATE INDEX IF NOT EXISTS idx_crm_calls_contact      ON public.crm_calls(contact_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_calls_deal         ON public.crm_calls(deal_id)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_calls_started_at   ON public.crm_calls(started_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_calls_outcome      ON public.crm_calls(outcome)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_calls_created_by   ON public.crm_calls(created_by) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_calls_follow_up    ON public.crm_calls(follow_up_at)
  WHERE deleted_at IS NULL AND follow_up_at IS NOT NULL;

-- Trigger pra manter updated_at em sync (usa funcao existente do projeto)
DO $$ BEGIN
  CREATE TRIGGER trg_crm_calls_set_updated_at
    BEFORE UPDATE ON public.crm_calls
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN undefined_function THEN
  -- Fallback: define funcao se nao existir
  CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $f$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $f$ LANGUAGE plpgsql;

  CREATE TRIGGER trg_crm_calls_set_updated_at
    BEFORE UPDATE ON public.crm_calls
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
WHEN duplicate_object THEN NULL;
END $$;

-- RLS (alinhado com as demais tabelas crm_*)
ALTER TABLE public.crm_calls ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "crm_calls_select" ON public.crm_calls FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_calls_insert" ON public.crm_calls FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_calls_update" ON public.crm_calls FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_calls_delete" ON public.crm_calls FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Realtime (idempotente)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_calls;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON TABLE public.crm_calls IS
  'Discador do CRM. Toda chamada feita por vendedor (V1=device, V2=voip). V3 popula colunas ai_*.';
COMMENT ON COLUMN public.crm_calls.channel IS
  'device = celular do vendedor (V1, link tel:). voip = provedor (V2+, click-to-call com gravacao).';
COMMENT ON COLUMN public.crm_calls.activity_id IS
  'Atividade espelho em crm_activities pra aparecer na timeline do contato/deal.';
COMMENT ON COLUMN public.crm_calls.follow_up_activity_id IS
  'Activity criada automaticamente quando outcome=callback_scheduled.';


-- ===== 045_drop_crm_proposals.sql =============================================
-- ============================================================
-- 045_drop_crm_proposals.sql
--
-- Remove o modulo de Propostas do CRM Fyness.
-- A aba foi excluida da UI; estas tabelas nao sao mais usadas em codigo.
--
-- Rode no Supabase SQL Editor.
-- ============================================================

BEGIN;

-- Realtime: remover do publication antes de dropar a tabela
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.crm_proposals;
EXCEPTION WHEN undefined_table OR undefined_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.crm_proposal_items;
EXCEPTION WHEN undefined_table OR undefined_object THEN NULL; END $$;

-- Itens primeiro (FK pra proposals)
DROP TABLE IF EXISTS public.crm_proposal_items CASCADE;
DROP TABLE IF EXISTS public.crm_proposals       CASCADE;

COMMIT;


-- ===== 046_crm_whatsapp.sql =============================================
-- ============================================================
-- 046_crm_whatsapp.sql
--
-- Inbox WhatsApp do CRM via Evolution API.
--
-- Modelo:
--   crm_whatsapp_instances  - cada instância da Evolution (1 por
--                             vendedor/numero). Estado da conexão,
--                             QR code transient, telefone conectado.
--   crm_messages            - todas as mensagens enviadas/recebidas
--                             via WhatsApp. Vincula a contato e
--                             (opcionalmente) a deal. Recebimento de
--                             numero desconhecido cria prospect e
--                             vincula via prospect_id ate que o
--                             vendedor promova pra contato.
--
-- Schema prevê multi-instancia (2-3 usuarios) desde ja, mesmo que a
-- UI MVP atenda 1 so.
--
-- Idempotente.
-- ============================================================

-- =================== crm_whatsapp_instances ====================

CREATE TABLE IF NOT EXISTS public.crm_whatsapp_instances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Nome da instância na Evolution API (unique, usado nas chamadas /instance/<name>)
  instance_name   TEXT NOT NULL UNIQUE,

  -- Dono da instância (vendedor). Null = instância compartilhada / sistema.
  team_member_id  TEXT REFERENCES public.team_members(id) ON DELETE SET NULL,

  -- Telefone conectado (preenchido apos escaneio do QR)
  phone_number    TEXT,

  -- Estado da conexão
  status          TEXT NOT NULL DEFAULT 'disconnected'
                  CHECK (status IN ('disconnected', 'connecting', 'qr_pending', 'connected', 'banned')),

  -- QR code atual (base64). Transient: zerado apos conexão.
  qr_code         TEXT,
  qr_expires_at   TIMESTAMPTZ,

  -- Ultimo ping bem-sucedido vindo do webhook (heartbeat / connection.update)
  last_seen_at    TIMESTAMPTZ,

  -- Audit
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_crm_whatsapp_instances_team_member
  ON public.crm_whatsapp_instances(team_member_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_whatsapp_instances_status
  ON public.crm_whatsapp_instances(status) WHERE deleted_at IS NULL;

-- =================== crm_messages ====================

CREATE TABLE IF NOT EXISTS public.crm_messages (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Instancia da Evolution que enviou/recebeu a mensagem
  instance_id            UUID NOT NULL REFERENCES public.crm_whatsapp_instances(id) ON DELETE RESTRICT,

  -- Vinculo do interlocutor (exatamente um dos dois deve estar preenchido)
  contact_id             UUID REFERENCES public.crm_contacts(id)  ON DELETE SET NULL,
  prospect_id            UUID REFERENCES public.crm_prospects(id) ON DELETE SET NULL,

  -- Contexto opcional: deal associado a esta conversa
  deal_id                UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,

  -- Direcao
  direction              TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),

  -- Numeros (snapshot; tolerante a delete do contato)
  from_phone             TEXT NOT NULL,
  to_phone               TEXT NOT NULL,

  -- Conteudo
  content                TEXT,            -- texto da mensagem (pode ser null em audio puro etc)
  media_url              TEXT,            -- URL na Evolution; MVP nao espelha no Supabase Storage
  media_type             TEXT CHECK (media_type IS NULL OR media_type IN
                          ('image', 'audio', 'video', 'document', 'sticker', 'location', 'contact')),
  media_mime             TEXT,
  media_filename         TEXT,
  media_caption          TEXT,            -- legenda quando aplicavel

  -- ID da mensagem na Evolution (dedup de webhooks repetidos)
  evolution_message_id   TEXT UNIQUE,

  -- Status do envio (outbound) ou recebimento (inbound)
  status                 TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'received')),
  error_message          TEXT,

  -- Timing
  sent_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at           TIMESTAMPTZ,
  read_at                TIMESTAMPTZ,

  -- Sinalizacoes
  is_spam                BOOLEAN NOT NULL DEFAULT FALSE,
  is_starred             BOOLEAN NOT NULL DEFAULT FALSE,

  -- Origem: 'manual' (vendedor digitou), 'automation' (automation disparou), 'reply' (resposta)
  source                 TEXT NOT NULL DEFAULT 'manual'
                         CHECK (source IN ('manual', 'automation', 'reply', 'broadcast')),
  automation_id          UUID REFERENCES public.crm_automations(id) ON DELETE SET NULL,

  -- Quem enviou (vendedor; null em inbound)
  created_by             UUID,

  -- Audit
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at             TIMESTAMPTZ,

  -- Garante que ha vinculo de interlocutor (contato OU prospect)
  CONSTRAINT crm_messages_link_check
    CHECK (contact_id IS NOT NULL OR prospect_id IS NOT NULL)
);

-- Indices pra inbox e listagens
CREATE INDEX IF NOT EXISTS idx_crm_messages_contact_sent
  ON public.crm_messages(contact_id, sent_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_messages_prospect_sent
  ON public.crm_messages(prospect_id, sent_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_messages_deal_sent
  ON public.crm_messages(deal_id, sent_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_messages_instance_status
  ON public.crm_messages(instance_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_messages_from_phone
  ON public.crm_messages(from_phone, sent_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_messages_pending_outbound
  ON public.crm_messages(instance_id, sent_at)
  WHERE deleted_at IS NULL AND direction = 'outbound' AND status = 'pending';

-- =================== Triggers updated_at ====================

DO $$ BEGIN
  CREATE TRIGGER trg_crm_whatsapp_instances_set_updated_at
    BEFORE UPDATE ON public.crm_whatsapp_instances
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN undefined_function THEN
  CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $f$
  BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
  $f$ LANGUAGE plpgsql;
  CREATE TRIGGER trg_crm_whatsapp_instances_set_updated_at
    BEFORE UPDATE ON public.crm_whatsapp_instances
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_crm_messages_set_updated_at
    BEFORE UPDATE ON public.crm_messages
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =================== RLS (alinhado com demais crm_*) ====================

ALTER TABLE public.crm_whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "crm_whatsapp_instances_select" ON public.crm_whatsapp_instances FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "crm_whatsapp_instances_insert" ON public.crm_whatsapp_instances FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "crm_whatsapp_instances_update" ON public.crm_whatsapp_instances FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "crm_whatsapp_instances_delete" ON public.crm_whatsapp_instances FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_messages_select" ON public.crm_messages FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "crm_messages_insert" ON public.crm_messages FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "crm_messages_update" ON public.crm_messages FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "crm_messages_delete" ON public.crm_messages FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =================== Realtime ====================

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_whatsapp_instances;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =================== Comments ====================

COMMENT ON TABLE public.crm_whatsapp_instances IS
  'Instância Evolution API por vendedor. Estado da conexão e QR code do escaneio.';
COMMENT ON COLUMN public.crm_whatsapp_instances.instance_name IS
  'Nome da instância na Evolution API (path /instance/<instance_name>).';
COMMENT ON COLUMN public.crm_whatsapp_instances.qr_code IS
  'Base64 do QR atual. Zerado apos status=connected. Renovado a cada qrcode.updated do webhook.';

COMMENT ON TABLE public.crm_messages IS
  'Inbox WhatsApp. Mensagens enviadas e recebidas via Evolution API. Liga a contato (conhecido) ou prospect (inbound desconhecido).';
COMMENT ON COLUMN public.crm_messages.evolution_message_id IS
  'ID retornado pela Evolution. UNIQUE pra dedup de webhooks repetidos.';
COMMENT ON COLUMN public.crm_messages.source IS
  'manual = vendedor digitou no inbox. automation = disparada por crm_automations. reply = resposta inbound. broadcast = futuro disparo em massa.';
COMMENT ON COLUMN public.crm_messages.media_url IS
  'URL na Evolution API. MVP nao espelha no Supabase Storage; risco: perde mídia se servidor Evolution morrer.';


-- ===== 047_crm_prospects_whatsapp_unique.sql =============================================
-- ============================================================
-- 047_crm_prospects_whatsapp_unique.sql
--
-- Previne duplicatas de prospects criados via webhook WhatsApp quando
-- multiplas mensagens chegam simultaneamente (race condition no
-- evolution-webhook ao criar prospect inbound).
--
-- Indice unique parcial: garante que so existe 1 prospect ativo por
-- (phone) entre os com source='whatsapp_inbound'.
--
-- Idempotente.
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_prospects_whatsapp_phone
  ON public.crm_prospects(phone)
  WHERE source = 'whatsapp_inbound' AND deleted_at IS NULL;

COMMENT ON INDEX public.uq_crm_prospects_whatsapp_phone IS
  'Previne duplicatas em prospects inbound do WhatsApp (race condition no webhook).';


-- ===== 048_crm_avatar_url.sql =============================================
-- ============================================================
-- 048_crm_avatar_url.sql
--
-- Adiciona avatar_url em crm_contacts e crm_prospects para guardar
-- a URL da foto de perfil (ex: WhatsApp profile picture).
--
-- Observacao: URLs do WhatsApp (pps.whatsapp.net) tem expiracao
-- (~7 dias). MVP guarda direto; quando quebrar, o webhook refaz fetch
-- na proxima mensagem do contato. Ideal futuro: espelhar no Supabase
-- Storage.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_prospects
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.crm_prospects.avatar_url IS
  'Foto de perfil (ex: WhatsApp). URL externa que pode expirar.';
COMMENT ON COLUMN public.crm_contacts.avatar_url IS
  'Foto de perfil (ex: WhatsApp). URL externa que pode expirar.';


-- ===== 049_crm_whatsapp_media_storage.sql =============================================
-- ============================================================
-- 049_crm_whatsapp_media_storage.sql
--
-- Bucket Storage 'crm-whatsapp-media' pra hospedar midia enviada
-- pelo CRM no Inbox WhatsApp. A WAHA precisa de URL publica pra
-- enviar midia; usar Storage proprio evita dependencia de servicos
-- externos e da URL persistente (vs WhatsApp CDN que expira).
--
-- Bucket publico (qualquer um com URL pode ler). Acesso controlado
-- por obscuridade do path (UUID no nome do arquivo).
--
-- Idempotente.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'crm-whatsapp-media',
  'crm-whatsapp-media',
  true,
  52428800, -- 50MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/webm',
    'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policies: usuario autenticado le e escreve no bucket
DO $$ BEGIN
  CREATE POLICY "crm_wa_media_select"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'crm-whatsapp-media');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_wa_media_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'crm-whatsapp-media' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_wa_media_delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'crm-whatsapp-media' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ===== 050_crm_lead_daily_reports.sql =============================================
-- ============================================================
-- 050_crm_lead_daily_reports.sql
--
-- Relato diário por lead. O vendedor escreve, no painel da Agenda,
-- uma observação sobre cada lead que atendeu no dia ("o que rolou
-- com a Acme hoje"). No fim do dia, a página de Relatório Diário
-- junta todos os relatos + os dados do dia (ligações, mensagens,
-- atividades) num documento consolidado.
--
-- Um relato por (lead, dia, autor). lead_key = '<dealId>:<contactId>'
-- (um dos dois pode faltar) é preenchido pelo service e serve de
-- chave estável pro upsert, já que deal_id/contact_id são nullable.
--
-- Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.crm_lead_daily_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Chave estável do lead pro upsert: '<deal_id>:<contact_id>'
  lead_key      TEXT NOT NULL,
  deal_id       UUID REFERENCES public.crm_deals(id)    ON DELETE CASCADE,
  contact_id    UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,

  -- Dia do relato (data local do vendedor) + conteúdo escrito
  report_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  content       TEXT NOT NULL DEFAULT '',

  -- Audit
  created_by    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Um relato por lead/dia/autor (chave do upsert)
CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_lead_daily_reports
  ON public.crm_lead_daily_reports(lead_key, report_date, created_by);

-- Busca da página de relatório: "relatos de tal dia (deste autor)"
CREATE INDEX IF NOT EXISTS idx_crm_lead_daily_reports_date
  ON public.crm_lead_daily_reports(report_date, created_by);

-- Trigger updated_at (usa função existente do projeto; fallback se faltar)
DO $$ BEGIN
  CREATE TRIGGER trg_crm_lead_daily_reports_set_updated_at
    BEFORE UPDATE ON public.crm_lead_daily_reports
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN undefined_function THEN
  CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $f$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $f$ LANGUAGE plpgsql;

  CREATE TRIGGER trg_crm_lead_daily_reports_set_updated_at
    BEFORE UPDATE ON public.crm_lead_daily_reports
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
WHEN duplicate_object THEN NULL;
END $$;

-- RLS (alinhado com as demais tabelas crm_*)
ALTER TABLE public.crm_lead_daily_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "crm_lead_daily_reports_select" ON public.crm_lead_daily_reports FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_lead_daily_reports_insert" ON public.crm_lead_daily_reports FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_lead_daily_reports_update" ON public.crm_lead_daily_reports FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_lead_daily_reports_delete" ON public.crm_lead_daily_reports FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Realtime (idempotente)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_lead_daily_reports;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON TABLE public.crm_lead_daily_reports IS
  'Relato diário escrito pelo vendedor sobre cada lead atendido. Consolidado na página de Relatório Diário.';
COMMENT ON COLUMN public.crm_lead_daily_reports.lead_key IS
  'Chave estável do lead: ''<deal_id>:<contact_id>''. Preenchida pelo service; base do upsert (deal_id/contact_id são nullable).';


-- ===== 051_crm_activity_google_task.sql =============================================
-- ============================================================
-- 051_crm_activity_google_task.sql
--
-- Atividades do tipo "tarefa" (ligação, mensagem, e-mail, follow-up, tarefa)
-- passam a sincronizar com o Google Tasks (não com o Calendar). Guardamos o
-- id da tarefa no Google pra propagar edição/conclusão/exclusão.
--
-- Atividades do tipo "evento" (reunião, visita, almoço) continuam usando
-- agenda_event_id (Google Calendar).
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_activities
  ADD COLUMN IF NOT EXISTS google_task_id TEXT;

COMMENT ON COLUMN public.crm_activities.google_task_id IS
  'Id da tarefa no Google Tasks (atividades kind=task). Eventos usam agenda_event_id (Google Calendar).';


-- ===== 052_crm_activities_type_message.sql =============================================
-- ============================================================
-- 052_crm_activities_type_message.sql
--
-- O CHECK de crm_activities.type não conhecia o tipo 'message' (Mensagem),
-- adicionado quando separamos Tarefa × Evento. INSERTs de atividade tipo
-- Mensagem batiam no constraint e caíam no fallback offline ("Salvo
-- localmente"). Recria o CHECK com todos os tipos atuais.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_activities
  DROP CONSTRAINT IF EXISTS crm_activities_type_check;

ALTER TABLE public.crm_activities
  ADD CONSTRAINT crm_activities_type_check
  CHECK (type IN ('call', 'email', 'message', 'meeting', 'task', 'lunch', 'visit', 'follow_up'));


-- ===== 052_os_templates_checklist.sql =============================================
-- ============================================================
-- 052. OS_TEMPLATES: coluna `checklist` (estrutura de tarefas + briefings)
-- ------------------------------------------------------------
-- Permite salvar uma O.S. inteira como MODELO: grupos + tarefas +
-- o briefing de cada tarefa. Ao aplicar o modelo numa O.S. nova,
-- a estrutura inteira vem pronta (so renomear/ajustar).
--
-- Idempotente: pode rodar mais de uma vez sem erro.
-- ============================================================

ALTER TABLE public.os_templates
  ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb;


-- ===== 053_crm_deal_mrr.sql =============================================
-- ============================================================
-- 053_crm_deal_mrr.sql
--
-- Adiciona `mrr` (mensalidade / receita recorrente mensal) em crm_deals.
--
-- Contexto: o Fyness e SaaS. O campo `value` continua sendo o VALOR TOTAL
-- DO CONTRATO (ex: 12x a mensalidade, setups, etc.). `mrr` e a parcela
-- recorrente mensal — base pra metrica de "MRR novo": soma do mrr dos
-- negocios GANHOS no mes.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_deals
  ADD COLUMN IF NOT EXISTS mrr NUMERIC;

COMMENT ON COLUMN public.crm_deals.mrr IS
  'Receita recorrente mensal (mensalidade) do negocio. value = contrato total; mrr = parcela mensal. Base pra "MRR novo".';


-- ===== 053_close_weekly_os_cron.sql =============================================
-- ============================================================
-- 053_close_weekly_os_cron.sql
--
-- Fecha automaticamente a O.S. da SEMANA toda sexta-feira às 18h (horário de
-- Brasília). A O.S. semanal (a que tem week_start preenchido) da semana corrente
-- vira status 'done' com actual_end = agora.
--
-- O "mega relatório da semana" (união dos diários) e o mensal (união das
-- semanais) NÃO precisam de snapshot: são reconstruídos dinamicamente dos relatos
-- salvos, e como o histórico passado não muda, o relatório de uma semana/mês
-- fechado fica idêntico pra sempre. Ou seja: nada se perde.
--
-- Requer a extensão pg_cron. No Supabase: Database > Extensions > habilite
-- "pg_cron" (ou rode o CREATE EXTENSION abaixo, que é idempotente).
--
-- Brasil é UTC-3 o ano todo (sem horário de verão), então 18:00 BRT = 21:00 UTC.
--
-- Idempotente: pode rodar de novo sem duplicar o agendamento.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ---------- Função: fecha a O.S. da semana corrente ----------
-- Segunda-feira da semana atual no fuso de Brasília → casa com o week_start
-- que o app grava (segunda local). Fecha só as que ainda estão abertas.
CREATE OR REPLACE FUNCTION public.close_weekly_os()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count  integer;
  v_monday date := date_trunc('week', (now() AT TIME ZONE 'America/Sao_Paulo'))::date;
BEGIN
  UPDATE public.os_orders
     SET status     = 'done',
         actual_end = COALESCE(actual_end, now()),
         updated_at = now()
   WHERE week_start = v_monday
     AND status IN ('available', 'in_progress');
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'close_weekly_os: % O.S. fechada(s) da semana %', v_count, v_monday;
  RETURN v_count;
END;
$$;

-- ---------- Agendamento: toda sexta 18:00 BRT (21:00 UTC) ----------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'close-weekly-os') THEN
    PERFORM cron.unschedule('close-weekly-os');
  END IF;
END $$;

SELECT cron.schedule(
  'close-weekly-os',
  '0 21 * * 5',                 -- minuto 0, hora 21 UTC, qualquer dia/mês, sexta (5)
  $$ SELECT public.close_weekly_os(); $$
);

-- ---------- Como testar agora (sem esperar sexta) ----------
-- Rode manualmente e veja quantas fecharam:
--   SELECT public.close_weekly_os();
-- Ver o job agendado:
--   SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'close-weekly-os';


-- ===== 054_os_uploads_storage.sql =============================================
-- ============================================================
-- 054_os_uploads_storage.sql
--
-- Bucket Storage 'os-uploads' pra hospedar imagens (prints/fotos)
-- coladas nos briefings e nas entregas das tarefas de O.S.
--
-- Antes, cada print virava base64 DENTRO de os_orders.checklist (JSONB),
-- inchando o registro: payload pesado a cada save, refetch lento,
-- mensagem de realtime descartada por estourar o teto de payload.
-- Agora a imagem vai pro Storage e o checklist guarda so a URL (leve).
--
-- Bucket publico (qualquer um com a URL le). Acesso por obscuridade do
-- path (UUID no nome do arquivo) — mesmo padrao do bucket do CRM.
--
-- Idempotente. Rode no Supabase -> SQL Editor.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'os-uploads',
  'os-uploads',
  true,
  10485760, -- 10MB
  -- Formatos reais de print/foto. SVG fica de FORA de proposito: bucket publico
  -- + SVG = vetor de XSS (SVG carrega <script>). Print nunca e SVG.
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'image/heic', 'image/heif', 'image/bmp', 'image/avif'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policies: leitura publica (bucket publico) e escrita/exclusao por autenticado.
DO $$ BEGIN
  CREATE POLICY "os_uploads_select"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'os-uploads');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "os_uploads_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'os-uploads' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "os_uploads_delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'os-uploads' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ===== 055_crm_activities_responsavel.sql =============================================
-- ============================================================
-- 055_crm_activities_responsavel.sql
--
-- Atribuição por tarefa: quem é o RESPONSÁVEL por executar a atividade
-- (pode ser diferente de quem criou) + quem concluiu.
--
-- assigned_to      = id do responsável (auth user / team member). Sem FK de
--                    propósito (id pode vir de auth.users ou team_members).
-- assigned_to_name = nome do responsável (denormalizado, p/ exibir sem join).
-- completed_by     = quem marcou como concluída.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_activities ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE public.crm_activities ADD COLUMN IF NOT EXISTS assigned_to_name TEXT;
ALTER TABLE public.crm_activities ADD COLUMN IF NOT EXISTS completed_by UUID;

COMMENT ON COLUMN public.crm_activities.assigned_to IS
  'Responsável por executar a tarefa (pode diferir de created_by). Usado na atribuição por tarefa da O.S. comercial.';


-- ===== 055_commercial_plan_actions.sql =============================================
-- ============================================================
-- 055_commercial_plan_actions.sql
--
-- Checklist de execucao do plano comercial (5W1H / kanban das 5 fases).
-- Guarda quais passos do "COMO" de cada fase ja foram concluidos.
--
-- Estado compartilhado (todo mundo ve o mesmo progresso). O id e a chave
-- estavel do passo (ex: 'f1-0'), definida no codigo (commercialPlanActions.js).
--
-- Idempotente. Rode no Supabase -> SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.commercial_plan_actions (
  id          text PRIMARY KEY,
  done        boolean NOT NULL DEFAULT false,
  done_by     text,
  done_at     timestamptz,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.commercial_plan_actions ENABLE ROW LEVEL SECURITY;

-- RLS aberto (mesmo padrao do resto do app).
DO $$ BEGIN
  CREATE POLICY "commercial_plan_actions_all"
    ON public.commercial_plan_actions
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ===== 056_crm_activities_delivery_report.sql =============================================
-- ============================================================
-- 056_crm_activities_delivery_report.sql
--
-- Relatório de ENTREGA por TAREFA (não mais por lead/dia). Cada tarefa tem o
-- seu relato de entrega — atribuído ao lead (deal_id/contact_id) E à tarefa.
-- Outro dia / outra tarefa do mesmo lead = outro relatório de entrega.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_activities ADD COLUMN IF NOT EXISTS delivery_report TEXT;

COMMENT ON COLUMN public.crm_activities.delivery_report IS
  'Relatório de entrega da tarefa (o que foi feito). Preenchido ao concluir. Vira a "Entrega" da tarefa na O.S. comercial e agrupa por lead no relatório.';


-- ===== 057_crm_report_closings.sql =============================================
-- ============================================================
-- 057_crm_report_closings.sql
--
-- Fechamento de relatório comercial por período. Quando o vendedor
-- (ou gestor) "fecha" o dia / a semana / o mês na página de Arquivos,
-- grava-se uma linha aqui: marca o período como entregue, com a data
-- do fechamento e um resumo (snapshot das métricas no momento).
--
-- O CONTEÚDO do relatório continua sendo montado na hora a partir da
-- agenda (crm_activities + crm_lead_daily_reports). Esta tabela só
-- registra o "marco" de fechamento (quando/quem) — não substitui os dados.
--
-- owner_id    = dono do relatório (auth_user_id do vendedor)
-- period      = 'daily' | 'weekly' | 'monthly'
-- period_key  = 'YYYY-MM-DD' (dia ou segunda da semana) | 'YYYY-MM' (mês)
--
-- Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.crm_report_closings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id    UUID NOT NULL,
  period      TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  period_key  TEXT NOT NULL,

  -- Snapshot resumido das métricas no momento do fechamento (reuniões, vendas, etc.)
  summary     JSONB,

  -- Audit
  closed_by   UUID,
  closed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Um fechamento por (dono, período, chave) — base do upsert
CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_report_closings
  ON public.crm_report_closings(owner_id, period, period_key);

-- Listar fechamentos de um dono
CREATE INDEX IF NOT EXISTS idx_crm_report_closings_owner
  ON public.crm_report_closings(owner_id, period);

-- Trigger updated_at (usa função existente do projeto; fallback se faltar)
DO $$ BEGIN
  CREATE TRIGGER trg_crm_report_closings_set_updated_at
    BEFORE UPDATE ON public.crm_report_closings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN undefined_function THEN
  CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $f$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $f$ LANGUAGE plpgsql;

  CREATE TRIGGER trg_crm_report_closings_set_updated_at
    BEFORE UPDATE ON public.crm_report_closings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
WHEN duplicate_object THEN NULL;
END $$;

-- RLS (alinhado com as demais tabelas crm_*)
ALTER TABLE public.crm_report_closings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "crm_report_closings_select" ON public.crm_report_closings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_report_closings_insert" ON public.crm_report_closings FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_report_closings_update" ON public.crm_report_closings FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_report_closings_delete" ON public.crm_report_closings FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Realtime (idempotente)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_report_closings;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON TABLE public.crm_report_closings IS
  'Marco de fechamento do relatório comercial (dia/semana/mês) por dono. Conteúdo segue dinâmico da agenda; aqui só registra quando/quem fechou + resumo.';


-- ===== 058_task_completions.sql =============================================
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


-- ===== 059_task_completions_quality.sql =============================================
-- ============================================================
-- 059_task_completions_quality.sql
--
-- Qualidade MANUAL por tarefa: o supervisor da O.S. preenche um checklist de
-- critérios (cada um com peso) ao revisar a tarefa. Guardamos a nota de
-- qualidade (0–100) e as respostas, em cima da base de produtividade.
--
-- quality_pct      = pontos obtidos ÷ aplicáveis × 100 (null se não avaliado)
-- quality_answers  = { criterioId: 'sim'|'nao'|'na' }
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.task_completions ADD COLUMN IF NOT EXISTS quality_pct integer;
ALTER TABLE public.task_completions ADD COLUMN IF NOT EXISTS quality_answers jsonb;

COMMENT ON COLUMN public.task_completions.quality_pct IS
  'Nota de qualidade da tarefa (0–100) vinda do checklist manual do supervisor.';
COMMENT ON COLUMN public.task_completions.quality_answers IS
  'Respostas do checklist de qualidade: { criterioId: sim|nao|na }.';


-- ===== 061_close_daily_os_midnight.sql =============================================
-- ============================================================
-- 061_close_daily_os_midnight.sql
--
-- NOVO MODELO de fechamento da O.S. (substitui o semanal de sexta):
--   • A O.S. fecha no FIM DO DIA — todo dia à MEIA-NOITE (00:00 BRT).
--   • A SEMANA é a junção dos dias  → fecha sozinha quando o último dia dela fecha.
--   • O MÊS é a junção das semanas   → fecha sozinho quando a última semana fecha.
-- Ou seja: existe UM cron só (diário). Semana e mês não têm cron próprio.
--
-- O que o cron faz à meia-noite: fecha (status 'done') toda O.S. ainda aberta
-- cujo período JÁ TERMINOU — week_end já passou (ou, na falta dele, o
-- sla_deadline). Assim cada O.S. fecha assim que o dia/semana dela acaba, e o
-- relatório do dia/semana/mês fica congelado por consequência.
--
-- Aposenta o cron antigo 'close-weekly-os' (053 / 060, sexta 18h → sáb 00:00).
-- A função public.close_weekly_os() fica no banco (inofensiva), só sem job.
--
-- Brasil é UTC-3 o ano todo → 00:00 BRT = 03:00 UTC.
-- Idempotente: pode rodar de novo sem duplicar nada.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ---------- Função: fecha toda O.S. cujo período já terminou ----------
CREATE OR REPLACE FUNCTION public.close_due_os()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_today date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
BEGIN
  UPDATE public.os_orders
     SET status     = 'done',
         actual_end = COALESCE(actual_end, now()),
         updated_at = now()
   WHERE status IN ('available', 'in_progress')
     -- período encerrado: o fim da semana coberta (ou o prazo SLA) já passou
     AND COALESCE(week_end, (sla_deadline AT TIME ZONE 'America/Sao_Paulo')::date) < v_today;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'close_due_os: % O.S. fechada(s) até %', v_count, v_today;
  RETURN v_count;
END;
$$;

-- ---------- Aposenta o cron semanal antigo ----------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'close-weekly-os') THEN
    PERFORM cron.unschedule('close-weekly-os');
  END IF;
END $$;

-- ---------- Agendamento: todo dia 00:00 BRT (03:00 UTC) ----------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'close-daily-os') THEN
    PERFORM cron.unschedule('close-daily-os');
  END IF;
END $$;

SELECT cron.schedule(
  'close-daily-os',
  '0 3 * * *',                  -- minuto 0, hora 3 UTC, todo dia = 00:00 BRT
  $$ SELECT public.close_due_os(); $$
);

-- ---------- Como testar / conferir ----------
-- Rodar agora e ver quantas fecharam:
--   SELECT public.close_due_os();
-- Ver os jobs (deve ter só 'close-daily-os'; 'close-weekly-os' não deve aparecer):
--   SELECT jobname, schedule, active FROM cron.job WHERE jobname LIKE 'close-%-os';


-- ===== 062_crm_deal_source.sql =============================================
-- ============================================================
-- 062_crm_deal_source.sql
--
-- Adiciona `source` (origem do lead) em crm_deals.
--
-- Contexto: substitui o uso de "uma pipeline por canal" (Outbound Manual,
-- Parceiros, Leads de Parceiros) por UMA pipeline de Vendas + este campo de
-- origem. Permite cruzar conversao por canal no relatorio comercial sem
-- fragmentar o funil em varias pipelines.
--
-- Texto livre (com sugestoes na UI: Prospeccao ativa, Indicacao de contador,
-- Trafego pago, Indicacao/WhatsApp, Indicacao de parceiro, ...). Fica livre
-- de proposito pra o time escrever a propria origem.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_deals
  ADD COLUMN IF NOT EXISTS source TEXT;

COMMENT ON COLUMN public.crm_deals.source IS
  'Origem do lead (canal de aquisicao). Texto livre com sugestoes na UI. Base pra analise de conversao por canal no relatorio comercial.';


-- ===== 063_os_judge.sql =============================================
-- ============================================================
-- 063_os_judge.sql
--
-- Adiciona `judge` (Juiz) em os_orders.
--
-- Contexto: terceira pessoa NEUTRA que arbitra a contestação de nota de
-- qualidade. Hoje quem resolve a contestação é o próprio supervisor (juiz em
-- causa própria) ou um gestor. Com o Juiz designado por O.S., a decisão da
-- contestação sai do supervisor e vai pro Juiz — ele vê os 2 lados (nota +
-- justificativa do supervisor × contestação do executor) e decide: mantém a
-- nota ou dá uma nota nova.
--
-- Mesmo formato do `supervisor`: texto com nomes separados por vírgula.
-- Idempotente.
-- ============================================================

ALTER TABLE public.os_orders
  ADD COLUMN IF NOT EXISTS judge TEXT;

COMMENT ON COLUMN public.os_orders.judge IS
  'Juiz da O.S. (nomes separados por vírgula). Arbitra a contestação de nota de qualidade — neutro entre supervisor e executor.';


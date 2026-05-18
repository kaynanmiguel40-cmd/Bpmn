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

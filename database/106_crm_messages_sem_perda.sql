-- 106 — o inbox para de perder mensagem e para de embaralhar a ordem.
--
-- Dois problemas distintos que se pareciam com um so ("as mensagens somem, e
-- quando nao somem chegam fora de ordem"):
--
-- 1. PERDA. O webhook descartava mensagem com um `continue` e respondia 200 pra
--    Evolution — que entao nunca reenviava. Tudo que o parser nao reconhecia
--    (mensagem temporaria, ver-uma-vez, localizacao, enquete...) e tudo que
--    falhava no espelhamento de midia sumia sem deixar rastro em lugar nenhum.
--    Nao dava nem pra saber QUANTO tinha sido perdido.
--
--    `crm_webhook_dead_letter` e esse rastro. Todo evento que o webhook nao
--    conseguir transformar em mensagem cai aqui com o payload cru. Nao e log:
--    e a fila do que precisa ser reprocessado depois que a causa for corrigida.
--
-- 2. DESORDEM. As tres queries de leitura ordenavam so por `sent_at`. Esse
--    campo vem do `messageTimestamp` do WhatsApp, que tem precisao de SEGUNDO —
--    entao toda rajada de mensagens empata, e ORDER BY com empate no Postgres
--    devolve ordem indefinida: a conversa se reorganiza sozinha entre um reload
--    e outro (e a cada UPDATE que reescreve a tupla, tipo marcar como lida).
--
--    `created_at` sempre esteve na linha: NOW() do servidor, microssegundo,
--    monotonico, imune ao relogio do celular do lead. Era so ninguem usar.
--    Agora ele desempata, e `id` desempata o desempate. Os indices abaixo
--    existem pra que essa ordenacao de 3 chaves nao vire sort em disco.

-- =================== 1. Dead-letter da ingestao ====================

CREATE TABLE IF NOT EXISTS public.crm_webhook_dead_letter (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- De onde veio (nome da instancia na Evolution; texto porque o evento pode
  -- chegar antes da instancia estar registrada em crm_whatsapp_instances)
  instance_name          TEXT,

  -- Chave da mensagem na Evolution. Permite casar com crm_messages depois do
  -- reprocessamento e evitar reprocessar duas vezes.
  evolution_message_id   TEXT,

  -- Por que nao virou mensagem: 'unsupported_type', 'media_mirror_failed',
  -- 'no_link', 'insert_failed', 'no_phone', 'reaction', 'protocol'
  reason                 TEXT NOT NULL,

  -- Detalhe legivel (mensagem de erro do insert, tipo nao reconhecido, etc)
  detail                 TEXT,

  -- Payload CRU do evento. E o unico lugar onde o conteudo original sobrevive:
  -- sem ele o reprocessamento seria impossivel.
  payload                JSONB NOT NULL,

  -- Reprocessamento: null = pendente. Preenchido quando virou mensagem.
  resolved_at            TIMESTAMPTZ,
  resolved_message_id    UUID REFERENCES public.crm_messages(id) ON DELETE SET NULL,

  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A fila de trabalho: o que ainda nao foi reprocessado, mais antigo primeiro.
CREATE INDEX IF NOT EXISTS idx_crm_webhook_dead_letter_pendentes
  ON public.crm_webhook_dead_letter (created_at)
  WHERE resolved_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_crm_webhook_dead_letter_reason
  ON public.crm_webhook_dead_letter (reason, created_at DESC);

-- Casar dead-letter com a mensagem que eventualmente entrou.
CREATE INDEX IF NOT EXISTS idx_crm_webhook_dead_letter_msg_id
  ON public.crm_webhook_dead_letter (evolution_message_id)
  WHERE evolution_message_id IS NOT NULL;

ALTER TABLE public.crm_webhook_dead_letter ENABLE ROW LEVEL SECURITY;

-- Alinhado com o resto do modulo crm_* (policies permissivas; o acesso e
-- controlado na aplicacao). Escrita e feita pela edge function com service
-- role, que ignora RLS de qualquer forma — a policy de insert existe pro caso
-- de reprocessamento manual pelo painel.
DO $$ BEGIN
  CREATE POLICY "crm_webhook_dead_letter_select" ON public.crm_webhook_dead_letter
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "crm_webhook_dead_letter_insert" ON public.crm_webhook_dead_letter
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "crm_webhook_dead_letter_update" ON public.crm_webhook_dead_letter
    FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON TABLE public.crm_webhook_dead_letter IS
  'Eventos da Evolution que o webhook nao conseguiu transformar em crm_messages. Fila de reprocessamento, nao log: o payload cru e a unica copia do conteudo original.';

-- =================== 2. Ordenacao deterministica ====================

-- Substituem idx_crm_messages_contact_sent / _prospect_sent: mesmo prefixo
-- (contact_id, sent_at DESC), entao servem pra tudo que o antigo servia, mais
-- o desempate. Os antigos ficam — sao pequenos e o planner escolhe sozinho.
CREATE INDEX IF NOT EXISTS idx_crm_messages_contact_ordem
  ON public.crm_messages (contact_id, sent_at DESC, created_at DESC, id DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_crm_messages_prospect_ordem
  ON public.crm_messages (prospect_id, sent_at DESC, created_at DESC, id DESC)
  WHERE deleted_at IS NULL;

-- A listagem do inbox varre a tabela inteira ordenada por sent_at (janela
-- global). Sem esse indice o desempate por 3 chaves vira sort em disco.
CREATE INDEX IF NOT EXISTS idx_crm_messages_ordem_global
  ON public.crm_messages (sent_at DESC, created_at DESC, id DESC)
  WHERE deleted_at IS NULL;

COMMENT ON COLUMN public.crm_messages.sent_at IS
  'Timestamp do WhatsApp (precisao de SEGUNDO) no inbound; NOW() do servidor no outbound enviado pelo CRM. Empata com frequencia — NUNCA ordene so por ele: use (sent_at, created_at, id).';
COMMENT ON COLUMN public.crm_messages.created_at IS
  'NOW() do servidor no momento do insert. E o unico relogio monotonico e confiavel da linha: usado como desempate da ordem de exibicao.';

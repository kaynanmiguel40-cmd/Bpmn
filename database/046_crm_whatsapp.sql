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
  team_member_id  UUID REFERENCES public.team_members(id) ON DELETE SET NULL,

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

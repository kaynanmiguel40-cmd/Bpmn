-- 108 — a conversa passa a ser (com quem + por qual numero), nao so (com quem).
--
-- Ate agora a conversa era chaveada so pelo interlocutor. Quando o mesmo lead
-- falava com os DOIS numeros da empresa, as duas linhas viravam uma thread so,
-- exibida sob o numero que tivesse falado por ultimo. Na pratica: o vendedor
-- mandava audio pelo fyness-principal e ele aparecia dentro da conversa da
-- lorena-consultora. "Caiu no numero errado" — e caiu mesmo, so que na tela,
-- porque no banco a mensagem sempre soube de qual instancia veio.
--
-- Pior que a confusao visual: a resposta saia pela instancia da ULTIMA mensagem
-- da thread misturada. Responder o que chegou num numero podia sair pelo outro,
-- do nada, sem ninguem escolher isso.
--
-- Sao 4 conversas de 140 hoje — mas sao as 4 mais movimentadas (885 mensagens,
-- um terco de todo o volume). Nao e caso de borda: e onde o trabalho acontece.
--
-- Agora cada numero tem a sua thread, que e como o WhatsApp funciona: duas
-- linhas telefonicas sao duas caixas de entrada. Responder na thread do
-- principal sai pelo principal, sempre.

CREATE OR REPLACE FUNCTION public.crm_inbox_conversations(
  p_limit          integer DEFAULT 100,
  p_offset         integer DEFAULT 0,
  p_instance_phone text    DEFAULT NULL,
  p_owner_auth_id  uuid    DEFAULT NULL,
  p_owner_member_id text   DEFAULT NULL
)
RETURNS TABLE (
  conversa_key       text,
  contact_id         uuid,
  prospect_id        uuid,
  instance_id        uuid,
  instance_phone     text,
  instance_name      text,
  other_name         text,
  other_phone        text,
  avatar_color       text,
  avatar_url         text,
  owner_auth_user_id uuid,
  owner_member_id    text,
  last_message       text,
  last_direction     text,
  last_at            timestamptz,
  last_status        text,
  unread_count       bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH ultimas AS (
    -- A chave ganhou instance_id. O DISTINCT ON precisa casar com o PREFIXO do
    -- ORDER BY, entao os dois carregam o par (interlocutor, instancia).
    SELECT DISTINCT ON (COALESCE(m.contact_id::text, m.prospect_id::text), m.instance_id)
           COALESCE(m.contact_id::text, m.prospect_id::text) AS chave,
           m.*
    FROM public.crm_messages m
    WHERE m.deleted_at IS NULL
    ORDER BY COALESCE(m.contact_id::text, m.prospect_id::text), m.instance_id,
             m.sent_at DESC, m.created_at DESC, m.id DESC
  ),
  nao_lidas AS (
    -- Contagem tambem por par: o badge da thread do principal nao pode somar
    -- as nao-lidas que chegaram na thread da consultora.
    SELECT COALESCE(m.contact_id::text, m.prospect_id::text) AS chave,
           m.instance_id,
           COUNT(*) AS total
    FROM public.crm_messages m
    WHERE m.deleted_at IS NULL
      AND m.direction = 'inbound'
      AND m.status <> 'read'
    GROUP BY 1, 2
  )
  SELECT
    -- A chave carrega a instancia: e o que o front usa pra saber qual linha da
    -- lista esta aberta, e duas threads do mesmo lead nao podem colidir.
    (CASE WHEN u.contact_id IS NOT NULL
          THEN 'c:' || u.contact_id::text
          ELSE 'p:' || u.prospect_id::text END)
      || ':' || COALESCE(u.instance_id::text, '-')       AS conversa_key,
    u.contact_id,
    u.prospect_id,
    u.instance_id,
    i.phone_number                                       AS instance_phone,
    i.instance_name,
    COALESCE(c.name, p.contact_name, p.company_name,
             CASE WHEN u.direction = 'inbound' THEN u.from_phone ELSE u.to_phone END)
                                                         AS other_name,
    COALESCE(c.phone, p.phone,
             CASE WHEN u.direction = 'inbound' THEN u.from_phone ELSE u.to_phone END)
                                                         AS other_phone,
    c.avatar_color,
    COALESCE(c.avatar_url, p.avatar_url)                 AS avatar_url,
    c.created_by                                         AS owner_auth_user_id,
    p.assigned_to                                        AS owner_member_id,
    COALESCE(u.content,
             CASE WHEN u.media_type IS NOT NULL THEN '[' || u.media_type || ']' ELSE '' END)
                                                         AS last_message,
    u.direction                                          AS last_direction,
    u.sent_at                                            AS last_at,
    u.status                                             AS last_status,
    COALESCE(n.total, 0)                                 AS unread_count
  FROM ultimas u
  LEFT JOIN public.crm_contacts            c ON c.id = u.contact_id  AND c.deleted_at IS NULL
  LEFT JOIN public.crm_prospects           p ON p.id = u.prospect_id AND p.deleted_at IS NULL
  LEFT JOIN public.crm_whatsapp_instances  i ON i.id = u.instance_id
  LEFT JOIN nao_lidas                      n ON n.chave = u.chave
                                            AND n.instance_id IS NOT DISTINCT FROM u.instance_id
  WHERE
    (p_instance_phone IS NULL OR i.phone_number = p_instance_phone)
    AND (
      (p_owner_auth_id IS NULL AND p_owner_member_id IS NULL)
      OR (p_owner_auth_id   IS NOT NULL AND c.created_by  = p_owner_auth_id)
      OR (p_owner_member_id IS NOT NULL AND p.assigned_to = p_owner_member_id)
    )
  ORDER BY u.sent_at DESC, u.created_at DESC, u.id DESC
  LIMIT  GREATEST(COALESCE(p_limit, 100), 1)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
$$;

COMMENT ON FUNCTION public.crm_inbox_conversations IS
  'Lista de conversas do inbox: uma linha por (interlocutor, instancia). O mesmo lead falando com dois numeros da empresa vira duas conversas — como no WhatsApp, onde duas linhas sao duas caixas de entrada.';

REVOKE EXECUTE ON FUNCTION public.crm_inbox_conversations(integer, integer, text, uuid, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.crm_inbox_conversations(integer, integer, text, uuid, text) TO authenticated;

-- Sustenta o DISTINCT ON novo (prefixo chave + instance_id) e o COUNT por par.
CREATE INDEX IF NOT EXISTS idx_crm_messages_conversa_instancia
  ON public.crm_messages ((COALESCE(contact_id::text, prospect_id::text)), instance_id,
                          sent_at DESC, created_at DESC, id DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_crm_messages_nao_lidas_instancia
  ON public.crm_messages ((COALESCE(contact_id::text, prospect_id::text)), instance_id)
  WHERE deleted_at IS NULL AND direction = 'inbound' AND status <> 'read';

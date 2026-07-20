-- 107 — a lista do inbox para de ser uma janela de 500 mensagens.
--
-- Como era: `getInboxConversations` pegava as ultimas `limit * 5` = 500
-- mensagens da tabela INTEIRA (as duas instancias, todos os contatos, todos os
-- prospects) e so entao agrupava por conversa no JavaScript.
--
-- O efeito disso nao e "a lista fica incompleta". E pior e mais confuso:
-- `limit = 100` nunca significou "100 conversas". Significava "as conversas que
-- tiverem ao menos uma mensagem entre as 500 mensagens mais recentes DO SISTEMA".
-- Um unico lead falante, mandando audios curtos, consumia a janela inteira e
-- empurrava todo mundo pra fora. A conversa aparecia hoje e sumia amanha sozinha,
-- sem ninguem mexer em nada — sem aviso, sem badge, sem nome na barra lateral.
-- O dado sempre esteve la; a lista e que nao alcancava.
--
-- Agora o agrupamento acontece onde ele deveria ter acontecido desde o inicio:
-- no banco. DISTINCT ON pega a ultima mensagem de cada conversa direto do
-- indice, e `limit` volta a significar conversas.
--
-- Dois ganhos que vem junto:
--
--   * unread deixa de ser estimativa. Antes so contava as nao-lidas que por
--     acaso cairam na janela — o badge subnotificava em silencio. Aqui o COUNT
--     roda sobre TODAS as mensagens da conversa.
--
--   * os filtros (numero, dono) sao aplicados ANTES do limit. No client eles
--     rodavam DEPOIS do truncamento, entao filtrar nunca recuperava nada:
--     so tirava mais linhas de uma lista ja cortada.
--
-- A ordenacao repete (sent_at, created_at, id) da migration 106 — pelo mesmo
-- motivo: sent_at tem precisao de segundo e empata o tempo todo, e com empate a
-- "ultima mensagem" escolhida era arbitraria. Era isso que fazia o preview da
-- conversa mostrar "oi" quando o lead tinha terminado com "quanto custa".

CREATE OR REPLACE FUNCTION public.crm_inbox_conversations(
  p_limit          integer DEFAULT 100,
  p_offset         integer DEFAULT 0,
  -- Telefone da instancia (aba "Fyness" / "Lorena"). NULL = todas.
  p_instance_phone text    DEFAULT NULL,
  -- Dono da conversa. Contato usa created_by (auth user id), prospect usa
  -- assigned_to (team_member id) — sao espacos de id diferentes, entao os dois
  -- sao aceitos e comparados cada um contra a sua coluna.
  p_owner_auth_id  uuid    DEFAULT NULL,
  -- text, nao uuid: crm_prospects.assigned_to e TEXT neste banco (verificado no
  -- information_schema do VPS). Declarar uuid aqui fazia a funcao nem ser criada.
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
  owner_auth_user_id uuid,          -- crm_contacts.created_by  e uuid
  owner_member_id    text,          -- crm_prospects.assigned_to e text
  last_message       text,
  last_direction     text,
  last_at            timestamptz,
  last_status        text,
  unread_count       bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER          -- respeita RLS de crm_messages, igual a query antiga
SET search_path = public
AS $$
  WITH ultimas AS (
    -- Uma linha por conversa: a mensagem mais recente. DISTINCT ON usa o mesmo
    -- prefixo dos indices de 106, entao isso e um index scan, nao um sort.
    SELECT DISTINCT ON (COALESCE(m.contact_id::text, m.prospect_id::text))
           COALESCE(m.contact_id::text, m.prospect_id::text) AS chave,
           m.*
    FROM public.crm_messages m
    WHERE m.deleted_at IS NULL
    ORDER BY COALESCE(m.contact_id::text, m.prospect_id::text),
             m.sent_at DESC, m.created_at DESC, m.id DESC
  ),
  nao_lidas AS (
    -- Contagem sobre TODAS as mensagens, nao so a janela recente.
    SELECT COALESCE(m.contact_id::text, m.prospect_id::text) AS chave,
           COUNT(*) AS total
    FROM public.crm_messages m
    WHERE m.deleted_at IS NULL
      AND m.direction = 'inbound'
      AND m.status <> 'read'
    GROUP BY 1
  )
  SELECT
    CASE WHEN u.contact_id IS NOT NULL
         THEN 'c:' || u.contact_id::text
         ELSE 'p:' || u.prospect_id::text END           AS conversa_key,
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
  WHERE
    -- Filtros ANTES do limit: e a diferenca entre filtrar e truncar.
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
  'Lista de conversas do inbox agrupada no banco (uma linha por contato/prospect). Substitui o agrupamento client-side que so enxergava as ultimas 500 mensagens globais. p_limit conta CONVERSAS.';

-- So authenticated: o inbox e tela logada.
--
-- O REVOKE nao e decorativo: o Postgres concede EXECUTE a PUBLIC em TODA funcao
-- criada, entao um GRANT sozinho nao restringe nada — apenas re-concede o que
-- PUBLIC (que inclui anon) ja tinha. Sem a linha de baixo, o comentario acima
-- seria mentira.
REVOKE EXECUTE ON FUNCTION public.crm_inbox_conversations(integer, integer, text, uuid, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.crm_inbox_conversations(integer, integer, text, uuid, text) TO authenticated;

-- Sustenta o DISTINCT ON e o COUNT de nao-lidas.
CREATE INDEX IF NOT EXISTS idx_crm_messages_conversa_ordem
  ON public.crm_messages ((COALESCE(contact_id::text, prospect_id::text)),
                          sent_at DESC, created_at DESC, id DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_crm_messages_inbound_nao_lidas
  ON public.crm_messages ((COALESCE(contact_id::text, prospect_id::text)))
  WHERE deleted_at IS NULL AND direction = 'inbound' AND status <> 'read';

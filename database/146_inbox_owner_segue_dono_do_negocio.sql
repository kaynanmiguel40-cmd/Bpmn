-- 146: o dono da conversa no Inbox segue o DONO DO NEGÓCIO do contato.
--
-- Sintoma: o filtro "Minhas" do inbox não mostrava as conversas do vendedor. Ao
-- reatribuir um lead (ex.: passar do Lhorena pro Kaua), o CRM troca o `owner_id`
-- do NEGÓCIO, mas o inbox resolvia o dono pelo `created_by` do CONTATO (quem criou)
-- — que continua sendo o antigo. Resultado: o Kaua via só 7 das 20 conversas dele.
--
-- Fix: owner_member_id passa a ser COALESCE(prospect.assigned_to, dono do negócio
-- do contato). Assim o inbox segue o mesmo dono do pipeline ("Meus leads"), e
-- qualquer reatribuição futura reflete sozinha. Fallback pro created_by continua
-- (o front usa owner_auth_user_id quando não há owner_member_id).

CREATE OR REPLACE FUNCTION public.crm_inbox_conversations(
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0,
  p_instance_phone text DEFAULT NULL::text,
  p_owner_auth_id uuid DEFAULT NULL::uuid,
  p_owner_member_id text DEFAULT NULL::text
)
RETURNS TABLE(conversa_key text, contact_id uuid, prospect_id uuid, instance_id uuid, instance_phone text, instance_name text, other_name text, other_phone text, avatar_color text, avatar_url text, owner_auth_user_id uuid, owner_member_id text, last_message text, last_direction text, last_at timestamp with time zone, last_status text, unread_count bigint)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  WITH ultimas AS (
    SELECT DISTINCT ON (COALESCE(m.contact_id::text, m.prospect_id::text), m.instance_id)
           COALESCE(m.contact_id::text, m.prospect_id::text) AS chave,
           m.*
    FROM public.crm_messages m
    WHERE m.deleted_at IS NULL
    ORDER BY COALESCE(m.contact_id::text, m.prospect_id::text), m.instance_id,
             m.sent_at DESC, m.created_at DESC, m.id DESC
  ),
  nao_lidas AS (
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
    -- Dono da conversa = dono do NEGÓCIO do contato (o inbox segue o dono do
    -- pipeline). Sem negócio, o assigned_to do prospect; sem isso, o front cai no
    -- created_by (owner_auth_user_id).
    COALESCE(
      p.assigned_to,
      (SELECT d.owner_id FROM public.crm_deals d
        WHERE d.contact_id = u.contact_id AND d.deleted_at IS NULL AND d.owner_id IS NOT NULL
        ORDER BY d.updated_at DESC NULLS LAST, d.created_at DESC
        LIMIT 1)
    )                                                    AS owner_member_id,
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
      OR (p_owner_member_id IS NOT NULL AND (
            p.assigned_to = p_owner_member_id
            OR EXISTS (SELECT 1 FROM public.crm_deals d
                        WHERE d.contact_id = u.contact_id AND d.deleted_at IS NULL
                          AND d.owner_id = p_owner_member_id)
          ))
    )
  ORDER BY u.sent_at DESC, u.created_at DESC, u.id DESC
  LIMIT  GREATEST(COALESCE(p_limit, 100), 1)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
$function$;

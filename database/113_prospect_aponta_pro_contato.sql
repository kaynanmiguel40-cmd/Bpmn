-- 113 — o vinculo passa a morar no PROSPECT, e todo numero que conversa ganha
-- contato no CRM.
--
-- O QUE A 112 NAO RESOLVEU. Ela religou as MENSAGENS existentes, mas o webhook
-- continua criando mensagem nova so com prospect_id. Resultado: a conversa do
-- Henrique partiu em duas — 56 mensagens sob o contato e 2 sob o prospect. Como
-- a lista ordena pela mais recente, a linha orfa ficou POR CIMA, e ele aparecia
-- duas vezes: uma certa e outra marcada "SEM CADASTRO".
--
-- Backfill nao conserta isso: cada mensagem nova reabre a mesma rachadura.
-- O vinculo tem que ficar num lugar que a mensagem nova herde sozinha — e esse
-- lugar e o prospect, que e quem o webhook ja encontra pelo telefone.
--
-- Com `crm_prospects.contact_id`, a mensagem pode chegar so com prospect_id que
-- a conversa ainda resolve pro contato (a RPC da migration 114 faz o coalesce).
--
-- E os que NAO tinham contato viram contato: sao leads reais conversando por
-- WhatsApp que so nao existiam no funil. Sem cadastro, o roteiro nao preenche o
-- [nome], o historico nao junta e a conversa nao vira negocio.

BEGIN;

ALTER TABLE crm_prospects
  ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES crm_contacts(id);

COMMENT ON COLUMN crm_prospects.contact_id IS
  'Contato do CRM que ESTE prospect representa. E o que deixa a conversa do WhatsApp achar o lead mesmo quando a mensagem so tem prospect_id.';

-- 1) Liga os que ja casam por telefone (mesma chave DDD + 8 finais da 112).
WITH d AS (
  SELECT p.id AS prospect_id,
    CASE WHEN length(regexp_replace(p.phone,'\D','','g')) >= 12
          AND left(regexp_replace(p.phone,'\D','','g'),2) = '55'
      THEN substr(regexp_replace(p.phone,'\D','','g'),3)
      ELSE regexp_replace(p.phone,'\D','','g') END AS dig
  FROM crm_prospects p WHERE p.deleted_at IS NULL AND p.contact_id IS NULL
),
pk AS (SELECT prospect_id, left(dig,2) || '-' || right(dig,8) AS k FROM d WHERE length(dig) BETWEEN 10 AND 11),
ck AS (
  SELECT c.id AS contact_id,
         left(regexp_replace(c.phone,'\D','','g'),2) || '-' || right(regexp_replace(c.phone,'\D','','g'),8) AS k
  FROM crm_contacts c
  WHERE c.deleted_at IS NULL AND length(regexp_replace(coalesce(c.phone,''),'\D','','g')) BETWEEN 10 AND 11
),
-- Telefone repetido entre dois contatos nao decide nada: melhor sem dono do que
-- no dono errado, porque o erro manda a resposta pra pessoa errada.
unico AS (SELECT k, min(contact_id::text)::uuid AS contact_id FROM ck GROUP BY k HAVING count(DISTINCT contact_id) = 1)
UPDATE crm_prospects p SET contact_id = u.contact_id
FROM pk JOIN unico u ON u.k = pk.k
WHERE p.id = pk.prospect_id;

-- 2) Quem CONVERSA e nao tem contato, ganha um.
--    So quem tem mensagem: prospect de lista de prospeccao que nunca trocou
--    palavra nao vira contato — isso inflaria a agenda com quem nunca falou.
INSERT INTO crm_contacts (name, phone, notes)
SELECT
  -- O nome do prospect ja foi corrigido na 112; onde ele ainda e o proprio
  -- telefone, fica o telefone mesmo — e honesto e da pra procurar.
  COALESCE(NULLIF(btrim(p.contact_name), ''), p.phone),
  p.phone,
  'Criado a partir da conversa de WhatsApp em 2026-07-20.'
FROM crm_prospects p
WHERE p.deleted_at IS NULL
  AND p.contact_id IS NULL
  AND coalesce(p.phone,'') <> ''
  AND EXISTS (SELECT 1 FROM crm_messages m WHERE m.prospect_id = p.id AND m.deleted_at IS NULL);

-- 3) Liga os recem-criados (mesma regra de telefone).
WITH d AS (
  SELECT p.id AS prospect_id,
    CASE WHEN length(regexp_replace(p.phone,'\D','','g')) >= 12
          AND left(regexp_replace(p.phone,'\D','','g'),2) = '55'
      THEN substr(regexp_replace(p.phone,'\D','','g'),3)
      ELSE regexp_replace(p.phone,'\D','','g') END AS dig
  FROM crm_prospects p WHERE p.deleted_at IS NULL AND p.contact_id IS NULL
),
pk AS (SELECT prospect_id, left(dig,2) || '-' || right(dig,8) AS k FROM d WHERE length(dig) BETWEEN 10 AND 11),
ck AS (
  SELECT c.id AS contact_id,
         left(regexp_replace(c.phone,'\D','','g'),2) || '-' || right(regexp_replace(c.phone,'\D','','g'),8) AS k
  FROM crm_contacts c
  WHERE c.deleted_at IS NULL AND length(regexp_replace(coalesce(c.phone,''),'\D','','g')) BETWEEN 10 AND 11
),
unico AS (SELECT k, min(contact_id::text)::uuid AS contact_id FROM ck GROUP BY k HAVING count(DISTINCT contact_id) = 1)
UPDATE crm_prospects p SET contact_id = u.contact_id
FROM pk JOIN unico u ON u.k = pk.k
WHERE p.id = pk.prospect_id;

-- 4) Fecha a rachadura ja aberta: as mensagens soltas herdam o contato do
--    prospect. Sem isso o Henrique continuaria em duas linhas.
UPDATE crm_messages m
SET contact_id = p.contact_id
FROM crm_prospects p
WHERE m.prospect_id = p.id
  AND m.contact_id IS NULL
  AND p.contact_id IS NOT NULL
  AND m.deleted_at IS NULL;

COMMIT;

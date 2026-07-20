-- 112 — cruza o telefone da conversa do WhatsApp com o contato do CRM.
--
-- O PROBLEMA: as 2762 mensagens do inbox estavam TODAS ligadas a `crm_prospects`
-- e NENHUMA a `crm_contacts`. O inbox virou um universo paralelo ao pipeline: a
-- conversa nao sabia de qual lead era, e o lead nao sabia que tinha conversa.
--
-- Pior: 93 desses prospects tinham o MESMO nome — "Lhorena - Fyness", o nome de
-- perfil do proprio numero da empresa, que vazou pro registro do outro lado. Na
-- tela, 93 pessoas diferentes viravam 93 linhas identicas. Uma delas tem 61
-- mensagens e e o Ismael, que tem negocio aberto.
--
-- A CHAVE: DDD + os 8 ultimos digitos. O WhatsApp entrega '553584153752'
-- (DDI+DDD+8) e o cadastro guarda '(35) 9768-5526' (DDD+8) — comparar string
-- nunca casa. O 9o digito fica de fora porque metade da base guarda com ele e
-- metade sem, e e o mesmo aparelho. O DDD entra porque final igual em estado
-- diferente e outra pessoa. Mesma regra de src/modules/crm/lib/telefone.js.
--
-- Backup em backups/inbox_prospects_20260720.tsv e inbox_messages_link_*.tsv.

BEGIN;

CREATE TEMP TABLE _cruza AS
WITH d AS (
  SELECT p.id AS prospect_id,
    CASE WHEN length(regexp_replace(p.phone,'\D','','g')) >= 12
          AND left(regexp_replace(p.phone,'\D','','g'),2) = '55'
      THEN substr(regexp_replace(p.phone,'\D','','g'),3)
      ELSE regexp_replace(p.phone,'\D','','g') END AS dig
  FROM crm_prospects p
  WHERE p.deleted_at IS NULL
    AND p.id IN (SELECT prospect_id FROM crm_messages WHERE deleted_at IS NULL AND prospect_id IS NOT NULL)
),
pk AS (SELECT prospect_id, left(dig,2) || '-' || right(dig,8) AS k FROM d WHERE length(dig) BETWEEN 10 AND 11),
ck AS (
  SELECT c.id AS contact_id,
         left(regexp_replace(c.phone,'\D','','g'),2) || '-' || right(regexp_replace(c.phone,'\D','','g'),8) AS k
  FROM crm_contacts c
  WHERE c.deleted_at IS NULL
    AND length(regexp_replace(coalesce(c.phone,''),'\D','','g')) BETWEEN 10 AND 11
),
-- Um contato por chave. Se duas pessoas dividem o mesmo telefone no cadastro,
-- NAO da pra escolher — melhor deixar a conversa sem dono do que colar no lead
-- errado, porque o erro silencioso aqui manda a resposta pra pessoa errada.
unico AS (SELECT k, min(contact_id::text)::uuid AS contact_id FROM ck GROUP BY k HAVING count(DISTINCT contact_id) = 1)
SELECT pk.prospect_id, unico.contact_id
FROM pk JOIN unico ON unico.k = pk.k;

-- 1) A conversa passa a ser do CONTATO. Mantem prospect_id: e o rastro de onde
--    o lead entrou, e apagar perderia a procedencia sem ganhar nada.
UPDATE crm_messages m
SET contact_id = x.contact_id
FROM _cruza x
WHERE m.prospect_id = x.prospect_id
  AND m.contact_id IS NULL
  AND m.deleted_at IS NULL;

-- 2) O nome do prospect casado passa a ser o do contato — a lista para de
--    mostrar o nome do proprio numero da empresa no lugar do lead.
UPDATE crm_prospects p
SET contact_name = c.name
FROM _cruza x
JOIN crm_contacts c ON c.id = x.contact_id
WHERE p.id = x.prospect_id
  AND c.name IS NOT NULL AND btrim(c.name) <> '';

-- 3) Os que NAO casaram continuam sem contato, mas nao podem seguir com o nome
--    errado. O telefone e pior que um nome e melhor que o nome de OUTRA pessoa:
--    pelo menos distingue as linhas e da pra procurar.
UPDATE crm_prospects p
SET contact_name = p.phone
WHERE p.deleted_at IS NULL
  AND p.contact_name = 'Lhorena - Fyness'
  AND p.id NOT IN (SELECT prospect_id FROM _cruza);

COMMIT;

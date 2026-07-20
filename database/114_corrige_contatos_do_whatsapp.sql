-- 114 — conserta o que a 113 fez errado e conclui o vinculo.
--
-- ERRO DA 113: o INSERT criou contato pra TODO prospect com mensagem, sem
-- checar se o telefone era telefone. Entraram 21 registros invalidos — 20 com
-- @lid (o identificador interno do WhatsApp, 14-15 digitos, que NAO e numero
-- discavel) e 1 com o telefone literal '0'.
--
-- E os 96 validos nasceram soltos: a 113 tentou liga-los com uma chave que so
-- aceitava 10-11 digitos, mas eles foram gravados com DDI (12-13). O passo de
-- ligacao devolveu "UPDATE 0" e ninguem ficou vinculado.
--
-- Nao dava pra simplesmente apagar tudo e refazer: entre a 113 e este conserto,
-- o webhook JA comecou a usar os contatos novos (mensagem de 20:07 ligada a um
-- deles). Apagar em bloco orfanaria mensagem real — por isso aqui se separa o
-- invalido do valido em vez de reverter.

BEGIN;

-- 1) Fora os 21 invalidos. Conferido antes: nenhuma mensagem aponta pra eles.
DELETE FROM crm_contacts
WHERE notes LIKE 'Criado a partir da conversa de WhatsApp%'
  AND length(regexp_replace(coalesce(phone,''),'\D','','g')) NOT IN (12, 13);

-- 2) Telefone no formato NACIONAL, como o resto da base guarda.
--    Ficar com DDI faria o cadastro novo divergir do antigo — e foi divergencia
--    de formato que criou este problema inteiro.
UPDATE crm_contacts
SET phone = substr(regexp_replace(phone,'\D','','g'), 3)
WHERE notes LIKE 'Criado a partir da conversa de WhatsApp%'
  AND length(regexp_replace(phone,'\D','','g')) IN (12, 13)
  AND left(regexp_replace(phone,'\D','','g'), 2) = '55';

-- 3) Agora liga: prospect -> contato, pela chave DDD + 8 finais.
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

-- 4) As mensagens soltas herdam o contato do prospect — e a conversa do
--    Henrique para de aparecer em duas linhas.
UPDATE crm_messages m
SET contact_id = p.contact_id
FROM crm_prospects p
WHERE m.prospect_id = p.id
  AND m.contact_id IS NULL
  AND p.contact_id IS NOT NULL
  AND m.deleted_at IS NULL;

COMMIT;

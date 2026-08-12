-- 154: uma conversa por pessoa no inbox (fim dos "2 Edersons")
--
-- O inbox (crm_inbox_conversations) agrupa por COALESCE(contact_id, prospect_id)
-- da mensagem. O mesmo lead costuma existir como PROSPECT (o webhook de
-- prospecção casa o número num crm_prospects) E, depois, como CONTATO (criado à
-- mão / ao virar negócio) — dois registros, sem link. Aí as mensagens antigas
-- ficam presas ao prospect e as novas ao contato: a conversa racha em duas pro
-- MESMO número. Acontece com todo lead que fala antes de virar contato.
--
-- Correção: a mensagem sempre gruda no CONTATO quando existe um de mesmo número
-- (o contact_id vence no COALESCE, então as duas metades viram uma só). E o
-- prospect passa a apontar pro contato. Feito uma vez pro histórico e, daqui
-- pra frente, automático por trigger quando um contato é criado/ganha telefone.
--
-- Casamento por crm_fone_chave (DDD + 8 últimos dígitos). O telefone do lead na
-- mensagem é from_phone (recebida) ou to_phone (enviada).

-- 1a) Backfill: toda mensagem sem contato gruda no contato de mesmo número.
--     (inclui as que estão só no prospect — o contact_id passa a valer.)
UPDATE crm_messages m
   SET contact_id = c.id,
       updated_at = now()
  FROM crm_contacts c
 WHERE m.contact_id IS NULL
   AND m.deleted_at IS NULL
   AND c.deleted_at IS NULL
   AND c.phone IS NOT NULL
   AND length(crm_fone_chave(c.phone)) >= 10
   AND crm_fone_chave(CASE WHEN m.direction = 'inbound' THEN m.from_phone ELSE m.to_phone END)
       = crm_fone_chave(c.phone);

-- 1b) Backfill: o prospect de mesmo número passa a apontar pro contato.
UPDATE crm_prospects p
   SET contact_id = c.id
  FROM crm_contacts c
 WHERE p.contact_id IS NULL
   AND p.deleted_at IS NULL
   AND c.deleted_at IS NULL
   AND p.phone IS NOT NULL AND c.phone IS NOT NULL
   AND length(crm_fone_chave(c.phone)) >= 10
   AND crm_fone_chave(p.phone) = crm_fone_chave(c.phone);

-- 2) Daqui pra frente: contato criado (ou que ganhou/trocou telefone) puxa as
--    mensagens do mesmo número e amarra o prospect correspondente.
CREATE OR REPLACE FUNCTION crm_liga_msgs_orfas_ao_contato()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  k text := crm_fone_chave(NEW.phone);
BEGIN
  IF k IS NULL OR length(k) < 10 THEN
    RETURN NEW;
  END IF;

  UPDATE crm_messages m
     SET contact_id = NEW.id,
         updated_at = now()
   WHERE m.contact_id IS NULL
     AND m.deleted_at IS NULL
     AND crm_fone_chave(CASE WHEN m.direction = 'inbound' THEN m.from_phone ELSE m.to_phone END) = k;

  UPDATE crm_prospects p
     SET contact_id = NEW.id
   WHERE p.contact_id IS NULL
     AND p.deleted_at IS NULL
     AND p.phone IS NOT NULL
     AND crm_fone_chave(p.phone) = k;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_liga_msgs_orfas ON crm_contacts;
CREATE TRIGGER trg_liga_msgs_orfas
AFTER INSERT OR UPDATE OF phone ON crm_contacts
FOR EACH ROW
WHEN (NEW.phone IS NOT NULL AND NEW.deleted_at IS NULL)
EXECUTE FUNCTION crm_liga_msgs_orfas_ao_contato();

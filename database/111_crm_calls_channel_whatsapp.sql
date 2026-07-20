-- 111 — ligacao por WhatsApp vira um canal proprio em crm_calls.
--
-- O CHECK antigo so admitia 'device' (chip do aparelho) e 'voip' (provedor, que
-- nao vamos usar). Faltava a chamada de voz do WhatsApp, que na pratica e o
-- outro canal que a consultora usa todo dia — e que tem economia e taxa de
-- atendimento diferentes do telefone.
--
-- Sem isso as duas viravam a mesma linha e nao dava pra responder "o WhatsApp
-- atende mais que o telefone?", que e a pergunta que decide por onde ligar
-- primeiro na proxima cadencia.
--
-- 'voip' fica: a coluna e o schema de gravacao seguem prontos caso um provedor
-- entre um dia. Hoje nao entra — sem VoIP nao ha como gravar, e a decisao foi
-- ficar no chip.

ALTER TABLE crm_calls DROP CONSTRAINT IF EXISTS crm_calls_channel_check;

ALTER TABLE crm_calls
  ADD CONSTRAINT crm_calls_channel_check
  CHECK (channel = ANY (ARRAY['device'::text, 'whatsapp'::text, 'voip'::text]));

COMMENT ON COLUMN crm_calls.channel IS
  'device = ligacao pelo chip (tel:). whatsapp = chamada de voz pelo WhatsApp. voip = provedor externo (nao usado).';

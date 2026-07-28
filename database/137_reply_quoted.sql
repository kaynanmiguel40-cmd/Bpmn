-- 137: RESPONDER MENSAGEM (citacao, estilo WhatsApp)
--
-- Guarda a referencia da mensagem citada. Desnormaliza o preview e o "de quem"
-- pra a tela renderizar a citacao SEM join (e sobreviver mesmo se a original nao
-- estiver na base — ex: o lead citou uma mensagem anterior ao nosso historico).
--
--   reply_to_id       -> nossa mensagem citada, quando da pra resolver (clicavel).
--   reply_to_preview  -> trecho da citada ("texto...", "[foto]", "[audio]"...).
--   reply_to_from_me  -> a citada era NOSSA (true) ou do lead (false).
ALTER TABLE crm_messages ADD COLUMN IF NOT EXISTS reply_to_id uuid REFERENCES crm_messages(id) ON DELETE SET NULL;
ALTER TABLE crm_messages ADD COLUMN IF NOT EXISTS reply_to_preview text;
ALTER TABLE crm_messages ADD COLUMN IF NOT EXISTS reply_to_from_me boolean;

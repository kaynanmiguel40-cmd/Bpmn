-- 125 — lead pode GERAR outro lead ligado a ele ("2 leads em 1").
--
-- No primeiro contato, o lead as vezes passa a bola pra outra pessoa que vai
-- continuar o atendimento (o socio, o financeiro, um indicado). Isso vira um
-- lead NOVO — mas ligado ao original, pra o historico continuar junto: quem
-- abrir qualquer um dos dois ve a conversa inteira, nao um pedaco.
--
-- `origin_deal_id` = o negocio que gerou este. NULL = lead que nasceu sozinho.
-- A cadeia pode ter varios niveis (A gera B, B gera C); o historico segue todos.

ALTER TABLE crm_deals
  ADD COLUMN IF NOT EXISTS origin_deal_id uuid REFERENCES crm_deals(id);

CREATE INDEX IF NOT EXISTS idx_crm_deals_origin ON crm_deals(origin_deal_id)
  WHERE origin_deal_id IS NOT NULL;

COMMENT ON COLUMN crm_deals.origin_deal_id IS
  'Negocio que GEROU este (lead ligado). O historico e compartilhado por toda a cadeia de leads ligados.';

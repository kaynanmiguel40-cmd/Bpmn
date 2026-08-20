-- 155: recupera os telefones que foram corrigidos e o sistema ignorou.
--
-- ─── O QUE ACONTECEU ─────────────────────────────────────────────────────────
-- O telefone mora em dois lugares: `crm_contacts.phone` (o registro) e
-- `crm_deals.contact_phone` (cópia que só vale de fallback). A regra do sistema
-- (getDealLeadInfo) é que o registro sempre vence — mas o formulário do negócio,
-- com contato vinculado, gravava só na cópia. Cada correção de número ia pra um
-- campo que nenhuma tela lê.
--
-- O código já foi corrigido (commit 215e6667: com contato vinculado, a edição
-- passa a gravar no contato). Isto aqui é o passivo: o que foi digitado ANTES do
-- conserto e continua invisível — inclusive o Dr Missiato, um dígito diferente,
-- que o sistema segue discando errado.
--
-- ─── O CRITÉRIO ──────────────────────────────────────────────────────────────
-- Copia a cópia por cima do registro SOMENTE quando o número do negócio é um
-- telefone brasileiro plausível (10 ou 11 dígitos com o DDD). Foi digitado depois
-- e de propósito — é a intenção mais recente de quem estava olhando pro lead.
--
-- Fica FORA quem tem os dois lados quebrados: o Cleiton está com
-- `(03) 59992-1298` no contato (DDD 03 não existe) e `(35) 9212-985` no negócio
-- (dígitos de menos). Escolher um lado ali é chutar qual número é da pessoa —
-- isso é pra alguém que conhece o lead resolver, não pra um UPDATE em massa.

BEGIN;

-- ANTES: o que vai mudar, lado a lado.
SELECT d.title AS lead, c.phone AS antes, d.contact_phone AS depois
FROM crm_deals d
JOIN crm_contacts c ON c.id = d.contact_id
WHERE d.deleted_at IS NULL AND c.deleted_at IS NULL
  AND length(regexp_replace(d.contact_phone, '[^0-9]', '', 'g')) IN (10, 11)
  AND right(regexp_replace(d.contact_phone, '[^0-9]', '', 'g'), 8)
      IS DISTINCT FROM right(regexp_replace(coalesce(c.phone, ''), '[^0-9]', '', 'g'), 8);

UPDATE crm_contacts c
   SET phone = d.contact_phone,
       updated_at = now()
  FROM crm_deals d
 WHERE d.contact_id = c.id
   AND d.deleted_at IS NULL AND c.deleted_at IS NULL
   AND length(regexp_replace(d.contact_phone, '[^0-9]', '', 'g')) IN (10, 11)
   AND right(regexp_replace(d.contact_phone, '[^0-9]', '', 'g'), 8)
       IS DISTINCT FROM right(regexp_replace(coalesce(c.phone, ''), '[^0-9]', '', 'g'), 8);

-- DEPOIS: só deve sobrar o caso ambíguo (número inválido dos dois lados).
SELECT d.title AS ainda_divergente, c.phone AS no_contato, d.contact_phone AS no_negocio
FROM crm_deals d
JOIN crm_contacts c ON c.id = d.contact_id
WHERE d.deleted_at IS NULL AND c.deleted_at IS NULL
  AND coalesce(btrim(d.contact_phone), '') <> ''
  AND right(regexp_replace(d.contact_phone, '[^0-9]', '', 'g'), 8)
      IS DISTINCT FROM right(regexp_replace(coalesce(c.phone, ''), '[^0-9]', '', 'g'), 8);

COMMIT;

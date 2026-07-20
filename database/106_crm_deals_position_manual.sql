-- 106 — distingue a posicao ARRASTADA da posicao herdada do backfill.
--
-- A migration 105 criou `position` e preencheu TODOS os deals de uma vez. Sem
-- uma segunda marca, nao da pra saber se o 300 daquele card significa "alguem
-- decidiu que ele e o terceiro" ou "ele so calhou de ser o terceiro na ordem em
-- que o backfill leu a tabela".
--
-- A distincao e o que deixa os dois eixos conviverem: card que a pessoa fixou a
-- mao manda sempre, e o score ordena o resto. Sem ela, ou o score nunca manda
-- (todo mundo tem posicao) ou o arrasto nunca manda (tudo e recalculado) — e os
-- dois extremos quebram metade da promessa.
--
-- Default false de proposito: nada do que ja esta na base foi escolhido a mao.

ALTER TABLE crm_deals
  ADD COLUMN IF NOT EXISTS position_manual boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN crm_deals.position_manual IS
  'true = a posicao foi definida por arrasto na coluna do Kanban. false = herdada do backfill, e o score pode reordenar.';

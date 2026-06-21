-- ============================================================
-- 063_os_judge.sql
--
-- Adiciona `judge` (Juiz) em os_orders.
--
-- Contexto: terceira pessoa NEUTRA que arbitra a contestação de nota de
-- qualidade. Hoje quem resolve a contestação é o próprio supervisor (juiz em
-- causa própria) ou um gestor. Com o Juiz designado por O.S., a decisão da
-- contestação sai do supervisor e vai pro Juiz — ele vê os 2 lados (nota +
-- justificativa do supervisor × contestação do executor) e decide: mantém a
-- nota ou dá uma nota nova.
--
-- Mesmo formato do `supervisor`: texto com nomes separados por vírgula.
-- Idempotente.
-- ============================================================

ALTER TABLE public.os_orders
  ADD COLUMN IF NOT EXISTS judge TEXT;

COMMENT ON COLUMN public.os_orders.judge IS
  'Juiz da O.S. (nomes separados por vírgula). Arbitra a contestação de nota de qualidade — neutro entre supervisor e executor.';

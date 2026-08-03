-- 143: compactação DENSA automática das agendas de cadência
--
-- Problema: a cadência coloca cada toque no "dia do offset" (D0, D1, D3…), então
-- cada dia recebe só os leads que "vencem" ali (~15) e a tarde fica vazia — o
-- backlog se arrasta por semanas com dias pela metade.
--
-- Esta função RE-FLUI todas as tarefas de cadência pendentes em dias CHEIOS
-- (8:10-18h, slots de 10min, sem almoço 11-12, só dias úteis), intercalando os
-- leads (o toque 1 de todos, depois o toque 2 de todos…) pra que dois toques do
-- MESMO lead fiquem espalhados no dia, não colados. É a versão automática do
-- re-espalhamento que era feito na mão.
--
-- NÃO mexe em reunião/visita/almoço (hora marcada) nem em evento recorrente.
-- Roda por um cron diário de madrugada (ver o final).

CREATE OR REPLACE FUNCTION compactar_agendas_densas(
  p_from date DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date
) RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated int := 0;
BEGIN
  WITH
  -- dias úteis a partir de p_from (folga de ~90 dias úteis)
  dias AS (
    SELECT d::date AS dia, (row_number() OVER (ORDER BY d)) - 1 AS didx
    FROM generate_series(p_from, p_from + 130, interval '1 day') g(d)
    WHERE extract(dow FROM d) NOT IN (0, 6)
  ),
  -- 53 slots por dia: manhã 8:10-10:50 (17) + tarde 12:00-17:50 (36)
  slots_dia AS (
    SELECT s AS sidx,
           CASE WHEN s < 17 THEN 490 + s * 10 ELSE 720 + (s - 17) * 10 END AS min_do_dia
    FROM generate_series(0, 52) s
  ),
  -- calendário global: número sequencial do slot -> timestamptz (BRT -> UTC)
  cal AS (
    SELECT (dias.didx * 53 + slots_dia.sidx) AS slotnum,
           ((dias.dia + make_interval(mins => slots_dia.min_do_dia)) AT TIME ZONE 'America/Sao_Paulo') AS ts
    FROM dias CROSS JOIN slots_dia
  ),
  -- tarefas de cadência pendentes, com o índice do toque DENTRO do lead
  base AS (
    SELECT a.id, a.assigned_to,
           COALESCE(a.deal_id::text, a.contact_id::text, a.id::text) AS lead,
           row_number() OVER (
             PARTITION BY a.assigned_to, COALESCE(a.deal_id::text, a.contact_id::text, a.id::text)
             ORDER BY a.start_date, a.id
           ) AS touch_idx
    FROM crm_activities a
    WHERE a.deleted_at IS NULL AND a.completed = false
      AND a.type NOT IN ('meeting', 'visit', 'lunch')
      AND a.recurrence_group_id IS NULL
      AND a.assigned_to IS NOT NULL
      AND a.start_date >= (now() AT TIME ZONE 'America/Sao_Paulo')::date
  ),
  -- intercala os leads: ordena por (toque, lead) e vira número de slot por vendedor
  tarefas AS (
    SELECT id, assigned_to,
           row_number() OVER (PARTITION BY assigned_to ORDER BY touch_idx, lead, id) - 1 AS slotnum
    FROM base
  ),
  novo AS (
    SELECT t.id, c.ts AS novo_start
    FROM tarefas t JOIN cal c ON c.slotnum = t.slotnum
  )
  UPDATE crm_activities a
  SET start_date = n.novo_start,
      end_date   = n.novo_start + interval '10 minutes',
      updated_at = now()
  FROM novo n
  WHERE a.id = n.id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END $$;

-- Cron diário: 5:00 BRT (8:00 UTC), seg-sex, antes do expediente (8:10). Mantém a
-- agenda densa sozinha — o vendedor abre o dia cheio, sem brecha, sem re-espalhar
-- na mão. cron.schedule faz upsert pelo jobname (idempotente).
SELECT cron.schedule('compactar-agenda-densa', '0 8 * * 1-5', 'SELECT compactar_agendas_densas()');

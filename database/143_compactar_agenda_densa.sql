-- 143: compactação DENSA automática das agendas de cadência
--
-- Re-flui as tarefas de CADÊNCIA pendentes em dias cheios (8:10-18h, 10min, sem
-- almoço 11-12, só dias úteis), intercalando os leads pra espalhar o mesmo lead.
-- Versão automática do re-espalhamento manual. Roda por um cron diário (no fim).
--
-- Escopo (corrigido após bateria de testes 2026-08-04):
--   • SÓ tarefas de cadência (stage_step_id NOT NULL) — NUNCA tarefa manual com
--     hora escolhida pelo usuário, nem reunião/visita/almoço, nem recorrente.
--   • Só o backlog dos próximos 30 dias — follow-up longo (D30+) fica no lugar.
--   • Piso do "agora": nunca grava no passado (se rodar depois das 8:10).
-- Limitações conhecidas (trade-off por densidade): não preserva turno manhã/tarde
--   do passo; o gap de 3h do mesmo lead é best-effort (garantido só com muitos leads).

CREATE OR REPLACE FUNCTION compactar_agendas_densas(
  p_from date DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date
) RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated int := 0;
BEGIN
  WITH
  -- dias úteis a partir de p_from (folga grande contra overflow: ~285 dias úteis)
  dias AS (
    SELECT d::date AS dia, (row_number() OVER (ORDER BY d)) - 1 AS didx
    FROM generate_series(p_from, p_from + 400, interval '1 day') g(d)
    WHERE extract(dow FROM d) NOT IN (0, 6)
  ),
  -- 53 slots por dia: manhã 8:10-10:50 (17) + tarde 12:00-17:50 (36)
  slots_dia AS (
    SELECT s AS sidx,
           CASE WHEN s < 17 THEN 490 + s * 10 ELSE 720 + (s - 17) * 10 END AS min_do_dia
    FROM generate_series(0, 52) s
  ),
  -- calendário bruto: cada slot -> timestamptz (BRT -> UTC)
  cal_raw AS (
    SELECT ((dias.dia + make_interval(mins => slots_dia.min_do_dia)) AT TIME ZONE 'America/Sao_Paulo') AS ts
    FROM dias CROSS JOIN slots_dia
  ),
  -- só slots no FUTURO (piso do "agora" + 15min) e re-numerados contíguos
  cal AS (
    SELECT (row_number() OVER (ORDER BY ts)) - 1 AS slotnum, ts
    FROM cal_raw
    WHERE ts >= now() + interval '15 minutes'
  ),
  -- tarefas de CADÊNCIA pendentes do backlog próximo, com índice do toque no lead
  base AS (
    SELECT a.id, a.assigned_to,
           COALESCE(a.deal_id::text, a.contact_id::text, a.id::text) AS lead,
           row_number() OVER (
             PARTITION BY a.assigned_to, COALESCE(a.deal_id::text, a.contact_id::text, a.id::text)
             ORDER BY a.start_date, a.id
           ) AS touch_idx
    FROM crm_activities a
    WHERE a.deleted_at IS NULL AND a.completed = false
      AND a.stage_step_id IS NOT NULL          -- só cadência (não tarefa manual)
      AND a.type NOT IN ('meeting', 'visit', 'lunch')
      AND a.recurrence_group_id IS NULL
      AND a.assigned_to IS NOT NULL
      AND a.start_date >= (now() AT TIME ZONE 'America/Sao_Paulo')::date
      AND a.start_date <  (now() AT TIME ZONE 'America/Sao_Paulo')::date + interval '30 days'
      -- Nunca re-empacota tarefa de negócio EXCLUÍDO (senão a compactação mantinha
      -- as órfãs vivas e ainda por cima num bloco denso todo dia).
      AND NOT EXISTS (SELECT 1 FROM crm_deals dd WHERE dd.id = a.deal_id AND dd.deleted_at IS NOT NULL)
  ),
  -- intercala os leads: ordena por (toque, lead) -> número de slot por vendedor
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

-- Cron diário: 5:00 BRT (8:00 UTC), seg-sex, antes do expediente (8:10).
SELECT cron.schedule('compactar-agenda-densa', '0 8 * * 1-5', 'SELECT compactar_agendas_densas()');

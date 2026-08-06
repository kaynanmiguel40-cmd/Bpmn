-- 148: compactação densa que NÃO colide com compromisso e não puxa follow-up.
--
-- Dois bugs da versão 143 (achados na bateria func+usab):
--   (1) COLISÃO: a grade de slots-alvo era montada pura (dias × slots), sem
--       descontar os horários já ocupados por reunião/visita/almoço/tarefa manual.
--       Um toque de cadência podia cair EM CIMA de uma reunião com hora combinada.
--   (2) PUXÃO: re-empacotava TODA cadência dos próximos 30 dias a partir de agora,
--       ignorando o day_offset — o follow-up D7/D14 era puxado pra hoje, colapsando
--       o espaçamento da cadência.
--
-- Correção:
--   • Só mexe nos toques de HOJE (não puxa follow-up futuro; cada dia é compactado
--     quando chega — o cron roda todo dia). Overdue e futuro ficam onde estão.
--   • Slots livres = a grade densa MENOS os horários já ocupados por qualquer
--     atividade que NÃO será movida (reunião/visita/almoço/manual/recorrente/
--     cadência de fora da janela). Reserva o bloco inteiro [start, end).
--   • Piso do "agora" (não grava no passado) e range grande contra overflow.

CREATE OR REPLACE FUNCTION compactar_agendas_densas(
  p_from date DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date
) RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated int := 0;
BEGIN
  WITH
  dias AS (
    SELECT d::date AS dia
    FROM generate_series(p_from, p_from + 400, interval '1 day') g(d)
    WHERE extract(dow FROM d) NOT IN (0, 6)
  ),
  slots_dia AS (
    SELECT CASE WHEN s < 17 THEN 490 + s * 10 ELSE 720 + (s - 17) * 10 END AS min_do_dia
    FROM generate_series(0, 52) s
  ),
  cal_raw AS (
    SELECT ((dias.dia + make_interval(mins => slots_dia.min_do_dia)) AT TIME ZONE 'America/Sao_Paulo') AS ts
    FROM dias CROSS JOIN slots_dia
  ),
  cal AS (
    SELECT ts FROM cal_raw WHERE ts >= now() + interval '15 minutes'
  ),
  -- Toques a MOVER: cadência pendente de HOJE (não puxa futuro; não mexe em deal
  -- excluído nem em tarefa manual/reunião/recorrente).
  base AS (
    SELECT a.id, a.assigned_to,
           COALESCE(a.deal_id::text, a.contact_id::text, a.id::text) AS lead,
           row_number() OVER (
             PARTITION BY a.assigned_to, COALESCE(a.deal_id::text, a.contact_id::text, a.id::text)
             ORDER BY a.start_date, a.id
           ) AS touch_idx
    FROM crm_activities a
    WHERE a.deleted_at IS NULL AND a.completed = false
      AND a.stage_step_id IS NOT NULL
      AND a.type NOT IN ('meeting', 'visit', 'lunch')
      AND a.recurrence_group_id IS NULL
      AND a.assigned_to IS NOT NULL
      AND a.start_date >= (now() AT TIME ZONE 'America/Sao_Paulo')::date
      AND a.start_date <  (now() AT TIME ZONE 'America/Sao_Paulo')::date + interval '1 day'
      AND NOT EXISTS (SELECT 1 FROM crm_deals dd WHERE dd.id = a.deal_id AND dd.deleted_at IS NOT NULL)
  ),
  tarefas AS (
    SELECT id, assigned_to,
           row_number() OVER (PARTITION BY assigned_to ORDER BY touch_idx, lead, id) - 1 AS ordem
    FROM base
  ),
  -- Horários JÁ OCUPADOS por atividade que NÃO será movida — reserva o bloco
  -- inteiro [start, end) pra a cadência não cair em cima (o bug da colisão).
  ocupado AS (
    SELECT DISTINCT a.assigned_to, c.ts
    FROM crm_activities a
    JOIN cal c ON c.ts >= a.start_date
              AND c.ts <  COALESCE(a.end_date, a.start_date + interval '10 minutes')
    WHERE a.deleted_at IS NULL AND a.completed = false AND a.assigned_to IS NOT NULL
      AND a.id NOT IN (SELECT id FROM base)
  ),
  -- Slots LIVRES por vendedor = a grade menos o que ele já tem ocupado, renumerados.
  slots_livres AS (
    SELECT dono.assigned_to, c.ts,
           row_number() OVER (PARTITION BY dono.assigned_to ORDER BY c.ts) - 1 AS slotnum
    FROM (SELECT DISTINCT assigned_to FROM tarefas) dono
    CROSS JOIN cal c
    WHERE NOT EXISTS (
      SELECT 1 FROM ocupado o WHERE o.assigned_to = dono.assigned_to AND o.ts = c.ts
    )
  ),
  novo AS (
    SELECT t.id, s.ts AS novo_start
    FROM tarefas t
    JOIN slots_livres s ON s.assigned_to = t.assigned_to AND s.slotnum = t.ordem
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

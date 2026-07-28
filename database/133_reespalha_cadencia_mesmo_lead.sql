-- 133: RE-ESPALHA O BACKLOG DE CADENCIA (mesmo lead, folga de 3h)
--
-- O planSteps ja nao cola dois toques do mesmo lead (GAP_MESMO_LEAD=180min), mas
-- isso so vale pras cadencias NOVAS. Este passe aplica a MESMA regra no que ja
-- estava agendado: sem empilhamento no mesmo slot E folga de 3h entre toques do
-- mesmo lead no mesmo dia (9:00, 12:00, 15:00 — manha/meio-dia/tarde).
--
-- CONSERVADOR de proposito: preserva o TIMEFRAME atual — cada tarefa so anda pra
-- FRENTE do dia onde ja esta (piso = maior entre o dia atual e hoje), nunca pra
-- tras. Nao reseta a cadencia nem compacta o backlog; so desamontoa.
--
-- NAO toca: tarefa concluida, avulsa (sem stage_step_id) e hora marcada
-- (reuniao/visita/almoco) — essas so OCUPAM slot, pra o re-espalhamento desviar.

DO $$
DECLARE
  SLOTS time[] := ARRAY['09:00','09:30','10:00','10:30','12:00','12:30','13:00',
                        '13:30','14:00','14:30','15:00','15:30','16:00','16:30',
                        '17:00','17:30']::time[];
  TZ      text := 'America/Sao_Paulo';
  hoje    date := (now() AT TIME ZONE TZ)::date;
  GAP     int  := 180;  -- folga inicio-a-inicio entre toques do mesmo lead
  t       record;
  v_dia   date;
  v_slot  time;
  v_min   int;
  achou   boolean;
  movidas int := 0;
BEGIN
  -- OCUPADO: tudo que NAO se move, marcando TODOS os slots de 30min que cobre
  -- (uma reuniao de 1h ocupa dois slots).
  CREATE TEMP TABLE ocupado (assigned_to uuid, dia date, slot time) ON COMMIT DROP;
  INSERT INTO ocupado
    SELECT a.assigned_to,
           (s AT TIME ZONE TZ)::date,
           (s AT TIME ZONE TZ)::time
      FROM crm_activities a
      CROSS JOIN LATERAL generate_series(
        a.start_date,
        COALESCE(a.end_date, a.start_date + interval '30 minutes') - interval '1 minute',
        interval '30 minutes'
      ) AS s
     WHERE a.completed = false AND a.deleted_at IS NULL AND a.assigned_to IS NOT NULL
       AND a.start_date >= now() - interval '1 day'
       AND (a.stage_step_id IS NULL OR a.type IN ('meeting','visit','lunch'));

  -- Ultimo slot dado a cada (vendedor, lead, dia) — pra a folga de 3h.
  CREATE TEMP TABLE lead_last (assigned_to uuid, deal_id uuid, dia date, last_min int) ON COMMIT DROP;

  -- Ordem: por vendedor e pelo horario ATUAL (preserva a ordem que a cadencia quis).
  FOR t IN
    SELECT a.id, a.assigned_to, a.deal_id,
           (a.start_date AT TIME ZONE TZ)::date AS cur_dia
      FROM crm_activities a
     WHERE a.completed = false AND a.deleted_at IS NULL AND a.assigned_to IS NOT NULL
       AND a.stage_step_id IS NOT NULL
       AND a.type NOT IN ('meeting','visit','lunch')
       AND a.start_date >= now() - interval '1 day'
     ORDER BY a.assigned_to, a.start_date, a.id
  LOOP
    v_dia := GREATEST(t.cur_dia, hoje);
    IF EXTRACT(dow FROM v_dia) = 6 THEN v_dia := v_dia + 2;
    ELSIF EXTRACT(dow FROM v_dia) = 0 THEN v_dia := v_dia + 1; END IF;

    achou := false;
    WHILE NOT achou LOOP
      FOREACH v_slot IN ARRAY SLOTS LOOP
        v_min := EXTRACT(hour FROM v_slot) * 60 + EXTRACT(minute FROM v_slot);
        -- slot ja ocupado por qualquer tarefa do vendedor?
        IF EXISTS (SELECT 1 FROM ocupado o
                    WHERE o.assigned_to = t.assigned_to AND o.dia = v_dia AND o.slot = v_slot) THEN
          CONTINUE;
        END IF;
        -- folga de 3h do MESMO lead no mesmo dia?
        IF EXISTS (SELECT 1 FROM lead_last l
                    WHERE l.assigned_to = t.assigned_to AND l.deal_id = t.deal_id
                      AND l.dia = v_dia AND v_min < l.last_min + GAP) THEN
          CONTINUE;
        END IF;

        UPDATE crm_activities
           SET start_date = (v_dia + v_slot) AT TIME ZONE TZ,
               end_date   = (v_dia + v_slot) AT TIME ZONE TZ + interval '30 minutes',
               updated_at = now()
         WHERE id = t.id;
        INSERT INTO ocupado VALUES (t.assigned_to, v_dia, v_slot);
        DELETE FROM lead_last WHERE assigned_to = t.assigned_to AND deal_id = t.deal_id AND dia = v_dia;
        INSERT INTO lead_last VALUES (t.assigned_to, t.deal_id, v_dia, v_min);
        movidas := movidas + 1;
        achou := true;
        EXIT;
      END LOOP;

      IF NOT achou THEN
        v_dia := v_dia + 1;
        IF EXTRACT(dow FROM v_dia) = 6 THEN v_dia := v_dia + 2;
        ELSIF EXTRACT(dow FROM v_dia) = 0 THEN v_dia := v_dia + 1; END IF;
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'cadencia re-espalhada: % tarefas', movidas;
END $$;

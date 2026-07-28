-- 139: RE-ESPALHA O BACKLOG NA GRADE DE 30 MIN (calendario sem conflito)
--
-- A grade de 5min (134) empacotava ~90 toques/dia e o calendario nao conseguia
-- desenhar sem empilhar. Volta pra 30min: cada toque na sua linha, legivel, sem
-- conflito visual. ~16/dia -> backlog mais longo, mas limpo.
--
-- Mesma logica do 134: reancora pelo DIA PRETENDIDO (criacao + offset, piso hoje),
-- sem empilhamento + folga de 3h entre toques do mesmo lead. Nao toca concluida/
-- avulsa/hora-marcada (so ocupam slot).
DO $$
DECLARE
  TZ      text := 'America/Sao_Paulo';
  hoje    date := (now() AT TIME ZONE TZ)::date;
  SLOT    int  := 10;
  GAP     int  := 180;
  DIA_INI int  := 9 * 60;
  DIA_FIM int  := 18 * 60;
  ALM_INI int  := 11 * 60;
  ALM_FIM int  := 12 * 60;
  t       record;
  v_dia   date;
  v_min   int;
  achou   boolean;
  movidas int := 0;
BEGIN
  CREATE TEMP TABLE ocupado (assigned_to uuid, dia date, min int) ON COMMIT DROP;
  INSERT INTO ocupado
    SELECT a.assigned_to, (s AT TIME ZONE TZ)::date,
           EXTRACT(hour FROM s AT TIME ZONE TZ)::int * 60 + EXTRACT(minute FROM s AT TIME ZONE TZ)::int
      FROM crm_activities a
      CROSS JOIN LATERAL generate_series(
        a.start_date,
        COALESCE(a.end_date, a.start_date + (SLOT || ' minutes')::interval) - interval '1 minute',
        (SLOT || ' minutes')::interval
      ) AS s
     WHERE a.completed = false AND a.deleted_at IS NULL AND a.assigned_to IS NOT NULL
       AND a.start_date >= now() - interval '1 day'
       AND (a.stage_step_id IS NULL OR a.type IN ('meeting','visit','lunch'));

  CREATE TEMP TABLE lead_last (assigned_to uuid, deal_id uuid, dia date, last_min int) ON COMMIT DROP;

  FOR t IN
    SELECT a.id, a.assigned_to, a.deal_id,
           GREATEST(((a.created_at AT TIME ZONE TZ)::date + COALESCE(st.day_offset, 0)), hoje) AS alvo
      FROM crm_activities a
      JOIN crm_stage_steps st ON st.id = a.stage_step_id
     WHERE a.completed = false AND a.deleted_at IS NULL AND a.assigned_to IS NOT NULL
       AND a.type NOT IN ('meeting','visit','lunch')
       AND a.start_date >= now() - interval '1 day'
     ORDER BY a.assigned_to,
              GREATEST(((a.created_at AT TIME ZONE TZ)::date + COALESCE(st.day_offset,0)), hoje),
              COALESCE(st.day_offset, 0), a.created_at, a.id
  LOOP
    v_dia := t.alvo;
    IF EXTRACT(dow FROM v_dia) = 6 THEN v_dia := v_dia + 2;
    ELSIF EXTRACT(dow FROM v_dia) = 0 THEN v_dia := v_dia + 1; END IF;

    achou := false;
    WHILE NOT achou LOOP
      v_min := DIA_INI;
      WHILE v_min + SLOT <= DIA_FIM LOOP
        IF v_min + SLOT > ALM_INI AND v_min < ALM_FIM THEN v_min := v_min + SLOT; CONTINUE; END IF;
        IF NOT EXISTS (SELECT 1 FROM ocupado o WHERE o.assigned_to = t.assigned_to AND o.dia = v_dia AND o.min = v_min)
           AND NOT EXISTS (SELECT 1 FROM lead_last l WHERE l.assigned_to = t.assigned_to AND l.deal_id = t.deal_id AND l.dia = v_dia AND v_min < l.last_min + GAP) THEN
          UPDATE crm_activities
             SET start_date = (v_dia + make_interval(mins => v_min)) AT TIME ZONE TZ,
                 end_date   = (v_dia + make_interval(mins => v_min + SLOT)) AT TIME ZONE TZ,
                 updated_at = now()
           WHERE id = t.id;
          INSERT INTO ocupado VALUES (t.assigned_to, v_dia, v_min);
          DELETE FROM lead_last WHERE assigned_to = t.assigned_to AND deal_id = t.deal_id AND dia = v_dia;
          INSERT INTO lead_last VALUES (t.assigned_to, t.deal_id, v_dia, v_min);
          movidas := movidas + 1; achou := true; EXIT;
        END IF;
        v_min := v_min + SLOT;
      END LOOP;
      IF NOT achou THEN
        v_dia := v_dia + 1;
        IF EXTRACT(dow FROM v_dia) = 6 THEN v_dia := v_dia + 2;
        ELSIF EXTRACT(dow FROM v_dia) = 0 THEN v_dia := v_dia + 1; END IF;
      END IF;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'cadencia re-espalhada (10min): % tarefas', movidas;
END $$;

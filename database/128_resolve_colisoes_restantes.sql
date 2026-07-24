-- 128: RESOLVE AS COLISOES QUE SOBRARAM DEPOIS DO 127
--
-- O 127 recolocou a cadencia pelo dia certo, mas tinha um ponto cego: ele une
-- crm_activities com crm_stage_steps por INNER JOIN. Tarefa cujo passo foi
-- APAGADO do playbook (orfa) ficava fora das duas pontas — nao entrava na lista
-- pra mover NEM na lista de horarios ocupados. Resultado: alguem foi recolocado
-- exatamente em cima dela.
--
-- Este passe nao depende do playbook: olha SO a agenda. Para cada horario com
-- mais de uma tarefa pendente, mantem uma e empurra as demais pro proximo slot
-- livre do dia (rolando pro proximo dia util se lotar).
--
-- Quem FICA no horario, em ordem de prioridade:
--   1. hora marcada (reuniao/visita/almoco) — combinada COM o lead, nao se mexe;
--   2. tarefa avulsa — alguem escolheu aquele horario na mao;
--   3. cadencia — e fila, pode andar.

DO $$
DECLARE
  SLOTS time[] := ARRAY['09:00','09:30','10:00','10:30','12:00','12:30','13:00',
                        '13:30','14:00','14:30','15:00','15:30','16:00','16:30',
                        '17:00','17:30']::time[];
  TZ      text := 'America/Sao_Paulo';
  t       record;
  v_dia   date;
  v_slot  time;
  achou   boolean;
  movidas int := 0;
BEGIN
  -- TODA tarefa pendente ocupa horario, seja ela de que origem for.
  CREATE TEMP TABLE ocupado ON COMMIT DROP AS
    SELECT a.assigned_to,
           (a.start_date AT TIME ZONE TZ)::date AS dia,
           (a.start_date AT TIME ZONE TZ)::time AS hora
      FROM crm_activities a
     WHERE a.completed = false AND a.deleted_at IS NULL AND a.assigned_to IS NOT NULL
       AND a.start_date >= now() - interval '1 day';

  -- Os perdedores de cada colisao: tudo menos o primeiro de cada horario.
  FOR t IN
    SELECT id, assigned_to, start_date
      FROM (
        SELECT a.id, a.assigned_to, a.start_date,
               row_number() OVER (
                 PARTITION BY a.assigned_to, a.start_date
                 ORDER BY CASE WHEN a.type IN ('meeting','visit','lunch') THEN 0
                               WHEN a.stage_step_id IS NULL THEN 1
                               ELSE 2 END,
                          a.created_at, a.id
               ) AS pos
          FROM crm_activities a
         WHERE a.completed = false AND a.deleted_at IS NULL AND a.assigned_to IS NOT NULL
           AND a.start_date >= now() - interval '1 day'
           -- so tarefa que PODE andar: hora marcada nunca sai do lugar
           AND a.type NOT IN ('meeting','visit','lunch')
      ) x
     WHERE x.pos > 1
     ORDER BY assigned_to, start_date
  LOOP
    v_dia := (t.start_date AT TIME ZONE TZ)::date;
    -- Libera o horario que ela ocupava (ela vai sair dali).
    DELETE FROM ocupado o
     WHERE o.assigned_to = t.assigned_to AND o.dia = v_dia
       AND o.hora = (t.start_date AT TIME ZONE TZ)::time
       AND ctid = (SELECT ctid FROM ocupado o2
                    WHERE o2.assigned_to = t.assigned_to AND o2.dia = v_dia
                      AND o2.hora = (t.start_date AT TIME ZONE TZ)::time LIMIT 1);

    achou := false;
    WHILE NOT achou LOOP
      FOREACH v_slot IN ARRAY SLOTS LOOP
        IF NOT EXISTS (SELECT 1 FROM ocupado o
                        WHERE o.assigned_to = t.assigned_to AND o.dia = v_dia AND o.hora = v_slot) THEN
          UPDATE crm_activities
             SET start_date = (v_dia + v_slot) AT TIME ZONE TZ,
                 end_date   = (v_dia + v_slot) AT TIME ZONE TZ + interval '30 minutes',
                 updated_at = now()
           WHERE id = t.id;
          INSERT INTO ocupado VALUES (t.assigned_to, v_dia, v_slot);
          movidas := movidas + 1;
          achou := true;
          EXIT;
        END IF;
      END LOOP;

      IF NOT achou THEN
        v_dia := v_dia + 1;
        IF EXTRACT(dow FROM v_dia) = 6 THEN v_dia := v_dia + 2;
        ELSIF EXTRACT(dow FROM v_dia) = 0 THEN v_dia := v_dia + 1; END IF;
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'colisoes resolvidas: %', movidas;
END $$;

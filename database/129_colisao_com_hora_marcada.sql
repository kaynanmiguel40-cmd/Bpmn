-- 129: TAREFA EM CIMA DE HORA MARCADA
--
-- Correcao do 128. La eu filtrei `type NOT IN ('meeting','visit','lunch')` DENTRO
-- da subquery que ranqueia — ou seja, ANTES de ranquear. Com isso a reuniao saia
-- da particao e a tarefa que estava em cima dela virava "a primeira do horario",
-- ganhando o direito de ficar. Sobrou exatamente esse caso: uma reuniao e uma
-- mensagem no mesmo minuto.
--
-- Aqui a hora marcada PARTICIPA do ranking (e sempre vence, CASE 0) e o filtro de
-- "quem pode andar" vai pro lado de fora. Assim ela mantem o horario e quem
-- estava por cima e que se move.

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
  CREATE TEMP TABLE ocupado ON COMMIT DROP AS
    SELECT a.assigned_to,
           (a.start_date AT TIME ZONE TZ)::date AS dia,
           (a.start_date AT TIME ZONE TZ)::time AS hora
      FROM crm_activities a
     WHERE a.completed = false AND a.deleted_at IS NULL AND a.assigned_to IS NOT NULL
       AND a.start_date >= now() - interval '1 day';

  FOR t IN
    SELECT id, assigned_to, start_date
      FROM (
        SELECT a.id, a.assigned_to, a.start_date, a.type,
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
      ) x
     -- O filtro de "pode andar" vem DEPOIS do ranking: hora marcada entra na
     -- disputa (e ganha), mas nunca e ela a se mover.
     WHERE x.pos > 1 AND x.type NOT IN ('meeting','visit','lunch')
     ORDER BY assigned_to, start_date
  LOOP
    v_dia := (t.start_date AT TIME ZONE TZ)::date;
    DELETE FROM ocupado o
     WHERE o.ctid = (SELECT o2.ctid FROM ocupado o2
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

  RAISE NOTICE 'colisoes com hora marcada resolvidas: %', movidas;
END $$;

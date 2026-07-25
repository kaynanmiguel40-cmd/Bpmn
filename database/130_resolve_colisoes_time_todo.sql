-- 130: RESOLVE COLISOES DA AGENDA — TIME TODO, ATE ZERAR
--
-- Sobra da corrida no agendamento: 4 tarefas novas caíram no mesmo horario que
-- outras (criadas antes do bundle novo com a fila chegar ao navegador de quem
-- moveu os deals). Este passe e a versao definitiva de 128/129: olha SO a agenda
-- (nao depende do playbook, entao pega ate tarefa cujo passo foi apagado), roda
-- pra TODOS os vendedores e repete ate nao sobrar colisao.
--
-- Quem FICA no horario, em ordem: hora marcada (reuniao/visita/almoco, combinada
-- COM o lead) > tarefa avulsa (alguem escolheu na mao) > cadencia (e fila, anda).
-- Hora marcada nunca e a que se move.

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
  passada int := 0;
BEGIN
  -- Repete: recolocar uma tarefa pode revelar outra colisao no destino.
  LOOP
    passada := passada + 1;

    DROP TABLE IF EXISTS ocupado;
    CREATE TEMP TABLE ocupado AS
      SELECT a.assigned_to,
             (a.start_date AT TIME ZONE TZ)::date AS dia,
             (a.start_date AT TIME ZONE TZ)::time AS hora
        FROM crm_activities a
       WHERE a.completed = false AND a.deleted_at IS NULL AND a.assigned_to IS NOT NULL
         AND a.start_date >= now() - interval '1 day';

    -- Perdedores da colisao: tudo menos o 1o de cada (assigned_to, horario).
    DROP TABLE IF EXISTS mover;
    CREATE TEMP TABLE mover AS
      SELECT id, assigned_to, start_date FROM (
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
      -- filtro de "pode andar" DEPOIS do ranking: hora marcada disputa e vence,
      -- mas nunca e ela a se mover.
      WHERE x.pos > 1 AND x.type NOT IN ('meeting','visit','lunch');

    EXIT WHEN NOT EXISTS (SELECT 1 FROM mover);

    FOR t IN SELECT id, assigned_to, start_date FROM mover ORDER BY assigned_to, start_date LOOP
      v_dia := (t.start_date AT TIME ZONE TZ)::date;
      -- Libera o slot que a perdedora ocupava (uma linha).
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

    EXIT WHEN passada >= 20; -- trava de seguranca
  END LOOP;

  RAISE NOTICE 'tarefas recolocadas: % (em % passadas)', movidas, passada;
END $$;

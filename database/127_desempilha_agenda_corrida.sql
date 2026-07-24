-- 127: DESEMPILHA A AGENDA E REANCORA A CADENCIA NO DIA CERTO
--
-- Estrago causado pela CORRIDA no agendamento (corrigida no codigo com a fila em
-- crmPlaybookService): varios leads entravam na etapa ao mesmo tempo, cada
-- scheduleStepsForDeal lia a agenda ocupada ANTES de qualquer um gravar, e todos
-- escolhiam os MESMOS horarios.
--
-- O dano nao parou no empilhamento (15 tarefas no mesmo minuto, 274 sobrepostas):
--   1. o dia passou a parecer cheio (16 slots uteis, 72 tarefas nele);
--   2. o rollover empurrou pro dia seguinte, que tambem estava "cheio";
--   3. o piso de dia cascateou o resto ainda mais longe.
-- Resultado: tarefa de day_offset=0 ("hoje") criada em 23/07 foi cair em 15/09 —
-- 7 semanas atrasada — enquanto a segunda-feira seguinte ficava com 4 tarefas e
-- 12 slots vazios. E a "brecha na agenda que nada preenche".
--
-- ESTE SCRIPT: recoloca cada tarefa de cadencia PENDENTE no dia que a cadencia
-- pediu (data em que foi criada + day_offset do passo, pulando fim de semana) e
-- distribui em horarios DISTINTOS, respeitando expediente 9-18 e almoco 11-12.
--
-- O que ele NAO toca, de proposito:
--   - tarefa concluida (historico);
--   - tarefa avulsa (sem stage_step_id) — hora marcada por uma pessoa;
--   - reuniao/visita/almoco — hora combinada COM o lead. Estas so OCUPAM slot.
--
-- Escopo: so quem realmente tem colisao. Reempacotar quem esta correto so geraria
-- churn na agenda de quem nao tem problema nenhum.

DO $$
DECLARE
  SLOTS time[] := ARRAY['09:00','09:30','10:00','10:30','12:00','12:30','13:00',
                        '13:30','14:00','14:30','15:00','15:30','16:00','16:30',
                        '17:00','17:30']::time[];
  TZ    text := 'America/Sao_Paulo';
  hoje  date := (now() AT TIME ZONE TZ)::date;
  t          record;
  v_dia      date;
  v_slot     time;
  achou      boolean;
  movidas    int := 0;
BEGIN
  -- Donos afetados: tem pelo menos um horario com mais de uma tarefa pendente.
  CREATE TEMP TABLE afetados ON COMMIT DROP AS
    SELECT assigned_to
      FROM crm_activities
     WHERE completed = false AND deleted_at IS NULL AND assigned_to IS NOT NULL
       AND start_date >= now() - interval '1 day'
     GROUP BY assigned_to, start_date
    HAVING count(*) > 1;

  -- Slots ja ocupados por quem NAO se move (avulsa e hora marcada).
  CREATE TEMP TABLE ocupado ON COMMIT DROP AS
    SELECT a.assigned_to,
           (a.start_date AT TIME ZONE TZ)::date AS dia,
           (a.start_date AT TIME ZONE TZ)::time AS hora
      FROM crm_activities a
     WHERE a.completed = false AND a.deleted_at IS NULL
       AND a.assigned_to IN (SELECT DISTINCT assigned_to FROM afetados)
       AND (a.stage_step_id IS NULL OR a.type IN ('meeting','visit','lunch'));

  -- As que serao recolocadas, na ordem que a cadencia manda.
  FOR t IN
    SELECT a.id, a.assigned_to,
           -- Dia que a cadencia pediu: quando foi criada + o offset do passo.
           -- Nunca no passado: o que ficou pra tras vai pra hoje.
           GREATEST(
             ((a.created_at AT TIME ZONE TZ)::date + COALESCE(s.day_offset, 0)),
             hoje
           ) AS alvo,
           COALESCE(s.day_offset, 0) AS off
      FROM crm_activities a
      JOIN crm_stage_steps s ON s.id = a.stage_step_id
     WHERE a.completed = false AND a.deleted_at IS NULL
       AND a.assigned_to IN (SELECT DISTINCT assigned_to FROM afetados)
       AND a.type NOT IN ('meeting','visit','lunch')
     ORDER BY a.assigned_to,
              GREATEST(((a.created_at AT TIME ZONE TZ)::date + COALESCE(s.day_offset,0)), hoje),
              COALESCE(s.day_offset, 0), a.created_at, a.id
  LOOP
    v_dia := t.alvo;
    -- Fim de semana nao trabalha lead.
    IF EXTRACT(dow FROM v_dia) = 6 THEN v_dia := v_dia + 2;
    ELSIF EXTRACT(dow FROM v_dia) = 0 THEN v_dia := v_dia + 1; END IF;

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
        -- Dia lotou (16 slots): rola pro proximo dia util.
        v_dia := v_dia + 1;
        IF EXTRACT(dow FROM v_dia) = 6 THEN v_dia := v_dia + 2;
        ELSIF EXTRACT(dow FROM v_dia) = 0 THEN v_dia := v_dia + 1; END IF;
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'tarefas recolocadas: %', movidas;
END $$;

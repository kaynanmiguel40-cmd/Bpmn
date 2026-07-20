-- ============================================================
-- 096_backfill_agenda_processo.sql
--
-- Gera as tarefas do processo (com data e hora) pros leads que JA estavam
-- parados nas etapas. O gatilho no app e a troca de etapa — quem ja estava la
-- nunca passou por ele, entao a agenda deles esta vazia.
--
-- Regras (as MESMAS do crmScheduling.js):
--   - expediente 9h-18h, slots de 30 min, fuso America/Sao_Paulo
--   - almoco 11h-12h: descarta o slot que comeca dentro E o que invadiria
--   - pula fim de semana
--   - nao encosta em atividade que ja existe na agenda da pessoa
--   - dia alvo = hoje + day_offset do passo
--
-- Sequencial de proposito: cada INSERT ja conta como ocupado pro proximo, senao
-- tudo cairia no mesmo horario.
--
-- Passos com source_tag ficam de fora: so a etapa "Leads" tem, e ela esta sem
-- nenhum negocio — evita replicar aqui a regra de origem que vive no JS.
--
-- Idempotente: passo que ja tem atividade pro negocio e pulado.
-- ============================================================

DO $$
DECLARE
  v_geral uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8';
  v_tz    text := 'America/Sao_Paulo';
  d RECORD;
  s RECORD;
  v_date date;
  v_slot timestamptz;
  v_criadas int := 0;
  -- PEGADINHA: crm_deals.owner_id -> team_members.id, mas
  -- crm_activities.assigned_to -> team_members.auth_user_id. Sao UUIDs
  -- DIFERENTES da mesma pessoa. Gravar o owner_id aqui faz a tarefa existir e
  -- nao aparecer na Agenda (que filtra pelo usuario de auth).
  v_assignee      uuid;
  v_assignee_name text;
BEGIN
  FOR d IN
    SELECT dl.id, dl.owner_id, dl.contact_id, dl.stage_id,
           t.auth_user_id, t.name AS owner_name
    FROM crm_deals dl
    LEFT JOIN team_members t ON t.id = dl.owner_id
    WHERE dl.pipeline_id = v_geral
      AND dl.status = 'open'
      AND dl.deleted_at IS NULL
      AND dl.stage_id IS NOT NULL
    ORDER BY dl.created_at
  LOOP
    v_assignee      := d.auth_user_id;
    v_assignee_name := d.owner_name;

    FOR s IN
      SELECT st.id, st.title, st.day_offset, st.period
      FROM crm_stage_steps st
      WHERE st.stage_id = d.stage_id AND st.source_tag IS NULL
      ORDER BY st.position
    LOOP
      CONTINUE WHEN EXISTS (
        SELECT 1 FROM crm_activities a
        WHERE a.deal_id = d.id AND a.stage_step_id = s.id AND a.deleted_at IS NULL
      );

      v_date := (now() AT TIME ZONE v_tz)::date + COALESCE(s.day_offset, 0);
      v_slot := NULL;

      -- Dia cheio EMPURRA pra frente (ate 60 dias) em vez de descartar a
      -- tarefa. Com varios leads na mesma etapa o dia alvo lota rapido (16
      -- slots uteis), e dropar silenciosamente deixaria lead sem cadencia.
      FOR i IN 0..60 LOOP
        WHILE EXTRACT(dow FROM v_date) IN (0, 6) LOOP
          v_date := v_date + 1;
        END LOOP;

        -- Turno do passo: 'manha' so antes do almoco, 'tarde' so depois. Sem
        -- isto as duas ligacoes do mesmo dia caem as duas de manha (o slot
        -- livre e sempre o mais cedo).
        SELECT q.slot INTO v_slot
        FROM generate_series(
               (v_date + CASE WHEN s.period = 'tarde' THEN time '12:00' ELSE time '09:00' END) AT TIME ZONE v_tz,
               (v_date + CASE WHEN s.period = 'manha' THEN time '10:30' ELSE time '17:30' END) AT TIME ZONE v_tz,
               interval '30 minutes'
             ) AS q(slot)
        WHERE NOT (
                q.slot + interval '30 min' > ((v_date + time '11:00') AT TIME ZONE v_tz)
                AND q.slot < ((v_date + time '12:00') AT TIME ZONE v_tz)
              )
          AND NOT EXISTS (
                SELECT 1 FROM crm_activities a
                WHERE a.deleted_at IS NULL
                  AND a.assigned_to IS NOT DISTINCT FROM v_assignee
                  AND a.start_date < q.slot + interval '30 min'
                  AND COALESCE(a.end_date, a.start_date + interval '30 min') > q.slot
              )
        ORDER BY q.slot
        LIMIT 1;

        EXIT WHEN v_slot IS NOT NULL;
        v_date := v_date + 1;
      END LOOP;

      CONTINUE WHEN v_slot IS NULL;

      INSERT INTO crm_activities
        (title, type, deal_id, contact_id, start_date, end_date, completed, assigned_to, assigned_to_name, stage_step_id)
      VALUES (
        s.title,
        CASE
          WHEN s.title ~* 'e-?mail'                                           THEN 'email'
          WHEN s.title ~* 'liga'                                              THEN 'call'
          WHEN s.title ~* 'whats|audio|áudio|mensagem|material|cartilha|v[ií]deo' THEN 'message'
          WHEN s.title ~* 'reuni|demo'                                        THEN 'meeting'
          ELSE 'task'
        END,
        d.id, d.contact_id, v_slot, v_slot + interval '30 min', false,
        v_assignee, v_assignee_name, s.id
      );
      v_criadas := v_criadas + 1;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Tarefas do processo agendadas: %', v_criadas;
END $$;

SELECT count(*) AS agendadas,
       min(start_date) AS primeira,
       max(start_date) AS ultima
FROM crm_activities
WHERE stage_step_id IS NOT NULL AND deleted_at IS NULL;

NOTIFY pgrst, 'reload schema';

-- ============================================================
-- 103_corrige_turno_das_ligacoes.sql
--
-- As ligacoes agendadas ANTES da coluna `period` existir cairam em qualquer
-- horario livre — 29 tarefas "de manha" estavam marcadas a tarde e 18 "de
-- tarde" estavam de manha. O backfill e idempotente, entao ele nao reagendou
-- essas: so criou as que faltavam.
--
-- Apaga (soft-delete) as PENDENTES que estao fora do turno. O backfill (096)
-- recria cada uma no turno certo, porque agora respeita o period.
--
-- So mexe em completed = false: tarefa ja feita e historico, nao se reagenda.
-- ============================================================

DO $$
DECLARE v_n int;
BEGIN
  UPDATE crm_activities a
  SET deleted_at = now(), updated_at = now()
  FROM crm_stage_steps st
  WHERE st.id = a.stage_step_id
    AND a.deleted_at IS NULL
    AND a.completed = false
    AND st.period IS NOT NULL
    AND (
      (st.period = 'manha' AND (a.start_date AT TIME ZONE 'America/Sao_Paulo')::time >= '11:00')
      OR
      (st.period = 'tarde' AND (a.start_date AT TIME ZONE 'America/Sao_Paulo')::time <  '12:00')
    );
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RAISE NOTICE 'Tarefas fora do turno removidas (serao recriadas pelo backfill): %', v_n;
END $$;

NOTIFY pgrst, 'reload schema';

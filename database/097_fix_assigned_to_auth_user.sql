-- ============================================================
-- 097_fix_assigned_to_auth_user.sql
--
-- CORRIGE o responsavel das tarefas do processo.
--
-- Pegadinha do schema: os dois campos parecem a mesma coisa e NAO sao.
--   crm_deals.owner_id        -> team_members.id           (be3691fd... da Lhorena)
--   crm_activities.assigned_to-> team_members.auth_user_id (66f7bcb3... da Lhorena)
--
-- O backfill (096) gravou o team_members.id em assigned_to. As atividades
-- existiam no banco mas NAO apareciam na Agenda, porque a Agenda filtra pelo
-- usuario de auth. Aqui converte um no outro e preenche assigned_to_name (que
-- as atividades normais tem e as minhas estavam sem).
--
-- Idempotente: rodar de novo nao muda nada.
-- ============================================================

DO $$
DECLARE v_n int;
BEGIN
  UPDATE crm_activities a
  SET assigned_to      = t.auth_user_id,
      assigned_to_name = t.name,
      updated_at       = now()
  FROM crm_deals d
  JOIN team_members t ON t.id = d.owner_id
  WHERE a.deal_id = d.id
    AND a.stage_step_id IS NOT NULL
    AND a.deleted_at IS NULL
    AND t.auth_user_id IS NOT NULL
    AND a.assigned_to IS DISTINCT FROM t.auth_user_id;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RAISE NOTICE 'Tarefas reatribuidas ao usuario de auth: %', v_n;
END $$;

SELECT a.assigned_to, a.assigned_to_name, count(*) AS tarefas
FROM crm_activities a
WHERE a.stage_step_id IS NOT NULL AND a.deleted_at IS NULL
GROUP BY 1, 2;

NOTIFY pgrst, 'reload schema';

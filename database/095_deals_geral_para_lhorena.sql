-- ============================================================
-- 095_deals_geral_para_lhorena.sql
--
-- Poe TODOS os negocios abertos da pipeline Geral sob a Lhorena.
--
-- Por que: as tarefas do processo nascem com assigned_to = dono do negocio.
-- 40 dos 58 leads estavam SEM DONO — as tarefas deles iriam pra agenda de
-- ninguem e nunca seriam trabalhadas.
--
-- Inclui os 5 que estavam com o Kaynan (o pedido foi "joga tudo pra Lhorena").
--
-- ATENCAO: nao guarda o dono anterior. Pra devolver algum lead depois, e na
-- mao — a distribuicao antes disto era: 40 sem dono, 13 Lhorena, 5 Kaynan.
--
-- Idempotente: rodar de novo nao muda nada (todos ja serao dela).
-- ============================================================

DO $$
DECLARE
  v_geral   uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8';
  -- crm_deals.owner_id e TEXT; crm_activities.assigned_to e UUID. O id da
  -- Lhorena e um uuid de verdade (os "member_..." dos outros nao sao), entao
  -- da pra usar nos dois — mas cada um com o seu tipo.
  v_lhorena      text := 'be3691fd-6859-4e76-ac02-58db09489406';
  v_lhorena_uuid uuid := 'be3691fd-6859-4e76-ac02-58db09489406';
  v_n int;
BEGIN
  UPDATE crm_deals
  SET owner_id = v_lhorena, updated_at = now()
  WHERE pipeline_id = v_geral
    AND status = 'open'
    AND deleted_at IS NULL
    AND (owner_id IS DISTINCT FROM v_lhorena);
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RAISE NOTICE 'Negocios movidos pra Lhorena: %', v_n;

  -- As atividades JA geradas pra esses negocios tambem passam pra ela, senao
  -- ficariam orfas na agenda de ninguem.
  UPDATE crm_activities a
  SET assigned_to = v_lhorena_uuid, updated_at = now()
  FROM crm_deals d
  WHERE a.deal_id = d.id
    AND d.pipeline_id = v_geral
    AND a.deleted_at IS NULL
    AND a.completed = false
    AND (a.assigned_to IS DISTINCT FROM v_lhorena_uuid);
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RAISE NOTICE 'Atividades pendentes movidas pra Lhorena: %', v_n;
END $$;

SELECT COALESCE(d.owner_id, '(sem dono)') AS owner_id, t.name, count(*) AS leads
FROM crm_deals d
LEFT JOIN team_members t ON t.id = d.owner_id
WHERE d.pipeline_id = '44b978de-616a-4256-a4cd-40cd4ec8a4a8' AND d.status = 'open'
GROUP BY d.owner_id, t.name;

NOTIFY pgrst, 'reload schema';

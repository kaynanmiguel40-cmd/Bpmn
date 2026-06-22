-- ============================================================
-- 061_close_daily_os_midnight.sql
--
-- NOVO MODELO de fechamento da O.S. (substitui o semanal de sexta):
--   • A O.S. fecha no FIM DO DIA — todo dia à MEIA-NOITE (00:00 BRT).
--   • A SEMANA é a junção dos dias  → fecha sozinha quando o último dia dela fecha.
--   • O MÊS é a junção das semanas   → fecha sozinho quando a última semana fecha.
-- Ou seja: existe UM cron só (diário). Semana e mês não têm cron próprio.
--
-- O que o cron faz à meia-noite: fecha (status 'done') toda O.S. ainda aberta
-- cujo período JÁ TERMINOU — week_end já passou (ou, na falta dele, o
-- sla_deadline). Assim cada O.S. fecha assim que o dia/semana dela acaba, e o
-- relatório do dia/semana/mês fica congelado por consequência.
--
-- Aposenta o cron antigo 'close-weekly-os' (053 / 060, sexta 18h → sáb 00:00).
-- A função public.close_weekly_os() fica no banco (inofensiva), só sem job.
--
-- Brasil é UTC-3 o ano todo → 00:00 BRT = 03:00 UTC.
-- Idempotente: pode rodar de novo sem duplicar nada.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ---------- Função: fecha toda O.S. cujo período já terminou ----------
CREATE OR REPLACE FUNCTION public.close_due_os()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_today date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
BEGIN
  UPDATE public.os_orders
     SET status     = 'done',
         actual_end = COALESCE(actual_end, now()),
         updated_at = now()
   WHERE status IN ('available', 'in_progress')
     -- período encerrado: o fim da semana coberta (ou o prazo SLA) já passou
     AND COALESCE(week_end, (sla_deadline AT TIME ZONE 'America/Sao_Paulo')::date) < v_today;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'close_due_os: % O.S. fechada(s) até %', v_count, v_today;
  RETURN v_count;
END;
$$;

-- ---------- Aposenta o cron semanal antigo ----------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'close-weekly-os') THEN
    PERFORM cron.unschedule('close-weekly-os');
  END IF;
END $$;

-- ---------- Agendamento: todo dia 00:00 BRT (03:00 UTC) ----------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'close-daily-os') THEN
    PERFORM cron.unschedule('close-daily-os');
  END IF;
END $$;

SELECT cron.schedule(
  'close-daily-os',
  '0 3 * * *',                  -- minuto 0, hora 3 UTC, todo dia = 00:00 BRT
  $$ SELECT public.close_due_os(); $$
);

-- ---------- Como testar / conferir ----------
-- Rodar agora e ver quantas fecharam:
--   SELECT public.close_due_os();
-- Ver os jobs (deve ter só 'close-daily-os'; 'close-weekly-os' não deve aparecer):
--   SELECT jobname, schedule, active FROM cron.job WHERE jobname LIKE 'close-%-os';

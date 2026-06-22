-- ============================================================
-- 053_close_weekly_os_cron.sql
--
-- Fecha automaticamente a O.S. da SEMANA toda sexta-feira às 18h (horário de
-- Brasília). A O.S. semanal (a que tem week_start preenchido) da semana corrente
-- vira status 'done' com actual_end = agora.
--
-- O "mega relatório da semana" (união dos diários) e o mensal (união das
-- semanais) NÃO precisam de snapshot: são reconstruídos dinamicamente dos relatos
-- salvos, e como o histórico passado não muda, o relatório de uma semana/mês
-- fechado fica idêntico pra sempre. Ou seja: nada se perde.
--
-- Requer a extensão pg_cron. No Supabase: Database > Extensions > habilite
-- "pg_cron" (ou rode o CREATE EXTENSION abaixo, que é idempotente).
--
-- Brasil é UTC-3 o ano todo (sem horário de verão), então 18:00 BRT = 21:00 UTC.
--
-- Idempotente: pode rodar de novo sem duplicar o agendamento.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ---------- Função: fecha a O.S. da semana corrente ----------
-- Segunda-feira da semana atual no fuso de Brasília → casa com o week_start
-- que o app grava (segunda local). Fecha só as que ainda estão abertas.
CREATE OR REPLACE FUNCTION public.close_weekly_os()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count  integer;
  v_monday date := date_trunc('week', (now() AT TIME ZONE 'America/Sao_Paulo'))::date;
BEGIN
  UPDATE public.os_orders
     SET status     = 'done',
         actual_end = COALESCE(actual_end, now()),
         updated_at = now()
   WHERE week_start = v_monday
     AND status IN ('available', 'in_progress');
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'close_weekly_os: % O.S. fechada(s) da semana %', v_count, v_monday;
  RETURN v_count;
END;
$$;

-- ---------- Agendamento: toda sexta 18:00 BRT (21:00 UTC) ----------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'close-weekly-os') THEN
    PERFORM cron.unschedule('close-weekly-os');
  END IF;
END $$;

SELECT cron.schedule(
  'close-weekly-os',
  '0 21 * * 5',                 -- minuto 0, hora 21 UTC, qualquer dia/mês, sexta (5)
  $$ SELECT public.close_weekly_os(); $$
);

-- ---------- Como testar agora (sem esperar sexta) ----------
-- Rode manualmente e veja quantas fecharam:
--   SELECT public.close_weekly_os();
-- Ver o job agendado:
--   SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'close-weekly-os';

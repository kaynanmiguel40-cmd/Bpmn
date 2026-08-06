-- 150: fila de disparos AGENDADOS de automação (respeita o delay_minutes).
--
-- Bug (bateria func+usab): automação com delay_minutes disparava NA HORA — o
-- delay era ignorado. O disparo roda no front (síncrono no moveDealToStage), sem
-- como esperar. Solução: automação com delay grava aqui um disparo pendente com
-- `dispatch_at = agora + delay`; a edge function `automation-dispatcher` (chamada
-- por um cron de 1 min via pg_net) envia os que venceram e grava o log.

CREATE TABLE IF NOT EXISTS crm_scheduled_automations (
  id            uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  automation_id uuid,
  deal_id       uuid,
  deal_title    text,
  stage_name    text,
  channel       text,        -- 'whatsapp' | 'email'
  recipient     text,        -- telefone ou e-mail (já resolvido no front)
  subject       text,
  body          text,        -- conteúdo já renderizado (template aplicado)
  media_url     text,
  contact_id    uuid,        -- evolution-send exige pra logar a mensagem
  dispatch_at   timestamptz NOT NULL,
  status        text NOT NULL DEFAULT 'pending',  -- pending | sent | failed
  error         text,
  attempts      int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  sent_at       timestamptz
);

-- Busca dos vencidos (o dispatcher roda a cada minuto).
CREATE INDEX IF NOT EXISTS idx_sched_autom_due
  ON crm_scheduled_automations (dispatch_at)
  WHERE status = 'pending';

ALTER TABLE crm_scheduled_automations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crm_scheduled_automations_all ON crm_scheduled_automations;
CREATE POLICY crm_scheduled_automations_all ON crm_scheduled_automations
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON crm_scheduled_automations TO anon, authenticated;

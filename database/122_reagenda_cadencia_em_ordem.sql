-- 122 — reagenda a cadencia pendente em ORDEM, e refresca os titulos antigos.
--
-- As 246 tarefas de cadencia pendentes foram criadas com o planSteps bugado:
-- datas embaralhadas (D2 em 13/08, D9 em 29/07) e esticadas ate 02/09, porque
-- cada toque reservava um slot exclusivo e rolava pra frente pela agenda cheia.
-- O codigo ja esta corrigido (commit ac80e062); aqui arrumamos o que ja existe.
--
-- Regra nova (a mesma do codigo): a data e ANCORADA na entrada na etapa —
-- base = ultima transicao PRA a etapa atual (ou created_at do deal). Cada toque
-- cai em base + day_offset (pulando fim de semana), no turno do passo
-- (manha 09h, tarde 13h, sem turno 10h). Ordem garantida pelo offset crescente.
--
-- Toque no passado vira overdue de verdade — e o certo: se o lead entrou ha 3
-- dias, o D0 dele ESTAVA pra ontem. Nao inflaciona: a maioria entrou 18-20/07.
--
-- Titulo tambem: a tarefa guardou um snapshot velho ("D5 10h — Ligação 4") de
-- antes do playbook ser reescrito. Passa a refletir o passo atual ("D5 manhã").
--
-- Backup: backups/cadencia_datas_antes_20260721.tsv

BEGIN;

WITH entrada AS (
  SELECT d.id AS deal_id, d.stage_id,
    COALESCE(
      (SELECT max(h.created_at)
         FROM crm_deal_stage_history h
        WHERE h.deal_id = d.id AND h.to_stage_id = d.stage_id),
      d.created_at
    )::date AS base
  FROM crm_deals d
  WHERE d.deleted_at IS NULL
),
calc AS (
  SELECT a.id AS activity_id,
    st.title AS titulo_atual,
    -- base + offset, com pulo de fim de semana (empurra 1 unica vez pra segunda)
    (CASE extract(dow FROM (e.base + st.day_offset * interval '1 day'))
       WHEN 6 THEN (e.base + st.day_offset * interval '1 day' + interval '2 day')
       WHEN 0 THEN (e.base + st.day_offset * interval '1 day' + interval '1 day')
       ELSE      (e.base + st.day_offset * interval '1 day')
     END)::date AS dia,
    (CASE st.period
       WHEN 'manha' THEN time '09:00'
       WHEN 'tarde' THEN time '13:00'
       ELSE time '10:00'
     END) AS hora
  FROM crm_activities a
  JOIN crm_stage_steps st ON st.id = a.stage_step_id
  JOIN entrada e ON e.deal_id = a.deal_id
  WHERE a.stage_step_id IS NOT NULL
    AND a.completed = false
    AND a.deleted_at IS NULL
)
UPDATE crm_activities a
SET start_date = (c.dia + c.hora),
    end_date   = (c.dia + c.hora + interval '30 min'),
    title      = c.titulo_atual
FROM calc c
WHERE a.id = c.activity_id;

COMMIT;

-- 118 — configura as duas etapas de reuniao com as flags da 117.
--
-- IDs fixos (pipeline Geral):
--   Reuniao acontecida = f86dbea2-0dc5-4e16-806e-d2eebccfb1d3
--   Reuniao Agendada   = 1d800dd1-f67e-49ab-a8a0-1d1c2eff8d95

BEGIN;

-- 1) SPIN (Reuniao acontecida): todos os 7 passos viram ROTEIRO, nao tarefa.
UPDATE crm_stage_steps
SET agendavel = false
WHERE stage_id = 'f86dbea2-0dc5-4e16-806e-d2eebccfb1d3';

-- 2) Reuniao Agendada e a etapa que abre o modal.
UPDATE crm_pipeline_stages
SET is_meeting_stage = true
WHERE id = '1d800dd1-f67e-49ab-a8a0-1d1c2eff8d95';

-- 3) Os passos da Reuniao Agendada saem da cadencia normal (agendavel=false) e,
--    onde fazem sentido como lembrete, ganham o offset relativo a reuniao:
--      Vespera (D-1)  -> 24h antes  (o modal snapa pra manha do dia anterior)
--      1h antes       -> 60 min antes
--      Na hora +5     -> 5 min DEPOIS (checar no-show)
--    "confirme e mande o convite" (pos 0) e "remarque" (pos 4) ficam so como
--    roteiro: um e a acao do proprio agendamento, o outro e contingencia.
UPDATE crm_stage_steps SET agendavel = false
WHERE stage_id = '1d800dd1-f67e-49ab-a8a0-1d1c2eff8d95';

UPDATE crm_stage_steps SET meeting_offset_minutes = -1440
WHERE id = '954e410f-9fd3-4d70-ab52-66fedd89081b'; -- Vespera (D-1)

UPDATE crm_stage_steps SET meeting_offset_minutes = -60
WHERE id = '810f4e82-094c-4155-b29e-00390ef22140'; -- 1h antes

UPDATE crm_stage_steps SET meeting_offset_minutes = 5
WHERE id = '77ab6b1c-b58e-4341-a2b0-245eff02945d'; -- Na hora — nao apareceu em 5 min

COMMIT;

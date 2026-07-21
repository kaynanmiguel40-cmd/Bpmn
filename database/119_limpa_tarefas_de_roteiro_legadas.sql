-- 119 — tira da Agenda as tarefas de ROTEIRO que o modelo antigo agendou.
--
-- Antes da 117/118, TODO passo de etapa virava tarefa. Os leads que ja estavam
-- na "Reuniao acontecida" ganharam os 7 passos SPIN como tarefas na Agenda. O
-- flag agendavel=false so impede AGENDAR DAQUI PRA FRENTE — nao apaga o que ja
-- foi criado. Estas sao metodologia (como conduzir a reuniao), nao tarefa: saem.
--
-- So PENDENTE: passo de roteiro ja concluido e historico, fica. Soft-delete,
-- reversivel. Backup: backups/tarefas_spin_legadas_20260721.tsv

BEGIN;

UPDATE crm_activities a
SET deleted_at = now()
FROM crm_stage_steps st
WHERE st.id = a.stage_step_id
  AND st.agendavel = false
  AND a.completed = false
  AND a.deleted_at IS NULL;

COMMIT;

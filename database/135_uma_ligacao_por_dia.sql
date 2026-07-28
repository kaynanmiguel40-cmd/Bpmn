-- 135: UMA LIGACAO POR DIA DE CADENCIA (tira o "parece duplicado")
--
-- A cadencia ligava de MANHA E DE TARDE no mesmo dia — dois "Ligação (3
-- tentativas)" identicos por dia, ou seja 6 tentativas de discagem por lead por
-- dia. Alem de parecer clone na agenda, e exagerado. Consolida em UMA ligacao por
-- dia de cadencia (a da manha).
--
-- EXCECAO: "D14 tarde — Ligação + despedida" fica — e o toque de ENCERRAMENTO
-- (break-up), distinto de uma tentativa normal. Nesse dia removo a manha e mantenho
-- a despedida.
--
-- agendavel=false (nao DELETE): o passo some da geracao de tarefas mas continua no
-- playbook — reversivel (basta voltar pra true) e preserva o historico de quem ja
-- marcou. As tarefas PENDENTES desses passos sao soft-deletadas; as concluidas
-- ficam como historico.

-- 1) Desliga os 7 passos redundantes (tarde duplicada + D14 manha).
UPDATE crm_stage_steps SET agendavel = false
 WHERE id IN (
   '87a9bb10-5467-40c0-ab5d-5fc519d333b1', -- D0 tarde
   'a61e3e27-c0fb-4542-97c1-d5cd7c0ce340', -- D2 tarde
   '44ca9499-a002-43de-868f-96e93bfa5aa5', -- D5 tarde
   '45bdcb8c-58ea-47b8-953a-9e30601236d2', -- D7 tarde
   '8d33a7e5-4906-4b8b-ad75-c999189306d5', -- D9 tarde
   'e3c56ca7-05d7-4a4e-b5f0-aa24cca4a4b5', -- D12 tarde (direta)
   'e9b1af10-c709-4cd2-886d-45fe799e2dac'  -- D14 manha (mantem a tarde: despedida)
 );

-- 2) Cancela as tarefas PENDENTES desses passos (nao mexe em concluida).
UPDATE crm_activities SET deleted_at = now(), updated_at = now()
 WHERE completed = false AND deleted_at IS NULL
   AND stage_step_id IN (
     '87a9bb10-5467-40c0-ab5d-5fc519d333b1',
     'a61e3e27-c0fb-4542-97c1-d5cd7c0ce340',
     '44ca9499-a002-43de-868f-96e93bfa5aa5',
     '45bdcb8c-58ea-47b8-953a-9e30601236d2',
     '8d33a7e5-4906-4b8b-ad75-c999189306d5',
     'e3c56ca7-05d7-4a4e-b5f0-aa24cca4a4b5',
     'e9b1af10-c709-4cd2-886d-45fe799e2dac'
   );

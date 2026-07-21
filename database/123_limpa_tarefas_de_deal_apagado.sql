-- 123 — tira da fila as tarefas pendentes de negocio JA APAGADO.
--
-- Apareceram investigando a ordem da cadencia: um deal soft-deletado tinha 8
-- tarefas de cadencia ainda pendentes (deleted_at NULL na tarefa, mas o deal
-- apagado). Sao fantasmas — o negocio nao existe, mas os toques seguiam na fila,
-- e como o reagendamento (122) so olha deal vivo, ficaram com data velha e
-- bagunçavam a checagem de ordem.
--
-- O caminho normal de exclusao ja chama cancelPendingStepsForDeal; este e um
-- caso historico que escapou. Limpeza idempotente: soft-delete de toda tarefa
-- pendente cujo deal esta apagado.

UPDATE crm_activities a
SET deleted_at = now()
FROM crm_deals d
WHERE d.id = a.deal_id
  AND d.deleted_at IS NOT NULL
  AND a.completed = false
  AND a.deleted_at IS NULL;

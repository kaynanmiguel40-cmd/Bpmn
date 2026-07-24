-- 126: DESFECHO DA LIGACAO NA PROPRIA TAREFA
--
-- O modal de execucao ja OBRIGA o vendedor a dizer "Falei com ele" ou "Nao
-- atendeu" antes de concluir uma tarefa de ligacao — mas a resposta nunca era
-- gravada: servia so pra decidir se marcava o passo do playbook como cumprido.
-- Resultado: nao havia como responder "quantas foram atendidas?" a nao ser pela
-- crm_calls (o registro pos-call OPCIONAL, com 8 linhas contra 88 tarefas).
--
-- null = nao informado (tarefa antiga, ou telas que nao perguntam). E o terceiro
-- estado de proposito: fingir que "sem resposta" e "nao atendeu" inventaria
-- fracasso que ninguem reportou.

ALTER TABLE crm_activities ADD COLUMN IF NOT EXISTS contacted boolean;

COMMENT ON COLUMN crm_activities.contacted IS
  'Desfecho da tarefa de ligacao: true = falou com o lead, false = tentou e nao atendeu, null = nao informado.';

-- ---------------------------------------------------------------------------
-- BACKFILL CONSERVADOR do historico.
--
-- O modal grava output='Não atendeu' automaticamente quando o vendedor marca que
-- nao falou (ExecuteTaskModal: output.trim() || (contacted === false ? 'Não
-- atendeu' : '')). Entao:
--   - delivery_report = 'Não atendeu'  -> nao atendeu, com certeza;
--   - delivery_report com texto real   -> ele escreveu o que o LEAD respondeu,
--                                         logo falou com alguem;
--   - delivery_report vazio            -> fica null. NAO chuta.
--
-- Ordem importa: o 'Não atendeu' e nao-vazio, entao tem que virar false ANTES da
-- regra generica (que so pega quem ainda esta null).
-- ---------------------------------------------------------------------------

UPDATE crm_activities
   SET contacted = false
 WHERE type = 'call' AND completed = true AND deleted_at IS NULL
   AND contacted IS NULL
   AND btrim(delivery_report) = 'Não atendeu';

UPDATE crm_activities
   SET contacted = true
 WHERE type = 'call' AND completed = true AND deleted_at IS NULL
   AND contacted IS NULL
   AND delivery_report IS NOT NULL AND btrim(delivery_report) <> '';

-- Recorte do placar: tarefa de ligacao concluida, por desfecho.
CREATE INDEX IF NOT EXISTS idx_crm_activities_call_contacted
    ON crm_activities (type, completed, contacted)
 WHERE deleted_at IS NULL;

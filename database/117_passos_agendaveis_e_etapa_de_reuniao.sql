-- 117 — separa o passo que E TAREFA do passo que e ROTEIRO, e marca a etapa de
-- reuniao.
--
-- O problema: TODO passo de etapa virava tarefa na Agenda. Mas ha dois tipos:
--   1. Cadencia — "D0 ligacao", "D3 WhatsApp" — coisas pra FAZER em dias.
--   2. Metodologia — os 7 passos SPIN da "Reuniao acontecida" (S/P/I/N + preparo
--      + demo) — sao o ROTEIRO de como conduzir a UMA reuniao, nao 7 tarefas em
--      dias diferentes. Agendar cada um enchia a Agenda com o mesmo compromisso
--      picado em sete.
--
-- E a "Reuniao Agendada" tinha o problema oposto: os passos "Vespera (D-1)",
-- "1h antes", "Na hora" so fazem sentido ANCORADOS na reuniao — e nao havia
-- data de reuniao. Ficavam todos em day_offset=0 (hoje), o que nao e vespera de
-- nada.
--
-- Tres colunas resolvem os dois casos:

-- `agendavel` = false: o passo aparece na ficha/execucao como roteiro, mas nunca
-- vira tarefa sozinho. Default true — a cadencia existente continua agendando.
ALTER TABLE crm_stage_steps
  ADD COLUMN IF NOT EXISTS agendavel boolean NOT NULL DEFAULT true;

-- `meeting_offset_minutes`: pra passo de etapa de reuniao, minutos RELATIVOS ao
-- inicio da reuniao (negativo = antes). NULL = nao e lembrete ancorado. O modal
-- de agendamento cria uma tarefa por passo com offset, no horario certo.
ALTER TABLE crm_stage_steps
  ADD COLUMN IF NOT EXISTS meeting_offset_minutes integer;

-- `is_meeting_stage` = true: mover um lead PRA esta etapa abre o modal de marcar
-- dia/hora em vez de agendar a cadencia direto. Default false.
ALTER TABLE crm_pipeline_stages
  ADD COLUMN IF NOT EXISTS is_meeting_stage boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN crm_stage_steps.agendavel IS
  'false = roteiro/metodologia, aparece na ficha mas nunca vira tarefa sozinho (ex: passos SPIN). true = cadencia agendavel.';
COMMENT ON COLUMN crm_stage_steps.meeting_offset_minutes IS
  'Minutos relativos ao inicio da reuniao (negativo=antes). NULL=nao e lembrete de reuniao. Usado quando a etapa e is_meeting_stage.';
COMMENT ON COLUMN crm_pipeline_stages.is_meeting_stage IS
  'true = mover um lead pra ca abre o modal de agendar reuniao (dia+hora) em vez de agendar cadencia.';

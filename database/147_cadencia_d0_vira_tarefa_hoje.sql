-- 147: o 1º contato (D0) da Cadência é tarefa "pra hoje" ASAP (não preso à manhã).
--
-- Sintoma: arrastar um lead pra Cadência de TARDE criava a 1ª tarefa só pra AMANHÃ.
-- Causa: o passo de 1º contato ("D0 manhã", posição 0) é agendável mas com
-- período=manhã — arrastado de tarde, não há slot de manhã hoje e ele rola pro dia
-- seguinte. O "D0 tarde" (posição 1) era só roteiro de retry.
--
-- Fix: o 1º contato (posição 0) passa a período livre (ASAP — cai no próximo slot
-- livre do dia, manhã OU tarde), pra o vendedor ver "ligar hoje" no dia em que
-- arrasta o lead. O "D0 tarde" (posição 1) segue como roteiro de retry (mesmo
-- padrão dos outros dias: manhã = tarefa, tarde = retry).
--
-- Idempotente (por etapa + posição).

UPDATE crm_stage_steps ss
SET agendavel = true,
    period    = NULL,
    title     = 'D0 — Ligação (ligar hoje, 3 tentativas)'
FROM crm_pipeline_stages st
WHERE ss.stage_id = st.id
  AND st.name = 'Cadencia'
  AND ss.day_offset = 0
  AND ss.position = 0;

UPDATE crm_stage_steps ss
SET agendavel = false,
    period    = 'tarde',
    title     = 'D0 tarde — Ligação (3 tentativas)'
FROM crm_pipeline_stages st
WHERE ss.stage_id = st.id
  AND st.name = 'Cadencia'
  AND ss.day_offset = 0
  AND ss.position = 1;

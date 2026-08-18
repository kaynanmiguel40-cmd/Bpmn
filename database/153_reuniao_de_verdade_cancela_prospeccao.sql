-- 153: só REUNIÃO DE VERDADE cancela a prospecção — passo de cadência que apenas
-- FALA em reunião, não.
--
-- ─── O SINTOMA ───────────────────────────────────────────────────────────────
-- "Movi o lead pra etapa e as tarefas não foram geradas." Elas foram: nasceram e
-- morreram no mesmo instante. 35 tarefas de cadência, em 5 leads, entre 06 e
-- 10/08 tinham `deleted_at` EXATAMENTE igual a `created_at` — assinatura de
-- exclusão na MESMA TRANSAÇÃO do insert (no Postgres, now() é o instante da
-- transação, não do comando).
--
-- ─── A CAUSA ─────────────────────────────────────────────────────────────────
-- O `type` da tarefa de cadência é DEDUZIDO DO TÍTULO do passo (stepChannel, em
-- crmScheduling.js): título que casa /reuni|demo/ vira type='meeting'. Passos
-- legítimos de cadência se chamam "Proponha a reunião (2 horários fechados)" e
-- "Mesmo dia da reunião — mande a proposta" — viram 'meeting' sem serem reunião
-- nenhuma; são roteiro de ligação.
--
-- A cadência é gravada em UM insert em lote. O trigger 145/149 é AFTER INSERT
-- FOR EACH ROW: quando chega na linha "meeting", as irmãs do mesmo lote JÁ estão
-- na tabela e visíveis pra transação. O UPDATE do trigger então apaga o próprio
-- lote que acabou de nascer. O lead fica com zero tarefas e ninguém vê erro —
-- o insert deu certo.
--
-- ─── A CORREÇÃO ──────────────────────────────────────────────────────────────
-- Reunião DE VERDADE é compromisso marcado com o lead: entra pela
-- scheduleMeetingForDeal (ou pelo form de tarefa) e tem `stage_step_id NULL`.
-- Passo de playbook SEMPRE tem `stage_step_id`. Essa é a distinção que separa
-- "marquei uma reunião" de "tenho um passo cujo título menciona reunião" — e não
-- depende de adivinhar intenção pelo texto do título, que foi o erro original.
--
-- Efeito colateral resolvido de brinde: os LEMBRETES da reunião (véspera,
-- anti-no-show) têm stage_step_id e também disparavam o cancelamento. A migration
-- 145 dizia em comentário que eles eram preservados; na prática, um lembrete
-- chamado "Confirmar a reunião na véspera" virava 'meeting' e cancelava a
-- cadência. Agora o comentário e o código concordam.
--
-- NÃO corrige os dados já perdidos — as 35 tarefas seguem apagadas. Reagendar é
-- passo separado e explícito (scheduleProcessForPipeline / botão "agendar
-- processo"), que é idempotente e só cria o que falta.

CREATE OR REPLACE FUNCTION cancel_prospecting_on_meeting() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.type IN ('meeting', 'visit')
     -- A LINHA QUE FALTAVA: só compromisso marcado, não passo de playbook.
     AND NEW.stage_step_id IS NULL
     AND NEW.deal_id IS NOT NULL
     AND NEW.completed = false
     AND NEW.deleted_at IS NULL THEN
    UPDATE crm_activities a
    SET deleted_at = now(), updated_at = now()
    WHERE a.deal_id = NEW.deal_id
      AND a.id <> NEW.id
      AND a.completed = false
      AND a.deleted_at IS NULL
      AND a.stage_step_id IS NOT NULL
      AND a.type NOT IN ('meeting', 'visit', 'lunch')
      AND EXISTS (
        SELECT 1
        FROM crm_stage_steps s
        JOIN crm_pipeline_stages ps ON ps.id = s.stage_id
        JOIN crm_deals d ON d.id = NEW.deal_id
        WHERE s.id = a.stage_step_id
          AND ps.pipeline_id = d.pipeline_id
          AND COALESCE(ps.is_meeting_stage, false) = false
          -- só as etapas ANTES da reunião (prospecção); Follow up/Fechamento ficam
          AND ps.position < (
            SELECT MIN(ms.position) FROM crm_pipeline_stages ms
            WHERE ms.pipeline_id = d.pipeline_id AND ms.is_meeting_stage = true
          )
      );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_cancel_prospecting_on_meeting ON crm_activities;
CREATE TRIGGER trg_cancel_prospecting_on_meeting
  AFTER INSERT ON crm_activities
  FOR EACH ROW
  EXECUTE FUNCTION cancel_prospecting_on_meeting();

NOTIFY pgrst, 'reload schema';

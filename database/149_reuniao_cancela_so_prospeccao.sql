-- 149: refina o trigger 145 — marcar reunião cancela SÓ a cadência de PROSPECÇÃO
-- (etapas ANTES da etapa de reunião), não o follow-up de pós-venda.
--
-- Bug (bateria func+usab): o 145 cancelava a cadência de TODA etapa não-reunião do
-- negócio — inclusive "Follow up"/Fechamento, que vêm DEPOIS da reunião. Marcar uma
-- reunião (ex.: nova call de fechamento) apagava o follow-up legítimo.
--
-- Agora só cancela cadência de etapas com POSIÇÃO menor que a da etapa de reunião
-- (is_meeting_stage) no MESMO pipeline do negócio — ou seja, a prospecção fria que
-- de fato ficou obsoleta. Sem etapa de reunião no pipeline, não cancela nada.

CREATE OR REPLACE FUNCTION cancel_prospecting_on_meeting() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.type IN ('meeting', 'visit')
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

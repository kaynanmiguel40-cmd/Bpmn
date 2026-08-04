-- 145: ao MARCAR uma reunião/visita com um lead, cancela a cadência de PROSPECÇÃO
-- pendente dele.
--
-- Sintoma: "gerei reunião com o lead, marquei, e ainda tem tarefa de prospecção".
-- Marcar reunião = você já alcançou o lead — a cadência fria (Entender o Lead,
-- Qualificação, etc.) não faz mais sentido. Antes ela ficava caindo na Fila do
-- vendedor junto com a reunião.
--
-- IMPORTANTE: cancela só a cadência de etapas NÃO-reunião. Os lembretes da própria
-- reunião (véspera, anti-no-show) vivem na etapa is_meeting_stage e SÃO PRESERVADOS.
-- Só cadência (stage_step_id NOT NULL) — tarefa manual não é tocada. Idempotente.

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
        SELECT 1 FROM crm_stage_steps s
        JOIN crm_pipeline_stages ps ON ps.id = s.stage_id
        WHERE s.id = a.stage_step_id
          AND COALESCE(ps.is_meeting_stage, false) = false
      );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_cancel_prospecting_on_meeting ON crm_activities;
CREATE TRIGGER trg_cancel_prospecting_on_meeting
  AFTER INSERT ON crm_activities
  FOR EACH ROW
  EXECUTE FUNCTION cancel_prospecting_on_meeting();

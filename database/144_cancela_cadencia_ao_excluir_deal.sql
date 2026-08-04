-- 144: ao EXCLUIR um negócio, cancela as tarefas de cadência pendentes dele.
--
-- Sintoma: "o sistema está criando/mostrando tarefa pra um lead excluído do CRM".
-- Causa: soft-delete do negócio (deleted_at) não removia os toques de cadência
-- pendentes — eles ficavam na Fila/Agenda do vendedor (e a compactação ainda os
-- reempacotava todo dia). O fix no app (softDeleteCrmDeal) trata o caminho da UI;
-- este trigger é a REDE DE SEGURANÇA pra QUALQUER caminho de exclusão (form de
-- edição, exclusão em massa, manual no banco).
--
-- Só cadência (stage_step_id NOT NULL): tarefa manual com hora escolhida não é
-- tocada. Idempotente.

CREATE OR REPLACE FUNCTION cancel_pending_steps_on_deal_delete() RETURNS trigger
LANGUAGE plpgsql
-- DEFINER: admin excluindo lead de OUTRO vendedor precisa cancelar as tarefas
-- daquele vendedor — a rede de segurança tem que valer cross-user (ignora RLS).
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    UPDATE crm_activities
    SET deleted_at = now(), updated_at = now()
    WHERE deal_id = NEW.id
      AND completed = false
      AND deleted_at IS NULL
      AND stage_step_id IS NOT NULL;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_cancel_steps_on_deal_delete ON crm_deals;
CREATE TRIGGER trg_cancel_steps_on_deal_delete
  AFTER UPDATE OF deleted_at ON crm_deals
  FOR EACH ROW
  EXECUTE FUNCTION cancel_pending_steps_on_deal_delete();

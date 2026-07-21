-- 121 — tarefa manual tambem nasce com dono: quem criou, quando ninguem escolheu.
--
-- A INVESTIGACAO: a suspeita era a cadencia (avanco de etapa) criando tarefa sem
-- dono. Os dados dizem o contrario — cadencia (stage_step_id) NUNCA gerou tarefa
-- sem assigned_to, em toda a historia. As orfas sao todas AVULSAS (tarefa manual,
-- "Ligar para Fernanda", "Cobrar o edson"): o form as vezes nao aplica o dono
-- padrao (lista de responsaveis ainda carregando, ou o campo limpo na mao) e a
-- tarefa entra sem assigned_to — some da fila de todo mundo.
--
-- Mesmo remedio dos negocios (migration 120), mas mais simples: em crm_activities
-- `assigned_to` E `created_by` sao os DOIS o auth_user_id. Entao no INSERT, se
-- assigned_to vier NULL, e o proprio created_by — nao precisa nem de lookup pra
-- resolver o dono, so pro nome.
--
-- Nao toca cadencia nem lembrete de reuniao: esses entram com assigned_to ja
-- preenchido (o dono do deal), e o IG so mexe no que esta NULL.

CREATE OR REPLACE FUNCTION crm_activity_dono_padrao()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.assigned_to IS NULL AND NEW.created_by IS NOT NULL THEN
    NEW.assigned_to := NEW.created_by;
    IF NEW.assigned_to_name IS NULL OR btrim(NEW.assigned_to_name) = '' THEN
      SELECT name INTO NEW.assigned_to_name
      FROM team_members
      WHERE auth_user_id = NEW.created_by
      LIMIT 1;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_activity_dono_padrao ON crm_activities;
CREATE TRIGGER trg_crm_activity_dono_padrao
  BEFORE INSERT ON crm_activities
  FOR EACH ROW
  EXECUTE FUNCTION crm_activity_dono_padrao();

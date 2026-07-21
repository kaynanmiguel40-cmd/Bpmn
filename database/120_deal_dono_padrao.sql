-- 120 — todo negocio nasce com dono: quem criou, quando ninguem foi escolhido.
--
-- O SINTOMA: tarefas caindo na Agenda "sem responsavel". A CAUSA: o negocio
-- estava sem dono. A cadencia agenda a tarefa pro dono do deal (owner_id); se o
-- deal nao tem dono, a tarefa nasce sem `assigned_to` e some da fila de todo
-- mundo — ninguem a ve, ninguem a faz.
--
-- Por que acontece: `owner_id` era opcional em toda criacao (form com o campo em
-- branco, import de lista, prospect->pipeline sem dono marcado). Consertar em
-- cada tela deixaria a proxima tela nova repetir o furo. Um trigger no banco
-- cobre TODO caminho de insert de uma vez — inclusive os que ainda nao existem.
--
-- Regra: no INSERT, se owner_id vier NULL, assume o team_member de quem criou
-- (created_by -> team_members.auth_user_id). Escolha explicita (owner_id
-- preenchido) manda; so preenche o vazio. Se o criador nao for um membro (raro,
-- ex: processo de sistema), fica NULL — nao ha a quem atribuir.

CREATE OR REPLACE FUNCTION crm_deal_dono_padrao()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.owner_id IS NULL AND NEW.created_by IS NOT NULL THEN
    SELECT id INTO NEW.owner_id
    FROM team_members
    WHERE auth_user_id = NEW.created_by
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_deal_dono_padrao ON crm_deals;
CREATE TRIGGER trg_crm_deal_dono_padrao
  BEFORE INSERT ON crm_deals
  FOR EACH ROW
  EXECUTE FUNCTION crm_deal_dono_padrao();

-- Backfill dos que ja estao sem dono: adota o criador. Todos os 13 abertos
-- mapeiam pra um membro; os que nao mapearem ficam como estao.
UPDATE crm_deals d
SET owner_id = tm.id
FROM team_members tm
WHERE d.owner_id IS NULL
  AND d.created_by = tm.auth_user_id
  AND d.deleted_at IS NULL;

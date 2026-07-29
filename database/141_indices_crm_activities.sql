-- 141: indice quente de crm_activities (janelas ocupadas / "minhas tarefas abertas")
--
-- Auditoria de egress (2026-07-29): getOwnerBusyWindows e a fila filtram por
-- (assigned_to, start_date) em tarefas abertas, e NAO havia indice em assigned_to
-- -> full scan a cada abertura do modal de reuniao / carga da fila.
--
-- NOTA: o banco deployado (VPS) ja tinha, criados fora-de-banda, indices em
-- start_date, contact_id, deal_id, completed e deleted_at (o repo nao os
-- versionava). Entao os unicos que faltavam de fato eram os de assigned_to. Este
-- indice PARCIAL cobre "abertas do dono" sem carregar tarefa concluida/apagada.
--
-- Tabela pequena (~1900 linhas) -> CREATE INDEX normal (lock breve), sem
-- CONCURRENTLY, pra rodar no runner transacional do db.mjs.

CREATE INDEX IF NOT EXISTS idx_crm_activities_assigned_open
  ON crm_activities (assigned_to, start_date)
  WHERE completed = false AND deleted_at IS NULL;

-- Rede de seguranca pra ambiente novo (fresh do _apply_all_schema) que ainda nao
-- tenha o indice de faixa de datas do calendario. No-op onde ja existe.
CREATE INDEX IF NOT EXISTS idx_crm_activities_start_date
  ON crm_activities (start_date);

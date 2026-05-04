-- ==========================================================
-- 039_os_participants_checklist_groups.sql
--
-- Reformulacao: o "bloco" agora E o grupo do checklist.
--   - participants[]      : lista de quem trabalha na O.S. (autoridade unica)
--   - checklist_groups[]  : metadados por grupo (assignee, prazo, tempo previsto)
--
-- Os itens do checklist continuam em os_orders.checklist (JSONB),
-- agrupados pelo campo i.group. Aqui guardamos os METADADOS de cada grupo
-- (responsavel, prazo, etc) sem duplicar em cada item.
--
-- Estrutura participants:
--   [{ "id": "<uuid>", "name": "Alice" }, ...]
--
-- Estrutura checklist_groups:
--   [{ "name": "TT", "assigneeId": "<uuid>", "assigneeName": "Alice",
--      "dueAt": "2026-05-10T18:00:00Z", "estimatedMinutes": 120 }, ...]
--
-- Idempotente.
-- ==========================================================

ALTER TABLE public.os_orders
  ADD COLUMN IF NOT EXISTS participants JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.os_orders
  ADD COLUMN IF NOT EXISTS checklist_groups JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.os_orders.participants IS
  'Lista de participantes da O.S. (modo team). Cada item: { id, name }. Fonte unica de verdade pra "quem trabalha aqui".';

COMMENT ON COLUMN public.os_orders.checklist_groups IS
  'Metadados por grupo do checklist (1 grupo = 1 obrigacao de 1 pessoa). Cada item: { name, assigneeId, assigneeName, dueAt, estimatedMinutes }.';

-- Index GIN pra queries do tipo "minhas O.S. por grupo do checklist"
CREATE INDEX IF NOT EXISTS idx_os_orders_checklist_groups
  ON public.os_orders USING GIN (checklist_groups);
CREATE INDEX IF NOT EXISTS idx_os_orders_participants
  ON public.os_orders USING GIN (participants);

-- Backfill: O.S. que ja tem assignee/assigned_to (mode solo legado) ganham
-- o proprio dono em participants[] como conveniencia.
-- Em team antigo (com os_blocks) faria sentido migrar dali — mas mantemos
-- vazio e a UI nova pede pra reatribuir.
UPDATE public.os_orders
   SET participants = jsonb_build_array(
     jsonb_build_object('id', assigned_to, 'name', COALESCE(assignee, ''))
   )
 WHERE participants = '[]'::jsonb
   AND assigned_to IS NOT NULL;

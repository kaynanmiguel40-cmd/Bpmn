-- 019: Adicionar coluna supervisor nas tarefas EAP
-- O supervisor acompanha/monitora a execucao, diferente do assigned_to (executor)

ALTER TABLE public.eap_tasks
  ADD COLUMN IF NOT EXISTS supervisor TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_eap_tasks_supervisor ON public.eap_tasks(supervisor);

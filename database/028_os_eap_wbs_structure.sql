-- 028_os_eap_wbs_structure.sql
-- Vinculo reverso OS → EAP task + caminho WBS para rastreabilidade.
-- Permite agrupar OS pela hierarquia da EAP (Projeto > Pacote > Tarefa).

-- 1) eap_task_id: link reverso da OS para a tarefa EAP que a originou
ALTER TABLE public.os_orders
  ADD COLUMN IF NOT EXISTS eap_task_id TEXT REFERENCES public.eap_tasks(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_os_orders_eap_task ON public.os_orders(eap_task_id);

-- 2) wbs_path: caminho WBS legivel (ex: "1.2.3 — Produto > Marketing > Campanha")
ALTER TABLE public.os_orders
  ADD COLUMN IF NOT EXISTS wbs_path TEXT;

-- 3) Backfill: preencher eap_task_id e wbs_path para OS ja vinculadas
UPDATE public.os_orders
SET eap_task_id = et.id,
    wbs_path    = et.wbs_number
FROM public.eap_tasks et
WHERE et.os_order_id = public.os_orders.id
  AND public.os_orders.eap_task_id IS NULL;

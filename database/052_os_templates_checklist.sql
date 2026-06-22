-- ============================================================
-- 052. OS_TEMPLATES: coluna `checklist` (estrutura de tarefas + briefings)
-- ------------------------------------------------------------
-- Permite salvar uma O.S. inteira como MODELO: grupos + tarefas +
-- o briefing de cada tarefa. Ao aplicar o modelo numa O.S. nova,
-- a estrutura inteira vem pronta (so renomear/ajustar).
--
-- Idempotente: pode rodar mais de uma vez sem erro.
-- ============================================================

ALTER TABLE public.os_templates
  ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb;

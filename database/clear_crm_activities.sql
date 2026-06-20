-- ============================================================
-- clear_crm_activities.sql
--
-- Limpa a AGENDA do CRM: apaga TODAS as atividades/tarefas de lead
-- (crm_activities) que estão lotando o calendário — toques de cadência,
-- follow-ups, reuniões, tarefas, etc.
--
-- NÃO toca em: negócios (crm_deals), ligações (crm_calls), relatos diários
-- (crm_lead_daily_reports), pipelines, estágios nem automações. Só a agenda.
--
-- O `SET session_replication_role = replica` desliga os triggers nesta sessão
-- (incl. o de auditoria que colide PK em delete em massa). Reativado no fim.
--
-- Rode no Supabase → SQL Editor → Run (o script inteiro de uma vez).
-- Hard-delete, IRREVERSÍVEL. Idempotente (rodar de novo não dá erro).
-- ============================================================

SET session_replication_role = replica;

-- Ligações criam uma atividade-espelho (activity_id). Como vamos manter as
-- ligações mas apagar as atividades, zeramos esse vínculo antes pra não deixar
-- referência pendurada.
UPDATE public.crm_calls SET activity_id = NULL WHERE activity_id IS NOT NULL;

-- Apaga todas as atividades da agenda.
DELETE FROM public.crm_activities;

-- ---- (Opcional) Se quiser MANTER o histórico de atividades já concluídas
-- ---- e apagar só as pendentes/futuras que lotam a agenda, troque a linha
-- ---- acima por esta:
--   DELETE FROM public.crm_activities WHERE completed = false;

-- ---- (Opcional) Se quiser apagar só AS SUAS (não as de outros usuários):
--   DELETE FROM public.crm_activities WHERE created_by = '<seu-user-id>';

SET session_replication_role = DEFAULT;

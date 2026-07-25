-- 132: SEM DESFECHO -> NAO ATENDIDO (blanks) / ATENDIDA (o que tem relato de conversa)
--
-- Decisao do dono: ligacao concluida sem desfecho informado conta como NAO
-- ATENDIDA. E o default conservador — nao da credito de "atendida" sem alguem ter
-- dito que atendeu.
--
-- EXCECAO das que tem relato de CONVERSA: uma delas ("Cobrar Tacio — Ele disse que
-- ainda possui interesse mas vai ficar para o inicio do proximo mes") registra que
-- o lead FALOU. Marcar isso como nao atendido contrariaria o proprio relato. Essa
-- vira atendida. As 15 em branco viram nao atendida.

-- 1) Em branco -> nao atendida.
UPDATE crm_activities
   SET contacted = false, updated_at = now()
 WHERE type = 'call' AND completed = true AND deleted_at IS NULL
   AND contacted IS NULL
   AND btrim(COALESCE(delivery_report, '')) = '';

-- 2) Com relato de conversa -> atendida (nao ha caso de relato = "nao atendeu"
--    aqui; o 131 ja separou esses). Restam so relatos que descrevem conversa.
UPDATE crm_activities
   SET contacted = true, updated_at = now()
 WHERE type = 'call' AND completed = true AND deleted_at IS NULL
   AND contacted IS NULL
   AND btrim(COALESCE(delivery_report, '')) <> '';

-- 116 — apaga as mensagens de teste presas na instancia morta.
--
-- Depois de consolidar as instancias (115), sobraram 11 mensagens apontando pra
-- 'crmfyness' — o numero desconectado desde 21/05, ja soft-deletado antes desta
-- sessao. Sao todas de teste do dia em que a integracao Evolution foi montada
-- ("teste", "testando", "Teste via Edge Function"), enviadas pra um @lid, nao
-- pra lead nenhum.
--
-- Por que apagar em vez de deixar: elas apontam pra instancia removida, entao
-- nao aparecem em nenhuma pastilha de numero (so numero conectado vira pastilha)
-- — ficariam invisiveis e eternas. Lixo de setup nao merece ocupar a unica
-- tabela particionada por data do inbox.
--
-- Soft-delete: reversivel, e coerente com o resto do inbox que nunca apaga
-- mensagem de verdade.

BEGIN;

UPDATE crm_messages m
SET deleted_at = now()
FROM crm_whatsapp_instances i
WHERE i.id = m.instance_id
  AND i.deleted_at IS NOT NULL   -- instancia ja removida
  AND m.deleted_at IS NULL;

COMMIT;

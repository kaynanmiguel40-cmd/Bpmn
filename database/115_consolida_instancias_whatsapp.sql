-- 115 — junta as duas instancias que sao o MESMO chip.
--
-- O numero 553584222295 estava cadastrado duas vezes:
--   default          — criada 20/05, parada desde 16/06, 320 mensagens (as antigas)
--   fyness-principal — ativa hoje, e a que o webhook usa agora
--
-- A prova de qual e a viva: o webhook resolve a instancia pelo NOME que a
-- Evolution manda e carimba updated_at a cada mensagem. 'fyness-principal' foi
-- carimbada hoje; 'default' nao recebe nada ha mais de um mes. Logo a Evolution
-- manda 'fyness-principal', e e ela que fica. O codigo concorda: DEFAULT_INSTANCE
-- ja e 'fyness-principal', e o nome literal 'default' nao aparece em lugar nenhum.
--
-- Direcao do merge: as 320 mensagens da 'default' passam a apontar pra
-- 'fyness-principal', e a 'default' sai de cena.
--
-- Backup: backups/instancias_antes_consolidar_20260721.tsv e
--         backups/msg_instance_links_20260721.tsv

BEGIN;

-- 1) As mensagens historicas migram pra instancia viva.
UPDATE crm_messages
SET instance_id = '1b579db1-3f95-46ef-8098-b816fceca798'  -- fyness-principal
WHERE instance_id = 'fbb6d200-f068-413d-b197-8e65fe5443ef' -- default
  AND deleted_at IS NULL;

-- 2) A 'default' sai: soft-delete + RENOMEIA.
--    O rename nao e cosmetico. O indice unico de instance_name inclui linhas
--    soft-deleted, entao deixar o nome 'default' preso na linha morta seria uma
--    bomba: se a Evolution um dia mandar 'default', o auto-registro do webhook
--    tentaria inserir 'default' de novo, colidiria no unico e a mensagem se
--    perderia num 500 eterno. Liberar o nome deixa esse caminho seguro.
UPDATE crm_whatsapp_instances
SET deleted_at   = now(),
    instance_name = 'default-merged-20260721',
    status       = 'disconnected'
WHERE id = 'fbb6d200-f068-413d-b197-8e65fe5443ef';

COMMIT;

-- Move os 40 leads importados de Passos/MG pra etapa LEADS (entrada da pipeline
-- Geral), que é onde eles devem entrar. Eu os havia colocado em "Cadencia" por
-- conta própria — decisão errada, o dono do processo é quem define a porta.
--
-- Junto sai a cadência que gerei: aquelas 520 tarefas apontam pros passos da
-- etapa Cadencia. Com o lead em Leads, elas são cadência de uma etapa onde ele não
-- está — o mesmo entulho que o cancelPendingStepsForDeal existe pra impedir.
-- Quando o vendedor arrastar o lead de Leads pra Cadencia, o app gera a cadência
-- na hora, ancorada naquele momento (que é o certo: a cadência conta a partir do
-- primeiro contato de verdade, não da data do import).

-- GUARD ANTI-BOT: um trigger bloqueia mudança de stage_id vinda de requisição sem
-- usuário autenticado (psql/service_role cai nisso). Ele existe justamente pra
-- impedir que algo automático arraste lead sozinho, então desligo pelo interruptor
-- oficial (crm_cadence_block) e RELIGO no fim.
--
-- Tudo numa transação só de propósito: se qualquer passo falhar, o ROLLBACK desfaz
-- também o desligamento e o guard volta ligado. O modo de falha inaceitável aqui
-- seria o script morrer no meio e deixar a trava aberta em produção.
BEGIN;

UPDATE crm_cadence_block SET blocked = false, updated_at = now() WHERE id = 1;

UPDATE crm_deals
   SET stage_id = '045b4463-5378-4225-adf2-4571651fc016', updated_at = now()
 WHERE source = 'Prospecção ativa — Passos/MG';

UPDATE crm_activities a
   SET deleted_at = now(), updated_at = now()
  FROM crm_deals d
 WHERE a.deal_id = d.id
   AND d.source = 'Prospecção ativa — Passos/MG'
   AND a.stage_step_id IS NOT NULL
   AND a.completed = false
   AND a.deleted_at IS NULL;

-- Histórico de entrada: os negócios foram inseridos direto (sem passar pelo
-- createCrmDeal), então não havia nenhuma linha e o "dias na etapa" do card
-- ficaria sem âncora.
INSERT INTO crm_deal_stage_history (deal_id, from_stage_id, to_stage_id, pipeline_id)
SELECT d.id, NULL, '045b4463-5378-4225-adf2-4571651fc016', d.pipeline_id
  FROM crm_deals d
 WHERE d.source = 'Prospecção ativa — Passos/MG'
   AND NOT EXISTS (SELECT 1 FROM crm_deal_stage_history h WHERE h.deal_id = d.id);

-- Guard de volta ao normal.
UPDATE crm_cadence_block SET blocked = true, updated_at = now() WHERE id = 1;

COMMIT;

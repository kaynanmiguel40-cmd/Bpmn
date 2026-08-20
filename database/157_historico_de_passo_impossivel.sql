-- 157: tira do histórico os passos de origem que NÃO PODIAM ter acontecido.
--
-- ─── POR QUE MEXER EM TAREFA CONCLUÍDA ───────────────────────────────────────
-- A regra da casa é não apagar tarefa concluída: ela aconteceu, com alguém do
-- outro lado, e apagar seria mentir sobre o passado. A migration 156 respeitou
-- isso e só tirou as pendentes.
--
-- Estas sete são a exceção, e a exceção se justifica pelo que os dados mostram:
--
--   · são TODAS o mesmo passo — "Anúncio pago — responder em 5 min";
--   · em leads cuja origem é INDICAÇÃO DE PARCEIRO;
--   · todas concluídas no MESMO DIA (19/08);
--   · nenhuma com uma linha de relato do que o lead respondeu.
--
-- Um protocolo de "responder um anúncio em 5 minutos" não pode ter sido
-- executado num lead que nunca veio de anúncio. Sete iguais, no mesmo dia, sem
-- registro nenhum, é a assinatura de alguém limpando da fila um roteiro que nem
-- deveria estar ali (ver 156: o ramo do playbook era escolhido antes da origem
-- ser preenchida).
--
-- Ou seja: não estamos apagando o registro de um trabalho. Estamos apagando o
-- registro de um trabalho que não houve — e que hoje faz a linha do tempo do
-- lead dizer que a vendedora rodou protocolo de anúncio pago num indicado.
--
-- ─── A TRAVA ─────────────────────────────────────────────────────────────────
-- `delivery_report` vazio é condição OBRIGATÓRIA. Onde houver uma linha do que o
-- lead respondeu, houve conversa de verdade e a tarefa FICA, mesmo com a tag
-- errada — o relato é a prova de que aconteceu, e ele vale mais que a etiqueta.
--
-- Soft-delete: dá pra desfazer com `UPDATE ... SET deleted_at = NULL`.

BEGIN;

WITH cat AS (
  SELECT d.id,
         CASE
           WHEN d.source ~* '(tr[aá]fego|an[uú]ncio|\yads?\y|pago)' THEN 'trafego'
           WHEN d.source ~* '(parceiro|contador)'                   THEN 'parceiro'
           WHEN d.source ~* '(insta|\ydm\y|direct|org[aâ]nic)'      THEN 'instagram'
           WHEN d.source ~* '(indica|cliente)'                      THEN 'cliente'
           ELSE NULL END AS categoria
  FROM crm_deals d WHERE d.deleted_at IS NULL
)
SELECT d.title AS lead, a.title AS sai_do_historico, ss.source_tag AS passo, c.categoria AS lead_e
FROM crm_activities a
JOIN cat c ON c.id = a.deal_id
JOIN crm_deals d ON d.id = a.deal_id
JOIN crm_stage_steps ss ON ss.id = a.stage_step_id
WHERE a.deleted_at IS NULL AND a.completed = true
  AND ss.source_tag IS NOT NULL AND c.categoria IS NOT NULL
  AND ss.source_tag <> c.categoria
  AND coalesce(btrim(a.delivery_report), '') = ''
  AND coalesce(btrim(a.delivery_input), '') = '';

UPDATE crm_activities a
   SET deleted_at = now(), updated_at = now()
  FROM (
    SELECT d.id,
           CASE
             WHEN d.source ~* '(tr[aá]fego|an[uú]ncio|\yads?\y|pago)' THEN 'trafego'
             WHEN d.source ~* '(parceiro|contador)'                   THEN 'parceiro'
             WHEN d.source ~* '(insta|\ydm\y|direct|org[aâ]nic)'      THEN 'instagram'
             WHEN d.source ~* '(indica|cliente)'                      THEN 'cliente'
             ELSE NULL END AS categoria
    FROM crm_deals d WHERE d.deleted_at IS NULL
  ) c
  JOIN crm_stage_steps ss ON true
 WHERE a.deal_id = c.id
   AND ss.id = a.stage_step_id
   AND a.deleted_at IS NULL AND a.completed = true
   AND ss.source_tag IS NOT NULL AND c.categoria IS NOT NULL
   AND ss.source_tag <> c.categoria
   AND coalesce(btrim(a.delivery_report), '') = ''
   AND coalesce(btrim(a.delivery_input), '') = '';

COMMIT;

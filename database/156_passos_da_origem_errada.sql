-- 156: tira da fila os passos de ORIGEM ERRADA que ficaram pendurados.
--
-- ─── O QUE ACONTECEU ─────────────────────────────────────────────────────────
-- A etapa "Leads" tem um passo por origem (anúncio pago, indicação de parceiro,
-- indicação de cliente, Instagram) e o agendador escolhe o ramo pela origem do
-- lead. Só que ele escolhe UMA VEZ, no instante em que o lead entra na etapa — e
-- a origem quase sempre é digitada DEPOIS: no "Leadro art letras" as tarefas
-- nasceram 0,44 segundo depois do negócio, antes de alguém preencher
-- "Indicação de parceiro (Robert)".
--
-- Sem origem, o filterStepsForDeal cai no conjunto INTEIRO (melhor mostrar tudo
-- do que deixar o vendedor sem roteiro). Resultado: lead de indicação com
-- "Anúncio pago — responder em 5 min" na fila.
--
-- O código já foi corrigido: salvar a origem agora refaz o ramo
-- (reconcileStepsForDeal). Isto aqui é o que ficou pendurado antes disso.
--
-- ─── O CRITÉRIO ──────────────────────────────────────────────────────────────
-- Só PENDENTE. Passo já concluído fica: aconteceu de verdade, com alguém do
-- outro lado — apagar seria mentir sobre o passado, mesmo sabendo hoje que era o
-- roteiro errado. (É por isso que o Leadro não aparece aqui: as dele já foram
-- concluídas.)
--
-- A categorização espelha o dealSourceCategory, NA MESMA ORDEM: parceiro antes de
-- indicação, senão "Indicação de parceiro" cairia em 'cliente'. Leads sem origem
-- reconhecível ficam de fora — sem saber a origem, não dá pra dizer qual passo
-- sobra.

BEGIN;

WITH cat AS (
  SELECT d.id,
         CASE
           WHEN d.source ~* '(tr[aá]fego|an[uú]ncio|\yads?\y|pago)' THEN 'trafego'
           WHEN d.source ~* '(parceiro|contador)'                   THEN 'parceiro'
           WHEN d.source ~* '(insta|\ydm\y|direct|org[aâ]nic)'      THEN 'instagram'
           WHEN d.source ~* '(indica|cliente)'                      THEN 'cliente'
           ELSE NULL
         END AS categoria
  FROM crm_deals d
  WHERE d.deleted_at IS NULL AND d.status = 'open'
)
SELECT d.title AS lead, a.title AS tarefa_que_sai, ss.source_tag AS origem_do_passo, c.categoria AS origem_do_lead
FROM crm_activities a
JOIN cat c ON c.id = a.deal_id
JOIN crm_deals d ON d.id = a.deal_id
JOIN crm_stage_steps ss ON ss.id = a.stage_step_id
WHERE a.deleted_at IS NULL AND a.completed = false
  AND ss.source_tag IS NOT NULL AND c.categoria IS NOT NULL
  AND ss.source_tag <> c.categoria;

UPDATE crm_activities a
   SET deleted_at = now(), updated_at = now()
  FROM (
    SELECT d.id,
           CASE
             WHEN d.source ~* '(tr[aá]fego|an[uú]ncio|\yads?\y|pago)' THEN 'trafego'
             WHEN d.source ~* '(parceiro|contador)'                   THEN 'parceiro'
             WHEN d.source ~* '(insta|\ydm\y|direct|org[aâ]nic)'      THEN 'instagram'
             WHEN d.source ~* '(indica|cliente)'                      THEN 'cliente'
             ELSE NULL
           END AS categoria
    FROM crm_deals d
    WHERE d.deleted_at IS NULL AND d.status = 'open'
  ) c
  JOIN crm_stage_steps ss ON true
 WHERE a.deal_id = c.id
   AND ss.id = a.stage_step_id
   AND a.deleted_at IS NULL AND a.completed = false
   AND ss.source_tag IS NOT NULL AND c.categoria IS NOT NULL
   AND ss.source_tag <> c.categoria;

COMMIT;

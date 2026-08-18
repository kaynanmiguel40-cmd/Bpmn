-- 154: tarefa com `assigned_to` apontando pro team_members.id em vez do auth_user_id.
--
-- ─── O SINTOMA ───────────────────────────────────────────────────────────────
-- 6 tarefas MANUAIS da Lhorena, escritas por ela em 16–24/07 ("Mensagem para
-- fechamento", "Verificar se o pagamento foi feito", "Fechamento"), invisíveis
-- na Fila e no Calendário de todo mundo há quase um mês. Não aparecem nem como
-- órfãs, porque `assigned_to` não está nulo — só está errado.
--
-- ─── A CAUSA ─────────────────────────────────────────────────────────────────
-- São DOIS ids diferentes pra mesma pessoa:
--   crm_deals.owner_id        -> team_members.id     (TEXT)
--   crm_activities.assigned_to -> auth.users.id      (UUID)
-- Gravar o primeiro na coluna do segundo faz a linha existir e sumir da tela.
-- A migration 097 já limpou isso, mas só nas linhas com `stage_step_id` (cadência);
-- as tarefas criadas à mão ficaram pra trás — e são justamente estas.
--
-- Por que a tela não se defende sozinha: `ownsTask` casa por id, depois por NOME,
-- depois por quem criou. O fallback por nome cobriria exatamente este caso, mas o
-- primeiro ramo tem `return` — com `assigned_to` preenchido (mesmo errado), os
-- outros dois nunca rodam.
--
-- ─── A CORREÇÃO ──────────────────────────────────────────────────────────────
-- Traduz o id, sem hardcode de pessoa: casa `assigned_to` contra team_members.id
-- e grava o auth_user_id do mesmo membro. Idempotente — rodar de novo não acha
-- mais nada, porque depois da troca o valor deixa de casar com um team_members.id.
--
-- Mexe também nas linhas já apagadas (deleted_at): são o mesmo defeito, e deixar
-- dado sabidamente errado pra trás só porque hoje é inofensivo é como ele volta
-- (basta alguém restaurar a tarefa).

BEGIN;

-- Confere ANTES: quantas linhas e de quem.
SELECT tm.name AS membro, count(*) AS linhas_a_corrigir,
       count(*) FILTER (WHERE a.completed = false AND a.deleted_at IS NULL) AS pendentes
FROM crm_activities a
JOIN team_members tm ON tm.id = a.assigned_to::text
WHERE tm.auth_user_id IS NOT NULL
GROUP BY 1;

UPDATE crm_activities a
   SET assigned_to = tm.auth_user_id,
       -- O nome costuma estar certo (é texto livre); preenche só se faltar, pra o
       -- fallback por nome ter em que se apoiar caso o id volte a divergir.
       assigned_to_name = COALESCE(NULLIF(btrim(a.assigned_to_name), ''), tm.name),
       updated_at = now()
  FROM team_members tm
 WHERE tm.id = a.assigned_to::text
   AND tm.auth_user_id IS NOT NULL;

-- Confere DEPOIS: tem que voltar zero linhas.
SELECT count(*) AS sobrou
FROM crm_activities a
JOIN team_members tm ON tm.id = a.assigned_to::text
WHERE tm.auth_user_id IS NOT NULL;

COMMIT;

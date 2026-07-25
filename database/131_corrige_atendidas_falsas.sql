-- 131: CORRIGE ATENDIDAS FALSAS DO BACKFILL 126
--
-- O 126 marcou contacted=true pra QUALQUER tarefa de ligacao com relato nao-vazio,
-- presumindo que texto = conversa. Errado: um relato como "Não atendeu.", "Não me
-- atendeu", "Sem retorno." descreve o CONTRARIO — a pessoa nao atendeu. So o texto
-- EXATO "Não atendeu" (que o modal grava sozinho) tinha virado false; as variacoes
-- (com ponto, "não me atendeu", "sem retorno") escaparam pra true e inflaram a
-- taxa de atendimento.
--
-- Reclassifica pra false SO o que e claramente nao-atendimento. O criterio ancora
-- no INICIO do relato ("não atendeu...", "sem retorno...", "liguei... não atendeu")
-- de proposito: isso separa as narrativas em que o lead RETORNOU e falou — ex:
-- "Ele me retornou que o sistema não atendeu o financeiro dele" (o "não atendeu" e
-- do sistema, e houve conversa) — que continuam corretamente como atendidas.
--
-- "Não tem interesse", "recusou", "não gostou" NAO entram: a pessoa ATENDEU e
-- declinou — atendida de verdade.

UPDATE crm_activities
   SET contacted = false, updated_at = now()
 WHERE type = 'call' AND completed = true AND deleted_at IS NULL
   AND contacted = true
   AND (
     btrim(delivery_report) ~* '^(n[ãa]o (me )?(atend|retorn)|sem retorno|liga[çc][ãa]o n[ãa]o atend)'
     OR btrim(delivery_report) ~* '^liguei .*n[ãa]o atend'
   );

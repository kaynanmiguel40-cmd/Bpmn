-- ============================================================
-- 099_ligacoes_3_tentativas_com_recado.sql
--
-- Toda LIGACAO da cadencia vira "3 tentativas", e nao atendendo o vendedor
-- DEIXA MENSAGEM. Antes o roteiro mandava "sem recado na 1a" e o toque morria
-- sem deixar rastro nenhum pro lead.
--
-- UPDATE por POSICAO, nao delete+insert. O 085 (que criou os passos) apaga e
-- recria; se rodasse de novo, os ids novos deixariam as 154 atividades ja
-- agendadas ORFAS (crm_activities.stage_step_id e ON DELETE SET NULL) e o
-- progresso dos leads iria junto no CASCADE. Aqui os ids sobrevivem.
--
-- Idempotente: reaplica o mesmo texto.
-- ============================================================

DO $$
DECLARE
  v_geral uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8';
  s2 uuid;
BEGIN
  SELECT id INTO s2 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=2; -- Primeiro contato

  UPDATE crm_pipeline_stages SET
    objetivo = $s$Logo depois do audio (etapa Leads), LIGAR na mesma hora. Cada ligacao sao ate 3 tentativas — nao atendeu, deixa mensagem e segue a cadencia de 14 dias ate o lead responder.$s$
  WHERE id=s2;

  -- pos 0 — Ligar agora
  UPDATE crm_stage_steps SET
    title = $s$Ligar agora (3 tentativas) — na mesma hora do áudio$s$,
    script = $s$Mandou o audio no Leads? Liga na sequencia, sem esperar. Liga ate 3x antes de desistir do toque.
"Oi [nome]! Acabei de te mandar um audio — aqui e a [consultora] da Fyness. Voce tem 15 minutinhos pra eu te mostrar como funciona?"$s$,
    scenarios = $j$[
      {"when":"Atendeu e conversou","then":"Ja era! Puxa a conversa e passa pra qualificacao — mova o card pra Respondeu."},
      {"when":"Nao atendeu nas 3","then":"Deixa mensagem: \"Oi [nome], acabei de te ligar! Sou a [consultora] da Fyness. Me fala um horario bom que eu te chamo.\" Depois segue pro proximo toque."}
    ]$j$::jsonb
  WHERE stage_id = s2 AND position = 0;

  -- pos 1 — Ligacao 2 (mesmo dia, a tarde)
  UPDATE crm_stage_steps SET
    title = $s$Mesmo dia, à tarde — Ligação 2 (3 tentativas)$s$,
    script = $s$Nao atendeu de manha? Liga de novo no fim do dia (horario oposto), ate 3x.
"Oi [nome], tentei te pegar mais cedo. Voce tem 15 minutinhos agora?"$s$,
    scenarios = $j$[
      {"when":"Atendeu","then":"Boa! Puxa a conversa e move pra Respondeu."},
      {"when":"Nao atendeu nas 3","then":"Deixa mensagem: \"Oi [nome], tentei de novo aqui! Qual o melhor horario pra te ligar amanha?\" Segue pro proximo toque."}
    ]$j$::jsonb
  WHERE stage_id = s2 AND position = 1;

  -- pos 2 — Ligacao 3 (almoco)
  UPDATE crm_stage_steps SET
    title = $s$D2 13h — Ligação 3 (3 tentativas, almoço)$s$,
    script = $s$Ligar no horario do almoco, ate 3x (variar horario sobe o atendimento).
"Oi [nome], sei que o corre e grande — separo 15 min no seu melhor horario pra te mostrar."$s$,
    scenarios = $j$[
      {"when":"Atendeu","then":"Move pra Respondeu e qualifica."},
      {"when":"Nao atendeu nas 3","then":"Deixa mensagem: \"Oi [nome], liguei na hora do almoco pra nao atrapalhar o expediente. Me diz a melhor hora que eu me adapto.\" Proximo toque e no WhatsApp (D3)."}
    ]$j$::jsonb
  WHERE stage_id = s2 AND position = 2;

  -- pos 4 — Ligacao 4
  UPDATE crm_stage_steps SET
    title = $s$D5 10h — Ligação 4 (3 tentativas)$s$,
    script = $s$Ligar de manha, ate 3x. "Oi [nome], vi que voce deu uma olhada no material. Posso te explicar em 5 min por telefone?"$s$,
    scenarios = $j$[
      {"when":"Atendeu","then":"Move pra Respondeu e qualifica."},
      {"when":"Nao atendeu nas 3","then":"Deixa mensagem: \"Oi [nome], te liguei hoje de manha! Voce chegou a ver o material que mandei? Qualquer duvida me chama.\" Segue pro toque de valor (D6)."}
    ]$j$::jsonb
  WHERE stage_id = s2 AND position = 4;

  -- pos 6 — Ligacao 5
  UPDATE crm_stage_steps SET
    title = $s$D7 19h — Ligação 5 (3 tentativas)$s$,
    script = $s$Ligar no fim do expediente, ate 3x. Tom leve, sem cobrar. "Oi [nome], so passando pra saber se faz sentido a gente conversar."$s$,
    scenarios = $j$[
      {"when":"Atendeu","then":"Move pra Respondeu e qualifica."},
      {"when":"Nao atendeu nas 3","then":"Deixa mensagem: \"Oi [nome], passei aqui rapidinho. Se fizer sentido conversar me chama — se nao for a hora, tudo bem tambem.\" Segue pro proximo toque (D9)."}
    ]$j$::jsonb
  WHERE stage_id = s2 AND position = 6;

  -- pos 7 — Ligacao 6 (pergunta facil)
  UPDATE crm_stage_steps SET
    title = $s$D9 11h — Ligação 6 (3 tentativas, pergunta fácil)$s$,
    script = $s$Ligar ate 3x com uma pergunta de baixo atrito. "Oi [nome]! Deixa eu te perguntar 1 coisa direta — voce ainda controla as financas no caderno ou ja usa alguma coisa? Pergunta de curiosa mesmo."$s$,
    scenarios = $j$[
      {"when":"Respondeu a pergunta","then":"Achou o gancho! Puxa a conversa e move pra Respondeu."},
      {"when":"Nao atendeu nas 3","then":"Deixa a MESMA pergunta por mensagem: \"Oi [nome]! So uma curiosidade: voce ainda controla as financas no caderno ou ja usa alguma coisa?\" Pergunta facil costuma destravar. Segue pro D10."}
    ]$j$::jsonb
  WHERE stage_id = s2 AND position = 7;

  -- pos 9 — Ligacao 7 (direta)
  UPDATE crm_stage_steps SET
    title = $s$D12 14h — Ligação 7 (3 tentativas, direta)$s$,
    script = $s$Ligar ate 3x, direto ao ponto. "Oi [nome], vou ser direta: faz sentido a gente conversar ou nao? Se nao for a hora, sem problema — so me fala."$s$,
    scenarios = $j$[
      {"when":"Diz que sim","then":"Move pra Respondeu e qualifica."},
      {"when":"Diz que nao","then":"Respeita, agradece e encerra (Nurturing)."},
      {"when":"Nao atendeu nas 3","then":"Deixa a pergunta por mensagem: \"Oi [nome], vou ser direta: ainda faz sentido a gente conversar? Qualquer resposta ta ok — so preciso saber.\" Ultimo toque e a despedida (D14)."}
    ]$j$::jsonb
  WHERE stage_id = s2 AND position = 9;

  -- pos 10 — Ligacao 8 + despedida
  UPDATE crm_stage_steps SET
    title = $s$D14 19h — Ligação 8 (3 tentativas) + despedida$s$,
    script = $s$Ultima tentativa: liga ate 3x. Atendendo ou nao, manda a despedida no WhatsApp — e o toque que mais destrava no fim da fila.
"Oi [nome], entendi que agora nao e o momento. Vou parar de te chamar pra nao te incomodar. Quando precisar, me manda 1 oi aqui que retomo na hora. Sucesso!"$s$,
    scenarios = $j$[
      {"when":"Responde (a despedida destrava em 15-30%)","then":"Que bom! Puxa a conversa e move pra Respondeu."},
      {"when":"Nao atendeu nas 3","then":"Manda a despedida por mensagem mesmo assim — e ela que costuma trazer a resposta."},
      {"when":"Silencio","then":"Encerra a cadencia e manda pra Nurturing (reativa mais pra frente)."}
    ]$j$::jsonb
  WHERE stage_id = s2 AND position = 10;

  RAISE NOTICE 'Ligacoes da cadencia: 3 tentativas + recado.';
END $$;

-- Confere: titulos e se as atividades continuam ligadas aos passos.
SELECT st.position, st.title
FROM crm_stage_steps st
JOIN crm_pipeline_stages s ON s.id = st.stage_id
WHERE s.pipeline_id = '44b978de-616a-4256-a4cd-40cd4ec8a4a8' AND s.position = 2
ORDER BY st.position;

SELECT count(*) AS atividades_ainda_ligadas
FROM crm_activities WHERE stage_step_id IS NOT NULL AND deleted_at IS NULL;

NOTIFY pgrst, 'reload schema';

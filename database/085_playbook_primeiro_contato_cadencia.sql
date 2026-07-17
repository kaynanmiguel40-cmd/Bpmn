-- ============================================================
-- 085_playbook_primeiro_contato_cadencia.sql
--
-- Reescreve a etapa "Primeiro contato" (Geral) como a cadencia de 14 dias em
-- TAREFAS: um toque por passo, na ordem, pra qualquer um seguir. Antes era tudo
-- amontoado num passo so ("D1 Lig1 / D1 Lig2 / ...").
--
-- Titulo = QUANDO + O QUE; script = a fala/acao curta. Leu, fez, marcou.
-- Refresca os passos (delete + insert) — idempotente no conteudo.
-- ============================================================

DO $$
DECLARE
  v_geral uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8';
  s2 uuid;
BEGIN
  SELECT id INTO s2 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=2; -- Primeiro contato

  UPDATE crm_pipeline_stages SET
    objetivo = $s$Logo depois do audio (etapa Leads), LIGAR na mesma hora. Se nao atender, seguir a cadencia de 14 dias — um toque por dia, variando horario — ate o lead responder.$s$,
    exit_criteria = $s$Lead respondeu qualquer coisa → mover pra Respondeu. Terminou a cadencia sem resposta → Nurturing.$s$
  WHERE id=s2;

  DELETE FROM crm_stage_steps WHERE stage_id = s2;

  INSERT INTO crm_stage_steps (stage_id, position, title, script) VALUES
    (s2, 0,  $s$Ligar agora — na mesma hora do áudio$s$, $s$Mandou o audio no Leads? Liga na sequencia, sem esperar. "Oi [nome]! Acabei de te mandar um audio — aqui e a [consultora] da Fyness. Voce tem 15 minutinhos pra eu te mostrar como funciona?"$s$),
    (s2, 1,  $s$Mesmo dia, à tarde — Ligação 2$s$, $s$Nao atendeu de manha? Liga de novo no fim do dia (horario oposto). "Oi [nome], tentei te pegar mais cedo. Voce tem 15 minutinhos agora?"$s$),
    (s2, 2,  $s$D2 13h — Ligação 3 (almoço)$s$, $s$Ligar no horario do almoco (variar horario sobe o atendimento). Mesma proposta: 15 min pra mostrar a ferramenta.$s$),
    (s2, 3,  $s$D3 — WhatsApp + cartilha (1 página)$s$, $s$Oi [nome]! Te mando aqui em 1 imagem como a Fyness funciona. Da uma olhada quando puder — qualquer duvida, me chama. (anexar a cartilha de 1 pagina)$s$),
    (s2, 4,  $s$D5 10h — Ligação 4$s$, $s$Ligar de manha. "Oi [nome], vi que voce ainda nao deu uma olhada. Posso te explicar em 5 min por telefone?"$s$),
    (s2, 5,  $s$D6 — WhatsApp de valor (dica rápida)$s$, $s$Da uma dica util antes de vender (vale mesmo se nao fechar — cria reciprocidade). Mesma mensagem pra todo mundo: "Oi [nome]! Deixa uma dica que serve mesmo se a gente nunca fechar: tenha UMA conta so pro CNPJ e passe toda venda por ela — ja organiza metade da bagunca. Se quiser, te mostro como deixar isso no automatico em 5 min."$s$),
    (s2, 6,  $s$D7 19h — Ligação 5$s$, $s$Ligar no fim do expediente. Tom leve, sem cobrar. "Oi [nome], so passando pra saber se faz sentido a gente conversar."$s$),
    (s2, 7,  $s$D9 11h — Ligação 6 (pergunta fácil)$s$, $s$Oi [nome]! Deixa eu te perguntar 1 coisa direta — voce ainda controla as financas no caderno ou ja usa alguma coisa? Pergunta de curiosa mesmo.$s$),
    (s2, 8,  $s$D10 — Material de valor (pro lead)$s$, $s$Manda um material que ajuda o lead mesmo sem fechar (guia, checklist, planilha modelo de controle financeiro). "Oi [nome]! Te mando esse material que vai te ajudar a organizar o financeiro — de graca, sem compromisso. Da uma olhada e me fala o que achou!"$s$),
    (s2, 9,  $s$D12 14h — Ligação 7 (direta)$s$, $s$Oi [nome], vou ser direta: faz sentido a gente conversar ou nao? Se nao for a hora, sem problema — so me fala.$s$),
    (s2, 10, $s$D14 19h — Ligação 8 + despedida$s$, $s$Ultima tentativa + despedida: "Oi [nome], entendi que agora nao e o momento. Vou parar de te chamar pra nao te incomodar. Quando precisar, me manda 1 oi aqui que retomo na hora. Sucesso!"$s$);

  RAISE NOTICE 'Primeiro contato: cadencia de 14 dias em 11 tarefas.';
END $$;

SELECT st.position, st.title
FROM crm_stage_steps st
JOIN crm_pipeline_stages s ON s.id = st.stage_id
WHERE s.pipeline_id='44b978de-616a-4256-a4cd-40cd4ec8a4a8' AND s.position=2
ORDER BY st.position;

NOTIFY pgrst, 'reload schema';

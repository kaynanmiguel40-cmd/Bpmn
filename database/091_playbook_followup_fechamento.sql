-- ============================================================
-- 091_playbook_followup_fechamento.sql
--
-- Etapa "Follow up" (Geral): o lead JA teve a reuniao. Aqui e a CADENCIA DE
-- FECHAMENTO — os toques, dia a dia, pra ele assinar. As objecoes (preciso
-- pensar / ta caro / nao e o momento) viram CENARIOS dentro de cada toque, em
-- vez de passos soltos.
--
-- Precos: anual R$67/mes (R$2,20/dia) e a ancora; mensal R$97 e a opcao B.
-- Carencia: assina hoje, 1a cobranca em ate 15 dias (substitui o trial).
-- Desconto so com contrapartida + aprovacao do gestor.
--
-- Refresca os passos (delete + insert) — idempotente no conteudo.
-- ============================================================

DO $$
DECLARE
  v_geral uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8';
  s7 uuid;
BEGIN
  SELECT id INTO s7 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=7; -- Follow up

  UPDATE crm_pipeline_stages SET
    objetivo = $s$O lead ja viu a solucao na reuniao. Objetivo unico: fazer ele FECHAR. Seguir a cadencia de toques ate ter um sim ou um nao claro.$s$,
    exit_criteria = $s$Assinou → mover pra Cliente. Disse nao ou sumiu apos a cadencia → Nurturing (retoma mais pra frente).$s$
  WHERE id=s7;

  DELETE FROM crm_stage_steps WHERE stage_id = s7;

  INSERT INTO crm_stage_steps (stage_id, position, title, script, scenarios) VALUES
    (s7, 0,
      $s$Mesmo dia da reunião — mande a proposta$s$,
      $s$Manda ainda quente, no mesmo dia: "[nome], foi otimo nossa conversa! Como combinei, te mando aqui: no anual sai R$67/mes — R$2,20 por dia, menos que um cafezinho. No mensal, R$97. E o melhor: voce assina hoje e a primeira cobranca so cai em ate 15 dias, entao ja comeca usando sem tirar do bolso agora."$s$,
      $j$[
        {"when":"Quer fechar","then":"Perfeito! Te mando o contrato agora — assina em 2 minutos e ja comecamos hoje."},
        {"when":"\"Preciso pensar\"","then":"Claro, [nome]! So me diz: qual a duvida que ta te travando? Prefiro resolver agora do que te deixar na duvida."},
        {"when":"\"Ta caro\"","then":"Entendo. Mas lembra do que voce me falou: voce ta perdendo [valor do SPIN] por mes sem controle. R$67/mes se paga no primeiro mes — e voce so paga daqui 15 dias."}
      ]$j$::jsonb),
    (s7, 1,
      $s$D1 — O que travou?$s$,
      $s$"[nome], enquanto a gente conversa, o financeiro continua no escuro. Me fala com sinceridade: o que ta te travando pra comecar?"$s$,
      $j$[
        {"when":"Diz a duvida","then":"Trata a duvida direto e ja volta pro fechamento: \"Resolvido isso, a gente comeca hoje?\""},
        {"when":"\"E o preco\"","then":"\"Quanto voce perde por mes sem saber pra onde vai o dinheiro? O Fyness custa R$2,20 por dia e te devolve esse controle.\""},
        {"when":"Nao respondeu","then":"Segue pro proximo toque (D3), sem cobrar."}
      ]$j$::jsonb),
    (s7, 2,
      $s$D3 — Jogadinhas pra destravar a resposta$s$,
      $s$Sumiu depois da reuniao? Usa uma jogadinha pra reabrir a conversa (uma por vez, nao todas de uma vez):

• AUDIO SEM SOM — manda um audio mudo de uns 5s. Ele responde "nao deu pra ouvir" e a conversa reabre. Ai voce: "Ops! Era pra te perguntar se voce ja decidiu sobre a proposta 😄"
• AUDIO CURTO (5-8s) no lugar de texto longo — da muito mais resposta.
• MENSAGEM DE UMA LINHA — "[nome], so um sim ou nao: ainda faz sentido pra voce?"
• LIGACAO PERDIDA + mensagem logo depois: "te liguei, viu? era rapidinho."
• TROCA DE CANAL — nao responde no zap? Liga. Nao atende? Chama no Instagram.
• GANCHO PESSOAL — manda algo do negocio dele: "vi seu post de [assunto] e lembrei de voce."$s$,
      $j$[
        {"when":"Respondeu qualquer coisa","then":"Conversa reaberta! Emenda na hora: \"Aproveitando que te peguei — o que faltou pra voce decidir?\""},
        {"when":"Continua sem responder","then":"Nao insiste na mesma jogadinha. Segue pro D5 (tirar o risco)."}
      ]$j$::jsonb),
    (s7, 3,
      $s$D5 — Tira o risco (carência de 15 dias)$s$,
      $s$"[nome], deixa eu tirar o risco pra voce: assina hoje e a primeira cobranca so cai em ate 15 dias. Voce entra, manda o primeiro comprovante no WhatsApp, ve funcionando — e so depois paga. Se nao fizer sentido, e so falar."$s$,
      $j$[
        {"when":"Topa comecar","then":"Show! Te mando o contrato agora."},
        {"when":"Ainda hesita","then":"\"O que precisaria acontecer pra voce se sentir seguro de comecar?\" — descobre o real motivo."}
      ]$j$::jsonb),
    (s7, 4,
      $s$D7 — Pergunta direta (sim ou não)$s$,
      $s$"[nome], vou ser direta pra nao ficar te enchendo: faz sentido pra voce comecar agora ou nao e a hora? Qualquer resposta ta ok — so preciso saber."$s$,
      $j$[
        {"when":"Diz sim","then":"\"Perfeito! Te mando o contrato agora.\""},
        {"when":"\"Nao e a hora\"","then":"\"Tranquilo! Marco de te procurar daqui uns 30 dias, pode ser? Enquanto isso te mando conteudo que ajuda.\" → Nurturing."},
        {"when":"Nao responde","then":"Vai pro ultimo toque (D10)."}
      ]$j$::jsonb),
    (s7, 5,
      $s$D10 — Última chance + porta aberta$s$,
      $s$"[nome], vou parar de te chamar pra nao incomodar. Quando quiser tirar o financeiro do escuro, me manda 1 oi que eu retomo na hora — sua proposta fica de pe. Sucesso ai!"$s$,
      $j$[
        {"when":"Responde (a despedida costuma destravar)","then":"\"Que bom! Bora fechar entao — te mando o contrato agora.\""},
        {"when":"Silencio","then":"Encerra a cadencia e manda pra Nurturing pra reativar mais pra frente."}
      ]$j$::jsonb);

  RAISE NOTICE 'Follow up: cadencia de fechamento pos-reuniao (6 toques).';
END $$;

SELECT st.position, st.title, jsonb_array_length(st.scenarios) AS cenarios
FROM crm_stage_steps st
JOIN crm_pipeline_stages s ON s.id = st.stage_id
WHERE s.pipeline_id='44b978de-616a-4256-a4cd-40cd4ec8a4a8' AND s.position=7
ORDER BY st.position;

NOTIFY pgrst, 'reload schema';

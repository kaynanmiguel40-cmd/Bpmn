-- ============================================================
-- 090_playbook_reuniao_acontecida_spin.sql
--
-- Etapa "Reuniao acontecida" (Geral): o passo a passo DA REUNIAO, com SPIN
-- selling no centro — cada letra (S, P, I, N) e uma tarefa com as perguntas.
--
-- A ordem importa: S levanta o cenario, P encontra o problema, I faz DOER
-- (quantifica), N faz o proprio lead dizer o valor de resolver. So depois a
-- demonstracao — e ela reconecta em cada dor que ele confessou no SPIN.
--
-- Refresca os passos (delete + insert) — idempotente no conteudo.
-- ============================================================

DO $$
DECLARE
  v_geral uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8';
  s6 uuid;
BEGIN
  SELECT id INTO s6 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=6; -- Reuniao acontecida

  UPDATE crm_pipeline_stages SET
    objetivo = $s$Conduzir a reuniao pelo SPIN: fazer a dor aparecer e DOER, o proprio lead dizer o valor de resolver, e so entao mostrar a solucao ao vivo.$s$,
    exit_criteria = $s$Reuniao feita → mover pra Follow up (proposta e contorno de objecao). Se fechou na hora → Cliente.$s$
  WHERE id=s6;

  DELETE FROM crm_stage_steps WHERE stage_id = s6;

  INSERT INTO crm_stage_steps (stage_id, position, title, script, scenarios) VALUES
    (s6, 0,
      $s$Antes de entrar — 5 min de preparo$s$,
      $s$Reler o que o lead ja contou (segmento, a dor que ele falou, faturamento aproximado). Olhar o Instagram/Google da empresa. Escolher o angulo: ele PAGA alguem pro financeiro, ou ele mesmo faz e perde tempo?$s$,
      $j$[]$j$::jsonb),
    (s6, 1,
      $s$Retomada (2-3 min) — reabre a dor$s$,
      $s$"[nome], da ultima vez voce me disse que controla o financeiro [do jeito que ele falou]. Piorou, melhorou ou continua igual? Hoje eu te mostro exatamente quanto isso ta custando e como resolver."$s$,
      $j$[
        {"when":"Diz que continua igual ou piorou","then":"Perfeito pra voce: \"Entao vamos resolver isso hoje.\" Segue pro S."},
        {"when":"Diz que melhorou","then":"\"Que bom! E o que ainda te incomoda no financeiro hoje?\" — sempre sobra alguma coisa."}
      ]$j$::jsonb),
    (s6, 2,
      $s$S — Situação: como é hoje$s$,
      $s$Perguntas (sem julgar, so mapeando):
"Como voce controla o financeiro hoje?"
"Quem faz isso — voce ou alguem?"
"Quanto tempo por semana isso te toma?" / "Quanto voce paga pra quem faz?"$s$,
      $j$[
        {"when":"Conta o processo (caderno, planilha, funcionario)","then":"Anota TUDO — numero de horas e de salario vira municao na Implicacao."},
        {"when":"Diz que e organizado","then":"\"Show! E voce sabe o lucro exato do mes passado?\" — puxa mais fundo antes de aceitar."}
      ]$j$::jsonb),
    (s6, 3,
      $s$P — Problema: onde dói$s$,
      $s$"Voce sabe seu lucro REAL do mes passado? O numero exato?"
"Ja chegou no fim do mes sem dinheiro pra pagar uma conta que voce nao esperava?"
"Voce consegue separar o que e da empresa e o que e seu?"$s$,
      $j$[
        {"when":"Admite que nao sabe o lucro","then":"Achou a dor. \"E isso te incomoda? Como voce decide as coisas sem esse numero?\""},
        {"when":"Diz que sabe","then":"Pede o numero: \"Quanto foi?\" Se ele hesitar ou chutar, a dor esta ali — siga."}
      ]$j$::jsonb),
    (s6, 4,
      $s$I — Implicação: faz DOER (quantifica)$s$,
      $s$Transforma a dor em dinheiro, com os numeros que ELE deu:
"Se escapa 5 a 10% do faturamento sem voce saber, no seu caso da uns R$[valor] por mes. Em um ano, R$[valor x12]."
"Voce paga R$[salario] por mes pra alguem cuidar disso — sao R$[x12] por ano."
"Seu concorrente que ja organizou sabe o lucro dele em tempo real. E voce descobre quando?"$s$,
      $j$[
        {"when":"Se assusta com o numero","then":"Deixa o silencio agir. Depois: \"E bastante, ne? E isso acontece todo mes.\""},
        {"when":"Minimiza (\"e pouco\")","then":"\"Imagina em 12 meses. E o pior nem e o valor — e decidir no escuro.\""}
      ]$j$::jsonb),
    (s6, 5,
      $s$N — Necessidade: ele diz o valor$s$,
      $s$Faz o LEAD falar o beneficio (nao voce):
"Se voce abrisse o celular agora e visse quanto lucrou e o que tem pra pagar, o que mudaria pra voce?"
"E se voce mandasse so uma foto do comprovante e nunca mais digitasse planilha — quanto tempo isso te devolveria?"$s$,
      $j$[
        {"when":"Diz que valeria muito / se empolga","then":"E a deixa perfeita: \"Entao deixa eu te mostrar exatamente isso.\" Vai pra demonstracao."},
        {"when":"Responde morno","then":"A dor nao doeu o suficiente — volta pra Implicacao com outro angulo antes de mostrar a ferramenta."}
      ]$j$::jsonb),
    (s6, 6,
      $s$Demonstração ao vivo — reconecta cada dor$s$,
      $s$Mostra funcionando pro segmento dele: manda a foto do comprovante no WhatsApp → o assistente lanca sozinho → aparece no caixa. Depois o resto (lucro em tempo real, contas a pagar, alertas).
REGRA: a cada recurso, reconecta na fala dele — "Lembra que voce disse [dor que ele falou]? Olha como isso acaba."$s$,
      $j$[
        {"when":"Reage com WOW","then":"Aproveita o pico: \"Imagina isso rodando no seu [segmento] desde amanha.\" Ja parte pra proposta."},
        {"when":"Fica quieto","then":"Pergunta: \"Como isso funcionaria no seu dia a dia?\" — traz ele pra dentro em vez de continuar mostrando."}
      ]$j$::jsonb);

  RAISE NOTICE 'Reuniao acontecida: SPIN (preparo, retomada, S, P, I, N, demo).';
END $$;

SELECT st.position, st.title, jsonb_array_length(st.scenarios) AS cenarios
FROM crm_stage_steps st
JOIN crm_pipeline_stages s ON s.id = st.stage_id
WHERE s.pipeline_id='44b978de-616a-4256-a4cd-40cd4ec8a4a8' AND s.position=6
ORDER BY st.position;

NOTIFY pgrst, 'reload schema';

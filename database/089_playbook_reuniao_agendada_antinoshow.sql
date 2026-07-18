-- ============================================================
-- 089_playbook_reuniao_agendada_antinoshow.sql
--
-- Etapa "Reuniao Agendada" (Geral): a reuniao ja esta marcada. Objetivo unico
-- = o lead APARECER. Reorganizada como sequencia ANTI NO-SHOW, do momento em
-- que marca ate o "nao apareceu, remarca".
--
-- Passos com script + cenarios (o que o lead responde e a fala de resposta).
-- Refresca os passos (delete + insert) — idempotente no conteudo.
-- ============================================================

DO $$
DECLARE
  v_geral uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8';
  s5 uuid;
BEGIN
  SELECT id INTO s5 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=5; -- Reuniao Agendada

  UPDATE crm_pipeline_stages SET
    objetivo = $s$A reuniao ja esta marcada. Objetivo unico: o lead APARECER. Cada toque abaixo existe pra matar o no-show.$s$,
    exit_criteria = $s$Lead compareceu → mover pra Reuniao acontecida. Nao apareceu e nao remarcou → volta pro follow-up do Qualificado.$s$
  WHERE id=s5;

  DELETE FROM crm_stage_steps WHERE stage_id = s5;

  INSERT INTO crm_stage_steps (stage_id, position, title, script, scenarios) VALUES
    (s5, 0,
      $s$Na hora que marcar — confirme e mande o convite$s$,
      $s$"Fechado, [nome]! Marquei pra [dia] as [hora]. Ja te mandei o convite — me confirma que chegou? Sao 20 min e voce sai sabendo exatamente como organizar o seu [segmento]."$s$,
      $j$[
        {"when":"Confirmou","then":"Perfeito! Te lembro na vespera. Qualquer imprevisto me avisa que a gente remarca numa boa."},
        {"when":"Nao respondeu","then":"Reforca no lembrete da vespera; se continuar mudo, liga."}
      ]$j$::jsonb),
    (s5, 1,
      $s$Véspera (D-1) — confirme a presença$s$,
      $s$"Oi [nome]! Passando pra confirmar nossa conversa de amanha as [hora]. Ta de pe? So me responde com um joinha 👍"$s$,
      $j$[
        {"when":"Confirmou","then":"Show! Te mando o link 1h antes. Ate amanha!"},
        {"when":"Pediu pra remarcar","then":"Sem problema! Que dia fica melhor — [opcao A] ou [opcao B]?"},
        {"when":"Nao respondeu","then":"Liga. Se nao atender, manda um audio curto reforcando o horario."}
      ]$j$::jsonb),
    (s5, 2,
      $s$1h antes — lembrete final + link$s$,
      $s$"[nome], daqui a 1h a gente se fala! Link: [link]. Separa 20 minutinhos que vale muito a pena."$s$,
      $j$[
        {"when":"Confirmou","then":"Combinado, te espero!"},
        {"when":"Silencio","then":"Liga 10 min antes pra garantir que ele lembrou."}
      ]$j$::jsonb),
    (s5, 3,
      $s$Na hora — não apareceu em 5 min? Ligue$s$,
      $s$Nao espera a reuniao inteira. 5 minutos de atraso, liga: "Oi [nome]! To aqui te esperando. Consegue entrar agora ou prefere remarcar?"$s$,
      $j$[
        {"when":"Entra","then":"Show! Bora comecar. (mover pra Reuniao acontecida)"},
        {"when":"Nao pode agora","then":"Sem problema! Bora remarcar agora: hoje mais tarde ou amanha as [hora]?"},
        {"when":"Nao atende","then":"Manda mensagem na hora e ja oferece dois horarios pra remarcar."}
      ]$j$::jsonb),
    (s5, 4,
      $s$Não apareceu — remarque no mesmo dia$s$,
      $s$"[nome], nao consegui te pegar hoje. Deixei outro horario reservado pra voce: [opcao A] ou [opcao B]. Qual fica melhor?" (remarcar no mesmo dia esfria muito menos que deixar pra semana que vem)$s$,
      $j$[
        {"when":"Remarcou","then":"Fechado! Te lembro na vespera de novo. (segue nesta etapa)"},
        {"when":"Sumiu de vez","then":"Volta pro follow-up do Qualificado e retoma a insistencia."}
      ]$j$::jsonb);

  RAISE NOTICE 'Reuniao Agendada: sequencia anti no-show (5 passos).';
END $$;

SELECT st.position, st.title, jsonb_array_length(st.scenarios) AS cenarios
FROM crm_stage_steps st
JOIN crm_pipeline_stages s ON s.id = st.stage_id
WHERE s.pipeline_id='44b978de-616a-4256-a4cd-40cd4ec8a4a8' AND s.position=5
ORDER BY st.position;

NOTIFY pgrst, 'reload schema';

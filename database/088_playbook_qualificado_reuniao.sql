-- ============================================================
-- 088_playbook_qualificado_reuniao.sql
--
-- Etapa "Qualificado" (Geral): ICP JA confirmado no Respondeu. Aqui o objetivo
-- e um so — CONSEGUIR A REUNIAO de 20 min. Sem re-qualificar.
--
-- Passos com script + cenarios (o que o lead responde e a fala de resposta).
-- Refresca os passos (delete + insert) — idempotente no conteudo.
-- ============================================================

DO $$
DECLARE
  v_geral uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8';
  s4 uuid;
BEGIN
  SELECT id INTO s4 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=4; -- Qualificado

  UPDATE crm_pipeline_stages SET
    objetivo = $s$Lead tem perfil (ICP confirmado no Respondeu). Objetivo unico: conseguir a reuniao de 20 min com o especialista.$s$,
    exit_criteria = $s$Reuniao marcada com data e hora → mover pra Reuniao Agendada.$s$
  WHERE id=s4;

  DELETE FROM crm_stage_steps WHERE stage_id = s4;

  INSERT INTO crm_stage_steps (stage_id, position, title, script, scenarios) VALUES
    (s4, 0,
      $s$Proponha a reunião (2 horários fechados)$s$,
      $s$"[nome], e EXATAMENTE isso que a Fyness resolve. Vou marcar 20 min com nosso especialista pra ele te mostrar AO VIVO, na pratica, como voce vai organizar o seu [segmento] na Fyness. Fica melhor amanha 10h ou 16h?"$s$,
      $j$[
        {"when":"Aceita um horario","then":"Fechado! Confirmo pra [dia/hora] e te mando o lembrete. Voce vai sair da reuniao sabendo exatamente como organizar o seu negocio."},
        {"when":"Nao tenho tempo agora","then":"Tranquilo! Qual dia e menos corrido pra voce? Eu encaixo no SEU horario — sao so 20 minutos."},
        {"when":"Me explica por aqui / manda no zap","then":"Posso adiantar, mas na reuniao o especialista mostra AO VIVO, feito pro seu [segmento], como fica o seu negocio organizado — vale muito mais que texto. Amanha 10h ou 16h?"},
        {"when":"Vou ver minha agenda / depois te falo","then":"Show! Ja deixo 2 opcoes seguradas: amanha 10h ou quinta 16h? Ai e so voce confirmar qual."}
      ]$j$::jsonb),
    (s4, 1,
      $s$D1 — Follow-up: reforça o horário$s$,
      $s$"[nome], consegui um horario pro especialista te mostrar na pratica como organizar o seu [segmento] na Fyness. Amanha 10h ou 16h?"$s$,
      $j$[
        {"when":"Escolheu um horario","then":"Fechado! Confirmo e te mando o lembrete 1h antes."},
        {"when":"Nao respondeu","then":"Sem problema, segue pro proximo toque."}
      ]$j$::jsonb),
    (s4, 2,
      $s$D3 — Follow-up: prova social$s$,
      $s$"[nome], teve um [mesmo segmento] que ficou adiando; quando viu como ficava tudo organizado, fechou na hora. Bora reservar 20 min? Amanha 10h ou 16h?"$s$,
      $j$[
        {"when":"Escolheu um horario","then":"Show! Fechado, te mando o lembrete."},
        {"when":"Ainda em duvida","then":"Sem compromisso — sao 20 min e voce sai sabendo exatamente como organizar o negocio. Que horario fica bom?"}
      ]$j$::jsonb),
    (s4, 3,
      $s$D5 — Follow-up: urgência leve$s$,
      $s$"[nome], ultima janela boa essa semana pra agenda do especialista. Que horario fica bom pra voce?"$s$,
      $j$[
        {"when":"Escolheu um horario","then":"Perfeito, fechado! Lembrete 1h antes."},
        {"when":"Nao respondeu","then":"Segue pro proximo toque, sem pressao."}
      ]$j$::jsonb),
    (s4, 4,
      $s$D7 — Follow-up: pergunta direta$s$,
      $s$"[nome], vou ser direta: ainda faz sentido pra voce ver como organizar o [segmento] na Fyness? Se sim, marco 20 min; se nao, sem problema — so me fala."$s$,
      $j$[
        {"when":"Topa","then":"Fechado! Amanha 10h ou 16h?"},
        {"when":"Diz que nao agora","then":"Tranquilo! Te mando um material de valor e retomo mais pra frente."}
      ]$j$::jsonb),
    (s4, 5,
      $s$D10 — Última tentativa + porta aberta$s$,
      $s$"[nome], vou parar de te chamar pra nao incomodar. Quando quiser ver como deixar o financeiro do seu [segmento] no controle, me manda 1 oi que marco na hora. Sucesso!"$s$,
      $j$[
        {"when":"Responde","then":"Que bom! Bora marcar — amanha 10h ou 16h?"},
        {"when":"Silencio","then":"Mantem no radar pra retomar daqui um tempo (Nurturing)."}
      ]$j$::jsonb);

  RAISE NOTICE 'Qualificado: agendar + follow-up em 10 dias (tarefas).';
END $$;

SELECT st.position, st.title, jsonb_array_length(st.scenarios) AS cenarios
FROM crm_stage_steps st
JOIN crm_pipeline_stages s ON s.id = st.stage_id
WHERE s.pipeline_id='44b978de-616a-4256-a4cd-40cd4ec8a4a8' AND s.position=4
ORDER BY st.position;

NOTIFY pgrst, 'reload schema';

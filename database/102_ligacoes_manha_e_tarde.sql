-- ============================================================
-- 102_ligacoes_manha_e_tarde.sql
--
-- REGRA: toda ligacao da cadencia acontece DUAS vezes no dia — uma de manha e
-- uma a tarde. Cada uma com as 3 tentativas seguidas.
--
-- Dois problemas que isto conserta:
--
-- 1) Os titulos traziam hora chumbada ("D5 10h", "D7 19h") mas quem escolhe o
--    horario e o agendador (primeiro slot livre). O titulo mentia sobre o
--    horario real da agenda. Agora o titulo diz o TURNO, e o turno e cumprido
--    de verdade (coluna period + crmScheduling).
--
-- 2) Sem a coluna `period`, criar uma tarefa "de manha" e outra "de tarde" no
--    mesmo dia colocaria AS DUAS de manha — o agendador so pegava o 1o slot
--    vago. Agora manha = 9h-11h, tarde = 12h-18h.
--
-- Cadencia: 14 ligacoes (7 dias x 2 turnos) + 3 WhatsApp + 3 e-mails = 20.
--
-- INSERT + renumeracao (nao delete+insert): as atividades ja agendadas ligam
-- por stage_step_id, entao os ids precisam sobreviver.
-- ============================================================

ALTER TABLE public.crm_stage_steps
  ADD COLUMN IF NOT EXISTS period TEXT CHECK (period IN ('manha', 'tarde'));

DO $$
DECLARE
  v_geral uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8';
  s2 uuid;
  v_regra text := $r$3 TENTATIVAS SEGUIDAS, no mesmo bloco: liga → nao atendeu, liga de novo na hora → nao atendeu, liga a 3a. So depois disso deixa recado.$r$;
BEGIN
  SELECT id INTO s2 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=2;

  IF EXISTS (SELECT 1 FROM crm_stage_steps WHERE stage_id = s2 AND period = 'tarde' AND day_offset = 2) THEN
    RAISE NOTICE 'Ligacoes manha/tarde ja aplicadas — nada a fazer.';
    RETURN;
  END IF;

  -- ---- turno das ligacoes que ja existem ----
  UPDATE crm_stage_steps SET period = 'manha' WHERE stage_id = s2 AND position IN (0, 5, 9);   -- D0, D5, D9
  UPDATE crm_stage_steps SET period = 'tarde' WHERE stage_id = s2 AND position IN (1, 2, 7, 11, 13); -- D0 tarde, D2, D7, D12, D14

  -- ---- titulos sem hora chumbada (quem manda no horario e o agendador) ----
  UPDATE crm_stage_steps SET title = $t$D0 manhã — Ligação (3 tentativas)$t$        WHERE stage_id=s2 AND position=0;
  UPDATE crm_stage_steps SET title = $t$D0 tarde — Ligação (3 tentativas)$t$        WHERE stage_id=s2 AND position=1;
  UPDATE crm_stage_steps SET title = $t$D2 tarde — Ligação (3 tentativas)$t$        WHERE stage_id=s2 AND position=2;
  UPDATE crm_stage_steps SET title = $t$D5 manhã — Ligação (3 tentativas)$t$        WHERE stage_id=s2 AND position=5;
  UPDATE crm_stage_steps SET title = $t$D7 tarde — Ligação (3 tentativas)$t$        WHERE stage_id=s2 AND position=7;
  UPDATE crm_stage_steps SET title = $t$D9 manhã — Ligação (3 tentativas)$t$        WHERE stage_id=s2 AND position=9;
  UPDATE crm_stage_steps SET title = $t$D12 tarde — Ligação (3 tentativas, direta)$t$ WHERE stage_id=s2 AND position=11;
  UPDATE crm_stage_steps SET title = $t$D14 tarde — Ligação + despedida$t$          WHERE stage_id=s2 AND position=13;

  -- ---- abre espaco pros 6 turnos que faltam (de tras pra frente) ----
  UPDATE crm_stage_steps SET position = 19 WHERE stage_id=s2 AND position = 13; -- D14 tarde
  UPDATE crm_stage_steps SET position = 17 WHERE stage_id=s2 AND position = 12; -- D13 email
  UPDATE crm_stage_steps SET position = 16 WHERE stage_id=s2 AND position = 11; -- D12 tarde
  UPDATE crm_stage_steps SET position = 14 WHERE stage_id=s2 AND position = 10; -- D10 whats
  UPDATE crm_stage_steps SET position = 13 WHERE stage_id=s2 AND position = 9;  -- D9 manha
  UPDATE crm_stage_steps SET position = 11 WHERE stage_id=s2 AND position = 8;  -- D8 email
  UPDATE crm_stage_steps SET position = 10 WHERE stage_id=s2 AND position = 7;  -- D7 tarde
  UPDATE crm_stage_steps SET position = 8  WHERE stage_id=s2 AND position = 6;  -- D6 whats
  UPDATE crm_stage_steps SET position = 6  WHERE stage_id=s2 AND position = 5;  -- D5 manha
  UPDATE crm_stage_steps SET position = 5  WHERE stage_id=s2 AND position = 4;  -- D4 email
  UPDATE crm_stage_steps SET position = 4  WHERE stage_id=s2 AND position = 3;  -- D3 whats
  -- livres: 3 (D2 manha), 7 (D5 tarde), 9 (D7 manha), 12 (D9 tarde),
  --         15 (D12 manha), 18 (D14 manha)

  INSERT INTO crm_stage_steps (stage_id, position, title, script, day_offset, period, scenarios) VALUES
    (s2, 3,  $t$D2 manhã — Ligação (3 tentativas)$t$,
      v_regra || E'\n\n"Oi [nome], bom dia! Aqui e a [consultora] da Fyness. Consegue falar 15 minutinhos?"', 2, 'manha',
      $j$[{"when":"Atendeu","then":"Move pra Respondeu e qualifica."},
          {"when":"Nao atendeu nas 3","then":"Sem recado agora — voce liga de novo a tarde. Se a tarde tambem nao pegar, ai sim manda mensagem."}]$j$::jsonb),

    (s2, 7,  $t$D5 tarde — Ligação (3 tentativas)$t$,
      v_regra || E'\n\n"Oi [nome]! Tentei falar com voce de manha. Consegue agora?"', 5, 'tarde',
      $j$[{"when":"Atendeu","then":"Move pra Respondeu e qualifica."},
          {"when":"Nao atendeu nas 3","then":"Deixa mensagem: \"Oi [nome], te liguei de manha e agora a tarde. Me fala um horario que funciona pra voce.\""}]$j$::jsonb),

    (s2, 9,  $t$D7 manhã — Ligação (3 tentativas)$t$,
      v_regra || E'\n\n"Oi [nome], bom dia! Passando rapidinho pra saber se faz sentido a gente conversar."', 7, 'manha',
      $j$[{"when":"Atendeu","then":"Move pra Respondeu e qualifica."},
          {"when":"Nao atendeu nas 3","then":"Sem recado — tenta de novo a tarde."}]$j$::jsonb),

    (s2, 12, $t$D9 tarde — Ligação (3 tentativas)$t$,
      v_regra || E'\n\n"Oi [nome]! Te liguei de manha. Consegue falar 5 minutinhos agora?"', 9, 'tarde',
      $j$[{"when":"Atendeu","then":"Move pra Respondeu e qualifica."},
          {"when":"Nao atendeu nas 3","then":"Deixa a pergunta facil por mensagem: \"Oi [nome]! So uma curiosidade: voce ainda controla as financas no caderno ou ja usa alguma coisa?\""}]$j$::jsonb),

    (s2, 15, $t$D12 manhã — Ligação (3 tentativas)$t$,
      v_regra || E'\n\n"Oi [nome], bom dia! Vou ser direta: ainda faz sentido a gente conversar?"', 12, 'manha',
      $j$[{"when":"Diz que sim","then":"Move pra Respondeu e qualifica."},
          {"when":"Diz que nao","then":"Respeita, agradece e encerra (Nurturing)."},
          {"when":"Nao atendeu nas 3","then":"Sem recado — tenta de novo a tarde."}]$j$::jsonb),

    (s2, 18, $t$D14 manhã — Ligação (3 tentativas)$t$,
      v_regra || E'\n\n"Oi [nome], bom dia! Ultima tentativa por aqui — se nao for a hora, sem problema nenhum."', 14, 'manha',
      $j$[{"when":"Atendeu","then":"Move pra Respondeu e qualifica."},
          {"when":"Nao atendeu nas 3","then":"Sem recado — a despedida vai no toque da tarde."}]$j$::jsonb);

  RAISE NOTICE 'Ligacoes agora sao manha + tarde em todo dia de ligacao.';
END $$;

SELECT st.position, st.day_offset AS dia, COALESCE(st.period, '—') AS turno, st.title
FROM crm_stage_steps st
JOIN crm_pipeline_stages s ON s.id = st.stage_id
WHERE s.pipeline_id = '44b978de-616a-4256-a4cd-40cd4ec8a4a8' AND s.position = 2
ORDER BY st.position;

NOTIFY pgrst, 'reload schema';

-- ============================================================
-- 100_cadencia_canal_email.sql
--
-- Adiciona o E-MAIL como 3o canal da cadencia (ligacao / whatsapp / email).
-- Entram 3 toques nos dias que estavam vagos, intercalando os canais:
--
--   D4  Email de apresentacao   (depois da cartilha do D3)
--   D8  Email com case          (entre a Lig.5 do D7 e a Lig.6 do D9)
--   D13 Email de encerramento   (vespera da despedida do D14)
--
-- Cadencia passa de 11 pra 14 toques: 8 ligacoes + 3 whatsapp + 3 emails.
--
-- INSERT + renumeracao de position (nao delete+insert): as atividades ja
-- agendadas ligam por stage_step_id, entao renumerar nao desconecta nada. Um
-- delete+insert trocaria os ids e orfanaria as 154 tarefas do Primeiro contato.
--
-- Idempotente: se ja existe passo de email na etapa, nao faz nada.
-- ============================================================

DO $$
DECLARE
  v_geral uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8';
  s2 uuid;
BEGIN
  SELECT id INTO s2 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=2; -- Primeiro contato

  IF EXISTS (SELECT 1 FROM crm_stage_steps WHERE stage_id = s2 AND title ILIKE '%mail%') THEN
    RAISE NOTICE 'Canal e-mail ja existe na cadencia — nada a fazer.';
    RETURN;
  END IF;

  -- Abre espaco: renumera de tras pra frente pra ordem nunca se cruzar.
  UPDATE crm_stage_steps SET position = 13 WHERE stage_id = s2 AND position = 10; -- D14 Lig.8
  UPDATE crm_stage_steps SET position = 11 WHERE stage_id = s2 AND position = 9;  -- D12 Lig.7
  UPDATE crm_stage_steps SET position = 10 WHERE stage_id = s2 AND position = 8;  -- D10 material
  UPDATE crm_stage_steps SET position = 9  WHERE stage_id = s2 AND position = 7;  -- D9  Lig.6
  UPDATE crm_stage_steps SET position = 7  WHERE stage_id = s2 AND position = 6;  -- D7  Lig.5
  UPDATE crm_stage_steps SET position = 6  WHERE stage_id = s2 AND position = 5;  -- D6  whats valor
  UPDATE crm_stage_steps SET position = 5  WHERE stage_id = s2 AND position = 4;  -- D5  Lig.4
  -- 0,1,2,3 ficam onde estao; sobram os buracos 4, 8 e 12 pros emails.

  INSERT INTO crm_stage_steps (stage_id, position, title, script, day_offset, scenarios) VALUES
    (s2, 4,
     $s$D4 — E-mail de apresentação$s$,
     $s$ASSUNTO: [nome], da pra saber o lucro da [empresa] sem planilha

CORPO:
Oi [nome], tudo bem?
Sou a [consultora], da Fyness. Tentei falar com voce por telefone esses dias.

A gente resolve uma dor bem especifica de quem toca um negocio: saber, no dia,
quanto entrou, quanto saiu e quanto sobrou — sem planilha e sem contador no meio.
Voce manda a foto do comprovante no WhatsApp e o resto e automatico.

Se fizer sentido, me responde este e-mail com um horario e eu te mostro em 15
minutos como ficaria no seu caso.

Abraco,
[consultora] — Fyness$s$,
     4,
     $j$[
       {"when":"Respondeu o e-mail","then":"Responde na hora e ja propoe horario: \"Que bom que voce viu! Consigo te mostrar amanha 10h ou 16h — qual fica melhor?\" Move pra Respondeu."},
       {"when":"Nao respondeu","then":"Normal — e-mail e canal de apoio. Segue pra ligacao do D5."}
     ]$j$::jsonb),

    (s2, 8,
     $s$D8 — E-mail com case do segmento$s$,
     $s$ASSUNTO: Um [segmento] igual ao seu parou de perder dinheiro

CORPO:
Oi [nome],
Te mando um caso rapido porque e bem parecido com o seu negocio.

Um [segmento] que atendemos nao sabia o lucro real do mes. Quando organizou,
descobriu que estava escapando dinheiro todo mes em coisa que nem lembrava de
ter pago. Hoje ele abre o celular e ve o numero.

Nao quero te tomar tempo: se quiser ver como ficaria ai, me responde com um
"quero ver" que eu te mostro em 15 min.

[consultora] — Fyness$s$,
     8,
     $j$[
       {"when":"Respondeu / pediu pra ver","then":"Puxa a conversa e ja marca. Move pra Respondeu."},
       {"when":"Nao respondeu","then":"Segue pra ligacao do D9 (pergunta facil)."}
     ]$j$::jsonb),

    (s2, 12,
     $s$D13 — E-mail de encerramento$s$,
     $s$ASSUNTO: Encerrando por aqui, [nome]

CORPO:
Oi [nome],
Tentei falar com voce algumas vezes e nao consegui — imagino que a correria
esteja grande, ou que agora nao seja o momento. Sem problema nenhum.

Vou parar de te procurar pra nao virar incomodo. Este e-mail fica aqui: quando
quiser tirar o financeiro do escuro, e so responder que eu retomo na hora.

Sucesso com a [empresa]!
[consultora] — Fyness$s$,
     13,
     $j$[
       {"when":"Responde (encerramento costuma destravar)","then":"Retoma na hora, sem cobrar o sumico: \"Que bom te ver por aqui! Bora marcar 15 min?\" Move pra Respondeu."},
       {"when":"Nao respondeu","then":"Ultimo toque e a despedida por telefone/WhatsApp no D14."}
     ]$j$::jsonb);

  RAISE NOTICE 'Canal e-mail adicionado: 3 toques (D4, D8, D13).';
END $$;

SELECT st.position, st.day_offset AS dia, st.title
FROM crm_stage_steps st
JOIN crm_pipeline_stages s ON s.id = st.stage_id
WHERE s.pipeline_id = '44b978de-616a-4256-a4cd-40cd4ec8a4a8' AND s.position = 2
ORDER BY st.position;

SELECT count(*) AS atividades_ainda_ligadas
FROM crm_activities WHERE stage_step_id IS NOT NULL AND deleted_at IS NULL;

NOTIFY pgrst, 'reload schema';

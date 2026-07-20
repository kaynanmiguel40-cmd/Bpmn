-- Falas dos ramos "atendeu/respondeu" do Primeiro contato (pipeline Geral).
-- Gerado por scripts_primeiro_contato.mjs. Idempotente: reescreve o `then`
-- do cenario cujo `when` casa, e nao mexe nos outros.
BEGIN;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Atendeu e conversou'
      THEN jsonb_set(e, '{then}', to_jsonb('Diz: "Perfeito! So pra eu nao te tomar tempo a toa: hoje voce sabe quanto sobrou no mes passado, ou e mais no sentimento?" Deixa ele falar — a resposta JA e a qualificacao. Fecha com: "E exatamente isso que a gente resolve. Te mostro em 15 min como fica no seu caso — quarta 10h ou quinta 16h?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 0
  AND st.scenarios @> '[{"when": "Atendeu e conversou"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Atendeu'
      THEN jsonb_set(e, '{then}', to_jsonb('Diz: "Perfeito! So pra eu nao te tomar tempo a toa: hoje voce sabe quanto sobrou no mes passado, ou e mais no sentimento?" Deixa ele falar — a resposta JA e a qualificacao. Fecha com: "E exatamente isso que a gente resolve. Te mostro em 15 min como fica no seu caso — quarta 10h ou quinta 16h?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 1
  AND st.scenarios @> '[{"when": "Atendeu"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Atendeu'
      THEN jsonb_set(e, '{then}', to_jsonb('Diz: "Perfeito! So pra eu nao te tomar tempo a toa: hoje voce sabe quanto sobrou no mes passado, ou e mais no sentimento?" Deixa ele falar — a resposta JA e a qualificacao. Fecha com: "E exatamente isso que a gente resolve. Te mostro em 15 min como fica no seu caso — quarta 10h ou quinta 16h?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 2
  AND st.scenarios @> '[{"when": "Atendeu"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Atendeu'
      THEN jsonb_set(e, '{then}', to_jsonb('Diz: "Perfeito! So pra eu nao te tomar tempo a toa: hoje voce sabe quanto sobrou no mes passado, ou e mais no sentimento?" Deixa ele falar — a resposta JA e a qualificacao. Fecha com: "E exatamente isso que a gente resolve. Te mostro em 15 min como fica no seu caso — quarta 10h ou quinta 16h?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 3
  AND st.scenarios @> '[{"when": "Atendeu"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Respondeu / reagiu'
      THEN jsonb_set(e, '{then}', to_jsonb('Responde na hora, sem esperar: "Que bom que deu uma olhada! Posso te mostrar funcionando com os SEUS numeros? Sao 15 min — quarta 10h ou quinta 16h?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 4
  AND st.scenarios @> '[{"when": "Respondeu / reagiu"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Atendeu'
      THEN jsonb_set(e, '{then}', to_jsonb('Diz: "Perfeito! So pra eu nao te tomar tempo a toa: hoje voce sabe quanto sobrou no mes passado, ou e mais no sentimento?" Deixa ele falar — a resposta JA e a qualificacao. Fecha com: "E exatamente isso que a gente resolve. Te mostro em 15 min como fica no seu caso — quarta 10h ou quinta 16h?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 6
  AND st.scenarios @> '[{"when": "Atendeu"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Atendeu'
      THEN jsonb_set(e, '{then}', to_jsonb('Diz: "Perfeito! So pra eu nao te tomar tempo a toa: hoje voce sabe quanto sobrou no mes passado, ou e mais no sentimento?" Deixa ele falar — a resposta JA e a qualificacao. Fecha com: "E exatamente isso que a gente resolve. Te mostro em 15 min como fica no seu caso — quarta 10h ou quinta 16h?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 7
  AND st.scenarios @> '[{"when": "Atendeu"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Atendeu'
      THEN jsonb_set(e, '{then}', to_jsonb('Diz: "Perfeito! So pra eu nao te tomar tempo a toa: hoje voce sabe quanto sobrou no mes passado, ou e mais no sentimento?" Deixa ele falar — a resposta JA e a qualificacao. Fecha com: "E exatamente isso que a gente resolve. Te mostro em 15 min como fica no seu caso — quarta 10h ou quinta 16h?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 9
  AND st.scenarios @> '[{"when": "Atendeu"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Atendeu'
      THEN jsonb_set(e, '{then}', to_jsonb('Diz: "Perfeito! So pra eu nao te tomar tempo a toa: hoje voce sabe quanto sobrou no mes passado, ou e mais no sentimento?" Deixa ele falar — a resposta JA e a qualificacao. Fecha com: "E exatamente isso que a gente resolve. Te mostro em 15 min como fica no seu caso — quarta 10h ou quinta 16h?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 10
  AND st.scenarios @> '[{"when": "Atendeu"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Respondeu / pediu pra ver'
      THEN jsonb_set(e, '{then}', to_jsonb('Responde curto e ja marca: "Show, [nome]! Te mostro em 15 min como ficaria na [empresa]. Quarta 10h ou quinta 16h?" Nao manda mais material — quem pediu pra ver quer conversar. Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 11
  AND st.scenarios @> '[{"when": "Respondeu / pediu pra ver"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Respondeu a pergunta'
      THEN jsonb_set(e, '{then}', to_jsonb('A resposta dele E o gancho. Se falar caderno/planilha/nada: "E o que eu mais escuto. A Fyness tira isso do caderno sem voce virar contador — voce manda a foto do comprovante no WhatsApp e o resto e automatico. Te mostro em 15 min?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 12
  AND st.scenarios @> '[{"when": "Respondeu a pergunta"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Atendeu'
      THEN jsonb_set(e, '{then}', to_jsonb('Diz: "Perfeito! So pra eu nao te tomar tempo a toa: hoje voce sabe quanto sobrou no mes passado, ou e mais no sentimento?" Deixa ele falar — a resposta JA e a qualificacao. Fecha com: "E exatamente isso que a gente resolve. Te mostro em 15 min como fica no seu caso — quarta 10h ou quinta 16h?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 13
  AND st.scenarios @> '[{"when": "Atendeu"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Respondeu / agradeceu'
      THEN jsonb_set(e, '{then}', to_jsonb('Emenda no agradecimento: "Imagina! Ja que te ajudou — quer que eu te mostre em 15 min como deixar isso tudo no automatico?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 14
  AND st.scenarios @> '[{"when": "Respondeu / agradeceu"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Diz que sim'
      THEN jsonb_set(e, '{then}', to_jsonb('Diz: "Que bom que te peguei! Vou ser direta: sao 15 min pra te mostrar quanto entra, sai e sobra da [empresa] sem planilha. Quarta 10h ou quinta 16h?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 15
  AND st.scenarios @> '[{"when": "Diz que sim"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Diz que nao'
      THEN jsonb_set(e, '{then}', to_jsonb('Diz: "Sem problema, [nome] — e obrigada pela sinceridade, isso ja me ajuda. Vou parar de te ligar pra nao te incomodar. Se um dia mudar de ideia, me manda 1 oi aqui." Move pra Nurturing: nao e um nao pra sempre, e um nao pra agora.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 15
  AND st.scenarios @> '[{"when": "Diz que nao"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Diz que sim'
      THEN jsonb_set(e, '{then}', to_jsonb('Diz: "Que bom que te peguei! Vou ser direta: sao 15 min pra te mostrar quanto entra, sai e sobra da [empresa] sem planilha. Quarta 10h ou quinta 16h?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 16
  AND st.scenarios @> '[{"when": "Diz que sim"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Diz que nao'
      THEN jsonb_set(e, '{then}', to_jsonb('Diz: "Sem problema, [nome] — e obrigada pela sinceridade, isso ja me ajuda. Vou parar de te ligar pra nao te incomodar. Se um dia mudar de ideia, me manda 1 oi aqui." Move pra Nurturing: nao e um nao pra sempre, e um nao pra agora.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 16
  AND st.scenarios @> '[{"when": "Diz que nao"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Atendeu'
      THEN jsonb_set(e, '{then}', to_jsonb('Diz: "Que bom que te peguei! Vou ser direta: sao 15 min pra te mostrar quanto entra, sai e sobra da [empresa] sem planilha. Quarta 10h ou quinta 16h?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 18
  AND st.scenarios @> '[{"when": "Atendeu"}]'::jsonb;

UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Responde (a despedida destrava em 15-30%)'
      THEN jsonb_set(e, '{then}', to_jsonb('Retoma SEM cobrar o sumico — cobranca fecha a porta que a despedida acabou de abrir: "Que bom te ver por aqui, [nome]! Bora os 15 min? Quarta 10h ou quinta 16h?" Move pra Respondeu.'::text))
      ELSE e END
    ORDER BY ord
  )
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 19
  AND st.scenarios @> '[{"when": "Responde (a despedida destrava em 15-30%)"}]'::jsonb;
COMMIT;

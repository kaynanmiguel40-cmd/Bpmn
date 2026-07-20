BEGIN;
UPDATE crm_stage_steps st
SET scenarios = (
  SELECT jsonb_agg(
    CASE WHEN e->>'when' = 'Agradeceu / respondeu'
      THEN jsonb_set(e, '{then}', to_jsonb('Emenda na propria dica, sem trocar de assunto: "Que bom que serviu! Era exatamente isso que eu ia te mostrar — a Fyness deixa essa organizacao no automatico. Sao 15 min: quarta 10h ou quinta 16h?" Move pra Respondeu.'::text))
      ELSE e END ORDER BY ord)
  FROM jsonb_array_elements(st.scenarios) WITH ORDINALITY AS t(e, ord)
)
FROM crm_pipeline_stages s
WHERE s.id = st.stage_id AND s.name = 'Primeiro contato' AND st.position = 8;
COMMIT;

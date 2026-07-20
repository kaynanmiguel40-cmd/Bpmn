-- ============================================================
-- 101_regra_3_tentativas_seguidas.sql
--
-- Deixa explicito o que "3 tentativas" significa: sao 3 chamadas SEGUIDAS,
-- dentro do MESMO bloco de 30 min — liga, nao atendeu liga de novo na hora,
-- nao atendeu liga a 3a. So depois das 3 e que deixa recado.
--
-- O porque (o que faz a regra funcionar): numero desconhecido tocando uma vez o
-- lead ignora achando que e telemarketing/operadora. Na 3a chamada seguida ele
-- entende que tem alguem procurando de verdade e atende.
--
-- A explicacao completa fica no OBJETIVO da etapa (uma vez so) e cada ligacao
-- leva um lembrete curto — repetir o paragrafo em 8 passos deixaria o checklist
-- ilegivel, que e justo o oposto do que ele serve.
--
-- Nao muda agendamento: as 3 tentativas cabem no bloco de 30 min ja reservado.
-- UPDATE por posicao (preserva ids -> nao desconecta as atividades agendadas).
-- ============================================================

DO $$
DECLARE
  v_geral uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8';
  s2 uuid;
  v_regra text := $r$3 TENTATIVAS SEGUIDAS, no mesmo bloco: liga → nao atendeu, liga de novo na hora → nao atendeu, liga a 3a. So depois disso deixa recado.$r$;
BEGIN
  SELECT id INTO s2 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=2;

  UPDATE crm_pipeline_stages SET
    objetivo = $s$Logo depois do audio (etapa Leads), LIGAR na mesma hora.

REGRA DAS 3 TENTATIVAS: cada toque de ligacao sao 3 chamadas SEGUIDAS, no mesmo bloco de 30 min — liga, nao atendeu liga de novo na hora, nao atendeu liga a 3a. Numero desconhecido tocando uma vez o lead ignora achando que e telemarketing; na 3a seguida ele entende que tem alguem procurando de verdade. So depois das 3 e que se deixa recado.

Nao atendendo, segue a cadencia de 14 dias (ligacao, WhatsApp e e-mail) ate o lead responder.$s$
  WHERE id=s2;

  -- Lembrete curto no inicio do script de cada LIGACAO (posicoes 0,1,2,5,7,9,11,13).
  UPDATE crm_stage_steps SET script = v_regra || E'\n\n' || script
  WHERE stage_id = s2
    AND position IN (0, 1, 2, 5, 7, 9, 11, 13)
    AND script NOT LIKE '3 TENTATIVAS SEGUIDAS%';

  RAISE NOTICE 'Regra das 3 tentativas seguidas aplicada nas ligacoes.';
END $$;

SELECT st.position, st.title, left(st.script, 58) AS comeco_do_script
FROM crm_stage_steps st
JOIN crm_pipeline_stages s ON s.id = st.stage_id
WHERE s.pipeline_id = '44b978de-616a-4256-a4cd-40cd4ec8a4a8' AND s.position = 2
ORDER BY st.position;

NOTIFY pgrst, 'reload schema';

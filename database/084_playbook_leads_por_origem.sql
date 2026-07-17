-- ============================================================
-- 084_playbook_leads_por_origem.sql
--
-- Reescreve SO a etapa "Leads" da pipeline Geral: o toque inicial organizado
-- por ORIGEM do lead, cada uma com PRIORIDADE (quao rapido responder) e o
-- script pronto. Linguagem simples, sem jargao. As outras 7 etapas nao mudam.
--
-- Refresca os passos do Leads (delete + insert) — idempotente no conteudo.
-- ============================================================

-- Tag de origem no passo: casa com a origem (source) do lead pra mostrar so o
-- script certo. NULL = passo universal (aparece pra todo lead).
ALTER TABLE public.crm_stage_steps ADD COLUMN IF NOT EXISTS source_tag TEXT;

DO $$
DECLARE
  v_geral uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8';
  s1 uuid;
BEGIN
  SELECT id INTO s1 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=1; -- Leads

  UPDATE crm_pipeline_stages SET
    objetivo = $s$Veja de onde o lead veio e mande o primeiro toque daquela origem. Sem vender — so abrir conversa.$s$,
    exit_criteria = $s$Mandou o primeiro toque → mover pra Primeiro contato.$s$
  WHERE id=s1;

  DELETE FROM crm_stage_steps WHERE stage_id = s1;

  -- Prioridade no TITULO; o script e SO a mensagem pra mandar. Simples: leu,
  -- copiou, mandou. source_tag casa com a origem do lead (mostra so o certo).
  INSERT INTO crm_stage_steps (stage_id, position, title, script, source_tag) VALUES
    (s1, 0, $s$Anúncio pago — responder em 5 min$s$, $s$Oi [nome]! Vi que voce se interessou pela Fyness. Vou te ligar agora pra tirar suas duvidas. Se nao puder atender, me avisa o melhor horario!$s$, $s$trafego$s$),
    (s1, 1, $s$Indicação de parceiro — hoje, por áudio$s$, $s$Oi [nome]! Aqui e a [consultora] da Fyness. O [parceiro] te falou da gente e pediu pra eu te procurar. Te chamo amanha pra te mostrar em 15 min. Beleza?$s$, $s$parceiro$s$),
    (s1, 2, $s$Indicação de cliente — por áudio$s$, $s$Oi [nome]! O [cliente] te indicou pra mim — falou que voce ia curtir a Fyness. Posso te explicar rapidinho?$s$, $s$cliente$s$),
    (s1, 3, $s$Veio pelo Instagram — pergunte antes$s$, $s$Oi [nome]! Que legal que voce chegou aqui. Antes de eu te explicar: o que te chamou atencao? Qual duvida voce ta tentando resolver?$s$, $s$instagram$s$);

  RAISE NOTICE 'Leads simplificado por origem: 4 toques (com tag).';
END $$;

SELECT st.position, st.title
FROM crm_stage_steps st
JOIN crm_pipeline_stages s ON s.id = st.stage_id
WHERE s.pipeline_id='44b978de-616a-4256-a4cd-40cd4ec8a4a8' AND s.position=1
ORDER BY st.position;

NOTIFY pgrst, 'reload schema';

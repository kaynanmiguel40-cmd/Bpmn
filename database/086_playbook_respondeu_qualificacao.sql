-- ============================================================
-- 086_playbook_respondeu_qualificacao.sql
--
-- Etapa "Respondeu" (Geral) = ROTEIRO DE QUALIFICACAO: as perguntas que o
-- vendedor faz + CENARIOS (o que o cliente responde) e como reagir a cada um.
-- Cenarios em JSONB (coluna scenarios, migration 087).
--
-- O Fyness serve empresa E financa pessoal — entao "nao tenho empresa" NAO
-- desqualifica; so muda o angulo. Desqualifica de verdade: nao cabe pagar
-- agora, ou ja e super organizado (sem dor).
--
-- Refresca os passos (delete + insert) — idempotente no conteudo.
-- ============================================================

DO $$
DECLARE
  v_geral uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8';
  s3 uuid;
BEGIN
  SELECT id INTO s3 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=3; -- Respondeu

  UPDATE crm_pipeline_stages SET
    objetivo = $s$O lead respondeu — partir direto pra qualificacao. Fazer as perguntas e decidir se tem perfil: tem o que organizar (empresa ou financa pessoal), cabe pagar, e tem dor.$s$,
    exit_criteria = $s$Tem dor e cabe pagar → mover pra Qualificado. Nao cabe agora ou ja e super organizado → Nurturing.$s$
  WHERE id=s3;

  DELETE FROM crm_stage_steps WHERE stage_id = s3;

  INSERT INTO crm_stage_steps (stage_id, position, title, script, scenarios) VALUES
    (s3, 0,
      $s$Pergunte: empresa ou finança pessoal? E como funciona?$s$,
      $s$"[nome], me conta: voce quer organizar as contas da EMPRESA ou as suas PESSOAIS? E como voce lida com isso hoje?"$s$,
      $j$[
        {"when":"Tem empresa (comercio, servico, alimentacao)","then":"Boa! Entao vou te mostrar como a Fyness organiza o financeiro do seu negocio."},
        {"when":"Nao tem empresa, e financa pessoal","then":"Perfeito, [nome]! A Fyness organiza a sua financa pessoal tambem — te mostro certinho no seu caso."}
      ]$j$::jsonb),
    (s3, 1,
      $s$Pergunte: qual o faturamento? (pra dimensionar)$s$,
      $s$"Pra eu te mostrar certinho no seu caso: quanto entra por mes, mais ou menos? (o faturamento da empresa, ou a sua renda)"$s$,
      $j$[
        {"when":"Fatura/ganha bem","then":"Boa! Com esse volume, cada real que escapa sem controle vira MUITO dinheiro no fim do mes. Te mostro como a Fyness fecha essa torneira."},
        {"when":"Fatura pouco / ta comecando","then":"Massa! Quem organiza cedo cresce sem bagunca. A Fyness te da esse controle desde ja, por uns R$2,20 por dia."}
      ]$j$::jsonb),
    (s3, 2,
      $s$Pergunte: como controla hoje? (a dor)$s$,
      $s$"Como voce controla o dinheiro hoje — caderno, planilha, na cabeca, sistema? Voce sabe seu saldo e pra onde ele vai?"$s$,
      $j$[
        {"when":"Bagunca — nao sabe o saldo/lucro, mistura tudo","then":"E exatamente isso que a Fyness resolve — te mostra seu saldo e pra onde o dinheiro vai, em tempo real. Bora marcar 20 min pra eu te mostrar ao vivo?"},
        {"when":"Ja usa um sistema e ta satisfeito","then":"Que massa que voce ja e organizado! Posso te mandar um material pra voce conhecer a Fyness? Se um dia fizer sentido somar, to por aqui."}
      ]$j$::jsonb),
    (s3, 3,
      $s$Se for empresa: quem decide?$s$,
      $s$"Quem decide as compras e contratacoes, e voce?"$s$,
      $j$[
        {"when":"E ele (ou decide junto)","then":"Perfeito! Entao bora, vou te mostrar como funciona."},
        {"when":"Nao e ele","then":"Massa! Voce consegue me apresentar pra quem decide junto? Assim eu mostro pros dois de uma vez e ninguem fica com duvida."}
      ]$j$::jsonb);

  RAISE NOTICE 'Respondeu: qualificacao com cenarios (4 perguntas).';
END $$;

SELECT st.position, st.title, jsonb_array_length(st.scenarios) AS cenarios
FROM crm_stage_steps st
JOIN crm_pipeline_stages s ON s.id = st.stage_id
WHERE s.pipeline_id='44b978de-616a-4256-a4cd-40cd4ec8a4a8' AND s.position=3
ORDER BY st.position;

NOTIFY pgrst, 'reload schema';

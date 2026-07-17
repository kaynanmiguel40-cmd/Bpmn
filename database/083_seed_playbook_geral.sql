-- ============================================================
-- 083_seed_playbook_geral.sql
--
-- Semeia o PLAYBOOK (objetivo + criterio de saida + passos com script) das 8
-- etapas da pipeline Geral (modelo de PROCESSO):
--   Leads · Primeiro contato · Respondeu · Qualificado ·
--   Reuniao Agendada · Reuniao acontecida · Follow up · Cliente
--
-- Conteudo do BPMN comercial antigo (inside sales v4) + as 5 cadencias.
-- Scripts REAIS dos blocos <bpmn:documentation>; alguns contornos de objecao
-- sao (sugerido) — coerentes com o material.
--
-- Resolve as etapas por POSICAO (1-8). Limpa passos de teste antes de semear.
-- Idempotente: se a etapa Cliente ja tem objetivo (sentinela do seed), sai.
-- Dollar-quoting ($s$) nos scripts pra nao escapar aspas/apostrofos.
-- ============================================================

DO $$
DECLARE
  v_geral uuid := '44b978de-616a-4256-a4cd-40cd4ec8a4a8';
  s1 uuid; s2 uuid; s3 uuid; s4 uuid; s5 uuid; s6 uuid; s7 uuid; s8 uuid;
BEGIN
  SELECT id INTO s1 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=1; -- Leads
  SELECT id INTO s2 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=2; -- Primeiro contato
  SELECT id INTO s3 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=3; -- Respondeu
  SELECT id INTO s4 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=4; -- Qualificado
  SELECT id INTO s5 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=5; -- Reuniao Agendada
  SELECT id INTO s6 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=6; -- Reuniao acontecida
  SELECT id INTO s7 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=7; -- Follow up
  SELECT id INTO s8 FROM crm_pipeline_stages WHERE pipeline_id=v_geral AND position=8; -- Cliente

  IF (SELECT objetivo FROM crm_pipeline_stages WHERE id=s8) IS NOT NULL THEN
    RAISE NOTICE 'Playbook da Geral ja semeado — nada a fazer.';
    RETURN;
  END IF;

  -- Limpa passos de teste (ex: os 3 rascunhos no Leads).
  DELETE FROM crm_stage_steps WHERE stage_id IN (s1, s2, s3, s4, s5, s6, s7, s8);

  -- ===================== 1 — LEADS =====================
  UPDATE crm_pipeline_stages SET
    objetivo = $s$Fazer o PRIMEIRO toque de cada lead novo o mais rapido possivel, no canal certo, transferindo a confianca da fonte (contador, indicacao, anuncio). Nao e pra vender — e pra abrir a conversa.$s$,
    exit_criteria = $s$Assim que disparar o 1o toque, mover pra Primeiro contato (a cadencia de follow-up roda a partir dali).$s$
  WHERE id=s1;
  INSERT INTO crm_stage_steps (stage_id, position, title, script) VALUES
    (s1, 0, $s$Speed-to-lead (regra que rege tudo)$s$, $s$Responder em ate 5 min no inbound/anuncio (0-5min = conversao ~50% maior; 24h+ = lead frio queimado). No lead endossado por contador, disparar o D0 no MESMO dia do endosso.$s$),
    (s1, 1, $s$1o toque — Anuncio pago (WhatsApp em ate 15min)$s$, $s$"Oi [nome]! Acabei de ver que voce se interessou pela Fyness. Vou te ligar agora pra tirar suas duvidas. Se nao puder atender, me avisa o melhor horario!"$s$),
    (s1, 2, $s$1o toque — Indicacao de contador (audio D0, nunca texto)$s$, $s$Audio de 30s: "Oi [nome]! Aqui e a [consultora] da Fyness. O [contador] te falou da gente — ele que me pediu pra te procurar. Sei que voce ta ocupado, entao so queria me apresentar rapido. Te chamo amanha pra te mostrar tudo em 15min. Beleza?"$s$),
    (s1, 3, $s$1o toque — Indicacao de cliente (peer-to-peer, audio D0)$s$, $s$"Oi [nome]! Aqui e a [consultora] da Fyness. O [cliente] te indicou pra mim — ele falou que voce e o [segmento] que cresceu bastante e acha que voce ia curtir nossa ferramenta. Posso te explicar rapidinho?"$s$),
    (s1, 4, $s$1o toque — Outbound frio (DM apos 3 dias de pre-aquecimento)$s$, $s$Pre-aquecer (D-3 a D-1): curtir 1 post, comentar algo genuino, seguir — sem pitch. DM (D0): "Oi [nome]! Sou a [consultora] da Fyness. Comecei a seguir voces faz uns dias — adorei aquele post do [coisa especifica]. Ajudo dono de [segmento] a controlar o caixa pelo WhatsApp. Posso te mandar 1 imagem rapida do que se trata?"$s$),
    (s1, 5, $s$1o toque — Inbound organico (pergunta antes de vender)$s$, $s$"Oi [nome]! Que legal que voce chegou aqui. Antes de eu te explicar a Fyness, me conta: o que te chamou atencao? Foi alguma duvida especifica que voce ta tentando resolver no negocio?"$s$);

  -- ===================== 2 — PRIMEIRO CONTATO =====================
  UPDATE crm_pipeline_stages SET
    objetivo = $s$Voce ja fez o 1o toque mas o lead ainda nao respondeu. Trabalhar a cadencia multi-toque variando canal e horario ate arrancar uma resposta — sem virar spam.$s$,
    exit_criteria = $s$Lead respondeu QUALQUER coisa (mensagem, ligacao atendida, emoji) → mover pra Respondeu. Esgotou a cadencia sem resposta → stand-by/Nurturing.$s$
  WHERE id=s2;
  INSERT INTO crm_stage_steps (stage_id, position, title, script) VALUES
    (s2, 0, $s$Cadencia multi-toque (12 toques em 14 dias, variando horario)$s$, $s$D1 9h Lig1 / D1 18h Lig2 / D2 13h Lig3 / D3 WhatsApp + cartilha / D5 10h Lig4 / D6 audio do Kaynan / D7 19h Lig5 / D9 11h Lig6 / D10 video de cliente / D12 14h Lig7 / D14 19h Lig8 + despedida. Variar horario sobe o pick-up ~35%.$s$),
    (s2, 1, $s$Ligacao 1 (D1, manha)$s$, $s$"Oi [nome]! Aqui e a [consultora] da Fyness, te mandei audio ontem — o [contador] pediu pra te ligar. Posso te roubar 15 minutos hoje ou amanha? Te chamo no horario que voce escolher."$s$),
    (s2, 2, $s$Toque do fundador (quebra de padrao — o dono chamando)$s$, $s$Audio pessoal do Kaynan (D6): "E ai [nome], aqui e o Kaynan, dono da Fyness. Soube que o [contador] te apresentou a gente e a [consultora] te procurou umas vezes. Me responde aqui 1 oi que eu mesmo te explico em 5 minutos como a gente pode te ajudar. Topa?"$s$),
    (s2, 3, $s$Pergunta-chave de saida digna$s$, $s$"Faz sentido a gente conversar ou nao?" — forca uma resposta e da saida honrosa. Se "nao quero", respeita e encerra.$s$),
    (s2, 4, $s$Despedida ativa (ultima chance — converte 15-30%)$s$, $s$"Oi [nome], entendi que agora nao e o momento. Vou parar de te chamar pra nao te incomodar. Quando precisar, e so me mandar 1 oi aqui que retomo na hora. Sucesso ai!"$s$);

  -- ===================== 3 — RESPONDEU =====================
  UPDATE crm_pipeline_stages SET
    objetivo = $s$Lead reagiu. Aprofundar a conversa com valor e perguntas de baixo atrito, entender a dor e aquecer pra reuniao.$s$,
    exit_criteria = $s$Confirmou o ICP (3 de 4 criterios) e ha fit → mover pra Qualificado.$s$
  WHERE id=s3;
  INSERT INTO crm_stage_steps (stage_id, position, title, script) VALUES
    (s3, 0, $s$Pergunta de baixo atrito (destrava sem pedir compromisso)$s$, $s$"Oi [nome]! Deixa eu te perguntar 1 coisa direta — voce ainda controla as financas no caderno ou ja usa alguma coisa? Pergunta de curiosa mesmo."$s$),
    (s3, 1, $s$Prova social por perfil (video de cliente do MESMO segmento)$s$, $s$"Oi [nome]! Te mando esse videozinho de 1 minuto — e a Dona Maria do salao, usa a Fyness ha 4 meses e conta como mudou pra ela. Acho que voce vai se identificar." (Regra: padaria pra padaria, salao pra salao.)$s$),
    (s3, 2, $s$Ligacao de conexao (entender a dor)$s$, $s$"Oi [nome], aqui e a [consultora] do Fyness. Vi que voce quer organizar o financeiro do seu [segmento]. Te chamei pra entender rapidinho como ta hoje e, se fizer sentido, marcar uma demonstracao de 20 min com nosso especialista. Pode falar 2 minutinhos?"$s$),
    (s3, 3, $s$OBJECAO: "Manda por e-mail / manda o material" (sugerido)$s$, $s$Mandar o visual de 1 pagina SEM cobrar resposta: "Te mandei a Fyness aqui em 1 imagem pra voce olhar quando der tempo. Qualquer duvida, me chama." E voltar pela ligacao no proximo toque — o material e isca, nao substitui a conversa.$s$),
    (s3, 4, $s$OBJECAO: "Ja tenho contador / ja uso planilha" (sugerido)$s$, $s$"O contador te fecha o mes la na frente; a Fyness te mostra teu lucro real HOJE, no celular, e voce lanca so mandando foto do comprovante no WhatsApp. Um nao substitui o outro."$s$);

  -- ===================== 4 — QUALIFICADO =====================
  UPDATE crm_pipeline_stages SET
    objetivo = $s$Lead tem fit (ICP confirmado). Conectar com o decisor, ancorar o WOW e propor a reuniao de 20 min.$s$,
    exit_criteria = $s$Reuniao aceita com data/hora → mover pra Reuniao Agendada.$s$
  WHERE id=s4;
  INSERT INTO crm_stage_steps (stage_id, position, title, script) VALUES
    (s4, 0, $s$Confirmar o ICP (3 de 4 criterios)$s$, $s$1) segmento PME servico/comercio/alimentacao; 2) faturamento >= R$10k/mes; 3) dor financeira (nao sabe o lucro real, mistura PF/PJ, controla no caderno, paga funcionario so pro financeiro); 4) decisor acessivel. Desqualifica: fatura < R$5k/mes, ja usa ERP robusto satisfeito, sem dor. Anotar a dor + estimativa de perda pro handoff.$s$),
    (s4, 1, $s$Perguntas de dor$s$, $s$"Como voce controla o financeiro hoje?" / "Voce sabe seu lucro real do mes passado?" / "Quem cuida disso, voce ou alguem?"$s$),
    (s4, 2, $s$Propor a reuniao com 2 opcoes de horario (nunca pergunta aberta)$s$, $s$"[nome], e EXATAMENTE isso que o Fyness resolve. Vou marcar 20 min com nosso especialista pra te mostrar AO VIVO, com os numeros do seu negocio. Fica melhor amanha 10h ou 16h?"$s$),
    (s4, 3, $s$OBJECAO: "Nao tenho tempo"$s$, $s$"Sem problema! Quando que e menos corrido pra voce? Eu encaixo no seu horario."$s$);

  -- ===================== 5 — REUNIAO AGENDADA =====================
  UPDATE crm_pipeline_stages SET
    objetivo = $s$Com a reuniao marcada, garantir o comparecimento: teaser curto que ancora o WOW (sem queimar a demo) e confirmacao 1h antes.$s$,
    exit_criteria = $s$Lead compareceu na reuniao → mover pra Reuniao acontecida. Nao-show → retomar follow-up de agendamento.$s$
  WHERE id=s5;
  INSERT INTO crm_stage_steps (stage_id, position, title, script) VALUES
    (s5, 0, $s$Mandar o teaser (30-60s) — ancora o WOW$s$, $s$Enviar teaser vertical 9:16, UMA cena (foto do comprovante → assistente lanca → aparece no fluxo de caixa). Legenda: "Olha o que acontece quando voce manda um comprovante aqui...". REGRA DE OURO: e teaser, NAO demo — nao mostrar DRE/relatorios (isso e municao do Closer ao vivo; mandar tudo aqui derruba o comparecimento).$s$),
    (s5, 1, $s$Handoff pro Closer (Smart Lead no CRM)$s$, $s$Registrar: nome/WhatsApp, segmento/cidade, dor principal, faturamento aprox., estimativa de perda mensal, fonte, data/hora. Notificar o Closer.$s$),
    (s5, 2, $s$Follow-up de agendamento se esfriar (D1/D3/D5)$s$, $s$D1: "[nome], consegui um horario pro especialista te mostrar quanto voce ta perdendo. Amanha 10h ou 16h?" D3: "[nome], o [case] tava igual e ficou adiando. Quando viu os numeros, fechou na hora." D5: "[nome], ultima janela essa semana. Cada dia sem controle e dinheiro saindo."$s$),
    (s5, 3, $s$Confirmacao 1h antes (mata no-show)$s$, $s$Enviar lembrete pro lead 1h antes da reuniao, reforcando o valor de 20 min e o horario.$s$);

  -- ===================== 6 — REUNIAO ACONTECIDA =====================
  UPDATE crm_pipeline_stages SET
    objetivo = $s$Fazer a dor DOER (Retomada + SPIN), entregar o WOW na demo ao vivo e levar a proposta ancorada na perda.$s$,
    exit_criteria = $s$Reuniao concluida → mover pra Follow up (proposta e contorno de objecao). Fechou na hora → Cliente.$s$
  WHERE id=s6;
  INSERT INTO crm_stage_steps (stage_id, position, title, script) VALUES
    (s6, 0, $s$Preparar (5 min antes)$s$, $s$Ler notas do SDR (dor, segmento, faturamento, perda estimada), olhar Insta/Google da empresa, calcular a perda, escolher o pitch: P1 "Manda o financeiro embora" (tem funcionario no financeiro) ou P2 "Para de perder horas com planilha" (faz sozinho).$s$),
    (s6, 1, $s$Retomada (2-3 min)$s$, $s$"[nome], o [SDR] me passou que voce controla o financeiro [na mao/de cabeca/com funcionario]. Piorou, melhorou ou continua igual? Hoje eu te mostro EXATAMENTE quanto isso custa e como resolver."$s$),
    (s6, 2, $s$SPIN (5-8 min) — fazer doer$s$, $s$S: "Como controla hoje? Quem faz? Quanto tempo/quanto paga por isso?" P: "Sabe seu lucro REAL do mes passado, o numero EXATO? Ja chegou no fim do mes sem dinheiro pra pagar conta?" I: "Se perde 5-15% do faturamento sem saber, em 1 ano da quanto? R$2-3k/mes de funcionario = R$30k/ano. Seu concorrente ja sabe o lucro em tempo real. E voce?" N: "Se visse no celular agora quanto lucrou e o que tem a pagar, quanto valeria?" Anotar os numeros (justificam o preco).$s$),
    (s6, 3, $s$Demo (8-10 min) — momento WOW$s$, $s$"Olha: mando essa foto de comprovante no WhatsApp... pronto, o assistente ja lancou, categorizado, no fluxo de caixa. Voce nunca mais digita nada." Mostrar com exemplos do segmento: lancamento por WhatsApp, DRE em tempo real (o lucro que ele nao sabia), recomendacoes do assistente, fluxo de caixa. RECONECTAR cada recurso a dor do SPIN: "Lembra que voce disse [dor]? Olha como acabou."$s$);

  -- ===================== 7 — FOLLOW UP =====================
  UPDATE crm_pipeline_stages SET
    objetivo = $s$Apresentar a proposta ancorada na perda + carencia de pagamento e contornar a objecao que travou o fechamento, com follow-up escalonado.$s$,
    exit_criteria = $s$Contornou e avancou → Cliente. Sem avanco apos os follow-ups → Nurturing (reativacao em 30 dias).$s$
  WHERE id=s7;
  INSERT INTO crm_stage_steps (stage_id, position, title, script) VALUES
    (s7, 0, $s$Proposta com ancoragem na perda + escada de preco$s$, $s$"[nome], com tudo que voce me mostrou, voce ta perdendo [estimativa] por mes sem controle. O Fyness resolve isso e ainda se paga." Ancorar SEMPRE no anual R$67/mes (R$2,20/dia); mensal R$97 como opcao B. P1: "Voce paga R$2-3k/mes pra alguem fazer o que o assistente faz por R$67." NUNCA abrir preco antes da demo.$s$),
    (s7, 1, $s$Carencia de pagamento (substitui o trial)$s$, $s$"Pra comecar sem aperto: assina hoje e a primeira cobranca cai em ate 15 dias. Voce ja entra usando, manda o primeiro comprovante no WhatsApp, e so paga depois." (SEM trial. Desconto so com algo em troca + aprovacao do gestor.)$s$),
    (s7, 2, $s$OBJECAO "preciso pensar" → follow-up D1/D3/D5$s$, $s$D1: "[nome], enquanto pensa, o financeiro continua no escuro. Qual a duvida que ta travando?" D3 (prova social): "o [case] ficou pensando e ja tinha perdido R$3k quando comecou." D5 (risco baixo): "Assina hoje e so paga em ate 15 dias. Comeca usando sem tirar do bolso agora."$s$),
    (s7, 3, $s$OBJECAO "esta caro" → reframe ROI + carencia$s$, $s$"Quanto voce PERDE por mes sem saber o lucro? R$97 se paga no primeiro mes. No anual sao R$67 — R$2,20/dia. Voce paga R$2-3k/mes de funcionario; isso nao e economia, e emergencia." Facilitar com a carencia de 15 dias.$s$),
    (s7, 4, $s$OBJECAO "nao e o momento" / "sem perfil"$s$, $s$"Nao e o momento": "Quando VAI ser? Enquanto espera, voce perde [valor] por mes; em 6 meses sao [valor x6]." → tag nao_agora + reativar em 30d. "Sem perfil": descarte honesto — "nesse momento o Fyness e mais indicado pra [criterio], mas entra na comunidade gratuita e, quando crescer, me chama."$s$),
    (s7, 5, $s$Fechamento com urgencia$s$, $s$"Faz sentido continuar perdendo [valor do SPIN] por mes ou vamos resolver isso agora? Te mando o contrato e voce ja comeca hoje."$s$);

  -- ===================== 8 — CLIENTE =====================
  UPDATE crm_pipeline_stages SET
    objetivo = $s$Formalizar o contrato com carencia, ativar o onboarding pra o cliente ver valor imediato e pedir indicacao (alimenta o canal no 1).$s$,
    exit_criteria = $s$Contrato assinado + pagamento coletado + onboarding disparado + check-ins D7/D30 agendados.$s$
  WHERE id=s8;
  INSERT INTO crm_stage_steps (stage_id, position, title, script) VALUES
    (s8, 0, $s$Contrato assinado + carencia (ate 15 dias)$s$, $s$Enviar contrato por assinatura digital; confirmar plano (Mensal R$97 ou Anual R$67/mes em 12x); aplicar carencia (assina agora, 1a cobranca em ate 15 dias); coletar cartao recorrente; disparar onboarding na hora.$s$),
    (s8, 1, $s$Ativar onboarding — valor imediato$s$, $s$"Manda AGORA a primeira foto de comprovante no WhatsApp e ve o assistente lancando tudo." Criar conta + credenciais (WhatsApp + email); setup de 30 min (plano de contas do segmento, contas a pagar/receber); dar acesso a Educacao Financeira + Comunidade; agendar check-in D7 e D30.$s$),
    (s8, 2, $s$Pedir indicacao em TODO fechamento (realimenta o topo)$s$, $s$"[nome], que bom te ter com a gente! Voce conhece outro dono de [segmento] penando com o financeiro? Me passa o contato que eu cuido dele igual cuidei de voce." Bonus: avisar o indicador quando o indicado responder, pra manter o canal ativo.$s$);

  RAISE NOTICE 'Playbook da Geral semeado: 8 etapas.';
END $$;

-- Confere: passos por etapa + objetivo preenchido.
SELECT s.position, s.name, count(st.id) AS passos, (s.objetivo IS NOT NULL) AS tem_objetivo
FROM crm_pipeline_stages s
LEFT JOIN crm_stage_steps st ON st.stage_id = s.id
WHERE s.pipeline_id = '44b978de-616a-4256-a4cd-40cd4ec8a4a8'
GROUP BY s.position, s.name, s.objetivo
ORDER BY s.position;

NOTIFY pgrst, 'reload schema';

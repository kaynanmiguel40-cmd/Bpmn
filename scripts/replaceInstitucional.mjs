import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/utils/marketingTemplate.js';
let content = readFileSync(filePath, 'utf8');

const START_MARKER = '<!-- POOL 5:';
const END_MARKER   = '<!-- POOL 6:';

const startIdx = content.indexOf(START_MARKER);
const endIdx   = content.indexOf(END_MARKER);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found!', { startIdx, endIdx });
  process.exit(1);
}

const INST_POOL = `<!-- POOL 5: FYNESS INSTITUCIONAL (@fynessbr — 6 seg, do zero)    -->
  <!-- ============================================================ -->
  <bpmn2:process id="Process_Institucional" isExecutable="false">

    <!-- ══════════════════════════════════════════════════════════════
         INÍCIO — SETUP DO PERFIL INSTITUCIONAL DO ZERO
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:startEvent id="Start_Inst_Setup" name="Setup do @fynessbr (6 Seguidores — Do Zero)">
      <bpmn2:documentation>🏢 PERFIL INSTITUCIONAL: @FYNESSBR
Status atual: 6 seguidores. Recém-criado. Zero autoridade própria ainda.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAPEL DO @FYNESSBR NO ECOSSISTEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ NÃO é o perfil que gera audiência — isso é Robert e Kaynan.
→ É o perfil que CONFIRMA a decisão de compra.
→ Quando o lead viu o Robert ou Kaynan e ficou curioso → vai no @fynessbr.
→ O que ele precisa encontrar: produto real, prova social, CTA claro.
→ Se o perfil estiver vazio ou desorganizado → lead vai embora.
→ Missão: fazer com que quem chega aqui converta para trial.

CRESCIMENTO ESPERADO (realista com 6 seguidores):
→ Mês 1: 6 → 80 (via menções de Robert + Kaynan)
→ Mês 2: 80 → 250 (conteúdo próprio + reposts dos fundadores)
→ Mês 3: 250 → 600 (primeiros clientes marcando o perfil)
→ Mês 6: 1.500+ (crescimento orgânico + anúncio Meta/Google levando ao perfil)
NOTA: @fynessbr cresce na cauda dos fundadores. Aceitar isso e usar a favor.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOM DE VOZ INSTITUCIONAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Profissional mas não frio. Tem personalidade de produto.
→ Direto ao ponto. Cada post tem um objetivo claro.
→ Orientado a resultado: mostra o que o produto faz, não só o que é.
→ Nunca genérico. Sempre específico: "Registre sua venda em 10 segundos."
→ Usa números reais quando possível. "R$8.000 economizados em retrabalho."
→ Tom: "solução que funciona" — não "mais um app" nem "revolucionário".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHECKLIST DE SETUP (FASE ZERO — Kauã executa antes de qualquer post)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Conta no modo Empresa (não criador)
□ Categoria: "Software" ou "Produto/Serviço"
□ Bio otimizada (ver abaixo)
□ Link direto pra LP na bio (sem Linktree — menos fricção)
□ Foto de perfil: logo Fyness em alta resolução, fundo da cor da marca
□ 5 Destaques de Stories criados com capas no padrão visual:
   🎬 Demo — vídeos do produto funcionando
   ⭐ Clientes — depoimentos e cases
   📊 Features — cada feature explicada
   ❓ FAQ — dúvidas mais comuns respondidas
   🚀 Trial — como funciona o período grátis
□ Primeiros 9 posts do feed planejados e criados antes do primeiro post público
□ Marcações ativas nos perfis de Robert e Kaynan na bio ou em posts fixados

BIO INSTITUCIONAL OTIMIZADA (150 caracteres):
"Gestão financeira empresarial pelo WhatsApp 📲
Mande uma mensagem. Controle seu negócio.
7 dias grátis — sem cartão 👇"
[Link: página de trial direta — sem etapa intermediária]

PRIMEIROS 9 POSTS DO GRID (publicar 3 por dia nos primeiros 3 dias):
→ Post 1: Vídeo demo do produto (15s — o que é o Fyness)
→ Post 2: Carrossel "5 problemas financeiros que o Fyness resolve"
→ Post 3: Reel "Registro de gasto em 10 segundos pelo WhatsApp"
→ Post 4: Carrossel "Tudo que você tem nos 7 dias grátis"
→ Post 5: Reel "Seu DRE gerado automaticamente"
→ Post 6: Post depoimento (fundadores usando o produto — até ter clientes)
→ Post 7: Reel "Antes e depois: planilha vs Fyness"
→ Post 8: Carrossel "Como funciona o Fyness — passo a passo"
→ Post 9: CTA direto — "7 dias grátis começa aqui"
      </bpmn2:documentation>
      <bpmn2:outgoing>Flow_Inst_Setup_Calendario</bpmn2:outgoing>
    </bpmn2:startEvent>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 1 — CALENDÁRIO EDITORIAL SEMANAL (4 PILARES)
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Inst_Calendario" name="Calendário Editorial Semanal — 4 Pilares">
      <bpmn2:documentation>📅 CALENDÁRIO EDITORIAL @FYNESSBR

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OS 4 PILARES E O PESO DE CADA UM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PILAR 1 — PRODUTO EM AÇÃO (40% do conteúdo)
→ Mostrar o produto funcionando. Sem explicação longa. Deixa o produto falar.
→ Formato: Reels curtos (15-30s), screen recording, demo ao vivo.
→ Objetivo: "Eu quero isso" — o lead vê e quer experimentar.

PILAR 2 — PROVA SOCIAL (30% do conteúdo)
→ Depoimentos, cases, resultados. O que o produto fez por quem usa.
→ Fase inicial (sem clientes ainda): usar fundadores como prova social.
→ Objetivo: "Funciona de verdade" — eliminar objeção de ceticismo.

PILAR 3 — EDUCATIVO COM SOLUÇÃO (20% do conteúdo)
→ Conteúdo de valor com o Fyness como solução natural.
→ Diferença do Robert/Kaynan: aqui o Fyness SEMPRE aparece como resposta.
→ Objetivo: "Preciso disso" — conectar dor com solução.

PILAR 4 — OFERTA E CTA (10% do conteúdo)
→ Post direto sobre o trial. Benefícios + urgência suave + link.
→ Um por semana no feed. Stories com link todos os dias.
→ Objetivo: conversão direta para trial.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISTRIBUIÇÃO SEMANAL (1 post/dia, 7 dias)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGUNDA — Produto em Ação (Reel de demo)
TERÇA — Educativo com Solução (Carrossel ou Reel)
QUARTA — Prova Social (Depoimento ou Case)
QUINTA — Produto em Ação (Feature específica)
SEXTA — Oferta + CTA (post direto pro trial)
SÁBADO — Repost de conteúdo dos fundadores (Robert ou Kaynan) → cross-follow
DOMINGO — Story série "Bastidores" ou Pergunta de engajamento

HORÁRIOS:
→ Posts de feed: 18h30 (maior engajamento para perfis de negócio)
→ Stories: 8h + 13h + 20h (3 momentos por dia)
→ Responder comentários: em até 2h após cada post

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BANCO DE CONTEÚDO — CALENDÁRIO 30 DIAS DETALHADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SEMANA 1 — LANÇAMENTO DO PERFIL

Seg (Produto): Reel "O que é o Fyness em 20 segundos"
ROTEIRO: [Screen recording do WhatsApp + dashboard]
"Você manda uma mensagem no WhatsApp.
[Texto na tela: 'Vendi R$2.000 hoje']
O Fyness registra automaticamente.
[Mostra o dashboard atualizando]
Relatório financeiro em tempo real. Sem planilha. Sem app novo.
Só o WhatsApp."
LEGENDA: "Gestão financeira nunca foi tão simples. Teste 7 dias grátis — link na bio."
HASHTAGS: #fyness #gestaofinanceira #whatsapp #empreendedorismo #pequenasempresas

Ter (Educativo): Carrossel "5 Problemas Financeiros que o Fyness Resolve"
Slide 1: "5 problemas financeiros que destroem negócios. O Fyness resolve todos."
Slide 2: "1. Você não sabe o lucro real do mês → DRE automático em tempo real"
Slide 3: "2. Planilha desatualizada → registro por WhatsApp, sempre em dia"
Slide 4: "3. Surpresas com vencimentos → alertas automáticos antes de vencer"
Slide 5: "4. Sem visibilidade do caixa → projeção de fluxo dos próximos 30 dias"
Slide 6: "5. Não sabe qual produto vale mais → análise de margem por produto"
Slide 7: "Tudo isso pelo WhatsApp. Sem planilha. Sem app novo."
Slide 8: "7 dias grátis. Sem cartão. Link na bio. 👆"
LEGENDA: "Qual desses 5 você mais sofre? Comenta o número aqui."

Qua (Prova Social): Post dos fundadores usando o produto
ROTEIRO (Robert): "Uso o Fyness todo dia. Não porque sou co-fundador. Porque funciona."
[Print do dashboard real do Robert com DRE do mês]
LEGENDA: "Construímos o Fyness porque precisávamos disso nos nossos próprios negócios. — Robert, co-fundador. Testa 7 dias: link na bio."

Qui (Produto): Reel "Registro de Gasto em 10 Segundos"
[Demo ao vivo — celular na mão, WhatsApp aberto]
"10 segundos. Vou mostrar."
[Fala no áudio: 'Paguei R$500 de aluguel do escritório.']
[Tela: confirmação do Fyness em 2 segundos]
[Mostra o relatório de despesas atualizado]
"Registrado. Categorizado. No relatório."
LEGENDA: "10 segundos. Seu financeiro sempre em dia. Link na bio."

Sex (Oferta): Post "7 Dias Grátis — O Que Você Leva"
FORMATO: Carrossel visual, cada slide = 1 benefício
Slide 1: "7 dias grátis. Veja o que você leva."
Slide 2: "✓ Controle financeiro completo pelo WhatsApp"
Slide 3: "✓ DRE em tempo real — sem esperar o fim do mês"
Slide 4: "✓ Fluxo de caixa projetado para 30 dias"
Slide 5: "✓ Alertas automáticos de vencimento"
Slide 6: "✓ Análise de margem por produto"
Slide 7: "✓ Relatórios prontos para apresentar ao contador"
Slide 8: "7 dias grátis. Sem cartão. Cancele quando quiser. ↓"
Slide 9: "Link na bio. Começa em 2 minutos."
LEGENDA: "Quanto você está perdendo sem controle financeiro? Teste e descubra. Link na bio."

Sab (Repost): Melhor Reel da semana do Robert ou Kaynan
LEGENDA: "De @[robert/kaynan] — Isso é o que o Fyness resolve. Link na bio pro trial."

Dom (Engajamento): Enquete nos Stories
Story 1: "Você usa alguma ferramenta de controle financeiro no seu negócio?" [Sim] [Não]
Story 2: (se não) "O que te impede?" [Não tenho tempo] [É complicado] [Não sei por onde começar]
Story 3: Link do trial com texto "Começar hoje é mais fácil do que você imagina."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEMANA 2 — APROFUNDAR FUNCIONALIDADES

Seg (Produto): Reel "Seu DRE em Tempo Real"
[Demo: Kaynan ou Robert abrindo o chat e pedindo o DRE]
"Digita: relatório do mês.
[Fyness responde com DRE formatado]
Receita total: R$18.400
Custo dos serviços: R$4.200
Despesas operacionais: R$6.800
Lucro líquido: R$7.400
Em 3 segundos. Sem planilha. Sem contador esperando."
LEGENDA: "Você sabe quanto lucrou esse mês? Com o Fyness, você sabe agora. Link na bio."

Ter (Educativo): Carrossel "Planilha vs Fyness — Qual a Diferença Real?"
Slide 1: "Planilha ou Fyness? Veja a diferença real."
Slide 2: "Planilha: precisa abrir toda vez. Fyness: já está no WhatsApp."
Slide 3: "Planilha: depende de você atualizar. Fyness: atualiza sozinho."
Slide 4: "Planilha: erro humano frequente. Fyness: IA processa e confirma."
Slide 5: "Planilha: relatório manual, demora horas. Fyness: relatório em segundos."
Slide 6: "Planilha: zero alerta de vencimento. Fyness: avisa antes de vencer."
Slide 7: "Planilha: abandonada em 60 dias. Fyness: você já usa o WhatsApp."
Slide 8: "A melhor ferramenta é a que você realmente usa. Teste 7 dias. Link na bio."

Qua (Prova Social): Case de uso — fundadores como proxy de cliente
FORMATO: Reel de 30s com Kaynan mostrando o próprio uso
"Uso o Fyness pra controlar as finanças do próprio Fyness.
[Mostra chat do WhatsApp com lançamentos do dia]
Cada gasto da empresa: registrado por mensagem.
Relatório no fim do dia: automático.
Isso é o que oferecemos pra você."
LEGENDA: "Se funciona pra quem construiu, funciona pro seu negócio. Teste 7 dias. Link na bio."

Qui (Produto): Reel "Alerta de Vencimento — Nunca Mais Seja Pego de Surpresa"
[Simulação: Fyness envia alerta 3 dias antes do vencimento]
"3 dias antes de vencer, o Fyness te avisa.
[Mostra notificação: 'Conta de energia vence em 3 dias — R$380']
Sem surpresa. Sem cheque especial. Sem juros."
LEGENDA: "Quantas vezes você foi pego de surpresa com uma conta? Com o Fyness, isso acaba. Link na bio."

Sex (Oferta): Reel com depoimento sintético (fundador)
Robert: "Se eu tivesse o Fyness há 5 anos, teria economizado R$80k em decisões erradas."
[Corte para demo rápida do produto]
CTA: "7 dias grátis. Sem cartão. Link na bio do @fynessbr."

Sab: Repost do melhor carrossel da semana (Robert ou Kaynan)

Dom: Stories engajamento — caixa de perguntas "Qual é sua maior dificuldade financeira no negócio?"
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Setup_Calendario</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Calendario_Produto</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 2 — PRODUTO EM AÇÃO (PILAR 1) — DEMOS E FEATURES
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Inst_Produto" name="Pilar 1 — Produto em Ação (Demo + Features)">
      <bpmn2:documentation>🎬 PRODUTO EM AÇÃO — BANCO COMPLETO DE CONTEÚDO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRA DE OURO DOS POSTS DE PRODUTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ MOSTRE, não descreva. Screen recording vale mais que texto.
→ 1 feature por post. Não tente mostrar tudo de uma vez.
→ Sempre começa do problema, não da solução.
  ERRADO: "O Fyness tem DRE automático!"
  CERTO: "Você sabe quanto lucrou esse mês? [pausa] O Fyness te diz em 3 segundos."
→ Duração máxima: 30 segundos. Vai direto.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BANCO DE 15 DEMOS DE FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 DEMO 1 — Registro de Venda por Texto
GANCHO: "Você vendeu. Em 10 segundos, está no financeiro."
CONTEÚDO: [Screen recording] Usuário digita "Vendi R$2.000 de consultoria hoje." Fyness confirma, registra, atualiza DRE.
LEGENDA: "Sem planilha. Sem app. Só o WhatsApp. Teste 7 dias: link na bio."

📌 DEMO 2 — Registro de Gasto por Áudio
GANCHO: "Fala. O Fyness entende."
CONTEÚDO: [Screen recording] Usuário manda áudio: "Paguei R$450 no fornecedor de embalagem." Fyness transcreve, categoriza, confirma.
LEGENDA: "Gestão financeira enquanto você dirige, caminha ou está de mãos ocupadas. Link na bio."

📌 DEMO 3 — DRE em Tempo Real
GANCHO: "Quanto você lucrou esse mês? Descobre agora, não no fim do mês."
CONTEÚDO: [Screen recording] Usuário digita "DRE" no chat. Fyness retorna relatório formatado com receitas, despesas, margem e lucro líquido.
LEGENDA: "DRE em tempo real. Sem esperar. Sem contador. Link na bio."

📌 DEMO 4 — Projeção de Fluxo de Caixa
GANCHO: "Você vai ter dinheiro na semana que vem? O Fyness sabe."
CONTEÚDO: [Dashboard] Projeção de entradas e saídas dos próximos 30 dias. Saldo previsto por dia.
LEGENDA: "Visibilidade financeira real. Antecipe problemas antes de virar crise. Link na bio."

📌 DEMO 5 — Alerta de Vencimento
GANCHO: "Boleto na sexta. O Fyness te avisou na terça."
CONTEÚDO: [Notificação do Fyness no WhatsApp] "Alerta: Conta de aluguel vence em 3 dias — R$3.200."
LEGENDA: "Zero surpresa. Zero cheque especial. Zero juros. Teste 7 dias: link na bio."

📌 DEMO 6 — Relatório de Contas a Pagar
GANCHO: "O que você deve nos próximos 15 dias? Pergunta pro Fyness."
CONTEÚDO: [Screen recording] Usuário digita "Contas a pagar." Fyness lista: fornecedor, aluguel, energia, com valores e datas.
LEGENDA: "Nunca mais seja pego de surpresa. Link na bio."

📌 DEMO 7 — Análise de Margem por Produto
GANCHO: "Qual produto te dá mais lucro? Provavelmente não é o que você pensa."
CONTEÚDO: [Dashboard] Comparativo de margem entre 3 produtos ou serviços. Um tem margem negativa.
LEGENDA: "Com o Fyness, você descobre onde está ganhando e onde está perdendo. Link na bio."

📌 DEMO 8 — Relatório de Inadimplência
GANCHO: "Quanto te devem? E quando vai entrar?"
CONTEÚDO: [Screen recording] Usuário digita "Inadimplência." Fyness retorna lista de clientes em atraso, valores e dias de atraso.
LEGENDA: "Controle do que te devem tanto quanto do que você deve. Link na bio."

📌 DEMO 9 — Consolidação Multi-Negócio
GANCHO: "Tem mais de um negócio? O Fyness consolida tudo."
CONTEÚDO: [Dashboard] Dois negócios separados, visão consolidada e individual.
LEGENDA: "Um WhatsApp. Múltiplos negócios. Tudo organizado. Link na bio."

📌 DEMO 10 — Categorização Automática por IA
GANCHO: "Você não categoriza. A IA do Fyness categoriza."
CONTEÚDO: [Screen recording] Usuário registra gasto. Fyness já categoriza automaticamente (aluguel, fornecedor, marketing, etc.). Usuário confirma com um clique.
LEGENDA: "Quanto menos etapas, mais você usa. Isso é o Fyness. Link na bio."

📌 DEMO 11 — Resumo Diário Automático
GANCHO: "Todo dia às 20h, seu financeiro do dia no WhatsApp."
CONTEÚDO: [Notificação] Resumo automático do dia: entradas, saídas, saldo.
LEGENDA: "Controle financeiro passivo. O Fyness te informa sem você precisar pedir. Link na bio."

📌 DEMO 12 — Exportação para Contador
GANCHO: "Seu contador vai amar isso."
CONTEÚDO: [Demo] Usuário pede exportação do relatório mensal. Fyness gera arquivo formatado para o contador.
LEGENDA: "Menos horas de contador. Mais dinheiro no seu bolso. Link na bio."

📌 DEMO 13 — Comparativo Mensal
GANCHO: "Esse mês foi melhor ou pior que o mês passado? Sabe em 5 segundos."
CONTEÚDO: [Dashboard] Comparativo visual mês a mês. Receita, despesa, lucro, margem.
LEGENDA: "Tendência é mais importante que número isolado. O Fyness mostra as duas coisas. Link na bio."

📌 DEMO 14 — Onboarding em 2 Minutos
GANCHO: "2 minutos. Do zero ao financeiro organizado."
CONTEÚDO: [Time-lapse] Usuário cria conta, adiciona primeiro negócio, registra primeiro lançamento. Tudo em 2 minutos.
LEGENDA: "Sem manual. Sem treinamento. Sem dor de cabeça. Começa em 2 min. Link na bio."

📌 DEMO 15 — Antes e Depois Real
GANCHO: "Assim era antes. Assim é depois do Fyness."
CONTEÚDO: [Split screen] Esquerda: planilha Excel caótica, cores aleatórias, datas erradas. Direita: dashboard Fyness limpo, relatório automático.
LEGENDA: "Você merece enxergar seu financeiro com clareza. 7 dias grátis. Link na bio."
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Calendario_Produto</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Produto_PS</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 3 — PROVA SOCIAL (PILAR 2) — DEPOIMENTOS E CASES
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Inst_ProvasSociais" name="Pilar 2 — Prova Social (Depoimentos, Cases, UGC)">
      <bpmn2:documentation>⭐ PROVA SOCIAL — ESTRATÉGIA COMPLETA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 1 — SEM CLIENTES AINDA (primeiros 30-60 dias)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Usar os fundadores como prova social inicial. É honesto e funciona.

DEPOIMENTO ROBERT (usar imediatamente):
FORMATO: Reel 30s ou carrossel com foto
ROTEIRO: "Construí o Fyness porque precisei dele no meu próprio negócio.
Já tentei planilha — funcionou por 2 meses.
Já tentei sistema de gestão — interface impossível, abandonei em 3 semanas.
O Fyness resolve um problema real que eu vivi: visibilidade financeira sem fricção.
Uso todos os dias. Se eu parasse de usar amanhã, sentiria falta."
CTA: "Testa 7 dias. Sem cartão. Link na bio."

DEPOIMENTO KAYNAN (usar imediatamente):
ROTEIRO: "Uso o Fyness pra controlar as finanças do próprio Fyness.
Cada gasto da empresa: registro por mensagem.
Relatório no fim de cada semana: automático.
Quanto tempo economizo? Estimativa: 4 horas por semana.
Isso em dinheiro, no meu caso, são horas que eu uso pra construir o produto."
CTA: "Link na bio pra testar. 7 dias grátis."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 2 — PRIMEIROS CLIENTES (a partir de 30 dias)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Coletar depoimentos de forma sistemática:

PROTOCOLO DE COLETA (Kaynan/Robert executam):
→ Dia 3 do trial: mensagem no WhatsApp: "Oi [nome], como está sendo a experiência com o Fyness? Tem algo que poderia melhorar?"
→ Dia 7 do trial: mensagem: "Última pergunta: em uma frase, o que o Fyness fez pelo seu negócio até agora?"
→ Após conversão (pagamento): "Você toparia gravar um depoimento de 30s? Pode ser pelo celular mesmo. A gente edita e manda você aprovar antes de postar."
→ Incentivo: "Quem grava ganha 1 mês extra grátis." (custo baixo, retorno alto)

COMO USAR OS DEPOIMENTOS:
→ Reel editado por Kauã (logo Fyness, trilha suave, legenda com nome/setor)
→ Carrossel "O que nossos clientes dizem" (atualizar mensalmente)
→ Stories: repostar o print da mensagem do cliente (pedir permissão primeiro)
→ Página de testimonials na LP (repassar pra equipe de LP)
→ Destacar no perfil (@fynessbr > Destaques > ⭐ Clientes)

FORMATOS DE CASE MAIS PODEROSOS:
→ "Antes do Fyness: [problema específico]. Depois: [resultado específico com número]."
→ "Como [setor/empresa] economizou [X horas/R$X] com o Fyness"
→ "De planilha pra Fyness: a história de [nome/setor]"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 3 — ESCALA DE PROVA SOCIAL (a partir de mês 3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Meta: 10 depoimentos publicados até o mês 3
→ 1 case em vídeo por mês (cliente real, gravado, editado profissionalmente)
→ "Mural de clientes" no carrossel mensal: crescer o número de logos/nomes a cada mês
→ UGC (User Generated Content): quando cliente marcar @fynessbr espontaneamente → repostar sempre
→ Enquete mensal nos Stories: "Há quanto tempo você usa o Fyness?" (prova de retenção)
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Produto_PS</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_PS_Educativo</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 4 — EDUCATIVO COM SOLUÇÃO (PILAR 3)
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Inst_Educativo" name="Pilar 3 — Educativo com Solução (Fyness como Resposta)">
      <bpmn2:documentation>📚 EDUCATIVO COM SOLUÇÃO — DIFERENÇA DO ROBERT/KAYNAN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRA: No @fynessbr, o conteúdo educativo SEMPRE termina com o Fyness como solução.
Diferente de Robert (educa puro) e Kaynan (bastidores puro).
Aqui: problema → contexto → o Fyness resolve.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BANCO DE 10 POSTS EDUCATIVOS COM SOLUÇÃO:

📌 EDU 1 — "Você Sabe Qual É Seu Lucro Real Esse Mês?"
FORMATO: Carrossel
Slide 1: "Você sabe qual é o lucro real do seu negócio esse mês?"
Slide 2: "Faturamento ≠ lucro. Essa confusão custa caro."
Slide 3: "Lucro real = receita − custos diretos − despesas fixas − impostos."
Slide 4: "A maioria dos empresários responde com o faturamento. Não com o lucro."
Slide 5: "Por quê? Porque calcular manualmente toma tempo e é chato."
Slide 6: "Com o Fyness: digita 'DRE' no WhatsApp. Em 3 segundos, o lucro real do mês."
Slide 7: "Sem cálculo. Sem planilha. Só a resposta que você precisa."
Slide 8: "7 dias grátis. Descobre o lucro real do seu negócio ainda hoje. Link na bio."
LEGENDA: "Você sabe responder sem hesitar? Se não — temos solução. Link na bio."

📌 EDU 2 — "Fluxo de Caixa Negativo Mata Negócio (Mesmo com Faturamento Alto)"
FORMATO: Reel 45s
GANCHO: "O negócio fatura bem. A conta está no zero. Por quê?"
DESENVOLVIMENTO: Explica o gap de caixa (compra hoje, recebe em 60 dias).
SOLUÇÃO: "O Fyness projeta exatamente quando vai faltar caixa — antes de faltar."
CTA: "Link na bio. 7 dias grátis."

📌 EDU 3 — "3 Gastos Invisíveis Que Drenam Seu Negócio"
FORMATO: Carrossel
Slide 1: "3 gastos invisíveis que provavelmente estão drenando seu negócio agora."
Slide 2: "1. Assinaturas esquecidas — softwares que ninguém usa mais."
Slide 3: "2. Contratos automáticos — serviços que renovam sem aviso."
Slide 4: "3. Inadimplência não gerenciada — você financia o cliente sem querer."
Slide 5: "Com o Fyness, você vê todos os gastos categorizados e recorrentes."
Slide 6: "Um relatório e você descobre o que está drenando. Em segundos."
Slide 7: "Teste 7 dias. Você vai se surpreender. Link na bio."

📌 EDU 4 — "Por Que 80% dos Empresários Não Controlam o Financeiro?"
FORMATO: Reel 30s
GANCHO: "80% dos empresários não têm controle financeiro formal. O motivo não é preguiça."
DESENVOLVIMENTO: "É fricção. As ferramentas são complicadas ou exigem tempo extra."
SOLUÇÃO: "O Fyness funciona onde você já está — no WhatsApp. Zero fricção extra."
CTA: "Link na bio."

📌 EDU 5 — "Quanto Vale 1 Hora do Seu Tempo Como Empresário?"
FORMATO: Carrossel
Slide 1: "Qual é o valor de 1 hora do seu tempo como empresário?"
Slide 2: "Se você fatura R$30k/mês e trabalha 200h/mês = R$150/hora."
Slide 3: "Controle financeiro manual: 4-8 horas por mês."
Slide 4: "Isso são R$600 a R$1.200 de tempo desperdiçado todo mês."
Slide 5: "O Fyness custa menos que 1 hora do seu tempo."
Slide 6: "E te devolve as 8 horas. Pra usar no que faz seu negócio crescer."
Slide 7: "7 dias grátis. Descobre quanto tempo você vai recuperar. Link na bio."

📌 EDU 6 — "Quando Contratar Mais? A Resposta Está no Financeiro"
FORMATO: Carrossel — Problema → Dado → Solução Fyness

📌 EDU 7 — "Precificação Errada: Como Saber Se Você Está Perdendo Dinheiro"
FORMATO: Reel de demo — Kaynan mostra a análise de margem por produto no Fyness

📌 EDU 8 — "Capital de Giro: Quanto Seu Negócio Precisa?"
FORMATO: Carrossel com cálculo simplificado + Fyness como ferramenta de monitoramento

📌 EDU 9 — "O Que Seu Contador Não Faz (Mas o Fyness Faz)"
FORMATO: Comparativo em carrossel — Contador faz X / Fyness faz Y
ATENÇÃO: Tom respeitoso — não atacar contadores. Eles são complementares.
PONTO: "Contador faz conformidade fiscal. Fyness faz gestão operacional em tempo real."

📌 EDU 10 — "Reserva de Emergência Empresarial: Você Tem?"
FORMATO: Carrossel — Como calcular + Fyness mostra quando você pode começar a guardar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEGENDA PADRÃO PARA POSTS EDUCATIVOS DO @FYNESSBR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Frase que resume o aprendizado do post]
O Fyness resolve isso automaticamente.
Teste 7 dias grátis — sem cartão — link na bio. ☝️
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_PS_Educativo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Educativo_CTA</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 5 — OFERTA E CTA (PILAR 4) + STORIES DIÁRIOS
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Inst_CTA" name="Pilar 4 — Oferta + CTA Direto + Stories Diários">
      <bpmn2:documentation>🎯 OFERTA + CTA + STORIES — CONVERSÃO DIÁRIA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POSTS DE OFERTA (1 por semana no feed — sexta-feira)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COPY DE OFERTA 1 — "Tudo que Você Leva" (carrossel)
[Ver conteúdo completo na Task Calendário — Semana 1, Sexta]

COPY DE OFERTA 2 — "Por Menos de R$5/dia" (Reel 20s)
GANCHO: "Quanto custa não controlar o financeiro? Muito mais do que R$5."
"O Fyness custa menos de R$5 por dia.
Em troca:
Controle financeiro completo.
DRE automático.
Alerta de vencimento.
Projeção de caixa.
Tudo no WhatsApp que você já usa.
Começa com 7 dias grátis. Sem cartão."
CTA: "Link na bio. ☝️"

COPY DE OFERTA 3 — "Objeção: Não tenho tempo" (carrossel)
Slide 1: "Você disse que não tem tempo pra controlar o financeiro."
Slide 2: "Manda uma mensagem no WhatsApp."
Slide 3: "Isso é tudo que o Fyness precisa de você."
Slide 4: "O resto é automático."
Slide 5: "Se você tem 30 segundos por transação..."
Slide 6: "Você tem tempo pro Fyness."
Slide 7: "7 dias grátis. Link na bio."

COPY DE OFERTA 4 — "Objeção: Já uso planilha" (carrossel)
Slide 1: "Você já usa planilha. Por que mudaria?"
Slide 2: "Há quanto tempo a planilha está desatualizada?"
Slide 3: "Quando foi a última vez que ela te avisou de um vencimento?"
Slide 4: "Quando ela te gerou um DRE automaticamente?"
Slide 5: "Planilha é uma ferramenta passiva. Você faz o trabalho."
Slide 6: "O Fyness trabalha por você."
Slide 7: "7 dias grátis pra ver a diferença. Link na bio."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORIES DIÁRIOS DO @FYNESSBR (cadência)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
META: 5 stories por dia. Kauã programa com antecedência.

TIPOS DE STORIES (banco para usar em rotação):

🔗 Story de Link (TODOS os dias — obrigatório):
→ 1 story por dia com link direto pro trial.
→ Texto: "7 dias grátis — sem cartão — começa aqui 👆"
→ Variar o visual a cada semana (fundo, cor, fonte).
→ Esse é o story mais importante. Nunca pular.

📊 Story de Dado:
→ Estatística sobre gestão financeira de PMEs.
→ Exemplos: "82% das PMEs não têm controle financeiro formal (SEBRAE)"
→ Kauã cria cards visuais. Publicar 2x/semana.

🎬 Story de Demo Rápida:
→ Gif ou vídeo de 10s mostrando 1 coisa do produto.
→ Publicar 2x/semana.
→ Aproveitar os demos de feed cortando pra 10s.

❓ Story de Engajamento:
→ Enquete sobre a dor financeira do seguidor.
→ Caixa de perguntas: "Me conta: qual sua maior dificuldade financeira no negócio?"
→ Publicar 2x/semana.
→ Respostas da caixa → usar como pauta de conteúdo.

📣 Story de Repost:
→ Repostar stories dos fundadores Robert e Kaynan que mencionam @fynessbr.
→ Diário (quando disponível).

DESTAQUES DO @FYNESSBR (atualizar semanalmente):
🎬 Demo: últimas demos publicadas
⭐ Clientes: depoimentos coletados
📊 Features: cada feature com story específico
❓ FAQ: respostas das dúvidas mais frequentes
🚀 Trial: como funciona, o que cobre, como começar
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Educativo_CTA</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_CTA_Ciclo</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ══════════════════════════════════════════════════════════════
         TIMER — CICLO SEMANAL
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:intermediateCatchEvent id="Timer_Inst_Semanal" name="Ciclo Semanal (P7D)">
      <bpmn2:incoming>Flow_Inst_CTA_Ciclo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Analise</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 6 — ANÁLISE SEMANAL + AJUSTE
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Inst_Analise" name="Análise Semanal — Métricas de Conversão">
      <bpmn2:documentation">📊 ANÁLISE SEMANAL @FYNESSBR — FOCO EM CONVERSÃO

DIFERENÇA DO ROBERT/KAYNAN:
→ Para os fundadores, a métrica principal é crescimento de seguidores.
→ Para o @fynessbr, a métrica principal é CONVERSÃO (cliques no link → trials iniciados).
→ Seguidores crescem devagar (vêm dos fundadores). Conversão pode ser alta mesmo com pouco seguidor.

MÉTRICAS QUE IMPORTAM:
□ Cliques no link da bio: [X] (rastrear por UTM: utm_source=instagram&utm_medium=bio&utm_campaign=fynessbr)
□ Swipe-up / link dos Stories: [X] (UTM: utm_campaign=fynessbr_stories)
□ Trials iniciados via @fynessbr: [X] (confirmar no dashboard do produto)
□ Taxa de conversão: trials/cliques × 100 (meta: acima de 8%)
□ Novos seguidores: [X] (secundário — vêm dos fundadores)
□ Qual post gerou mais cliques na bio? [identificar e replicar]
□ Qual story de link teve mais cliques? [identificar horário e visual]

DIAGNÓSTICO:
→ Cliques baixos mas alcance alto: post não tem CTA claro ou convincente
→ Cliques ok mas trials baixos: LP não está convertendo (ação no Pool 6)
→ Sem crescimento de seguidores: os fundadores estão mencionando o @fynessbr?
→ Alto engajamento mas baixa conversão: conteúdo entretém mas não convence

TEMPLATE SEMANAL:
Semana: [data]
Cliques no link da bio: [X]
Cliques nos links de stories: [X]
Trials iniciados via IG: [X]
Taxa de conversão: [X]%
Melhor post da semana (mais cliques): [título]
Novo depoimento coletado: [Sim/Não]
Ação pra semana que vem: [descrever]
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Analise</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Gateway</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Inst_Conversao" name="Taxa de Conversão Acima de 8%?">
      <bpmn2:incoming>Flow_Inst_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Escalar</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Inst_Otimizar</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:task id="Task_Inst_Escalar" name="Escalar: Ampliar Demos + Coletar Mais Provas Sociais">
      <bpmn2:documentation">🚀 ESCALAR — CONVERSÃO ACIMA DA META

Sinais de escala:
→ Taxa de conversão consistente acima de 8%
→ Stories de link com mais de 5% de cliques
→ Trials novos por semana crescendo semana a semana

AÇÕES:
1. Aumentar frequência de stories de link pra 2x/dia
2. Acelerar coleta de depoimentos — entrar em contato com todos os trials convertidos
3. Criar série semanal de demos ("Feature da semana") — cada semana uma feature nova
4. Solicitar ao Robert e Kaynan que aumentem menções ao @fynessbr nos seus perfis
5. Testar anúncio de Stories do @fynessbr (R$200/mês) amplificando o melhor post orgânico
6. Criar post fixado no topo do perfil com o melhor demo de conversão
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Escalar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Mensal</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Inst_Otimizar" name="Otimizar: CTA, Visual e Frequência de Link">
      <bpmn2:documentation">🔧 OTIMIZAR — CONVERSÃO ABAIXO DA META

DIAGNÓSTICO POR PROBLEMA:

Cliques baixos:
→ Story de link sem apelo visual suficiente (Kauã refaz com novo design)
→ CTA da legenda fraco — testar: "Link na bio" vs "Começa grátis agora 👆" vs "7 dias sem cartão — link na bio"
→ Frequência de link nos stories muito baixa — garantir 1 por dia sem falta

Alcance baixo do feed:
→ Horário errado — testar 12h e 19h além do 18h30
→ Hashtags saturadas — pesquisar hashtags de médio volume no nicho
→ Grid desorganizado — Kauã revisa consistência visual

Trials baixos mesmo com cliques:
→ Problema está na LP, não no Instagram (ação no Pool 6 — Landing Page)
→ Passar dados do funil para equipe da LP: "Pessoas chegam mas não convertem"
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Otimizar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Mensal</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Inst_Mensal" name="Avaliação Mensal (P30D)">
      <bpmn2:incoming>Flow_Inst_Mensal</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Relatorio</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P30D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Inst_Relatorio" name="Relatório Mensal + Planejamento Editorial">
      <bpmn2:documentation">📋 RELATÓRIO MENSAL @FYNESSBR

CRESCIMENTO:
→ Seguidores: [início] → [fim] | Crescimento: [+X]
→ Impressões totais do mês: [X]
→ Alcance total do mês: [X]

CONVERSÃO (mais importante):
→ Cliques no link da bio: [X]
→ Trials iniciados via Instagram: [X]
→ Taxa de conversão IG → Trial: [X]%
→ Melhor post de conversão: [título]
→ Melhor story de conversão: [descrição]

PROVA SOCIAL:
→ Depoimentos coletados esse mês: [X]
→ Cases publicados: [X]
→ UGC recebido (clientes marcando @fynessbr): [X]

PLANEJAMENTO PRÓXIMO MÊS:
□ Novos demos a produzir: [listar features]
□ Depoimentos agendados: [listar clientes]
□ Temas educativos: [listar]
□ Posts de oferta com novo copy: [rascunho]
□ Anúncio de Stories? [Sim/Não — budget]
□ Série especial? [listar ideia]
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Relatorio</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_LP</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Inst_LP" name="→ Landing Page">
      <bpmn2:documentation>Lead clicou no link do @fynessbr → vai para a Landing Page.
UTM: utm_source=instagram&amp;utm_medium=bio&amp;utm_campaign=fynessbr_organico</bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_LP</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_LP" />
    </bpmn2:intermediateThrowEvent>

    <!-- SEQUENCE FLOWS -->
    <bpmn2:sequenceFlow id="Flow_Inst_Setup_Calendario"  sourceRef="Start_Inst_Setup"       targetRef="Task_Inst_Calendario" />
    <bpmn2:sequenceFlow id="Flow_Inst_Calendario_Produto" sourceRef="Task_Inst_Calendario"   targetRef="Task_Inst_Produto" />
    <bpmn2:sequenceFlow id="Flow_Inst_Produto_PS"         sourceRef="Task_Inst_Produto"      targetRef="Task_Inst_ProvasSociais" />
    <bpmn2:sequenceFlow id="Flow_Inst_PS_Educativo"       sourceRef="Task_Inst_ProvasSociais" targetRef="Task_Inst_Educativo" />
    <bpmn2:sequenceFlow id="Flow_Inst_Educativo_CTA"      sourceRef="Task_Inst_Educativo"    targetRef="Task_Inst_CTA" />
    <bpmn2:sequenceFlow id="Flow_Inst_CTA_Ciclo"          sourceRef="Task_Inst_CTA"          targetRef="Timer_Inst_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Inst_Analise"            sourceRef="Timer_Inst_Semanal"     targetRef="Task_Inst_Analise" />
    <bpmn2:sequenceFlow id="Flow_Inst_Gateway"            sourceRef="Task_Inst_Analise"      targetRef="Gateway_Inst_Conversao" />
    <bpmn2:sequenceFlow id="Flow_Inst_Escalar"  name="Acima de 8%"   sourceRef="Gateway_Inst_Conversao" targetRef="Task_Inst_Escalar" />
    <bpmn2:sequenceFlow id="Flow_Inst_Otimizar" name="Abaixo de 8%"  sourceRef="Gateway_Inst_Conversao" targetRef="Task_Inst_Otimizar" />
    <bpmn2:sequenceFlow id="Flow_Inst_Mensal"             sourceRef="Task_Inst_Escalar"      targetRef="Timer_Inst_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Inst_Mensal2"            sourceRef="Task_Inst_Otimizar"     targetRef="Timer_Inst_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Inst_Relatorio"          sourceRef="Timer_Inst_Mensal"      targetRef="Task_Inst_Relatorio" />
    <bpmn2:sequenceFlow id="Flow_Inst_LP"                 sourceRef="Task_Inst_Relatorio"    targetRef="LinkThrow_Inst_LP" />

  </bpmn2:process>

  <!-- ============================================================ -->
`;

const before = content.slice(0, startIdx);
const after  = content.slice(endIdx);

const newContent = before + INST_POOL + after;
writeFileSync(filePath, newContent, 'utf8');
console.log(`Done! ${newContent.length} chars, ${newContent.split('\n').length} lines`);

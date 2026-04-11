import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/utils/marketingTemplate.js';
let content = readFileSync(filePath, 'utf8');

const START_MARKER = '<!-- POOL 3: ROBERT';
const END_MARKER   = '<!-- POOL 4: KAYNAN';

const startIdx = content.indexOf(START_MARKER);
const endIdx   = content.indexOf(END_MARKER);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found!', { startIdx, endIdx });
  process.exit(1);
}

const ROBERT_POOL = `<!-- POOL 3: ROBERT — AUTORIDADE FINANCEIRA (Instagram 3k seguidores)  -->
  <!-- ============================================================ -->
  <bpmn2:process id="Process_Robert" isExecutable="false">

    <!-- ══════════════════════════════════════════════════════════════
         INÍCIO — SETUP DE PERFIL E POSICIONAMENTO
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:startEvent id="Start_Robert_Setup" name="Setup do Perfil Robert">
      <bpmn2:documentation>👤 PERFIL: ROBERT — ESPECIALISTA FINANCEIRO E COMERCIAL
Instagram: @robert[sobrenome] | 3.000 seguidores (base inicial)
Fyness Instagram: @fynessbr — 6 seguidores (recém-criado, zero autoridade ainda)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 TOM DE VOZ COMPLETO DO ROBERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONALIDADE:
→ 35 anos. Já abriu empresa. Já quase faliu. Aprendeu na raça.
→ Sério mas não arrogante. Autoridade conquistada, não imposta.
→ Fala como mentor, não como professor de faculdade.
→ "Eu já vi isso matar negócios" — experiência real, não teórica.
→ Usa números e dados sempre que possível. Números chocam e educam.
→ Pausa dramática antes da solução — deixa o problema "doer" antes de resolver.

LINGUAGEM:
→ Frases curtas. Máximo 10 palavras por frase nos Reels.
→ "Você" direto — fala com o empresário, não "os empresários".
→ Evita jargão financeiro pesado (CDB, Selic, etc.) — foco em gestão operacional.
→ Pode ser duro: "Você está sangrando e não sabe."
→ Tom nunca condescendente: "Não é sua culpa, ninguém te ensinou isso."

POSTURA SOBRE O FYNESS:
→ Não é vendedor. É fundador que usa e acredita.
→ Menciona 20% do tempo, sempre contextualizado.
→ "Construí o Fyness porque precisava disso no meu próprio negócio."
→ Como @fynessbr tem 6 seguidores agora: Robert é o rosto principal.
→ O Instagram do Fyness cresce nas costas do Robert — ele deve SEMPRE marcar @fynessbr
   nos posts relevantes para transferir autoridade gradualmente.

BIO OTIMIZADA:
"💼 Especialista em gestão financeira empresarial
Ajudo empresários a pararem de trabalhar no escuro 🔦
Co-fundador @fynessbr | 7 dias grátis 👇"
[Link na bio: página de trial do Fyness]

FOTO DE PERFIL: Foto profissional, terno ou camisa social, expressão séria/confiante.
DESTAQUES DO STORIES: 📊 Dicas | ❓ Perguntas | 🔦 Bastidores | 📈 Resultados | ℹ️ Fyness

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 META DE CRESCIMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mês 1: 3.000 → 3.800 (+800) — Conteúdo consistente, 3x/semana
Mês 2: 3.800 → 5.000 (+1.200) — Primeiro Reel viral (meta: 50k views)
Mês 3: 5.000 → 7.000 (+2.000) — Colaborações + repercussão
Mês 4: 7.000 → 10.000 (+3.000) — Autoridade estabelecida, lead magnet
Meta 6 meses: 10.000+ seguidores
      </bpmn2:documentation>
      <bpmn2:outgoing>Flow_Robert_Setup_Semanal</bpmn2:outgoing>
    </bpmn2:startEvent>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 1 — 2x REELS POR SEMANA (ROTEIROS COMPLETOS)
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Robert_Reels" name="2x Reels Educativos por Semana (Roteiros Completos)">
      <bpmn2:documentation>🎬 REELS ROBERT — BANCO DE 30 ROTEIROS COMPLETOS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO PADRÃO DE TODOS OS REELS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Duração: 45-75 segundos (sweet spot para salvar + compartilhar)
Hook (0-3s): Frase de impacto — problema chocante ou número real
Desenvolvimento (3-60s): 3-4 pontos rápidos, 1 por corte
CTA final (últimos 5s): Nunca "compre". Sempre "salva / comenta / marca".
Legenda: Sempre ativa (60% assiste sem som)
Kauã edita: cortes em 0,5s, texto na tela, trilha low fi ou dramática
Horário de post: Terça ou Quinta, 19h (maior engajamento empresarial)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCO 1 — MÊS 1 (Semanas 1-4)
TEMA: DESPERTAR (mostrar o problema)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 REEL 1 — "O Teste dos 3 Segundos"
GANCHO (na tela + Robert fala):
"Quanto seu negócio lucrou em janeiro? Se você demorou mais de 3 segundos pra responder... a gente precisa conversar."
DESENVOLVIMENTO:
"Eu fiz essa pergunta pra 50 empresários.
47 não souberam responder na hora.
Não porque são ruins em negócios.
Porque ninguém nunca organizou as informações pra eles.
Faturamento você sabe. Todo mundo sabe.
Mas lucro? Quanto sobrou? De onde veio? Pra onde foi?
Isso é o que separa o empresário que cresce do empresário que trabalha muito e não acumula nada."
CTA: "Salva esse vídeo e manda pra um sócio. Vocês precisam ter essa conversa."
HASHTAGS: #gestaofinanceira #empreendedorismo #lucro #financasempresariais

🎬 REEL 2 — "A Armadilha do Movimento"
GANCHO: "Você pode estar falindo... e não saber."
DESENVOLVIMENTO:
"Me segue aqui, porque isso acontece mais do que você imagina.
O negócio tem movimento. Tem cliente. Tem faturamento.
Mas no final do mês, onde está o dinheiro?
Isso tem um nome: é o problema do fluxo de caixa negativo.
A empresa vende, mas os custos chegam antes da receita.
Vi isso acontecer com um negócio de R$300 mil por mês.
No papel, estava bem. Na conta, estava no limite.
O problema não foi venda. Foi gestão."
CTA: "Comenta 'FLUXO' aqui que eu te mando o conteúdo completo."

🎬 REEL 3 — "60% Fecham em 5 Anos — Aqui Está o Porquê"
GANCHO: "60% dos negócios fecham antes dos 5 anos. Eu sei o motivo principal."
DESENVOLVIMENTO:
"Não é falta de produto. Não é concorrência.
É falta de gestão financeira básica.
Sabe qual é a diferença entre um negócio que sobrevive e um que fecha?
Não é o produto. Produtos iguais sobrevivem ou morrem dependendo da gestão.
O que mata é não saber:
Primeiro: qual produto dá mais lucro.
Segundo: quando vai faltar caixa.
Terceiro: onde o dinheiro está indo sem você perceber.
Com essas três respostas, 80% dos problemas financeiros são resolvidos.
Sem elas, você está voando às cegas."
CTA: "Salva esse vídeo. Um dia você vai precisar lembrar disso."

🎬 REEL 4 — "Planilha Não é Controle"
GANCHO: "Você tem planilha de controle financeiro? Isso não é controle. É ilusão."
DESENVOLVIMENTO:
"Planilha só funciona quando você atualiza ela.
Você última vez que atualizou? Semana passada? Mês passado?
Planilha depende de disciplina manual todos os dias.
E quando você está correndo atrás de cliente, vendendo, gerenciando equipe...
Quem atualiza a planilha?
Eu já tentei. Funcionou por 2 meses.
Depois o negócio cresceu, eu fiquei sem tempo...
e a planilha virou uma mentira organizada.
Gestão financeira real precisa acontecer sozinha, em tempo real.
Não pode depender da sua memória ou do seu tempo disponível."
CTA: "Você ainda usa planilha? Comenta aqui embaixo."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCO 2 — MÊS 2 (Semanas 5-8)
TEMA: EDUCAÇÃO (ensinar conceitos)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 REEL 5 — "DRE em 60 Segundos"
GANCHO: "DRE. Você sabe o que é? Se não sabe, você está gerenciando às cegas."
DESENVOLVIMENTO:
"DRE é Demonstração do Resultado do Exercício.
Em português: é o relatório que mostra se você lucrou ou não.
Funciona assim:
Receita total: tudo que entrou de venda.
Menos: custo dos produtos ou serviços.
Isso te dá a Margem Bruta.
Menos: despesas operacionais. Aluguel, salários, marketing.
Isso te dá o Lucro Operacional.
É aqui que a maioria dos empresários se choca.
Porque o número final nunca é o que eles esperavam."
CTA: "Salva esse vídeo. Isso deveria ser ensinado na escola."

🎬 REEL 6 — "Faturamento vs Lucro — A Confusão Que Mata Negócios"
GANCHO: "Empresário que confunde faturamento com lucro está brincando de rico."
DESENVOLVIMENTO:
"Faturamento é o que entrou.
Lucro é o que sobrou.
Parece óbvio né? Mas você ficaria surpreso com quantos empresários tomam decisões
— contratam, investem, compram equipamento —
baseados no faturamento, não no lucro.
Já vi negócio de R$500k por mês com lucro real de R$8k.
Cobre os custos fixos. Paga os funcionários. No final, sobra isso.
E o dono trabalhando 12 horas por dia.
Antes de tomar qualquer decisão de investimento no seu negócio,
você precisa saber: qual é o seu lucro líquido real? Não o faturamento."
CTA: "Comenta aqui: você sabe qual é o lucro real do seu negócio?"

🎬 REEL 7 — "Os 3 Relatórios Que Todo Empresário Precisa"
GANCHO: "3 relatórios. Se você não tiver esses 3, está gerenciando com os olhos fechados."
DESENVOLVIMENTO:
"Primeiro: Fluxo de Caixa.
O que vai entrar e sair nos próximos 30 dias.
Evita surpresa. Evita cheque especial. Evita desespero.
Segundo: DRE mensal.
Mostra se você lucrou ou não. Por produto, por serviço.
Terceiro: Contas a Pagar e a Receber.
O que você deve e o que te devem, com data de vencimento.
Com esses três relatórios, você toma decisão baseada em dado.
Sem eles, você toma decisão baseada em sensação.
E sensação mente."
CTA: "Você tem esses 3 na sua empresa? Comenta aqui."

🎬 REEL 8 — "Como Calcular o Preço Certo (Sem Perder Dinheiro)"
GANCHO: "Você está precificando errado. E nem sabe quanto está perdendo."
DESENVOLVIMENTO:
"A maioria dos empresários precifica assim:
Vê o concorrente, cobra um pouco menos. Acha que está competindo.
O problema? O concorrente talvez também esteja perdendo dinheiro.
Precificação correta:
Custo direto do produto ou serviço.
Mais: rateio das despesas fixas (aluguel, salários, contas).
Mais: margem de lucro desejada.
Mais: impostos.
ESSE é o seu preço mínimo.
Abaixo disso, você está trabalhando de graça.
Quantos dos seus produtos estão abaixo dessa linha sem você saber?"
CTA: "Salva esse vídeo. Quando for rever seus preços, você vai precisar."

🎬 REEL 9 — "Capital de Giro: O Que É e Por Que Você Não Tem"
GANCHO: "Capital de giro. Se você não tem, você está preso. Para sempre."
DESENVOLVIMENTO:
"Capital de giro é o dinheiro necessário pra manter o negócio funcionando
enquanto você espera os clientes pagarem.
Você compra matéria-prima hoje. Vende em 30 dias. Recebe em 60 dias.
Quem paga as contas nesses 60 dias?
O capital de giro.
Sem ele, você pega empréstimo com juro alto.
Ou atrasa fornecedor. Ou atrasa funcionário.
Ou pede parcelamento que corrói sua margem.
A solução não é mágica: é controle financeiro que antecipa esse buraco antes de cair nele."
CTA: "Você já ficou sem capital de giro? Comenta aqui."

🎬 REEL 10 — "Custo Fixo vs Custo Variável — A Armadilha Invisível"
GANCHO: "Você sabe qual é o custo fixo do seu negócio por dia? Não? Vem ver isso."
DESENVOLVIMENTO:
"Custo fixo: existe independente de você vender ou não.
Aluguel. Salário. Internet. Contador. Seguro.
Todo dia que você abre a empresa, o custo fixo está rodando.
Custo variável: cresce conforme você vende.
Matéria-prima. Embalagem. Comissão de vendas.
Sabe qual é o maior erro?
Empresário contrata mais funcionário (fixo!) quando as vendas aumentam.
Aí as vendas caem um pouco... e o custo fixo sufoca o negócio.
Antes de contratar, pergunte: isso é realmente necessário ou posso terceirizar?"
CTA: "Salva esse vídeo. É uma das decisões mais importantes que você vai tomar."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCO 3 — MÊS 3 (Semanas 9-12)
TEMA: PROVA SOCIAL E SOLUÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 REEL 11 — "O Dia Que Quase Perdi Meu Negócio" (história pessoal)
GANCHO: "Quase perdi meu negócio. E só percebi quando foi quase tarde demais."
DESENVOLVIMENTO:
"Não vou entrar em detalhes de qual negócio.
Mas vou contar o que aconteceu.
A empresa estava crescendo. Faturamento subindo todo mês.
E eu me senti seguro. Seguro demais.
Não controlava o caixa com disciplina. Achava que estava bem.
Um mês, chegou o 13º salário, renovação do aluguel e troca de equipamento.
Tudo no mesmo mês.
Faltou R$80 mil no caixa.
Aquele susto me ensinou mais sobre gestão financeira
do que qualquer curso, livro ou planilha.
Nunca mais fiquei sem visibilidade do meu caixa."
CTA: "Você já viveu algo parecido? Comenta aqui. Você não está sozinho."

🎬 REEL 12 — "Empresário Que Sabia Onde Estava Cada Real — Resultado"
GANCHO: "Vou mostrar o que acontece quando um empresário finalmente enxerga o financeiro."
DESENVOLVIMENTO:
"Um cliente nosso tinha um negócio de R$80k por mês.
Achava que tinha margem de 30%. Parecia bem.
Quando mapeamos tudo de verdade, descobrimos:
3 produtos que davam prejuízo e ele não sabia.
R$4.200 por mês em gastos que ninguém usava mais.
Um fornecedor com contrato que ele havia esquecido de cancelar.
Em 45 dias de ajuste, sem aumentar o faturamento,
o lucro subiu R$11.000 por mês.
Não vendeu mais. Só passou a enxergar o que já tinha."
CTA: "Salva esse vídeo. Você pode ter dinheiro 'escondido' no seu negócio."

🎬 REEL 13 — "O Que o WhatsApp Tem a Ver com Financeiro?"
GANCHO: "Gestão financeira pelo WhatsApp. Parece brincadeira. Não é."
DESENVOLVIMENTO:
"A maior barreira para o empresário controlar o financeiro não é vontade.
É fricção. É complicação. É software que ninguém aguenta usar.
Pensa comigo: você usa WhatsApp pra tudo.
Clientes. Fornecedores. Equipe. A vida inteira tá lá.
E se o controle financeiro também estivesse lá?
Sem planilha pra abrir. Sem sistema pra logar.
Só uma mensagem: 'Vendi R$2.300 hoje.'
E o sistema processa, categoriza, e já aparece no relatório.
Isso é o que estamos construindo com o Fyness.
Porque a melhor ferramenta é a que você realmente usa." [marca @fynessbr]
CTA: "Link na bio pra testar 7 dias grátis."

🎬 REEL 14 — "5 Perguntas Que Todo Empresário Deve Saber Responder"
GANCHO: "5 perguntas. Se você não souber responder todas, temos trabalho a fazer."
DESENVOLVIMENTO:
"Um: Qual foi o lucro líquido do mês passado?
Dois: Qual produto ou serviço tem a maior margem?
Três: Quanto você tem de contas a pagar nos próximos 30 dias?
Quatro: Qual é o seu ponto de equilíbrio mensal?
Cinco: Você sabe se vai ter caixa suficiente na semana que vem?
Se você respondeu menos de 3 com segurança...
Você está gerenciando o seu negócio no escuro.
Não é julgamento. É diagnóstico.
E diagnóstico é o primeiro passo pra resolver."
CTA: "Quantas você respondeu? Comenta o número aqui."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCO 4 — MÊS 4-6 (Semanas 13-24)
TEMA: ESCALA + AUTORIDADE CONSOLIDADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 REEL 15 — "Como Construir Reserva de Emergência no Negócio"
GANCHO: "Quanto tempo seu negócio sobrevive sem faturar? Se a resposta for menos de 3 meses, alerta."
DESENVOLVIMENTO:
"Reserva de emergência empresarial: 3 a 6 meses de custos fixos guardados.
Parece impossível. Não é.
Se você economizar 5% do faturamento todo mês,
em 18 meses você tem 3 meses de reserva.
O problema é que sem controle financeiro,
você nem sabe se sobram 5% pra guardar.
Pode estar sobrando 15%... e você achando que falta dinheiro.
Ou pode estar no negativo... e você achando que está bem.
Gestão é a base de tudo."
CTA: "Salva. Compartilha com seu sócio."

🎬 REEL 16 — "Você Está Se Pagando Certo?"
GANCHO: "O salário do dono é o dado financeiro mais ignorado nas pequenas empresas."
DESENVOLVIMENTO:
"Muitos empresários misturam o dinheiro do negócio com o pessoal.
Paga conta pessoal da conta da empresa.
Retira quando precisa, sem critério.
Isso é um desastre financeiro disfarçado de liberdade.
Primeiro: o negócio nunca sabe qual é o custo real de operação.
Segundo: você nunca sabe se o negócio é lucrativo de verdade.
Terceiro: quando vier imposto ou investimento necessário, o caixa não existe.
Regra básica: defina seu pró-labore. Um valor fixo. Todo mês.
Separe conta pessoal de conta da empresa.
Isso muda tudo."
CTA: "Comenta aqui: você separa suas contas pessoais das do negócio?"

🎬 REEL 17 — "Por Que Crescer Pode Estar Te Matando"
GANCHO: "Crescimento mata negócio. Ninguém fala isso. Mas é verdade."
DESENVOLVIMENTO:
"Você dobra o faturamento. Mais clientes. Mais produto. Mais equipe.
E de repente... está mais estressado, mais endividado, com menos margem.
Isso tem um nome: crescimento sem gestão.
O negócio cresce, mas a estrutura não acompanha.
O custo fixo explode. A margem cai.
Você fatura o dobro e lucra a metade.
Crescimento saudável exige: saber o ponto de equilíbrio,
ter projeção de fluxo de caixa para os próximos 90 dias,
e não ampliar custos fixos antes da receita garantir a base."
CTA: "Salva esse vídeo antes de contratar alguém novo."

🎬 REEL 18 — "Como Ler um Extrato Bancário Como Empresário"
GANCHO: "Extrato bancário é o espelho da saúde do seu negócio. Você sabe ler o seu?"
DESENVOLVIMENTO:
"A maioria olha o extrato e vê números.
Empresário que gerencia bem olha e vê padrões.
Onde está o maior gasto fixo? Faz sentido esse valor?
Tem saída recorrente que você não reconhece? Pode ser assinatura esquecida.
A entrada está vindo quando devia? Ou clientes atrasando?
Tem meses que a conta cresce? Quais meses? Por quê?
O extrato conta a história do seu negócio.
Mas você precisa saber fazer as perguntas certas pra ele."
CTA: "Vai no extrato do último mês agora. Só olha. Comenta o que achou."

🎬 REEL 19 — "Inadimplência: Como Não Deixar Ela Destruir Seu Caixa"
GANCHO: "Um cliente te deve dinheiro? Saiba: isso tem custo real que você provavelmente não calculou."
DESENVOLVIMENTO:
"Inadimplência não é só não receber.
É capital imobilizado. É você financiando o cliente sem querer.
Se você vende a prazo e tem 10% de inadimplência,
você precisa de 10% a mais de capital de giro pra cobrir.
E esse dinheiro tem custo: poderia estar investido ou girando no negócio.
Estratégias práticas:
Um: defina política de crédito (quem pode comprar a prazo, qual limite).
Dois: envie lembrete automático antes do vencimento.
Três: negocie rápido quando atrasar — prazo longo = mais chance de perder.
Quatro: monitore o envelhecimento da dívida todo mês."
CTA: "Quanto você tem de inadimplência hoje? Comenta o %."

🎬 REEL 20 — "O Empresário que Triplicou o Lucro Sem Vender Mais"
GANCHO: "Triplicou o lucro. Sem contratar. Sem aumentar o faturamento. Vem ver como."
DESENVOLVIMENTO:
"Negócio de prestação de serviços. R$40k de faturamento por mês.
O dono achava que o lucro era de R$6k.
Fizemos um mapeamento completo do financeiro.
Descoberta 1: Dois serviços que custavam mais do que cobravam. Cortados.
Descoberta 2: Dois funcionários em funções que poderiam ser automatizadas.
Descoberta 3: Três fornecedores cobrados acima do mercado — renegociados.
Resultado: mesmos R$40k de faturamento.
Lucro real: R$18k por mês.
Triplicou o lucro. Não vendeu um real a mais.
Visibilidade financeira faz isso."
CTA: "Salva esse vídeo. Pode ser o dinheiro mais fácil que você vai ganhar."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCO 5 — REELS VIRAIS (apostar alto)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 REEL 21 — "Quanto Você Perdeu Esse Mês Sem Saber?" (FORMATO: INTERATIVO)
GANCHO: "Vou fazer uma conta rápida com você. Pode ser que o resultado te choque."
DESENVOLVIMENTO:
"Responde comigo:
Você tem alguma assinatura de software que não usa mais? [R$X]
Tem funcionário em função que duplica com outro? [R$X]
Algum produto que você vende abaixo do custo real? [R$X]
Tem cliente que te paga com 60 dias de atraso? (capital imobilizado = custo)
Sabe qual é o custo por dia de manter o negócio aberto?
Cada um desses 'não sei' ou 'não calculei' representa dinheiro saindo.
Silenciosamente. Todo mês.
Gestão não é sobre trabalhar mais. É sobre parar de perder o que já ganhou."
CTA: "Compartilha esse vídeo com um empresário que precisa ver isso."

🎬 REEL 22 — "Teste ao Vivo: 3 Perguntas Que Seu Contador Deveria Responder"
GANCHO: "Vou te dar 3 perguntas pra fazer pro seu contador. Se ele não souber responder, problema."
DESENVOLVIMENTO:
"Pergunta 1: Qual é o meu custo por produto/serviço com rateio de despesas fixas?
Pergunta 2: Com base no fluxo atual, quando meu caixa vai zerar se o faturamento cair 20%?
Pergunta 3: Qual produto tem a maior margem de contribuição?
Contador que não responde essas perguntas não é culpa dele.
A maioria faz conformidade fiscal. Não gestão financeira estratégica.
São trabalhos diferentes.
Você precisa dos dois. Mas precisa entender qual é qual."
CTA: "Fez a pergunta pro contador? Comenta a resposta aqui."

🎬 REEL 23 — "Abrindo o Dashboard do Fyness Ao Vivo" (SHOW, NÃO TELL)
GANCHO: "Deixa eu mostrar como controlo o financeiro de um negócio em tempo real."
DESENVOLVIMENTO:
[Robert abre o Fyness no celular]
"Aqui está o fluxo de caixa da semana. Entradas, saídas, saldo previsto.
Aqui o DRE do mês — por categoria, em tempo real.
Aqui as contas a pagar dos próximos 15 dias — com alerta de vencimento.
Aqui o relatório de qual produto está performando.
Tudo isso pelo WhatsApp.
Você manda a informação pelo chat, o sistema processa e aparece aqui.
Esse é o Fyness. Co-fundei porque precisava disso." [marca @fynessbr]
CTA: "7 dias grátis no link da bio. Sem cartão de crédito."

🎬 REEL 24 — "O Erro Que Faz Empresários Perderem R$50k Por Ano"
GANCHO: "R$50.000 por ano. É o que o brasileiro médio perde por não controlar o financeiro empresarial."
DESENVOLVIMENTO:
"Não é um número inventado.
É a média de:
Compras desnecessárias porque não tinha visibilidade.
Juros de cheque especial por falta de antecipação de caixa.
Precificação errada por não saber o custo real.
Inadimplência não gerenciada.
Contratos ativos que ninguém usa.
Cada um desses sozinho pode ser pequeno.
Juntos, somam mais do que muita gente investiu no negócio esse ano.
Gestão financeira não é custo. É o investimento com maior retorno que existe."
CTA: "Salva esse vídeo e manda pra quem precisa ouvir isso."

🎬 REEL 25 — "Por Que Minha Empresa Precisava de Gestão Financeira pelo WhatsApp"
GANCHO: "Construí um software financeiro. Não porque sou tecnólogo. Porque precisei."
DESENVOLVIMENTO:
"Tentei planilha. Funcionou por 2 meses.
Tentei sistema de gestão tradicional. Interface horrível. Abandonei em 3 semanas.
Tentei contratar alguém só pra controlar o financeiro. Ficou caro demais.
A solução que funcionou?
Uma ferramenta que exige zero disciplina extra.
Porque você já usa WhatsApp todo dia.
O Fyness se encaixa no que você já faz.
Você vende? Manda mensagem. O sistema registra.
Você paga uma conta? Manda mensagem. O sistema registra.
No final do dia, você tem relatório sem ter aberto uma planilha sequer." [marca @fynessbr]
CTA: "Link na bio. Testa 7 dias."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REELS BÔNUS — COLABORAÇÃO + SAZONAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 REEL 26 — Collab com Kaynan: "Desenvolvedor e Especialista Financeiro — Por Que Criamos o Fyness"
GANCHO: [Robert e Kaynan juntos] "Dois sócios. Dois perfis opostos. Mesmo problema."
DESENVOLVIMENTO:
"Robert: Eu precisava de gestão financeira real. As ferramentas que existiam eram ou caras demais ou complicadas demais.
Kaynan: Eu encontrei o problema técnico mais interessante que já vi: como fazer gestão financeira ser tão simples quanto mandar mensagem.
Robert: Esse é o Fyness.
Kaynan: É o sistema que Robert precisava que existisse.
Robert: E que a gente construiu do zero." [marca @fynessbr]
CTA: "Link na bio pra conhecer o que a gente construiu."

🎬 REEL 27 — "Revisão Financeira de Fim de Ano: O Que Todo Empresário Precisa Fazer" (Dezembro)
GANCHO: "Dezembro chegou. Você fechou o ano sabendo quanto lucrou? Ou vai esperar o contador dizer em março?"

🎬 REEL 28 — "Resolução de Ano Novo Que Realmente Muda Seu Negócio" (Janeiro)
GANCHO: "Chega de resolver emagrecer. Esse ano, resolva controlar seu financeiro."

🎬 REEL 29 — "Black Friday: Como Não Vender Mais e Ganhar Menos" (Novembro)
GANCHO: "Black Friday pode ser o pior dia do ano pro seu caixa. Entenda por quê."

🎬 REEL 30 — "Quanto Você Realmente Faturou Esse Mês?" (Live/Q&A Mensal)
FORMATO: Robert ao vivo, respondendo perguntas de gestão financeira.
CTA: "Manda sua pergunta financeira pra caixa de perguntas nos Stories."
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Setup_Semanal</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Reels_Stories</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 2 — STORIES DIÁRIOS (CADÊNCIA COMPLETA)
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Robert_Stories" name="Stories Diários — Cadência Semanal Completa">
      <bpmn2:documentation>📱 STORIES ROBERT — CADÊNCIA SEMANAL DETALHADA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RITMO: 5-7 stories por dia | Kauã programa antecipado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 SEGUNDA-FEIRA — "Pergunta da Semana"
Story 1: Imagem com fundo escuro + texto: "Pergunta da semana: [pergunta sobre gestão financeira]"
  Exemplos de perguntas:
  → "Você controla o fluxo de caixa da sua empresa?"
  → "Você sabe qual produto tem a maior margem de lucro?"
  → "Você separa a conta pessoal da conta da empresa?"
Story 2: Enquete: "Você faz gestão financeira:" [Todo dia] [Às vezes] [Nunca]
Story 3: Caixa de perguntas: "Me manda sua dúvida financeira. Respondo essa semana."
OBJETIVO: Gerar perguntas reais para usar no conteúdo da semana.

📅 TERÇA-FEIRA — "Respondendo Você" (autoridade + proximidade)
Story 1-3: Robert responde as melhores perguntas recebidas na segunda.
  FORMATO: Vídeo curto (15-30s) com Robert falando direto.
  TOM: "Boa pergunta. A resposta é simples mas importante..."
Story 4: "Amanhã tem Reel novo. Sobre [tema]. Vai salvar esse."
OBJETIVO: Mostrar que Robert conhece o problema real dos seguidores.

📅 QUARTA-FEIRA — "Bastidores Fyness" (construir @fynessbr do zero)
Story 1: Print de conversa no WhatsApp com Kaynan sobre desenvolvimento.
  Legenda: "Isso aqui. Isso é o que estamos construindo."
Story 2: Vídeo do Robert mostrando uma feature do Fyness (15s).
  Texto: "Olha o que o Fyness faz automaticamente..."
Story 3: Desafio de desenvolvimento: "Ontem quebramos a cabeça nesse problema. Hoje resolvemos assim."
Story 4: Marcação do @fynessbr + link para o trial.
OBJETIVO: Cada Quarta-feira constrói 1 tijolo na autoridade do @fynessbr.
ESTRATÉGIA DE CRESCIMENTO @fynessbr: Robert sempre marca, sempre aparece junto.
  Quando alguém clicar no @fynessbr pelo perfil do Robert, encontra algo.
  Ao longo de 6 meses, @fynessbr vai receber autoridade transferida pelo Robert.

📅 QUINTA-FEIRA — "Dado Chocante" (conteúdo viral de stories)
Story 1: Card com estatística.
  Exemplos:
  → "82% das PMEs no Brasil não têm controle financeiro formal. (SEBRAE)"
  → "Falta de gestão financeira é causa #1 de falência de negócios."
  → "Empresário brasileiro trabalha em média 11h/dia e lucra menos que assalariado de CLT."
Story 2: Robert comenta o dado em vídeo curto (10-15s).
Story 3: Enquete: "Você se identifica com esse dado?"
OBJETIVO: Stories de dado chocante têm taxa de resposta alta → mais alcance.

📅 SEXTA-FEIRA — "Dica do Robert" (quick win)
Story 1: Vídeo 30s de Robert dando uma dica prática e imediata.
  Exemplos de dicas:
  → "Toda sexta-feira, dedique 15 minutos pra revisar o que entrou e saiu essa semana."
  → "Nunca tome decisão de investimento sem antes projetar o caixa dos próximos 30 dias."
  → "Se um produto não cobre os custos fixos, você está subsidiando ele com outro. Descubra qual."
  → "Inadimplência acima de 5%: revise sua política de crédito imediatamente."
Story 2: "Salva nos Destaques 📊 Dicas se isso te ajudou."
OBJETIVO: Dicas salváveis = mais engajamento = mais alcance.

📅 SÁBADO — "Mais Leve" (humanizar sem perder autoridade)
Story 1-2: Robert no cotidiano (café, academia, família — sem exagero).
Story 3: Compartilhamento de Reel da semana para quem perdeu.
OBJETIVO: Humanizar sem perder posicionamento de especialista.

📅 DOMINGO — "Reflexão Semanal" (preparar a semana)
Story 1: Card com frase motivacional + prática.
  Exemplos:
  → "Semana nova. Antes de começar: você sabe qual é a meta financeira da sua empresa essa semana?"
  → "Domingo é dia de preparar. Abra o relatório. Revise o fluxo de caixa. Comece segunda preparado."
Story 2: Enquete: "Sua empresa está em dia financeiramente?" [Sim, estou no controle] [Não, tenho que melhorar]
OBJETIVO: Posicionar Robert como referência de hábito empresarial semanal.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESTAQUES DOS STORIES (organização do perfil)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Dicas Financeiras — melhores dicas dos stories da sexta
❓ Perguntas — Q&As da terça
🔦 Fyness — bastidores e demos do produto
📈 Resultados — cases de clientes (quando disponível)
🙋 Sobre mim — quem é o Robert, trajetória, porque o Fyness
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Reels_Stories</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Stories_Carrossel</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 3 — CARROSSEL SEMANAL (EDITORIAL + ALCANCE)
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Robert_Carrossel" name="1x Carrossel Educativo por Semana (Temas + Roteiros)">
      <bpmn2:documentation>🗂️ CARROSSEL ROBERT — TEMAS E ROTEIROS COMPLETOS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POR QUÊ CARROSSEL?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Carrossel é o formato com maior taxa de SAVE no Instagram.
→ Save = Instagram entende que o conteúdo é valioso → distribui mais.
→ Aumenta seguidores de forma mais orgânica e qualificada (pessoas que salvam vão voltar).
→ Um carrossel forte pode funcionar por meses (ex: "7 sinais" vai ser recomendado sempre).

FORMATO:
→ 8-10 slides
→ Slide 1: Título = gancho forte (mesma lógica do Reel)
→ Slides 2-8: 1 ponto por slide — curto, visual, impactante
→ Slide 9-10: Resumo + CTA ("Salva" + "Segue @robert pra mais")
→ Design: Kauã usa template Fyness (cor, fonte, logo sutil)
→ Postar às 18h de segunda-feira (maximiza semana inteira de alcance)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BANCO DE 12 CARROSSEIS COMPLETOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 CARROSSEL 1 — "7 Sinais Que Seu Financeiro Está Fora de Controle"
Slide 1: "7 sinais que seu financeiro está fora de controle 🚨"
Slide 2: "1. Você não sabe o lucro do último mês"
Slide 3: "2. Você mistura conta pessoal com conta da empresa"
Slide 4: "3. Você toma decisão de investimento no 'feeling'"
Slide 5: "4. Você fica sem dinheiro no fim do mês mesmo com bom faturamento"
Slide 6: "5. Você não sabe qual produto tem maior margem"
Slide 7: "6. Você não tem reserva de emergência"
Slide 8: "7. Seu controle financeiro depende da sua memória"
Slide 9: "Se você marcou 3 ou mais... A gente precisa conversar."
Slide 10: "Salva esse carrossel 🔖 | Segue @robert pra mais"

📌 CARROSSEL 2 — "Como Montar um DRE Simples em 10 Minutos"
Slide 1: "DRE em 10 minutos. Mesmo se você odeia números."
Slide 2: "DRE = Demonstração do Resultado. É o raio-X do seu negócio."
Slide 3: "Passo 1: Some toda receita do mês (vendas + serviços)"
Slide 4: "Passo 2: Subtraia o custo dos produtos/serviços → Margem Bruta"
Slide 5: "Passo 3: Liste todas as despesas fixas (aluguel, salários, etc)"
Slide 6: "Passo 4: Subtraia as despesas → Lucro Operacional"
Slide 7: "Passo 5: Desconte impostos → Lucro Líquido"
Slide 8: "Esse número final é o que realmente sobrou pro seu negócio."
Slide 9: "Faça isso todo mês. Sem exceção. Sua empresa vai mudar."
Slide 10: "Salva 🔖 | @fynessbr faz isso automaticamente. Link na bio."

📌 CARROSSEL 3 — "5 Relatórios Financeiros Que Todo Empresário Precisa"
Slide 1: "5 relatórios. Sem eles, você está no escuro."
Slide 2: "1. Fluxo de Caixa — o que vai entrar e sair nos próximos 30 dias"
Slide 3: "2. DRE Mensal — lucro ou prejuízo? Por produto?"
Slide 4: "3. Contas a Pagar — o que você deve e quando vence"
Slide 5: "4. Contas a Receber — o que te devem e quando entra"
Slide 6: "5. Análise de Margem por Produto — qual produto vale a pena?"
Slide 7: "Com esses 5, você toma decisão com dado, não com instinto."
Slide 8: "Sem esses 5, cada decisão é uma aposta."
Slide 9: "Salva esse carrossel. Compartilha com seu sócio ou gerente financeiro."
Slide 10: "Segue @robert | @fynessbr gera todos esses relatórios automaticamente."

📌 CARROSSEL 4 — "Checklist: Seu Negócio Está Pronto pra Crescer?"
Slide 1: "Quer escalar? Responde esse checklist primeiro."
Slides 2-9: 8 perguntas com checkboxes visuais:
  □ Você sabe o lucro líquido real?
  □ Você tem projeção de caixa dos próximos 90 dias?
  □ Você sabe o custo real de cada produto?
  □ Você tem reserva de 3 meses de custos fixos?
  □ Sua inadimplência está abaixo de 5%?
  □ Você tem processo definido de cobrança?
  □ Você sabe qual canal de venda tem melhor ROI?
  □ Seu pró-labore está separado do lucro da empresa?
Slide 10: "Menos de 5 checkmarks = você cresce construindo sobre areia. Corrige primeiro."

📌 CARROSSEL 5 — "Como Precificar Sem Perder Dinheiro"
Slide 1: "Você está cobrando certo? 70% dos empresários não estão."
Slides 2-8: Fórmula de precificação passo a passo com exemplos numéricos reais.
Slide 9: "Abaixo desse preço = você está trabalhando de graça (ou pagando pra trabalhar)."
Slide 10: "Salva 🔖 | Revisa seus preços essa semana."

📌 CARROSSEL 6 — "O Que Fazer Quando o Caixa Está Negativo"
Slide 1: "Caixa negativo. O que fazer? Não entre em pânico. Tem protocolo."
Slides 2-8: Plano de ação em 7 etapas (priorizar pagamentos, negociar prazo, identificar entradas previsíveis, etc.)
Slide 9: "Caixa negativo é sintoma. O problema está no controle."
Slide 10: "Salva. Compartilha com quem precisa."

CADÊNCIA DE PUBLICAÇÃO:
→ 1 carrossel novo por semana (segunda, 18h)
→ Rotacionar temas por mês:
  Mês 1: Diagnóstico (carrosseis 1, 2, 3, 4)
  Mês 2: Ação (carrosseis 5, 6, + 2 novos)
  Mês 3: Cases + Resultados (novos carrosseis com dados reais de clientes)
→ Sempre salvar nos destaques "📊 Dicas"
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Stories_Carrossel</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Carrossel_CTA</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 4 — CTA ESTRATÉGICO + CRESCIMENTO @FYNESSBR
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Robert_CTA" name="CTA Estratégico + Transferência de Autoridade p/ @fynessbr">
      <bpmn2:documentation>🎯 ESTRATÉGIA DE CTA + CONSTRUÇÃO DE AUTORIDADE DO @FYNESSBR

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXTO: @FYNESSBR TEM 6 SEGUIDORES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ O perfil @fynessbr é um ativo importante mas precisa ser construído.
→ Robert é o motor de crescimento do Fyness no Instagram.
→ Estratégia: usar a autoridade do Robert para "puxar" o @fynessbr.
→ Meta: em 3 meses, @fynessbr ter pelo menos 500 seguidores orgânicos.

REGRA 80/20 — APLICAÇÃO REAL:
→ 80% do conteúdo: educativo puro, zero menção ao produto.
→ 20% do conteúdo: mencionar Fyness de forma natural e contextualizada.
→ NUNCA mencionar preço nos posts orgânicos.
→ SEMPRE contextualizar antes do CTA ("porque precisei disso no meu próprio negócio").

FRASES DE CTA QUE CONVERTEM (aprovadas por contexto):
→ Após Reel educativo: "O Fyness faz isso automaticamente. Link na bio pra testar 7 dias."
→ Após carrossel de diagnóstico: "Cada item desse carrossel, o Fyness resolve. Link na bio."
→ Nos Stories: "Abrindo o dashboard do Fyness aqui..." [demo de 15s] + link
→ Nas respostas de perguntas: "Essa é exatamente a dor que o Fyness resolve. @fynessbr"
→ No último slide do carrossel: logo do Fyness + "7 dias grátis, link na bio"

O QUE NÃO FAZER:
→ Não transformar o feed em vitrine de produto.
→ Não usar linguagem de anúncio ("CLIQUE AGORA", "OFERTA LIMITADA") no orgânico.
→ Não postar sobre preço ou planos no feed — isso vai para Stories ou DM.
→ Não postar o mesmo CTA duas vezes seguidas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTRATÉGIA DE TRANSFERÊNCIA DE AUTORIDADE PARA @FYNESSBR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEMANA 1-4:
→ Robert menciona @fynessbr toda Quarta nos Stories.
→ Robert marca @fynessbr em 100% dos posts que falam sobre o produto.
→ Meta: @fynessbr ir de 6 para 50 seguidores (quem vê o Robert e vai conferir).

MÊS 2-3:
→ Robert posta 1x/semana story que começa: "Esse é o @fynessbr —" e mostra algo novo.
→ Robert faz Lives mensais ao vivo mostrando o dashboard do Fyness.
→ Meta: @fynessbr ir de 50 para 200 seguidores.

MÊS 4-6:
→ Colaboração: Robert + @fynessbr fazem post conjunto (repost).
→ @fynessbr começa a ter conteúdo próprio (Pool 5), Robert amplifica.
→ Meta: @fynessbr ir de 200 para 500+ seguidores.

COLLAB COM KAYNAN:
→ 1x por mês: Robert e Kaynan fazem Reel juntos.
→ Formato: Robert fala o problema, Kaynan mostra a solução técnica.
→ Aproveitar os diferentes públicos dos dois.

ENGAJAMENTO ATIVO:
→ Nos primeiros 30 min após qualquer post: Robert responde TODOS os comentários.
→ Todo dia: Robert passa 15 min respondendo DMs e comentários antigos.
→ Toda semana: Robert comenta em 10 posts de contas maiores do nicho (exposição orgânica).
→ Toda semana: Robert segue 20 contas de empresários pequenos relevantes.

HASHTAGS POR TIPO DE POST:
Reels: #gestaofinanceira #empreendedorismo #financasempresariais #pequenasempresas #fluxodecaixa #lucro #gestaoempresarial #empreendedor #negocio #empresario
Carrosseis: #dicasfinanceiras #gestaofinanceira #empreendedorismo #financasempresariais #controle financeiro
Stories: sem hashtag (não ajuda no Stories)
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Carrossel_CTA</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_CTA_Ciclo</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ══════════════════════════════════════════════════════════════
         TIMER — CICLO DE OTIMIZAÇÃO SEMANAL
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:intermediateCatchEvent id="Timer_Robert_Semanal" name="Ciclo Semanal (P7D)">
      <bpmn2:incoming>Flow_Robert_CTA_Ciclo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Analise</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 5 — ANÁLISE SEMANAL DE MÉTRICAS
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Robert_Analise" name="Análise Semanal de Métricas e Ajuste de Conteúdo">
      <bpmn2:documentation>📊 ANÁLISE SEMANAL — MÉTRICAS E TOMADA DE DECISÃO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ONDE ANALISAR: Instagram Insights (aba Profissional)
QUANDO: Toda segunda-feira pela manhã, antes de planejar a semana.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MÉTRICAS PRIMÁRIAS (decisão de continuar ou pivotar):
□ Alcance total da semana (meta: crescer 5% a cada semana)
□ Novos seguidores da semana (meta mês 1: +200/semana)
□ Taxa de seguidores (seguidores novos ÷ alcance × 100) — meta: acima de 0,8%
□ Saves dos Reels (meta: acima de 5% das visualizações)
□ Saves dos carrosseis (meta: acima de 10% das visualizações)
□ Taxa de engajamento (likes + comentários + saves ÷ alcance × 100) — meta: acima de 3%

MÉTRICAS SECUNDÁRIAS (otimização de conteúdo):
□ Qual Reel teve mais views? Por que? Repetir o gancho/tema.
□ Qual carrossel teve mais saves? Esse tema tem demanda — criar mais.
□ Qual Story teve mais respostas? Esse formato gera conversa — replicar.
□ Qual post gerou mais visitas ao perfil? Esse é o conteúdo de aquisição.
□ Qual post gerou mais cliques no link da bio? Esse é o conteúdo de conversão.

MÉTRICAS DO @FYNESSBR (acompanhar separado):
□ Seguidores do @fynessbr essa semana vs semana anterior
□ Impressões do @fynessbr vindas das menções do Robert (Meta Insights)
□ Cliques no link do @fynessbr via stories do Robert

DECISÃO DE CONTEÚDO BASEADA EM DADOS:
→ Se Reel abaixo de 1.000 views em 7 dias: analisar o gancho (problema está nos 3 primeiros segundos)
→ Se carrossel com menos de 50 saves: slide 1 não está convertendo (revisar título)
→ Se Stories com menos de 30% de retenção: conteúdo muito longo ou pouco interessante
→ Se semanas seguidas sem crescimento: tentar novo formato (live, collab, série)

TEMPLATE DE ANÁLISE SEMANAL (Kauã/Robert preenchim):
Semana: [data]
Reels publicados: [quais]
Melhor Reel: [nome] — [X] views, [Y] saves
Carrossel publicado: [qual] — [X] saves
Novos seguidores: [número]
@fynessbr: [seguidores antes] → [seguidores depois]
Cliques no link da bio: [número]
Decisão da semana que vem: [o que replicar] / [o que mudar]
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Analise</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Gateway</bpmn2:outgoing>
    </bpmn2:task>

    <!-- GATEWAY: Crescimento no caminho certo? -->
    <bpmn2:exclusiveGateway id="Gateway_Robert_Crescimento" name="Meta de Seguidores no Ritmo?">
      <bpmn2:incoming>Flow_Robert_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Escalar</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Robert_Otimizar</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:task id="Task_Robert_Escalar" name="Escalar: Aumentar Frequência + Colaborações">
      <bpmn2:documentation>🚀 ESCALAR — QUANDO O CRESCIMENTO ESTÁ NO RITMO

Indicadores que está na hora de escalar:
→ Taxa de seguidores acima de 1% (excelente)
→ Algum Reel passou de 50k views (viral atingido)
→ Crescendo mais de 500 seguidores/semana consistentemente

AÇÕES DE ESCALA:
1. AUMENTAR FREQUÊNCIA: passar de 2 para 3 Reels/semana
2. COLABORAÇÕES com criadores do nicho (outros especialistas em negócios, contadores, etc.)
   → Proposta de collab: "Vamos fazer um Reel juntos? Tema: [tema]. Você fala X, eu falo Y."
   → Prioridade: contas entre 10k-100k no nicho de negócios/finanças
3. LEAD MAGNET: criar um PDF/guia gratuito ("7 relatórios financeiros essenciais") para capturar email
   → Divulgar no Stories com link
   → Quem baixa → entra na lista de emails → sequência de nutrição → trial Fyness
4. STORIES COMPRADOS (anúncio de Stories do Robert para audiência lookalike dos seguidores)
   → Investir R$300/mês em anúncio de Stories com melhor Reel orgânico
5. LIVE MENSAL: Robert responde perguntas ao vivo — convida colaboradores
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Escalar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Voltar</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Robert_Otimizar" name="Otimizar: Revisar Gancho, Tema e Formato">
      <bpmn2:documentation>🔧 OTIMIZAR — QUANDO O CRESCIMENTO ESTÁ ABAIXO DO ESPERADO

DIAGNÓSTICO POR PROBLEMA:

PROBLEMA: Views baixos nos Reels (menos de 500 em 7 dias)
→ Causa mais provável: gancho fraco (3 primeiros segundos)
→ Solução: Testar 3 variações de gancho pro mesmo tema. Qual pergunta/dado/afirmação mais choca?
→ Referência: Analisar os ganchos dos 5 Reels de mais sucesso do nicho no mesmo período.

PROBLEMA: Views ok mas poucos saves/shares (menos de 2%)
→ Causa mais provável: conteúdo entretém mas não é útil o suficiente para guardar
→ Solução: Adicionar checklist, passo a passo, ou número acionável no final do Reel.
→ Exemplo: ao invés de "entenda fluxo de caixa", mostrar "3 passos para montar fluxo de caixa hoje"

PROBLEMA: Muita visita ao perfil mas pouco follow
→ Causa mais provável: bio não convence, grid não tem consistência visual, ou falta destaques organizados
→ Solução: Revisar bio, reorganizar destaques, garantir que os últimos 9 posts do grid comunicam autoridade.

PROBLEMA: Seguidores crescem mas cliques no link da bio são baixos
→ Causa mais provável: CTA fraco ou pouco frequente; ou lead ainda não está "pronto"
→ Solução: Criar conteúdo de "ponte" (comparação antes/depois do Fyness, história pessoal + produto).

PROBLEMA: Crescimento parou completamente
→ Solução nuclear: colaboração com conta maior.
→ Um Reel compartilhado por uma conta de 30k+ muda o jogo.
→ Abordagem: identificar 5 criadores de negócio com 10k-100k, propor collab com tema específico.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Otimizar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Voltar</bpmn2:outgoing>
    </bpmn2:task>

    <!-- Timer mensal para ciclo de avaliação maior -->
    <bpmn2:intermediateCatchEvent id="Timer_Robert_Mensal" name="Avaliação Mensal (P30D)">
      <bpmn2:incoming>Flow_Robert_Voltar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Mensal</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P30D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Robert_Mensal" name="Relatório Mensal + Planejamento do Próximo Mês">
      <bpmn2:documentation>📋 RELATÓRIO MENSAL DO ROBERT — TEMPLATE COMPLETO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RELATÓRIO MÊS [X] — PERFIL @ROBERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRESCIMENTO:
→ Seguidores início do mês: [X]
→ Seguidores fim do mês: [Y]
→ Crescimento absoluto: [Y-X]
→ Crescimento %: [(Y-X)/X × 100]%
→ Meta era: [Z] — atingida? [Sim/Não]

CONTEÚDO:
→ Reels publicados: [número]
→ Reel com mais views: [título] — [X] views
→ Reel com mais saves: [título] — [X] saves
→ Carrosseis publicados: [número]
→ Carrossel com mais saves: [título] — [X] saves
→ Stories publicados (média/dia): [número]

ENGAJAMENTO:
→ Alcance médio por Reel: [X]
→ Taxa de save média dos Reels: [X]%
→ Taxa de engajamento médio: [X]%

CONVERSÃO:
→ Cliques no link da bio: [X]
→ Trials iniciados vindos do orgânico Robert: [X] (rastrear por UTM)

CRESCIMENTO @FYNESSBR:
→ Seguidores @fynessbr início: [X] | fim: [Y]
→ Menções do Robert ao @fynessbr: [X] vezes
→ Impressões no @fynessbr via menção Robert: [X]

DECISÕES PARA O PRÓXIMO MÊS:
□ Temas que performaram — repetir com ângulo diferente: [listar]
□ Temas que não performaram — descartar por ora: [listar]
□ Colaborações programadas: [listar contas + datas]
□ Lead magnet? [Sim/Não — se sim, qual]
□ Anúncio de Stories do Robert? [Sim/Não — orçamento]
□ Frequência de Reels: [2x ou 3x por semana]
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Mensal</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Gateway_LP</bpmn2:outgoing>
    </bpmn2:task>

    <!-- Gateway de saída: Lead Clicou na Bio? -->
    <bpmn2:exclusiveGateway id="Gateway_Robert_Engajou" name="Lead Clicou no Link da Bio?">
      <bpmn2:incoming>Flow_Robert_Gateway_LP</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Robert_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Robert_LP" name="→ Landing Page">
      <bpmn2:documentation>Lead clicou no link da bio do Robert → vai para a Landing Page do Fyness.
UTM: utm_source=instagram&amp;utm_medium=organic&amp;utm_campaign=robert_bio</bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_LP" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:endEvent id="End_Robert_Organico" name="Continua no Feed (Maturação)">
      <bpmn2:documentation>Lead ainda não clicou. Continua recebendo conteúdo.
→ Ciclo natural de maturação: pode converter em 2 semanas ou 3 meses.
→ Quando estiver pronto, vai buscar o link na bio espontaneamente.
→ Isso é o poder do conteúdo orgânico: trabalha 24h, nunca para.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Nao</bpmn2:incoming>
    </bpmn2:endEvent>

    <!-- SEQUENCE FLOWS -->
    <bpmn2:sequenceFlow id="Flow_Robert_Setup_Semanal"  sourceRef="Start_Robert_Setup"       targetRef="Task_Robert_Reels" />
    <bpmn2:sequenceFlow id="Flow_Robert_Reels_Stories"  sourceRef="Task_Robert_Reels"         targetRef="Task_Robert_Stories" />
    <bpmn2:sequenceFlow id="Flow_Robert_Stories_Carrossel" sourceRef="Task_Robert_Stories"    targetRef="Task_Robert_Carrossel" />
    <bpmn2:sequenceFlow id="Flow_Robert_Carrossel_CTA"  sourceRef="Task_Robert_Carrossel"     targetRef="Task_Robert_CTA" />
    <bpmn2:sequenceFlow id="Flow_Robert_CTA_Ciclo"      sourceRef="Task_Robert_CTA"           targetRef="Timer_Robert_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Robert_Analise"        sourceRef="Timer_Robert_Semanal"      targetRef="Task_Robert_Analise" />
    <bpmn2:sequenceFlow id="Flow_Robert_Gateway"        sourceRef="Task_Robert_Analise"       targetRef="Gateway_Robert_Crescimento" />
    <bpmn2:sequenceFlow id="Flow_Robert_Escalar"  name="Sim, no ritmo"  sourceRef="Gateway_Robert_Crescimento" targetRef="Task_Robert_Escalar" />
    <bpmn2:sequenceFlow id="Flow_Robert_Otimizar" name="Abaixo da meta" sourceRef="Gateway_Robert_Crescimento" targetRef="Task_Robert_Otimizar" />
    <bpmn2:sequenceFlow id="Flow_Robert_Voltar"         sourceRef="Task_Robert_Escalar"       targetRef="Timer_Robert_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Robert_Voltar2"        sourceRef="Task_Robert_Otimizar"      targetRef="Timer_Robert_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Robert_Mensal"         sourceRef="Timer_Robert_Mensal"       targetRef="Task_Robert_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Robert_Gateway_LP"     sourceRef="Task_Robert_Mensal"        targetRef="Gateway_Robert_Engajou" />
    <bpmn2:sequenceFlow id="Flow_Robert_Sim"  name="Sim" sourceRef="Gateway_Robert_Engajou"   targetRef="LinkThrow_Robert_LP" />
    <bpmn2:sequenceFlow id="Flow_Robert_Nao"  name="Não" sourceRef="Gateway_Robert_Engajou"   targetRef="End_Robert_Organico" />

  </bpmn2:process>

  <!-- ============================================================ -->
`;

const before = content.slice(0, startIdx);
const after  = content.slice(endIdx);

const newContent = before + ROBERT_POOL + after;
writeFileSync(filePath, newContent, 'utf8');
console.log(`Done! ${newContent.length} chars, ${newContent.split('\n').length} lines`);

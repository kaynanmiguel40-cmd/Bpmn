import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/utils/marketingTemplate.js';
let content = readFileSync(filePath, 'utf8');

const START_MARKER = '<!-- POOL 4: KAYNAN';
const END_MARKER   = '<!-- POOL 5:';

const startIdx = content.indexOf(START_MARKER);
const endIdx   = content.indexOf(END_MARKER);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found!', { startIdx, endIdx });
  process.exit(1);
}

const KAYNAN_POOL = `<!-- POOL 4: KAYNAN — PROXIMIDADE E PRODUTO (Build in Public)      -->
  <!-- ============================================================ -->
  <bpmn2:process id="Process_Kaynan" isExecutable="false">

    <!-- ══════════════════════════════════════════════════════════════
         INÍCIO — SETUP DE PERFIL DO ZERO
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:startEvent id="Start_Kaynan_Setup" name="Setup do Perfil Kaynan (Do Zero)">
      <bpmn2:documentation>👤 PERFIL: KAYNAN — CO-FUNDADOR, 19 ANOS, BUILD IN PUBLIC
Instagram: ~200 seguidores | Reconstruir como perfil profissional do zero
Fyness Instagram: @fynessbr — 6 seguidores (recém-criado)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 TOM DE VOZ COMPLETO DO KAYNAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONALIDADE:
→ 19 anos. Está vivendo o processo AGORA. Não fala de teoria — fala do que está acontecendo.
→ Autêntico ao extremo. Mostra o erro tanto quanto mostra o acerto.
→ Energia alta. Fala rápido. Edição rápida. Geração Z nativa.
→ Vulnerabilidade real: "Às 2 da manhã travei em um bug. Olha como resolvi."
→ Tom de amigo que conta o que está fazendo — não de professor ensinando.
→ Diferente do Robert (que é autoridade): Kaynan é IDENTIFICAÇÃO.
→ Quem tem 18-28 anos querendo empreender se vê no Kaynan.

LINGUAGEM:
→ Informal mas inteligente. "A gente" mais que "nós". Pode usar "cara", "mano" com moderação.
→ Sem jargão técnico pesado — simplifica tudo: "é basicamente uma API que lê texto"
→ Frases curtas e energéticas. Ritmo de podcast acelerado.
→ Admite quando não sabe: "Eu não sabia isso até 3 meses atrás."
→ Mostra o processo real, não o highlight reel.

POSICIONAMENTO ÚNICO:
→ "O jovem fundador que mostra os bastidores de um SaaS brasileiro"
→ O que Robert NÃO faz: bastidores, tech, produto, lançamento, falhas.
→ Complemento perfeito: Robert = "por que você precisa" / Kaynan = "como a gente construiu"
→ Build in Public: transparência total sobre o processo → gera comunidade de acompanhamento.

BIO OTIMIZADA:
"19 anos | Co-fundador @fynessbr 🛠️
Construindo um SaaS brasileiro ao vivo
Bastidores, erros e tudo mais 👇"
[Link na bio: Linktree → Trial Fyness + @fynessbr + contato]

NOME DE USUÁRIO: @kaynanfyness (ou @kaynanbf — testar disponibilidade)
NOME NO PERFIL: "Kaynan | Co-fundador Fyness"

FOTO DE PERFIL: Foto descontraída mas profissional — sorrindo, pode estar com notebook ou celular.
Kauã produz a foto. Fundo neutro (branco ou cor da marca Fyness).

DESTAQUES DO STORIES A CRIAR:
🛠️ Bastidores — processo de construção do Fyness
🚀 Fyness — produto em ação, demos, features
📖 Aprendi — aprendizados de empreender jovem
🤝 Sobre mim — quem é Kaynan, trajetória, por que o Fyness
❓ Perguntas — Q&As respondidas sobre tech, produto, empreendedorismo

PRIMEIROS 9 POSTS (grade inicial — Kauã prepara o layout antes do primeiro post):
→ Post 1: Apresentação pessoal (Reel: "Olha quem sou e o que estou construindo")
→ Post 2: Carrossel: "Construí um SaaS com 19 anos — aqui está o que aprendi"
→ Post 3: Reel: Demo do Fyness funcionando (produto em ação)
→ Post 4: Carrossel: "Por que construímos o Fyness no WhatsApp e não num app"
→ Post 5: Reel: Bastidor de desenvolvimento (feature favorita)
→ Post 6: Carrossel: "Erros que quase me fizeram desistir" (vulnerabilidade = identificação)
→ Post 7: Reel: Collab com Robert ("dois fundadores, dois perfis opostos")
→ Post 8: Carrossel: "Stack tecnológico do Fyness — simplificado pra não técnicos"
→ Post 9: Reel: "Dia 1 de lançamento — o que aconteceu"

META DE CRESCIMENTO:
Mês 1: 200 → 700 (+500) — Setup + primeiros 9 posts + 2 Reels/semana
Mês 2: 700 → 1.500 (+800) — Bastidores do lançamento, collab Robert
Mês 3: 1.500 → 2.500 (+1.000) — Primeiro Reel viral de bastidores
Mês 6: 5.000+ — Autoridade de jovem fundador estabelecida
      </bpmn2:documentation>
      <bpmn2:outgoing>Flow_Kaynan_Setup_Perfil</bpmn2:outgoing>
    </bpmn2:startEvent>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 1 — SETUP DO PERFIL (FASE ZERO — FAZER UMA VEZ)
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Kaynan_CriarPerfil" name="Criar e Otimizar Perfil Profissional (Fase Zero)">
      <bpmn2:documentation>🔧 SETUP COMPLETO DO PERFIL — CHECKLIST ANTES DO PRIMEIRO POST

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHECKLIST DE SETUP (Kauã executa, Kaynan aprova)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Mudar conta para Perfil Profissional (Criador de Conteúdo)
□ Escolher usuário: @kaynanfyness (verifica disponibilidade)
□ Atualizar nome do perfil: "Kaynan | Co-fundador Fyness"
□ Escrever e publicar bio (ver template abaixo)
□ Adicionar link Linktree na bio
□ Criar Linktree com 3 links: Trial Fyness, @fynessbr, WhatsApp contato
□ Fazer foto profissional (Kauã fotografa)
□ Definir paleta de cores do feed (usar cores Fyness)
□ Criar 5 destaques de Stories com capas no padrão visual
□ Planejar grid dos primeiros 9 posts antes de publicar qualquer coisa
□ Seguir 200 contas estratégicas: criadores de conteúdo de tech/empreendedorismo/startup
□ Publicar os 9 posts do grid em 3 dias (3 por dia) — grid completo antes de crescer

LINKTREE — ESTRUTURA:
1️⃣ "Testar o Fyness — 7 dias grátis" → [link trial]
2️⃣ "Ver o @fynessbr" → instagram.com/fynessbr
3️⃣ "Falar com a gente" → WhatsApp comercial do Fyness

CONTAS PARA SEGUIR (build in public ecosystem):
→ Fundadores de startups brasileiras (@meunegocio, influenciadores de tech BR)
→ Criadores de conteúdo de empreendedorismo jovem
→ Perfis de SaaS brasileiro / product builders
→ Clientes potenciais do Fyness (pequenos empresários, MEI)

REGRA DE OURO DO SETUP:
→ Não poste nada até o grid dos 9 estar pronto.
→ Quando alguém novo chega no perfil, vê 9 posts organizados e de qualidade.
→ Primeira impressão = grid. Grid caótico = não segue.
→ Kauã cria o layout completo no Canva antes de publicar.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Setup_Perfil</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Perfil_Reels</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 2 — 2x REELS POR SEMANA (ROTEIROS COMPLETOS)
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Kaynan_Reels" name="2x Reels por Semana — Build in Public (Roteiros Completos)">
      <bpmn2:documentation">🎬 REELS KAYNAN — BANCO DE 25 ROTEIROS COMPLETOS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO PADRÃO KAYNAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Duração: 20-45 segundos (Geração Z — mais curto que o Robert)
Hook (0-2s): Mais agressivo. Dado chocante OU situação absurda OU pergunta provocadora.
Ritmo: Fala rápido. Cortes a cada 2-3s. Sem silêncio desnecessário.
Texto na tela: Grande, legível, aparece em sincronia com a fala.
Tom: Natural, como se fosse um story longo mas editado.
Edição (Kauã): Cortes rápidos, zoom ocasional, trilha com energia, meme/referência quando cabe.
Horário: Segunda ou Quarta, 20h (público jovem mais ativo).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCO 1 — APRESENTAÇÃO E CONTEXTO (Semanas 1-2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 REEL K1 — "Quem Sou Eu e o Que Estou Construindo"
GANCHO: "Tenho 19 anos e co-fundei um SaaS. Não vou enfeitar o que foi isso."
DESENVOLVIMENTO:
"Meu nome é Kaynan. Co-fundador do Fyness.
O Fyness é gestão financeira empresarial pelo WhatsApp.
O empresário manda mensagem de voz — 'gastei R$200 com fornecedor' —
e o sistema já lança no financeiro automaticamente.
Sem planilha. Sem aplicativo complicado.
Só o WhatsApp que o empresário já usa.
Construí isso com o Robert, meu sócio de 35 anos.
Sim — eu tenho 19 e ele tem 35. Funciona, acredita em mim.
Esse perfil vai ser o bastidor de tudo isso."
CTA: "Segue aqui pra acompanhar. Vou mostrar tudo — incluindo os erros."
HASHTAGS: #buildinpublic #startupbrasil #empreendedorismo #saas #fyness

🎬 REEL K2 — "Por Que Construímos no WhatsApp"
GANCHO: "Você ia preferir um aplicativo novo ou o WhatsApp que já tem no celular?"
DESENVOLVIMENTO:
"Essa foi a pergunta que mudou tudo no Fyness.
A maior barreira pra gestão financeira não é tecnologia.
É adoção. As pessoas não usam o sistema que compram.
Aí caiu a ficha: e se a gestão financeira fosse onde o empresário já está?
No WhatsApp. Que ele já usa 3 horas por dia.
Você faz uma venda? Manda pro Fyness.
Pagou uma conta? Manda pro Fyness.
Tudo registrado em tempo real. Relatório no fim do dia.
Sem abrir um aplicativo novo. Nunca."
CTA: "Link na bio pra testar 7 dias grátis. [marca @fynessbr]"

🎬 REEL K3 — "Construí um SaaS com Quanto Dinheiro?"
GANCHO: "Me perguntam muito: quanto custou construir o Fyness? Vou ser transparente."
DESENVOLVIMENTO:
"Vou ser honesto.
Não foi zero. Mas foi bem menos do que você imagina.
A maior parte do custo não foi infraestrutura.
Foi tempo.
Meu tempo, do Robert, do nosso time.
A infraestrutura cloud, API, servidor — isso escala conforme o produto cresce.
O segredo de SaaS é exatamente isso: custo marginal baixo conforme você escala.
O que pesou de verdade foi o ciclo de testes.
Construiu, testou, quebrou, reconstruiu.
Esse ciclo é o custo real de qualquer produto digital."
CTA: "Comenta o que você acha que é o maior custo pra construir um SaaS."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCO 2 — BASTIDORES DO PRODUTO (Semanas 3-6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 REEL K4 — "Como o Fyness Entende o Que Você Fala"
GANCHO: "Você fala: 'Gastei R$300 no fornecedor hoje.' O Fyness entende isso como dado financeiro. Deixa eu mostrar como."
DESENVOLVIMENTO:
"Não é mágica. É processamento de linguagem natural.
Você manda a mensagem pro WhatsApp do Fyness.
O sistema lê a mensagem, identifica: tipo de transação, valor, categoria.
Joga no banco de dados. Atualiza o relatório.
Tudo em menos de 2 segundos.
A IA não é perfeita — às vezes precisa de uma confirmação.
'Esse gasto é de qual categoria?' E você responde. Ela aprende.
Com o tempo, a IA do Fyness fica treinada no padrão do seu negócio."
CTA: "Salva esse vídeo. Link na bio pra testar."

🎬 REEL K5 — "O Bug Que Travou Nosso Lançamento"
GANCHO: "Às 23h do dia anterior ao lançamento, encontrei um bug crítico. Aqui está o que aconteceu."
DESENVOLVIMENTO:
"O sistema estava duplicando lançamentos quando o usuário mandava mensagem muito rápido.
Dois lançamentos. Um gasto virava dois no relatório.
Isso não pode existir num produto financeiro.
Ficamos eu e o time até 3h da manhã debugando.
Encontramos: era uma condição de corrida na fila de processamento.
Corrigimos com um lock simples na operação.
Testamos 200 vezes. Passou em tudo.
Atrasamos o lançamento 1 dia.
Valeu? Com certeza.
Produto financeiro com bug de duplicação = fim da confiança."
CTA: "Já passou por situação parecida? Comenta aqui."

🎬 REEL K6 — "Feature Que Mais Me Orgulho no Fyness"
GANCHO: "De tudo que construí no Fyness, isso aqui é o que mais me orgulha."
DESENVOLVIMENTO:
"O relatório de DRE em tempo real.
A maioria dos sistemas gera o DRE no fim do mês.
O Fyness gera o DRE em tempo real. Agora. Nesse momento.
O empresário abre o chat, digita 'relatório', e recebe o DRE do mês atual.
Com o que já entrou. Com o que já saiu. Margem bruta. Lucro operacional.
Aquela sensação de 'construí isso e está funcionando' não passa.
Quando um usuário me mandou mensagem falando 'cara, isso aqui é demais' —
foi o melhor momento do produto até hoje."
CTA: "Salva esse vídeo. [marca @fynessbr] Link na bio."

🎬 REEL K7 — "Um Dia Construindo o Fyness"
GANCHO: "Vou te mostrar como é um dia real construindo um SaaS."
DESENVOLVIMENTO:
[Formato: cortes rápidos mostrando o dia]
"7h: Abro o laptop. Listo o que precisa ser feito hoje.
9h: Reunião rápida com o Robert — alinha produto e comercial.
11h: Foco total em código. Nenhuma notificação.
13h: Almoço com o time. Falamos de tudo menos trabalho por 30 minutos.
14h: Revisar feedback de usuários do trial.
16h: Implementar ajuste pedido por 3 usuários diferentes.
19h: Deploy. Testar. Funcionar.
21h: Responder emails e DMs do produto.
Não é todo dia assim. Às vezes é só debugging.
Às vezes é só reunião. Às vezes quebra tudo.
Mas isso é construir um produto. Real, não glamourizado."
CTA: "Comenta se você quer ver mais dia-a-dia de fundador."

🎬 REEL K8 — "Por Que Escolhi um Sócio de 35 Anos com 19 Anos"
GANCHO: "Meu sócio tem 35 anos. Eu tenho 19. Funcionou? Vou te contar."
DESENVOLVIMENTO:
"Quando o Robert me apresentou a ideia, minha primeira reação foi:
'Mas isso não vai ser muito difícil de vender?'
Ele falou: 'Deixa eu me preocupar com isso. Você se preocupa com o produto.'
Essa divisão foi fundamental.
Eu nunca tentei saber vender antes de aprender a construir.
Ele nunca tentou saber de tech antes de entender o mercado.
A gente discute? Sim. Muito.
Mas cada um na sua área com total autonomia.
Se você tem 19 anos e está pensando em ter um sócio mais velho —
não fuja dessa ideia. A experiência que falta pra você pode estar nele."
CTA: "Comenta: você prefere sócio da mesma idade ou mais experiente?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCO 3 — EMPREENDEDORISMO JOVEM (Semanas 7-10)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 REEL K9 — "O Que Aprendi Sobre Dinheiro Construindo o Fyness"
GANCHO: "Construir um produto financeiro me ensinou mais sobre dinheiro do que qualquer aula."
DESENVOLVIMENTO:
"Ponto 1: Empresário médio tem zero visibilidade financeira. Zero mesmo.
Ponto 2: A dor é real. Conversamos com 60 empresários antes de escrever uma linha de código.
Ponto 3: Produto que resolve dor real vende. Produto bonito que não resolve dor não vende.
Ponto 4: Eu nunca ia entender esse mercado sem o Robert.
Ponto 5: A melhor pesquisa de produto é ligar pra quem você quer vender e ouvir.
Com 19 anos, eu entrei nessa com muito código e pouca empatia com o cliente.
Hoje é o contrário. O código vem depois que você entende o problema."
CTA: "Salva. Compartilha com quem está pensando em abrir um negócio."

🎬 REEL K10 — "Erro Que Quase Me Fez Desistir do Fyness"
GANCHO: "Teve um mês que eu pensei seriamente em largar o Fyness. Vou ser honesto sobre isso."
DESENVOLVIMENTO:
"Foi no terceiro mês de desenvolvimento.
A gente tinha construído muito. Testado muito.
E não estava saindo do lugar.
Os primeiros usuários do teste não estavam usando o produto no dia a dia.
Eles baixavam, testavam uma vez e paravam.
Aquilo me destruiu. Tinha meses de trabalho naquele produto.
O Robert me chamou pra conversar. Perguntou: 'O produto resolve a dor certa?'
A resposta era não. A gente estava resolvendo uma dor que o empresário tinha mas não sentia.
Precisávamos resolver a dor que ele sentia todos os dias.
Pivotamos. Reconstruímos. E aí clicou."
CTA: "Comenta aqui: você já quis desistir de algo e não desistiu? O que aconteceu?"

🎬 REEL K11 — "Ninguém Me Contou Isso Sobre Empreender Jovem"
GANCHO: "Tem uma coisa que ninguém fala sobre empreender com 19 anos. Vou falar."
DESENVOLVIMENTO:
"Todo mundo fala do sonho. Do crescimento. Do 'siga sua paixão'.
Ninguém fala da parte chata.
Das noites depurando bug sem ter certeza se alguém vai usar.
Das reuniões que parecem não ir pra lugar nenhum.
De pedir ajuda pra alguém mais velho e aceitar que você não sabe tudo.
De aprender a separar o ego do produto.
'Esse feedback não é pessoal. É sobre o produto.'
De fazer isso enquanto amigos da mesma idade estão na faculdade.
Não tem jeito certo. Tem o jeito que funciona pra você.
Mas saber que isso vem junto — isso me ajudaria muito antes."
CTA: "Comenta o que ninguém te contou sobre empreender ou trabalhar."

🎬 REEL K12 — "Por Que Saí da Faculdade pra Construir o Fyness" (se aplicável)
GANCHO: "Larguei a faculdade. Não me arrependo. Mas não é pra todo mundo."
DESENVOLVIMENTO:
"Não vou glamourizar. Faculdade tem valor real.
Mas existia um conflito: construir o Fyness com 20% da energia,
ou construir o Fyness com 100% da energia.
Não dava pra fazer os dois com a mesma intensidade.
A oportunidade era agora. O produto estava tomando forma.
Fiz a escolha. Foi a certa pra mim nesse momento.
Mas só você sabe se é a certa pra você.
Parâmetros que usei:
1. Tenho produto concreto ou só ideia? (produto concreto)
2. Tenho sócio complementar? (sim, Robert)
3. Tenho condição financeira por 6-12 meses? (calculei)
4. Posso voltar se precisar? (sim)
Se você responder sim pras 4, aí vale a pena ponderar."
CTA: "Comenta: você conseguiria empreender enquanto estuda?"

🎬 REEL K13 — "Rotina de Um Fundador de Startup Brasileira (Sem Glamour)"
GANCHO: "Vai ser a rotina mais sem glamour que você já viu. Mas é real."
DESENVOLVIMENTO:
"6h30: Acordo. Verifico notificação de erro no sistema antes de fazer café.
[Isso não é saudável. Mas acontece.]
8h: Listas do dia. O que é crítico. O que é importante. O que é só barulho.
10h-13h: Desenvolvimento. Fone no ouvido. Nenhuma notificação.
14h-16h: Produto, usuários, feedback, ajuste.
17h-18h: Comercial com o Robert. Alinha o que o cliente quer vs o que construímos.
19h: Academia ou caminhada — isso não é opcional pra mim.
20h: Conteúdo ou responder DMs.
22h: Desconecta. Não funciona se não descansar.
Não é todos os dias perfeito. Mas é a estrutura."
CTA: "Comenta sua rotina de fundador / empreendedor. Curioso pra comparar."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCO 4 — LANÇAMENTO E PROVA SOCIAL (Semanas 11-16)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 REEL K14 — "Dia 1 de Lançamento — O Que Aconteceu"
GANCHO: "Esse é o dia que passamos meses esperando. Aqui está o que realmente aconteceu."
DESENVOLVIMENTO:
[Formato: antes e depois, com print dos primeiros usuários]
"7h da manhã. A LP estava no ar.
Primeiro usuário cadastrado às 8h47.
Olhei pro monitor e gritei sozinho no escritório.
Segundo usuário às 9h12. Terceiro às 10h30.
No fim do dia: 23 trials iniciados.
Vinte. E. Três. Pessoas. Usando. O. Produto.
Que construímos de zero.
O feeling é indescritível.
Não importa o número. Importa que eram pessoas reais
com problemas reais usando algo que a gente construiu."
CTA: "Segue aqui pra acompanhar o crescimento em tempo real. [marca @fynessbr]"

🎬 REEL K15 — "Primeiro Feedback Negativo Real — Como Respondi"
GANCHO: "Recebi um feedback negativo do produto. Aqui está o que fiz."
DESENVOLVIMENTO:
"Usuário do trial escreveu: 'O produto é interessante mas a interface do chat é confusa.'
Primeira reação: defensiva. 'Mas a gente trabalhou nisso por meses.'
Segunda reação: curiosidade. 'O que especificamente está confuso?'
Entrei em contato. Pedi 15 minutos de ligação.
Ele me mostrou exatamente onde travou.
Ponto de confusão: a confirmação de lançamento tinha texto ambíguo.
Levamos 2 horas pra corrigir e testar.
Ele voltou ao trial. 'Ficou muito melhor.'
Feedback negativo não é ataque. É dado.
Dado que você não conseguiria pagando por pesquisa."
CTA: "Salva esse vídeo. É a lição mais importante de produto que aprendi."

🎬 REEL K16 — "Mostrando o Fyness Ao Vivo" (demo em tempo real)
GANCHO: "Vou mostrar o Fyness funcionando agora. Tela real. Sem edição."
DESENVOLVIMENTO:
[Kaynan abre o WhatsApp do Fyness ao vivo]
"Ó — vou mandar uma venda aqui.
'Vendi R$1.500 de consultoria hoje.'
[tela do chat aparece com a confirmação do Fyness]
Em 2 segundos, confirmação: 'Lançamento registrado — Receita de serviços R$1.500.'
Agora vou pedir o relatório do dia.
'Relatório do dia.'
[DRE resumido do dia aparece]
Receitas, despesas, saldo do dia.
Tudo sem abrir nenhum outro app.
Só o WhatsApp."
CTA: "Link na bio. 7 dias grátis. Sem cartão de crédito. [marca @fynessbr]"

🎬 REEL K17 — "O Que Mudaria se Fizesse de Novo"
GANCHO: "Se eu pudesse recomeçar o Fyness do zero, mudaria 3 coisas."
DESENVOLVIMENTO:
"Um: Faria o MVP mais simples.
A gente construiu features demais antes de validar o básico.
Mínimo viável = só a feature que resolve a dor número 1.
Dois: Conversaria com mais clientes antes de codificar.
Literalmente: 30 ligações antes de escrever uma linha de código.
Três: Construiria a distribuição junto com o produto.
Instagram, conteúdo, SEO — esses canais precisam ser construídos desde o dia 1.
Não depois que o produto está pronto.
Fiz isso parcialmente. Deveria ter feito completamente."
CTA: "Comenta: qual erro você cometeu numa empreitada e não cometeria de novo?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCO 5 — TECH SIMPLIFICADO (Mês 4-6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 REEL K18 — "Stack do Fyness — Explicado pra Quem Não É Técnico"
GANCHO: "Qual tecnologia usamos pra construir o Fyness? Vou explicar sem jargão."
DESENVOLVIMENTO:
"Frontend: o que você vê. Interface, dashboard.
Backend: o que processa os dados, faz os cálculos, gera os relatórios.
Banco de dados: onde fica tudo guardado — transações, categorias, histórico.
IA/NLP: o cérebro que lê a mensagem do WhatsApp e entende o que significa.
API do WhatsApp: a ponte que conecta o chat com o nosso sistema.
Cada parte dessas é como uma peça de LEGO.
A magia está em como você conecta elas.
Não está em qual peça usa."
CTA: "Comenta se quer que eu explique alguma parte em mais detalhe."

🎬 REEL K19 — "Como Testamos o Fyness com 60 Empresários Antes do Lançamento"
GANCHO: "60 empresários. 60 ligações. Antes de lançar. Era necessário? Sem dúvida."
DESENVOLVIMENTO:
"Chamamos de fase de discovery.
60 ligações de 30 minutos com pequenos empresários.
Pergunta 1: Como você controla o financeiro hoje?
Pergunta 2: Qual é a maior dor nesse processo?
Pergunta 3: Por que você não usa [ferramenta X]?
O padrão que apareceu em 48 das 60 ligações:
'Não tenho tempo' e 'É complicado demais.'
Aí ficou claro: a solução não pode exigir tempo extra nem aprendizado.
WhatsApp: zero tempo extra (já está aberto). Zero aprendizado (já sabe usar).
Discovery valida. Nunca pule essa etapa."
CTA: "Salva esse vídeo. Antes de construir qualquer produto, faz esse processo."

🎬 REEL K20 — "Automatizei Minha Vida com o Fyness" (uso pessoal)
GANCHO: "Uso o próprio produto que construo. Deixa eu mostrar como."
DESENVOLVIMENTO:
"Muita gente usa planilha pessoal pra controlar gastos. Eu uso o Fyness.
'Almoço R$25.' Categorizado como alimentação.
'Assinatura Netflix R$40.' Categorizado como lazer.
'Uber R$18.' Categorizado como transporte.
No fim do mês, mando 'relatório mensal'.
E vejo exatamente: onde gastei mais, onde posso cortar, qual categoria explodiu.
Não precisa ser empresa pra usar.
Qualquer pessoa que queira controlar dinheiro funciona."
CTA: "Linka na bio pra testar. [marca @fynessbr]"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REELS COLLAB + ESPECIAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 REEL K21 — Collab Robert + Kaynan: "19 anos vs 35 anos — Como Tomamos Decisão no Fyness"
GANCHO: [Kaynan] "Meu sócio tem 35 anos." [Robert] "Meu sócio tem 19."
DESENVOLVIMENTO:
Kaynan: "Quando a gente discorda — e discorda muito —"
Robert: "Eu escuto o que ele tem a dizer sobre produto e tech."
Kaynan: "Eu escuto o que ele tem a dizer sobre mercado e cliente."
Robert: "No final, decidimos junto ou quem tem mais contexto decide."
Kaynan: "Nunca um manda no outro."
Robert: "Mas cada um tem autonomia total na sua área."
Kaynan: "Funciona porque a gente respeita o que o outro sabe que o outro não sabe."
Robert: "Esse é o Fyness. Dois perfis complementares. Um produto."
CTA: [Ambos] "Link na bio. [marca @fynessbr]"

🎬 REEL K22 — "100 Usuários no Trial — O Que Aprendemos"
GANCHO: "Chegamos a 100 usuários no trial. Aqui está o que aprendemos sobre o produto."

🎬 REEL K23 — "Resposta ao Comentário: 'Você É Jovem Demais pra Construir Isso'"
GANCHO: "Recebi esse comentário. Vou responder publicamente."

🎬 REEL K24 — "Por Que Escolhemos Ser um SaaS e Não um App"
GANCHO: "Não construímos um app. Essa decisão foi proposital. Aqui está o porquê."

🎬 REEL K25 — "6 Meses do Fyness — O Que Mudou, O Que Não Mudou"
GANCHO: "6 meses depois do lançamento. Atualização honesta."
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Perfil_Reels</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Reels_Stories</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 3 — STORIES DIÁRIOS (CADÊNCIA BUILD IN PUBLIC)
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Kaynan_Stories" name="Stories Diários — Build in Public Ao Vivo">
      <bpmn2:documentation>📱 STORIES KAYNAN — CADÊNCIA SEMANAL COMPLETA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILOSOFIA: Build in Public
→ Mostrar o processo real — não só os acertos.
→ Cada story é um tijolo na narrativa do "jovem fundador construindo um SaaS".
→ Quem acompanha stories diários vira fã — não só seguidor.
→ Frequência: 5-7 stories por dia. Kaynan grava espontâneo + Kauã programa.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 SEGUNDA-FEIRA — "Semana Começa Assim"
Story 1: Vídeo rápido (10s) — Kaynan mostrando o notebook ou a lista do dia.
  Texto: "Semana nova. Isso aqui na agenda hoje:"
Story 2: Lista das 3 prioridades da semana no produto.
Story 3: Enquete: "Você usa alguma ferramenta de gestão financeira?" [Sim] [Não]
OBJETIVO: Mostrar que está sempre trabalhando, nunca parado.

📅 TERÇA-FEIRA — "Bastidor de Desenvolvimento"
Story 1-2: Print ou vídeo de algo que está sendo construído/corrigido.
  Texto: "Trabalhando nisso hoje:"
Story 3: Vídeo explicando em 20s o que é aquilo (simplificado).
Story 4: Caixa de perguntas: "Pergunta sobre o produto ou sobre empreender. Respondo amanhã."
OBJETIVO: Transparência radical sobre o produto → constrói confiança.

📅 QUARTA-FEIRA — "Pergunta do Seguidor + @fynessbr"
Story 1-2: Kaynan responde 2-3 perguntas recebidas na terça. Vídeo curto, direto.
Story 3: Menção ao @fynessbr com algo novo: "Feature nova no Fyness essa semana:"
Story 4: [Link do trial do Fyness]
OBJETIVO: Engajamento real + construção do @fynessbr (toda quarta, sem falta).

📅 QUINTA-FEIRA — "Dado ou Aprendizado da Semana"
Story 1: Card com stat ou aprendizado da semana de produto.
  Exemplos:
  → "Métrica que mais acompanho: taxa de ativação — usuários que usam no dia 1"
  → "Hoje aprendi: usuário que usa o produto 3 vezes nos primeiros 7 dias tem 80% de chance de pagar"
  → "Benchmark de SaaS: taxa de conversão trial → pago acima de 20% é excelente"
Story 2: Kaynan comenta o dado em 15s.
OBJETIVO: Posicionar como alguém que aprende e compartilha em público.

📅 SEXTA-FEIRA — "Resultados da Semana (Transparência)"
Story 1: "Resultados dessa semana:" [números reais do produto quando possível]
  → Trials novos, usuários ativos, feature deployada, etc.
  → Se não tiver números públicos ainda: aprendizado mais importante da semana.
Story 2: "O que vai pra semana que vem:"
Story 3: Mais leve — pode mostrar saindo do escritório, academia, algo pessoal.
OBJETIVO: Transparência cria senso de acompanhamento. Seguidores sentem que estão junto.

📅 SÁBADO — "Mais Pessoal"
Story 1-2: Vida fora do Fyness (academia, amigos, hobby — sem exagerar).
Story 3: Repost do melhor Reel da semana (ampliar alcance).
OBJETIVO: Humanizar. Quem segue um fundador quer saber que ele é humano também.

📅 DOMINGO — "Reflexão Semanal"
Story 1: Reflexão rápida sobre o que aconteceu na semana.
Story 2: O que aprendi essa semana (1 frase, direct).
Story 3: Enquete ou caixa de perguntas preparando o conteúdo da semana seguinte.
OBJETIVO: Domingo é dia de maior engajamento para reflexão/motivação.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORIES ESPECIAIS (usar quando acontecer)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ "Novo usuário no trial!" — mostrar o ping/notificação (celebra cada um)
→ "Primeiro pagamento recebido" — marco histórico, mostrar a notificação (sem valor)
→ "Deploy de feature nova" — mostrar antes e depois
→ "Ligação com usuário" — bastidor de call com cliente (com permissão)
→ "Feedback positivo recebido" — repostar print (com permissão do usuário)
→ "Reunião com o Robert" — bastidor da dinâmica de sócios

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENGAJAMENTO ATIVO (Kaynan faz pessoalmente)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Responder TODOS os comentários dos primeiros 30 min após post.
→ Responder DMs diariamente — mesmo sendo uma frase.
→ Seguir ativamente pessoas que comentam (audiência pequena = oportunidade de conexão real).
→ Comentar em posts de outros criadores de conteúdo de startup/tech BR.
→ Marcar @fynessbr sempre que falar sobre o produto.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Reels_Stories</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Stories_Collab</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 4 — COLLAB ROBERT + KAYNAN (1x/mês) + CARROSSEL
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Kaynan_Colaboracao" name="Collab Robert + Carrosseis Mensais">
      <bpmn2:documentation>🤝 COLABORAÇÃO KAYNAN + CONTEÚDO EXTRA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COLLAB ROBERT + KAYNAN (1x por mês — PRIORITÁRIO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Gravar juntos 1 vez por mês. Mesma gravação, edição diferente pra cada perfil.
→ Publicar nos 3 perfis: @kaynan, @robert, @fynessbr
→ Cada publicação credita os outros dois — cross-follow máximo.

FORMATOS DE COLLAB (banco de ideias):

📌 Collab 1 — "19 vs 35: Quem Toma Decisão Melhor no Fyness?"
Kaynan: "Eu digo que é o dado. Sempre."
Robert: "Eu digo que é a experiência. Sempre."
[Discutem levemente]
Kaynan: "Okay, dado + experiência."
Robert: "Esse é o Fyness."
Duração: 30s. Tom: leve, divertido.

📌 Collab 2 — "O Que Aprendi com Meu Sócio Mais Velho/Jovem"
Robert: "Kaynan me ensinou a não se apegar a uma solução."
Kaynan: "Robert me ensinou a olhar pro cliente antes do produto."

📌 Collab 3 — "Provando o Fyness Ao Vivo — Robert e Kaynan"
[Ambos no escritório. Robert usa o Fyness como cliente. Kaynan mostra o que o sistema registra.]
Real time demo. Autenticidade máxima.

📌 Collab 4 — "O Maior Erro que Cometemos Juntos no Fyness"
Formato confessional. Ambos admitem um erro real do processo.
CTA: "Aprendemos. E o produto ficou melhor por causa disso."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CARROSSEIS KAYNAN (2x por mês)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: conteúdo denso que gera saves e atrai seguidores qualificados.

📌 Carrossel K1 — "Construí um SaaS com 19 Anos — Aqui Está o Que Aprendi"
Slide 1: "Construí um SaaS com 19 anos. Sem pausar para glamourizar."
Slide 2: "1. Valide antes de codificar. Cada linha sem validação é retrabalho."
Slide 3: "2. Encontre um sócio complementar. O que você não sabe é tão importante quanto o que você sabe."
Slide 4: "3. MVP = mínimo que resolve a dor #1. Não a dor #5."
Slide 5: "4. Distribuição não é pós-lançamento. É paralela ao produto."
Slide 6: "5. Build in public acelera. Transparência gera comunidade."
Slide 7: "6. O produto vai mudar. Foque no problema, não na solução."
Slide 8: "7. Feedback negativo é o dado mais valioso que existe."
Slide 9: "Está construindo algo? Vai lá. Vai errar. Vai aprender. Vai de novo."
Slide 10: "Segue @kaynan pra mais | Fyness: link na bio"

📌 Carrossel K2 — "Por Que Construímos Gestão Financeira no WhatsApp"
Slides: Jornada de decisão — o problema, as alternativas testadas, por que WhatsApp ganhou.
Conclui com demo do produto.

📌 Carrossel K3 — "7 Coisas Que Mudei no Produto Depois do Feedback dos Primeiros Usuários"
Slides: Cada mudança com before/after. Mostra humildade e capacidade de pivotar.

📌 Carrossel K4 — "Stack do Fyness Explicado pra Não-Técnicos"
Slides: Cada camada da stack com analogia simples. Acessível, educativo, posiciona como tech.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HASHTAGS KAYNAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reels: #buildinpublic #startupbrasil #empreendedorismo #saas #fyness #fundador #produtodigital #techbr #empreendedor #19anos
Carrosseis: #buildinpublic #startupbrasil #empreendedorismo #saas #lições #fundador #produtodigital
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Stories_Collab</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Collab_Ciclo</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ══════════════════════════════════════════════════════════════
         TIMER — CICLO DE OTIMIZAÇÃO SEMANAL
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:intermediateCatchEvent id="Timer_Kaynan_Semanal" name="Ciclo Semanal (P7D)">
      <bpmn2:incoming>Flow_Kaynan_Collab_Ciclo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Analise</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 5 — ANÁLISE SEMANAL
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_Kaynan_Analise" name="Análise Semanal de Métricas e Ajuste">
      <bpmn2:documentation>📊 ANÁLISE SEMANAL KAYNAN — MÉTRICAS E DECISÕES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUANDO: Toda segunda, manhã. Junto com o planejamento da semana.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MÉTRICAS PRINCIPAIS:
□ Seguidores novos da semana (meta mês 1: +100/semana)
□ Alcance dos Reels (meta: crescer toda semana)
□ Taxa de saves dos Reels (meta: acima de 3%)
□ Comentários dos Reels (meta: acima de 20 por Reel)
□ Respostas dos Stories (meta: acima de 5 por dia)
□ Visitas ao perfil da semana
□ Cliques no link da bio

MÉTRICAS DO @FYNESSBR:
□ Seguidores do @fynessbr ganhos com menções do Kaynan
□ Cliques no @fynessbr via stories do Kaynan

DECISÃO POR DADO:
→ Reel com menos de 500 views em 7 dias: gancho fraco. Testar variação.
→ Reel com mais de 5k views: replicar o formato, tema ou gancho.
→ Stories com mais de 50% de respostas: esse formato gera engajamento — continuar.
→ Carrossel com menos de 30 saves: slide 1 não convence — revisar título.

AJUSTE DE CONTEÚDO:
→ O que mais engajou essa semana? Fazer mais do mesmo.
→ O que menos engajou? Por quê? Gancho, tema, formato ou horário?
→ Qual Reel gerou mais seguidores novos? Esse é o conteúdo de aquisição.
→ Qual post gerou mais clique no link da bio? Esse é o conteúdo de conversão.

TEMPLATE DE ANÁLISE:
Semana: [data]
Reels: [títulos] | Melhor: [título] — [X] views, [Y] saves, [Z] comentários
Seguidores: [antes] → [depois] | Crescimento: [+X]
@fynessbr ganhou: [X] seguidores via Kaynan
Cliques na bio: [X]
O que replicar: [descrever]
O que mudar: [descrever]
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Analise</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Gateway_Cresc</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Kaynan_Crescimento" name="Crescimento no Ritmo?">
      <bpmn2:incoming>Flow_Kaynan_Gateway_Cresc</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Escalar</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Kaynan_Otimizar</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:task id="Task_Kaynan_Escalar" name="Escalar: Aumentar Frequência + Build in Public Mais Profundo">
      <bpmn2:documentation>🚀 ESCALAR — QUANDO O CRESCIMENTO ESTÁ NO RITMO

Sinal de escala:
→ +200 seguidores/semana consistentemente
→ Algum Reel passou de 20k views
→ DMs começam a vir espontaneamente sobre o produto

AÇÕES DE ESCALA:
1. Aumentar de 2 para 3 Reels/semana
2. Aumentar frequência de carrosseis para 3x/mês
3. Criar série temática: "Semanas do Build in Public" (7 dias mostrando 1 aspecto do produto)
4. Anúncio de Stories do Kaynan (R$200/mês no melhor Reel orgânico) → audiência lookalike
5. Colaboração com outros criadores de conteúdo de tech/startups BR:
   → Proposta de collab: "Vamos fazer uma live ou Reel sobre [tema]? Minha audiência vai curtir."
6. Thread/carrossel mensal: "Atualização do Fyness — mês X" (build in public estruturado)
7. Newsletter opcional: lista de emails com bastidores que não cabem no Instagram
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Escalar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Mensal</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Kaynan_Otimizar" name="Otimizar: Revisar Gancho, Autenticidade e Formato">
      <bpmn2:documentation>🔧 OTIMIZAR — QUANDO ABAIXO DO ESPERADO

DIAGNÓSTICO:

PROBLEMA: Reels com poucos views (menos de 300)
→ O gancho não está matando nos primeiros 2 segundos.
→ Teste: gravar o mesmo tema com 3 ganchos diferentes.
→ Ganchos que funcionam para o perfil Kaynan:
  • Revelar algo pessoal/vulnerável imediatamente
  • Mostrar bastidor de algo específico no produto
  • "Deixa eu te mostrar [X]" + demo imediata

PROBLEMA: Views ok mas sem seguidores novos
→ O conteúdo entretém mas não faz a pessoa querer mais.
→ Solução: CTA mais claro no final. "Segue aqui pra acompanhar a jornada."
→ Bio pode não estar convertendo — revisar.

PROBLEMA: Seguidores crescem mas sem engajamento
→ Audiência errada. Conteúdo está atraindo público que não é o ICP.
→ Rever temas: focar mais em empreendedorismo + produto do que em tech puro.

PROBLEMA: Crescimento parado depois de boa largada
→ Síndrome de "já vi esse perfil". Precisa renovar o conteúdo.
→ Testar novo formato: live, série, challenge, bastidor de processo diferente.
→ Buscar collab urgente com conta maior.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Otimizar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Mensal</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Kaynan_Mensal" name="Avaliação Mensal (P30D)">
      <bpmn2:incoming>Flow_Kaynan_Mensal</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Relatorio</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P30D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Kaynan_Relatorio" name="Relatório Mensal + Planejamento">
      <bpmn2:documentation>📋 RELATÓRIO MENSAL KAYNAN

CRESCIMENTO:
→ Seguidores: [início] → [fim] | Meta era [X] | Atingiu? [Sim/Não]
→ Melhor Reel do mês: [título] | [X] views | [Y] saves
→ @fynessbr cresceu: [X] seguidores via Kaynan esse mês
→ Cliques no link da bio: [X] | Trials gerados pelo Kaynan: [X] (via UTM)

BUILD IN PUBLIC:
→ Features mostradas nos bastidores: [listar]
→ Erros compartilhados publicamente: [listar]
→ Feedback recebido de seguidores sobre o produto: [resumo]

DECISÕES:
□ Manter frequência atual ou aumentar?
□ Colaborações agendadas pro próximo mês: [listar]
□ Novo tema ou série a explorar: [descrever]
□ Anúncio de Stories do Kaynan? [Sim/Não]
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Relatorio</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Gateway_LP</bpmn2:outgoing>
    </bpmn2:task>

    <!-- Gateway de saída: Lead Clicou na Bio? -->
    <bpmn2:exclusiveGateway id="Gateway_Kaynan_Engajou" name="Lead Clicou no Link da Bio?">
      <bpmn2:incoming>Flow_Kaynan_Gateway_LP</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Kaynan_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Kaynan_LP" name="→ Landing Page">
      <bpmn2:documentation>Lead clicou no link da bio do Kaynan → vai para a Landing Page do Fyness.
UTM: utm_source=instagram&amp;utm_medium=organic&amp;utm_campaign=kaynan_bio</bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_LP" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:endEvent id="End_Kaynan_Organico" name="Continua no Feed (Maturação)">
      <bpmn2:documentation>Lead ainda não converteu. Continua no feed.
→ Build in public cria fidelidade — seguidores do Kaynan são os mais engajados.
→ Quando estiver pronto, vai buscar o link espontaneamente.
→ Ou vai ver o produto via Robert, Meta Ads ou Google Ads e o Kaynan vai servir como prova social.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Nao</bpmn2:incoming>
    </bpmn2:endEvent>

    <!-- SEQUENCE FLOWS -->
    <bpmn2:sequenceFlow id="Flow_Kaynan_Setup_Perfil"    sourceRef="Start_Kaynan_Setup"         targetRef="Task_Kaynan_CriarPerfil" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Perfil_Reels"    sourceRef="Task_Kaynan_CriarPerfil"    targetRef="Task_Kaynan_Reels" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Reels_Stories"   sourceRef="Task_Kaynan_Reels"          targetRef="Task_Kaynan_Stories" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Stories_Collab"  sourceRef="Task_Kaynan_Stories"        targetRef="Task_Kaynan_Colaboracao" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Collab_Ciclo"    sourceRef="Task_Kaynan_Colaboracao"    targetRef="Timer_Kaynan_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Analise"         sourceRef="Timer_Kaynan_Semanal"       targetRef="Task_Kaynan_Analise" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Gateway_Cresc"   sourceRef="Task_Kaynan_Analise"        targetRef="Gateway_Kaynan_Crescimento" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Escalar"  name="No ritmo"      sourceRef="Gateway_Kaynan_Crescimento" targetRef="Task_Kaynan_Escalar" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Otimizar" name="Abaixo da meta" sourceRef="Gateway_Kaynan_Crescimento" targetRef="Task_Kaynan_Otimizar" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Mensal"          sourceRef="Task_Kaynan_Escalar"        targetRef="Timer_Kaynan_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Mensal2"         sourceRef="Task_Kaynan_Otimizar"       targetRef="Timer_Kaynan_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Relatorio"       sourceRef="Timer_Kaynan_Mensal"        targetRef="Task_Kaynan_Relatorio" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Gateway_LP"      sourceRef="Task_Kaynan_Relatorio"      targetRef="Gateway_Kaynan_Engajou" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Sim"  name="Sim" sourceRef="Gateway_Kaynan_Engajou"    targetRef="LinkThrow_Kaynan_LP" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Nao"  name="Não" sourceRef="Gateway_Kaynan_Engajou"    targetRef="End_Kaynan_Organico" />

  </bpmn2:process>

  <!-- ============================================================ -->
`;

const before = content.slice(0, startIdx);
const after  = content.slice(endIdx);

const newContent = before + KAYNAN_POOL + after;
writeFileSync(filePath, newContent, 'utf8');
console.log(`Done! ${newContent.length} chars, ${newContent.split('\n').length} lines`);

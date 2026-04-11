import { readFileSync, writeFileSync } from 'fs';

const f = 'c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js';
let c = readFileSync(f, 'utf8');

// ===================================================================
// FIX 1: Add participant for TikTok + YouTube Shorts in collaboration
// ===================================================================
const oldCollab = ` <bpmn2:participant id="Participant_LP" name=" LANDING PAGE — Jornada do Visitante" processRef="Process_LP" />`;
const newCollab = ` <bpmn2:participant id="Participant_LP" name=" LANDING PAGE — Jornada do Visitante" processRef="Process_LP" />
 <bpmn2:participant id="Participant_MultiPlat" name=" DISTRIBUICAO MULTI-PLATAFORMA — TikTok + YouTube Shorts (Kaua)" processRef="Process_MultiPlat" />`;

if (!c.includes(oldCollab)) { console.error('FIX 1 FAILED'); process.exit(1); }
c = c.replace(oldCollab, newCollab);
console.log('FIX 1: Participant MultiPlat added ✓');

// ===================================================================
// FIX 2: Add Process_MultiPlat (new pool)
// ===================================================================
const insertBefore = `  <!-- ============================================================ -->
  <!-- DIAGRAMA VISUAL — LAYOUT COMPLETO -->`;

const newPool = `  <!-- ============================================================ -->
  <!-- POOL 7: DISTRIBUICAO MULTI-PLATAFORMA — TikTok + YouTube Shorts -->
  <!-- ============================================================ -->
  <bpmn2:process id="Process_MultiPlat" isExecutable="false">

    <bpmn2:startEvent id="Start_Multi_Setup" name="Setup TikTok + YouTube">
      <bpmn2:documentation>SETUP DAS PLATAFORMAS — FAZER UMA VEZ

TIKTOK:
□ Criar conta TikTok Business: @fynessbr (ou @fyness)
□ Categoria: Servicos Financeiros / Tecnologia
□ Bio: "Controle o dinheiro do seu negocio pelo WhatsApp. 7 dias gratis (link na bio)"
□ Link na bio: LP com UTM utm_source=tiktok&amp;utm_medium=organic
□ Conectar ao Meta Business (se quiser rodar ads futuramente)

YOUTUBE:
□ Criar canal YouTube: "Fyness" ou "Fyness - Financeiro pelo WhatsApp"
□ Ativar YouTube Shorts (automatico pra videos verticais ate 60s)
□ Descricao do canal: foco em MEI/EPP, controle financeiro simples
□ Link na descricao: LP com UTM utm_source=youtube&amp;utm_medium=shorts
□ Thumbnail padrao: logo Fyness + titulo do video (Kaua cria template)

RESPONSAVEL: Kaua (setup e publicacao) | Kaynan (contas e acessos)

REGRA DE OURO:
→ NAO criar conteudo exclusivo pra TikTok ou YouTube
→ Todo Reel gravado pro Instagram sai AUTOMATICAMENTE nas 3 plataformas
→ Kaua posta o mesmo arquivo — so adapta legenda se necessario
→ Custo de producao extra: ZERO. Alcance extra: 3-5x</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Multi_Setup</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_Multi_Fluxo" name="Fluxo de Reaproveitamento — 1 Conteudo → 3 Plataformas">
      <bpmn2:documentation>FLUXO DE PUBLICACAO — KAUA EXECUTA

QUANDO ROBERT OU KAYNAN GRAVAM UM REEL:
1. Kaua recebe o video final editado
2. Posta no Instagram (prioridade — horario ideal: 19h)
3. Posta no TikTok (mesmo dia — horario ideal: 20h)
4. Posta no YouTube Shorts (mesmo dia ou dia seguinte)

ADAPTACOES POR PLATAFORMA:
INSTAGRAM: legenda longa, hashtags (#financeiro #mei #pequenoempreendedor), CTA "link na bio"
TIKTOK: legenda curta (max 150 char), hashtags de nicho (#tiktokbusiness #empreendedor #mei), som trending se possivel
YOUTUBE SHORTS: titulo otimizado pra busca (ex: "Como controlar caixa da padaria"), descricao com link, sem hashtag no titulo

FORMATOS QUE FUNCIONAM PRA MEI NO TIKTOK:
→ "Voce que tem [negocio], olha isso" — falar direto pro nicho
→ Antes/depois de tela (planilha bagunçada → painel Fyness limpo)
→ Demo em 15 segundos: manda audio → sistema lanca → painel atualiza
→ Dado chocante: "80% dos MEIs nao sabem o lucro real do proprio negocio"
→ Historinha real: "O Seu Carlos tem uma padaria e descobriu que..."

CARROSSEIS (so Instagram):
→ Carrossel NAO vai pro TikTok/YouTube
→ Mas o slide 1 pode virar Status do WhatsApp (print)

FREQUENCIA MINIMA:
→ 2 Reels de Robert/semana → 2 posts em cada plataforma = 6 publicacoes
→ 2 Reels de Kaynan/semana → 2 posts em cada plataforma = 6 publicacoes
→ TOTAL: 12 publicacoes/semana nas 3 plataformas (com apenas 4 gravacoes)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Multi_Setup</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Multi_Fluxo</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Multi_Calendario" name="Calendario de Publicacao Semanal">
      <bpmn2:documentation>CALENDARIO — KAUA PUBLICA NAS 3 PLATAFORMAS

SEGUNDA: Reel Robert → IG 19h | TikTok 20h | YouTube Shorts
TERCA: Stories Robert + Kaynan (so IG)
QUARTA: Reel Kaynan → IG 20h | TikTok 21h | YouTube Shorts
QUINTA: Reel Robert → IG 19h | TikTok 20h | YouTube Shorts (se tiver)
SEXTA: Reel Kaynan → IG 20h | TikTok 21h | YouTube Shorts (se tiver)
SABADO: Repost @fynessbr (so IG)
DOMINGO: Descanso ou stories leves

HORARIOS IDEAIS POR PLATAFORMA (MEI/EPP):
→ Instagram: 18h-20h (depois do expediente)
→ TikTok: 20h-22h (horario de lazer — scroll no sofa)
→ YouTube Shorts: qualquer horario (algoritmo distribui ao longo de dias/semanas)

YOUTUBE SHORTS — VANTAGEM UNICA:
→ Um Short pode gerar views por MESES depois de publicado
→ Instagram Reel morre em 48h. YouTube Short vive 6+ meses
→ Otimizar TITULO pro YouTube (funciona como busca):
  "Como controlar caixa da padaria pelo WhatsApp"
  "Dono de salao: voce sabe seu lucro real?"
  "Controle financeiro MEI em 10 segundos"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Multi_Fluxo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Multi_Ciclo</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Multi_Semanal" name="Ciclo Semanal (P7D)">
      <bpmn2:incoming>Flow_Multi_Ciclo</bpmn2:incoming>
      <bpmn2:incoming>Flow_Multi_Loop</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Multi_Analise</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Multi_Analise" name="Analise Semanal — Metricas por Plataforma">
      <bpmn2:documentation>ANALISE SEMANAL — MULTI-PLATAFORMA
Quando: toda segunda, junto com analise dos outros pools.
Responsavel: Kaynan + Kaua

COMPARATIVO SEMANAL:
□ PLATAFORMA | VIEWS TOTAL | MELHOR VIDEO | SEGUIDORES NOVOS | CLIQUES LINK
  Instagram    | ___         | ___          | ___              | ___
  TikTok       | ___         | ___          | ___              | ___
  YouTube      | ___         | ___          | ___              | ___
  TOTAL        | ___         | ___          | ___              | ___

PERGUNTAS CHAVE:
□ Qual plataforma teve mais views essa semana?
□ O MESMO video performou diferente em cada plataforma? Por que?
  (hook funciona melhor em TikTok? thumbnail faz diferença no YouTube?)
□ Cliques no link: qual plataforma trouxe mais trafego pra LP?
□ Trials via UTM: tiktok [X] | youtube [X] (comparar com instagram)

DECISOES:
→ Se TikTok tem 5x mais views que Instagram: aumentar prioridade TikTok
  (ex: postar la primeiro, adaptar formato pro que funciona la)
→ Se YouTube Short especifico continua gerando views apos 30 dias:
  criar mais conteudo com o mesmo formato/tema
→ Se uma plataforma tem views mas zero cliques: problema no CTA ou link na bio</bpmn2:documentation>
      <bpmn2:incoming>Flow_Multi_Analise</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Multi_Gateway</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Multi_Crescimento" name="Alcance Crescendo?">
      <bpmn2:incoming>Flow_Multi_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Multi_Escalar</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Multi_Otimizar</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:task id="Task_Multi_Escalar" name="Escalar: Aumentar Frequencia na Plataforma Vencedora">
      <bpmn2:documentation>ESCALAR — PLATAFORMA COM MELHOR PERFORMANCE

QUANDO ESCALAR:
→ Uma plataforma tem consistentemente 3x mais views que as outras
→ Cliques no link crescendo semana a semana
→ Trials via UTM dessa plataforma aparecendo

ACOES:
→ Aumentar frequencia na plataforma vencedora (ex: 3 videos/semana la ao inves de 2)
→ Adaptar formato especifico: se TikTok vence, criar versao otimizada pra TikTok
  (cortes mais rapidos, som trending, texto na tela maior)
→ Testar TikTok Ads (boost de video organico — R$50-100 pelo melhor video da semana)
→ Testar YouTube Ads (Shorts ads — formato novo, CPV barato)
→ Manter as outras plataformas no minimo (2 videos/semana) — nao abandonar</bpmn2:documentation>
      <bpmn2:incoming>Flow_Multi_Escalar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Multi_Loop_Esc</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Multi_Otimizar" name="Otimizar: Diagnostico por Plataforma">
      <bpmn2:documentation>OTIMIZAR — VIEWS OU CLIQUES BAIXOS

DIAGNOSTICO TIKTOK:
→ Views abaixo de 500 em 48h: gancho fraco. TikTok e mais agressivo — precisa prender em 1 segundo.
  Testar: texto grande na tela no primeiro frame + fala direta
→ Views ok mas sem seguidores: falta CTA verbal no final. "Segue pra mais dicas pro seu negocio."
→ Video removido ou shadowban: checar se tem musica com copyright ou termo sensivel

DIAGNOSTICO YOUTUBE SHORTS:
→ Views abaixo de 200 em 7 dias: titulo fraco. YouTube Shorts depende de titulo otimizado pra busca.
  Testar: "Como [acao] [tipo de negocio]" (ex: "Como controlar caixa da padaria")
→ Views altos mas CTR de link baixo: descricao nao tem link visivel ou CTA fraco

DIAGNOSTICO GERAL:
→ Mesmo video funciona em 1 plataforma e nao em outra: normal. Cada algoritmo prioriza coisas diferentes.
→ Nenhuma plataforma funcionando: problema no CONTEUDO, nao na distribuicao.
  Voltar pros pools Robert/Kaynan e revisar ganchos e temas.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Multi_Otimizar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Multi_Loop_Oti</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Multi_LP" name="→ Landing Page">
      <bpmn2:documentation>Trafego organico de TikTok e YouTube chega na LP via link na bio/descricao.
UTMs:
→ TikTok: utm_source=tiktok&amp;utm_medium=organic&amp;utm_campaign=reels
→ YouTube: utm_source=youtube&amp;utm_medium=shorts&amp;utm_campaign=reels</bpmn2:documentation>
      <bpmn2:incoming>Flow_Multi_LP</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_LP" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:sequenceFlow id="Flow_Multi_Setup" sourceRef="Start_Multi_Setup" targetRef="Task_Multi_Fluxo" />
    <bpmn2:sequenceFlow id="Flow_Multi_Fluxo" sourceRef="Task_Multi_Fluxo" targetRef="Task_Multi_Calendario" />
    <bpmn2:sequenceFlow id="Flow_Multi_Ciclo" sourceRef="Task_Multi_Calendario" targetRef="Timer_Multi_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Multi_Analise" sourceRef="Timer_Multi_Semanal" targetRef="Task_Multi_Analise" />
    <bpmn2:sequenceFlow id="Flow_Multi_Gateway" sourceRef="Task_Multi_Analise" targetRef="Gateway_Multi_Crescimento" />
    <bpmn2:sequenceFlow id="Flow_Multi_Escalar" name="Sim" sourceRef="Gateway_Multi_Crescimento" targetRef="Task_Multi_Escalar" />
    <bpmn2:sequenceFlow id="Flow_Multi_Otimizar" name="Nao" sourceRef="Gateway_Multi_Crescimento" targetRef="Task_Multi_Otimizar" />
    <bpmn2:sequenceFlow id="Flow_Multi_Loop_Esc" sourceRef="Task_Multi_Escalar" targetRef="LinkThrow_Multi_LP" />
    <bpmn2:sequenceFlow id="Flow_Multi_Loop_Oti" sourceRef="Task_Multi_Otimizar" targetRef="LinkThrow_Multi_LP" />
    <bpmn2:sequenceFlow id="Flow_Multi_LP" sourceRef="Task_Multi_Analise" targetRef="LinkThrow_Multi_LP" />

  </bpmn2:process>

`;

if (!c.includes(insertBefore)) { console.error('FIX 2 FAILED'); process.exit(1); }
c = c.replace(insertBefore, newPool + '  ' + insertBefore);
console.log('FIX 2: Pool MultiPlat (TikTok + YouTube Shorts) added ✓');

// Fix: Task_Multi_Analise has 2 outgoings (gateway + LP). LP should come from escalar/otimizar.
// Actually let me fix the flows - LP link should come after the loop
c = c.replace(
  `    <bpmn2:sequenceFlow id="Flow_Multi_Loop_Esc" sourceRef="Task_Multi_Escalar" targetRef="LinkThrow_Multi_LP" />
    <bpmn2:sequenceFlow id="Flow_Multi_Loop_Oti" sourceRef="Task_Multi_Otimizar" targetRef="LinkThrow_Multi_LP" />
    <bpmn2:sequenceFlow id="Flow_Multi_LP" sourceRef="Task_Multi_Analise" targetRef="LinkThrow_Multi_LP" />`,
  `    <bpmn2:sequenceFlow id="Flow_Multi_Loop_Esc" sourceRef="Task_Multi_Escalar" targetRef="Timer_Multi_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Multi_Loop_Oti" sourceRef="Task_Multi_Otimizar" targetRef="Timer_Multi_Semanal" />`
);
// Remove the extra outgoing from Task_Multi_Analise
c = c.replace(
  `      <bpmn2:outgoing>Flow_Multi_Gateway</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway`,
  `      <bpmn2:outgoing>Flow_Multi_Gateway</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Multi_LP_Link</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway`
);
// Add flow for LP link from analise
c = c.replace(
  `    <bpmn2:sequenceFlow id="Flow_Multi_Loop_Oti" sourceRef="Task_Multi_Otimizar" targetRef="Timer_Multi_Semanal" />`,
  `    <bpmn2:sequenceFlow id="Flow_Multi_Loop_Oti" sourceRef="Task_Multi_Otimizar" targetRef="Timer_Multi_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Multi_LP_Link" sourceRef="Task_Multi_Analise" targetRef="LinkThrow_Multi_LP" />`
);
// Fix LinkThrow incoming
c = c.replace(
  `      <bpmn2:incoming>Flow_Multi_LP</bpmn2:incoming>`,
  `      <bpmn2:incoming>Flow_Multi_LP_Link</bpmn2:incoming>`
);
console.log('FIX 2b: Flows fixed ✓');

// ===================================================================
// FIX 3: Adjust Robert's tone/bio for MEI/EPP
// ===================================================================
const oldRobertBio = `BIO:
"Especialista em gestao financeira empresarial
Ajudo empresarios a pararem de trabalhar no escuro
Co-fundador @fynessbr | 7 dias gratis (link abaixo)"`;

const newRobertBio = `PUBLICO-ALVO: MEI e EPP — dono de padaria, salao, loja, oficina, food truck, hotfruit.
NAO e empresario corporativo. E o Seu Ze que trabalha 12h por dia e nao sabe pra onde vai o dinheiro.

BIO:
"Ajudo donos de negocio a pararem de perder dinheiro sem perceber
Padaria, salao, loja, oficina — se tem caixa, eu ajudo a controlar
Co-fundador @fynessbr | 7 dias gratis (link abaixo)"`;

if (!c.includes(oldRobertBio)) { console.error('FIX 3 FAILED: Robert bio not found'); process.exit(1); }
c = c.replace(oldRobertBio, newRobertBio);

// Update Robert's hook examples
const oldRobertHooks = `EXEMPLOS DE ABERTURA QUE FUNCIONAM PARA O ROBERT:
- "Voce sabe quanto seu negocio lucrou esse mes? Nao? Problema."
- "Conheco empresarios que faturam R$50k por mes e nao tem R$5k na conta."
- "Planilha nao e controle financeiro. E ilusao de controle."
- "Todo negocio que fechou achava que estava indo bem."
- Dado + pergunta direta: numero chocante nos 3 primeiros segundos, pergunta que forca o seguidor a se posicionar.`;

const newRobertHooks = `EXEMPLOS DE ABERTURA QUE FUNCIONAM PARA O ROBERT (falar pro MEI):
- "Voce que tem padaria: sabe quanto lucrou esse mes? Se demorou pra responder, problema."
- "Conheco dono de salao que fatura R$15 mil e no fim do mes nao tem R$2 mil na conta."
- "Dono de loja: voce controla seu caixa no caderninho? Isso nao e controle. E ilusao."
- "O Seu Carlos tem uma padaria. Vendia 300 paes por dia e PERDIA dinheiro em 40 deles. Sabe como descobriu?"
- "Voce que tem oficina, food truck, loja de roupa — se nao sabe seu lucro real, a gente precisa conversar."
- Dado + pergunta direta com exemplo de negocio real (padaria, salao, oficina). Nunca falar "empresa" ou "empresarial" — falar "seu negocio".`;

if (!c.includes(oldRobertHooks)) { console.error('FIX 3b FAILED: Robert hooks not found'); process.exit(1); }
c = c.replace(oldRobertHooks, newRobertHooks);
console.log('FIX 3: Robert tone adjusted for MEI/EPP ✓');

// ===================================================================
// FIX 4: Adjust Kaynan's tone/bio for MEI/EPP
// ===================================================================
const oldKaynanBio = `BIO:
"19 anos | Co-fundador @fynessbr
Construindo um SaaS brasileiro ao vivo
Bastidores, erros e tudo mais (link abaixo)"`;

const newKaynanBio = `PUBLICO-ALVO: MEI e EPP. Kaynan fala com o dono de negocio pequeno que nao entende de tecnologia.
A linguagem e simples. "SaaS" nao existe no vocabulario do Seu Ze — falar "sistema", "app", "ferramenta".

BIO:
"19 anos | Co-fundador @fynessbr
Construindo um sistema pra donos de negocio controlarem tudo pelo WhatsApp
Bastidores, erros e tudo mais (link abaixo)"`;

if (!c.includes(oldKaynanBio)) { console.error('FIX 4 FAILED: Kaynan bio not found'); process.exit(1); }
c = c.replace(oldKaynanBio, newKaynanBio);

// Update Kaynan's hook examples
const oldKaynanHooks = `EXEMPLOS DE ABERTURA QUE FUNCIONAM PARA O KAYNAN:
- "As 2h da manha encontrei um bug critico no dia anterior ao lancamento. Aqui esta o que aconteceu."
- "Quase desisti do Fyness. Vou ser honesto sobre o que aconteceu."
- "Tenho 19 anos e co-fundei um SaaS. Nao vou enfeitar o que foi isso."
- "Deixa eu te mostrar o que fiz essa semana que mudou a direcao do produto."
- Revelacao imediata: situacao real, sem introducao, direto ao ponto.`;

const newKaynanHooks = `EXEMPLOS DE ABERTURA QUE FUNCIONAM PARA O KAYNAN (MEI entende):
- "Tenho 19 anos e construi um sistema pra donos de negocio controlarem o dinheiro pelo WhatsApp."
- "O Seu Carlos manda um audio: 'paguei R$800 de aluguel'. Pronto. O sistema ja lancou. Olha isso."
- "Quase desisti de tudo. Vou ser honesto sobre o que aconteceu."
- "Deixa eu te mostrar o que a Dona Maria faz pra controlar a loja dela em 10 segundos."
- "Voce que tem negocio e controla tudo na memoria — olha o que eu construi pra resolver isso."
- Demo ao vivo vale TUDO: mostrar o WhatsApp, mandar audio, sistema lancar. MEI entende visual, nao texto.`;

if (!c.includes(oldKaynanHooks)) { console.error('FIX 4b FAILED: Kaynan hooks not found'); process.exit(1); }
c = c.replace(oldKaynanHooks, newKaynanHooks);
console.log('FIX 4: Kaynan tone adjusted for MEI/EPP ✓');

// ===================================================================
// FIX 5: Adjust Meta Ads targeting for MEI/EPP
// ===================================================================
const oldMetaTarget = `PÚBLICO FRIO (Campanha Consciência):
→ Interesses: Empreendedorismo, Gestão Empresarial, Finanças Empresariais,
 Pequenas e Médias Empresas, Contabilidade, Fluxo de Caixa
→ Concorrentes: Nibo, Conta Azul, Omie (alcança quem já pesquisou)
→ Comportamento: Proprietários de pequenas empresas, Tomadores de decisão
→ Faixa etária: 25–55 anos | Localização: Brasil
→ Excluir: quem já é cliente, quem já iniciou Trial`;

const newMetaTarget = `PÚBLICO FRIO (Campanha Consciência) — FOCO MEI/EPP:
→ Interesses PRIMARIOS (nicho MEI):
  Microempreendedor Individual (MEI), Empreendedorismo,
  Pequenos Negocios, Comercio Local, Gestao de Negocios,
  Sebrae, Simples Nacional, MEI Facil
→ Interesses SECUNDARIOS (setores do publico-alvo):
  Padaria, Salao de Beleza, Barbearia, Food Truck, Loja de Roupas,
  Oficina Mecanica, Restaurante, Acai, Hamburgueria, Pet Shop
→ Concorrentes: Nibo, Conta Azul, Omie (alcanca quem ja pesquisou)
→ Comportamento: Proprietarios de pequenos negocios, Administradores de paginas comerciais
→ Faixa etaria: 25-55 anos | Localizacao: Brasil (refinar por estado apos dados)
→ Excluir: quem ja e cliente, quem ja iniciou Trial
→ IMPORTANTE: NAO segmentar por "Gestao Empresarial" ou "Financas Empresariais" —
  MEI nao se identifica com esses termos. Usar "Pequenos Negocios" e setores especificos.`;

if (!c.includes(oldMetaTarget)) { console.error('FIX 5 FAILED: Meta target not found'); process.exit(1); }
c = c.replace(oldMetaTarget, newMetaTarget);
console.log('FIX 5: Meta Ads targeting adjusted for MEI/EPP ✓');

// ===================================================================
// FIX 6: Adjust Google Ads keywords for MEI/EPP
// ===================================================================
const oldGoogleKW = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRUPO 1: GESTÃO FINANCEIRA (principal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Correspondência Frase] — aparece em buscas que contenham a frase:
"software gestão financeira"
"sistema financeiro empresa"
"controle financeiro empresarial"
"controle financeiro pequena empresa"
"gestão financeira para empresas"
"fluxo de caixa automatico"
"sistema de fluxo de caixa"
"como controlar financeiro da empresa"
"organizar financeiro empresa"
"substituir planilha financeira"
"gestão financeira whatsapp"
"lançamento financeiro whatsapp"
"dre automatico empresa"
"relatorio financeiro automatico"

[Correspondência Exata] — aparece SOMENTE nessa busca:
[software gestão financeira empresas]
[controle financeiro empresa pequena]
[sistema financeiro para pequenas empresas]
[fyness]
[fyness financeiro]`;

const newGoogleKW = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRUPO 1: CONTROLE FINANCEIRO MEI/EPP (principal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Correspondência Frase] — aparece em buscas que contenham a frase:

TERMOS QUE MEI PESQUISA (linguagem real):
"como controlar o caixa do meu negocio"
"controlar dinheiro da minha loja"
"controle financeiro pelo whatsapp"
"organizar financeiro do meu negocio"
"como saber se meu negocio da lucro"
"controle de caixa simples"
"sistema financeiro simples"
"sistema financeiro barato"
"controle financeiro MEI"
"gestao financeira MEI"
"fluxo de caixa MEI"
"fluxo de caixa automatico"
"controle financeiro pequeno negocio"
"controle financeiro padaria"
"controle financeiro salao"
"controle financeiro loja"

TERMOS TECNICOS (volume menor, intencao alta):
"software gestao financeira"
"sistema financeiro empresa"
"gestao financeira whatsapp"
"lancamento financeiro whatsapp"
"dre automatico"
"relatorio financeiro automatico"
"substituir planilha financeira"

[Correspondência Exata] — aparece SOMENTE nessa busca:
[controle financeiro mei]
[controle de caixa pelo whatsapp]
[sistema financeiro para pequenos negocios]
[como controlar caixa da padaria]
[como organizar financeiro do meu negocio]
[fyness]
[fyness financeiro]`;

if (!c.includes(oldGoogleKW)) { console.error('FIX 6 FAILED: Google KW not found'); process.exit(1); }
c = c.replace(oldGoogleKW, newGoogleKW);
console.log('FIX 6: Google Ads keywords adjusted for MEI/EPP ✓');

// ===================================================================
// FIX 7: Add diagram elements for Pool 7 (MultiPlat)
// ===================================================================
// Move annotations down to make room for new pool
c = c.replace(
  `    <!-- ANOTACAO: IN MARKETING -->
    <bpmndi:BPMNShape id="Annotation_InMarketing_di" bpmnElement="Annotation_InMarketing">
      <dc:Bounds x="180" y="2900" width="400" height="230" />
    </bpmndi:BPMNShape>

    <!-- ANOTACAO: CAC MAXIMO -->
    <bpmndi:BPMNShape id="Annotation_CAC_di" bpmnElement="Annotation_CAC">
      <dc:Bounds x="620" y="2900" width="400" height="250" />
    </bpmndi:BPMNShape>`,
  `    <!-- ANOTACAO: IN MARKETING -->
    <bpmndi:BPMNShape id="Annotation_InMarketing_di" bpmnElement="Annotation_InMarketing">
      <dc:Bounds x="180" y="3320" width="400" height="230" />
    </bpmndi:BPMNShape>

    <!-- ANOTACAO: CAC MAXIMO -->
    <bpmndi:BPMNShape id="Annotation_CAC_di" bpmnElement="Annotation_CAC">
      <dc:Bounds x="620" y="3320" width="400" height="250" />
    </bpmndi:BPMNShape>`
);

// Add new pool shapes before the closing tags
const diagramEnd = `    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>`;

const poolDiagram = `    <!-- POOL 7: DISTRIBUICAO MULTI-PLATAFORMA -->
    <bpmndi:BPMNShape id="Participant_MultiPlat_di" bpmnElement="Participant_MultiPlat" isHorizontal="true">
      <dc:Bounds x="160" y="2880" width="1800" height="400" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Start_Multi_Setup_di" bpmnElement="Start_Multi_Setup">
      <dc:Bounds x="300" y="3062" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="278" y="3110" width="84" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Multi_Fluxo_di" bpmnElement="Task_Multi_Fluxo">
      <dc:Bounds x="370" y="3040" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Multi_Calendario_di" bpmnElement="Task_Multi_Calendario">
      <dc:Bounds x="550" y="3040" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Timer_Multi_Semanal_di" bpmnElement="Timer_Multi_Semanal">
      <dc:Bounds x="730" y="3062" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="708" y="3110" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Multi_Analise_di" bpmnElement="Task_Multi_Analise">
      <dc:Bounds x="800" y="3040" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_Multi_Crescimento_di" bpmnElement="Gateway_Multi_Crescimento" isMarkerVisible="true">
      <dc:Bounds x="980" y="3055" width="50" height="50" />
      <bpmndi:BPMNLabel><dc:Bounds x="960" y="3025" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Multi_Escalar_di" bpmnElement="Task_Multi_Escalar">
      <dc:Bounds x="1070" y="2960" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Multi_Otimizar_di" bpmnElement="Task_Multi_Otimizar">
      <dc:Bounds x="1070" y="3120" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="LinkThrow_Multi_LP_di" bpmnElement="LinkThrow_Multi_LP">
      <dc:Bounds x="1260" y="3062" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1238" y="3110" width="80" height="14" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="Flow_Multi_Setup_di" bpmnElement="Flow_Multi_Setup"><di:waypoint x="336" y="3080" /><di:waypoint x="370" y="3080" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Fluxo_di" bpmnElement="Flow_Multi_Fluxo"><di:waypoint x="510" y="3080" /><di:waypoint x="550" y="3080" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Ciclo_di" bpmnElement="Flow_Multi_Ciclo"><di:waypoint x="690" y="3080" /><di:waypoint x="730" y="3080" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Analise_di" bpmnElement="Flow_Multi_Analise"><di:waypoint x="766" y="3080" /><di:waypoint x="800" y="3080" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Gateway_di" bpmnElement="Flow_Multi_Gateway"><di:waypoint x="940" y="3080" /><di:waypoint x="980" y="3080" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Escalar_di" bpmnElement="Flow_Multi_Escalar"><di:waypoint x="1030" y="3080" /><di:waypoint x="1070" y="3000" /><bpmndi:BPMNLabel><dc:Bounds x="1040" y="3040" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Otimizar_di" bpmnElement="Flow_Multi_Otimizar"><di:waypoint x="1030" y="3080" /><di:waypoint x="1070" y="3160" /><bpmndi:BPMNLabel><dc:Bounds x="1040" y="3120" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Loop_Esc_di" bpmnElement="Flow_Multi_Loop_Esc"><di:waypoint x="1140" y="2960" /><di:waypoint x="748" y="2960" /><di:waypoint x="748" y="3062" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Loop_Oti_di" bpmnElement="Flow_Multi_Loop_Oti"><di:waypoint x="1140" y="3200" /><di:waypoint x="748" y="3200" /><di:waypoint x="748" y="3098" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_LP_Link_di" bpmnElement="Flow_Multi_LP_Link"><di:waypoint x="940" y="3060" /><di:waypoint x="940" y="3030" /><di:waypoint x="1260" y="3030" /><di:waypoint x="1260" y="3062" /></bpmndi:BPMNEdge>

`;

if (!c.includes(diagramEnd)) { console.error('FIX 7 FAILED: diagram end not found'); process.exit(1); }
c = c.replace(diagramEnd, poolDiagram + '    ' + diagramEnd);
console.log('FIX 7: Pool 7 diagram elements added ✓');

// ===================================================================
// Update header comment
// ===================================================================
c = c.replace(
  '* Pools: META ADS | GOOGLE ADS | ROBERT (Autoridade) | KAYNAN (Proximidade)',
  '* Pools: META ADS | GOOGLE ADS | ROBERT (Autoridade) | KAYNAN (Proximidade) | TIKTOK+YOUTUBE'
);
c = c.replace(
  '* FYNESS INSTITUCIONAL | LANDING PAGE',
  '* FYNESS INSTITUCIONAL | LANDING PAGE | DISTRIBUICAO MULTI-PLATAFORMA'
);
console.log('FIX 8: Header updated ✓');

// ===================================================================
// WRITE
// ===================================================================
writeFileSync(f, c, 'utf8');
console.log('\nAll fixes applied. File saved.');
console.log('Total lines:', c.split('\n').length);

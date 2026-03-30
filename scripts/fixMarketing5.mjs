import { readFileSync, writeFileSync } from 'fs';

const f = 'c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js';
let c = readFileSync(f, 'utf8');

// =====================================================================
// FIX 1: Update header comment
// =====================================================================
c = c.replace(
  `* Pools: META ADS | GOOGLE ADS | ROBERT (Autoridade) | KAYNAN (Proximidade) | TIKTOK+YOUTUBE
 * FYNESS INSTITUCIONAL | LANDING PAGE | DISTRIBUICAO MULTI-PLATAFORMA`,
  `* Pools: META ADS | GOOGLE ADS | ROBERT (IG+TikTok) | KAYNAN (IG+TikTok) | TIKTOK+YOUTUBE
 * FYNESS INSTITUCIONAL (IG+TikTok) | LANDING PAGE | YOUTUBE — Canal Unico Fyness`
);
console.log('FIX 1: Header updated');

// =====================================================================
// FIX 2: Update Pool 7 participant name
// =====================================================================
c = c.replace(
  `<bpmn2:participant id="Participant_MultiPlat" name=" DISTRIBUICAO MULTI-PLATAFORMA — TikTok + YouTube Shorts (Kaua)" processRef="Process_MultiPlat" />`,
  `<bpmn2:participant id="Participant_MultiPlat" name=" YOUTUBE — Canal Unico Fyness (Robert + Kaynan + Kaua)" processRef="Process_MultiPlat" />`
);
console.log('FIX 2: Pool 7 renamed to YouTube');

// =====================================================================
// FIX 3: Add TikTok strategy to Robert's Setup documentation
// =====================================================================
const robertSetupEnd = `LINK NA BIO: Pagina de trial do Fyness (UTM: utm_campaign=robert_bio)
FOTO: Profissional, terno ou camisa social, expressao seria e confiante
DESTAQUES: Dicas | Perguntas | Fyness | Resultados | Sobre mim`;

const robertSetupNew = `LINK NA BIO: Pagina de trial do Fyness (UTM: utm_campaign=robert_bio)
FOTO: Profissional, terno ou camisa social, expressao seria e confiante
DESTAQUES: Dicas | Perguntas | Fyness | Resultados | Sobre mim

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIKTOK — @robert_fyness
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJETIVO: Alcance massivo — viralizar pra atingir donos de negocio que NAO estao procurando solucao (topo de funil)

POR QUE FUNCIONA:
TikTok distribui por INTERESSE, nao por seguidores. Um video com 0 seguidores pode ter 500k views
se o hook for bom. 35% dos usuarios do TikTok no Brasil tem 25-44 anos (DataReportal 2024).
Dono de negocio pequeno consome TikTok a noite depois de fechar a loja.
Ele nao esta procurando sistema de gestao — mas quando ve video que descreve a dor dele, para e assiste.

BIO TIKTOK: "Ajudo donos de negocio a pararem de perder dinheiro | Co-fundador @fynessbr | Teste gratis ↓"
LINK: LP com UTM utm_source=tiktok&utm_medium=bio&utm_campaign=robert

CONTEUDO PRINCIPAL (70%): HOOK + HISTORIA
Estrutura: 0-2s Hook (texto grande + fala) → 2-15s Problema → 15-40s Virada → 40-60s Resultado
Hooks: Pergunta direta | Numero chocante | Provocacao | Historia | Contraintuitivo
SEMPRE texto grande na tela (40% assistem sem som)

CONTEUDO SECUNDARIO (20%): NUMERO CHOCANTE
"R$2.400 perdidos em um mes." — numeros especificos interrompem o scroll

CONTEUDO TERCIARIO (10%): REACT/DUETO
Dueto com videos de "guru" ou Sebrae — adicionar perspectiva real

FREQUENCIA: 1-2 videos/dia nos primeiros 2 meses (volume > perfeicao)
REGRA: grava 5 em 1h, posta 1/dia. Algoritmo testa cada video independentemente.

METAS TIKTOK:
Mes 1-2: 0 → 1.000 seguidores | 2-3 videos com 10k+ views
Mes 3-6: 1.000 → 10.000 | 1-2 videos/mes com 50k+
Mes 7-12: 10.000 → 50.000+ | leads organicos toda semana

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUTUBE — Aparece no Canal @fynessbr
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Robert e o apresentador PRINCIPAL do canal YouTube da Fyness.

SHORTS: Repost do TikTok com titulo SEO (3-5/semana, custo zero)
LONGFORM: 1 video/semana de 8-15 minutos

CATEGORIAS LONGFORM:
1. TUTORIAL PRATICO (40%): "Como calcular preco de venda", "Fluxo de caixa simples"
   POR QUE: resolve busca ativa, 5.000-20.000 buscas/mes, lead qualificado
2. CASO REAL (30%): historias de clientes com numeros reais
   POR QUE: prova social em video = mais poderosa. Converte fundo de funil.
3. ERRO COMUM (30%): "5 erros financeiros que quebram seu negocio"
   POR QUE: formato com maior CTR no YouTube (vidIQ)

ESTRUTURA: 0-30s Hook → 30s-1:30 Contexto → 1:30-8:00 Conteudo → 8-9:00 Resumo → 9-9:30 CTA
SEO: keyword no inicio do titulo + descricao com timestamps + thumbnail com rosto + texto curto`;

if (!c.includes(robertSetupEnd)) { console.error('FIX 3 FAILED: Robert setup end not found'); process.exit(1); }
c = c.replace(robertSetupEnd, robertSetupNew);
console.log('FIX 3: Robert TikTok + YouTube strategy added');

// =====================================================================
// FIX 4: Add TikTok to Robert's Calendario
// =====================================================================
const robertCalEnd = `DOMINGO — Story de reflexao + caixa de perguntas
Tipo: pergunta para a audiencia sobre dor financeira. Alimenta pauta da proxima semana.
Exemplo: "Qual e sua maior dificuldade financeira no negocio agora? Manda aqui."`;

const robertCalNew = `DOMINGO — Story de reflexao + caixa de perguntas
Tipo: pergunta para a audiencia sobre dor financeira. Alimenta pauta da proxima semana.
Exemplo: "Qual e sua maior dificuldade financeira no negocio agora? Manda aqui."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIKTOK — CALENDARIO ROBERT (diario)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGUNDA: Video hook+historia (grava na sessao de segunda junto com IG)
TERCA: Video numero chocante ou dica rapida
QUARTA: React/Dueto de conteudo financeiro (baixo custo de producao)
QUINTA: Video hook+historia (segundo tema da semana)
SEXTA: Resposta a comentario com video (engajamento em cascata)
SABADO: Trend adaptada pro nicho (se tiver trend relevante)
DOMINGO: Opcional — repost do melhor da semana ou descanso

HORARIOS: 20h-22h (dono de negocio no sofa depois de fechar)
REGRA: Texto grande na tela SEMPRE. 40% assiste sem som.
PRODUCAO: Robert grava 4-5 videos de uma vez (30-60min). Kaua edita e agenda.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUTUBE — CALENDARIO ROBERT (semanal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHORTS: Kaua reposta os melhores TikToks com titulo SEO (3-5/semana)
LONGFORM: 1 video/semana (publicar quinta-feira 18h)
Robert grava longform 1x/semana (40-60min de gravacao bruta → Kaua edita pra 8-15min)`;

if (!c.includes(robertCalEnd)) { console.error('FIX 4 FAILED'); process.exit(1); }
c = c.replace(robertCalEnd, robertCalNew);
console.log('FIX 4: Robert TikTok + YouTube calendario added');

// =====================================================================
// FIX 5: Add TikTok to Robert's Crescimento
// =====================================================================
const robertCrescEnd = `QUANDO ESCALAR (a partir do mes 3):
- Passar de 2 para 3 Reels por semana.
- Criar lead magnet (PDF "7 relatorios financeiros essenciais") para captura de email.
- Testar anuncio de Stories com o melhor Reel organico (R$300/mes).`;

const robertCrescNew = `QUANDO ESCALAR (a partir do mes 3):
- Passar de 2 para 3 Reels por semana.
- Criar lead magnet (PDF "7 relatorios financeiros essenciais") para captura de email.
- Testar anuncio de Stories com o melhor Reel organico (R$300/mes).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRESCIMENTO TIKTOK — ROBERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TATICAS:
1. TREND JACKING: usar audios/trends virais adaptados pro nicho
   POR QUE: pega carona no algoritmo. So usar se fizer sentido pro conteudo.
2. RESPONDER COMENTARIOS COM VIDEO: cada comentario bom = video novo
   POR QUE: gera engajamento em cascata, algoritmo distribui o video-resposta
3. SERIES COM GANCHO: "Parte 1, 2, 3" — forca follow pra ver proximo
   POR QUE: aumenta follow rate e watch time
4. DUETOS COM CONTEUDO DO NICHO: 2-3x/semana
   POR QUE: alcanca audiencia do video original sem precisar da propria base

CRESCIMENTO YOUTUBE — ROBERT
TATICAS:
1. SHORTS → LONGFORM FUNIL: no final do Short, "video completo no canal"
2. PLAYLISTS: "Gestao Financeira pra Iniciante", "Casos Reais", "Erros Comuns"
3. END SCREEN + CARDS: todo video tem end screen pro proximo + 3 cards
4. SEO AGRESSIVO: titulo com keyword, descricao com timestamps, tags
   Keywords alvo: "gestao financeira pequeno negocio", "como calcular lucro",
   "fluxo de caixa simples", "como precificar produto"`;

if (!c.includes(robertCrescEnd)) { console.error('FIX 5 FAILED'); process.exit(1); }
c = c.replace(robertCrescEnd, robertCrescNew);
console.log('FIX 5: Robert TikTok + YouTube crescimento added');

// =====================================================================
// FIX 6: Add TikTok to Robert's Analise
// =====================================================================
const robertAnaliseEnd = `DECISAO:
- O que mais engajou? Fazer mais do mesmo na proxima semana.
- O que nao engajou? Trocar o gancho, nao o tema.
- Cliques na bio baixos? Revisar o CTA do ultimo story de sexta.`;

const robertAnaliseNew = `DECISAO:
- O que mais engajou? Fazer mais do mesmo na proxima semana.
- O que nao engajou? Trocar o gancho, nao o tema.
- Cliques na bio baixos? Revisar o CTA do ultimo story de sexta.

METRICAS TIKTOK:
- Views por video (>500 em 48h = ok, >10k = potencial viral)
- Watch time medio (>50% = bom, >70% = viral)
- Compartilhamentos (mais importante que curtidas no TikTok)
- Cliques no link da bio

METRICAS YOUTUBE:
- CTR da thumbnail (>5% = bom, >8% = otimo)
- Retencao media longform (>40% = bom)
- Impressoes de busca (SEO funcionando?)
- Cliques no link da descricao`;

if (!c.includes(robertAnaliseEnd)) { console.error('FIX 6 FAILED'); process.exit(1); }
c = c.replace(robertAnaliseEnd, robertAnaliseNew);
console.log('FIX 6: Robert TikTok + YouTube metricas added');

// =====================================================================
// FIX 7: Add TikTok strategy to Kaynan's Setup documentation
// =====================================================================
const kaynanSetupEnd = `SETUP ANTES DO PRIMEIRO POST (Kaua executa):
- Conta no modo Criador de Conteudo
- Bio publicada
- 5 destaques criados com capas no padrao visual
- 9 primeiros posts do feed planejados e prontos antes de publicar qualquer coisa
- Seguir 200 contas estrategicas de tech, empreendedorismo e startup BR`;

const kaynanSetupNew = `SETUP ANTES DO PRIMEIRO POST (Kaua executa):
- Conta no modo Criador de Conteudo
- Bio publicada
- 5 destaques criados com capas no padrao visual
- 9 primeiros posts do feed planejados e prontos antes de publicar qualquer coisa
- Seguir 200 contas estrategicas de tech, empreendedorismo e startup BR

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIKTOK — @kaynan_fyness
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJETIVO: Viralizar com narrativa "jovem fundador" + demos virais do produto

POR QUE FUNCIONA:
TikTok ADORA narrativas de fundador jovem. "19 anos construindo tech" viraliza
naturalmente porque quebra expectativa. Demo de produto em formato "satisfying"
(antes/depois, transformacao) performa bem. O algoritmo favorece conteudo que gera
curiosidade + watch time alto.

BIO TIKTOK: "19 anos. Construo sistema que dono de negocio usa pra parar de perder dinheiro | @fynessbr ↓"
LINK: LP com UTM utm_source=tiktok&utm_medium=bio&utm_campaign=kaynan

CONTEUDO PRINCIPAL (50%): POV / NARRATIVA FUNDADOR
POR QUE: POV coloca espectador DENTRO da situacao. Alta taxa de comentario = sinal forte pro algoritmo.
Exemplos:
- "POV: voce tem 19 anos e o dono de um restaurante te liga pra agradecer"
- "Me pediram pra mostrar meu setup. Aqui e onde o Fyness e construido."
- "19 anos. Co-fundador. Essa e minha rotina real."

CONTEUDO SECUNDARIO (30%): DEMO SATISFYING
POR QUE: videos de transformacao (antes/depois) sao dos mais compartilhados no TikTok.
Exemplos:
- Transicao: caderninho → tela do Fyness com tudo organizado
- Time-lapse: registrando 10 vendas em 30 segundos pelo celular
- Screen recording acelerado: "O Fyness organiza suas vendas automaticamente"

CONTEUDO TERCIARIO (20%): RESPONDER COMENTARIOS COM VIDEO
POR QUE: cada comentario respondido = video novo que o TikTok distribui.
Loop de crescimento gratuito.

FREQUENCIA: 1 video/dia
METAS TIKTOK:
Mes 1-3: 0 → 2.000 seguidores | 1+ video com 50k views
Mes 4-6: 2.000 → 10.000 | audiencia engajada
Mes 7-12: 10.000 → 30.000+ | link na bio gerando trials

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUTUBE — Aparece no Canal @fynessbr
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Kaynan aparece no canal UNICO do YouTube (Fyness). Menos frequencia que Robert
porque o tempo do Kaynan e mais valioso codando.

SHORTS: Repost do TikTok com titulo SEO (3-5/semana, custo zero)
LONGFORM: 1 video a cada 2 semanas

CATEGORIAS:
1. TOUR DO PRODUTO: walkthrough completo, setup pra tipos de negocio
   POR QUE: quem pesquisa "fyness" ou "sistema gestao financeira" quer VER o produto
2. BUILD IN PUBLIC: "O que construi essa semana", "Um cliente pediu X, construi em 3 dias"
   POR QUE: cria audiencia fiel, transmite que o produto evolui e a empresa escuta`;

if (!c.includes(kaynanSetupEnd)) { console.error('FIX 7 FAILED'); process.exit(1); }
c = c.replace(kaynanSetupEnd, kaynanSetupNew);
console.log('FIX 7: Kaynan TikTok + YouTube strategy added');

// =====================================================================
// FIX 8: Add TikTok to Kaynan's Calendario
// =====================================================================
const kaynanCalEnd = `COLLAB COM ROBERT (1 vez por mes):
Gravar 1 Reel juntos. Mesma gravacao, corte diferente para cada perfil.
Publicar nos 3 perfis: @kaynan, @robert, @fynessbr.
Formato: "19 anos vs 35 anos — como tomamos decisao no Fyness."`;

const kaynanCalNew = `COLLAB COM ROBERT (1 vez por mes):
Gravar 1 Reel juntos. Mesma gravacao, corte diferente para cada perfil.
Publicar nos 3 perfis: @kaynan, @robert, @fynessbr.
Formato: "19 anos vs 35 anos — como tomamos decisao no Fyness."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIKTOK — CALENDARIO KAYNAN (diario)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGUNDA: POV fundador ou "day in the life"
TERCA: Demo satisfying (antes/depois)
QUARTA: Resposta a comentario com video
QUINTA: POV ou narrativa pessoal
SEXTA: Demo de feature nova ou build in public
SABADO: Trend adaptada (se relevante) ou descanso
DOMINGO: Opcional

HORARIOS: 20h-22h
PRODUCAO: Kaynan grava 2-3 videos rapidos na segunda (15-30min total).
Kaua edita e agenda. Demos sao screen recording (Kaynan faz em 5min).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUTUBE — CALENDARIO KAYNAN (quinzenal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHORTS: Kaua reposta os melhores TikToks com titulo SEO (3-5/semana)
LONGFORM: 1 video a cada 2 semanas (grava quando tem feature nova ou caso interessante)
Playlist dedicada: "Tour pelo Fyness" e "Build in Public"`;

if (!c.includes(kaynanCalEnd)) { console.error('FIX 8 FAILED'); process.exit(1); }
c = c.replace(kaynanCalEnd, kaynanCalNew);
console.log('FIX 8: Kaynan TikTok + YouTube calendario added');

// =====================================================================
// FIX 9: Add TikTok to Kaynan's Crescimento
// =====================================================================
const kaynanCrescEnd = `ESCALA (a partir do mes 3):
- Passar de 2 para 3 Reels/semana.
- Criar serie semanal "Semana do Build in Public" (7 dias mostrando 1 aspecto do produto).
- Testar anuncio de Stories (R$200/mes) com o melhor Reel organico.`;

const kaynanCrescNew = `ESCALA (a partir do mes 3):
- Passar de 2 para 3 Reels/semana.
- Criar serie semanal "Semana do Build in Public" (7 dias mostrando 1 aspecto do produto).
- Testar anuncio de Stories (R$200/mes) com o melhor Reel organico.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRESCIMENTO TIKTOK — KAYNAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TATICAS:
1. NARRATIVA FUNDADOR JOVEM: "19 anos construindo tech" viraliza naturalmente
   POR QUE: quebra expectativa, gera curiosidade e admiracao
2. RESPONDER COMENTARIOS COM VIDEO: loop de crescimento gratuito
3. SERIES POV: "Acompanhe minha rotina como CTO de 19 anos — Dia 1"
   POR QUE: forca follow pra acompanhar a serie
4. CROSS-PROMO: Robert menciona "@kaynan_fyness construiu isso"
   POR QUE: transfer de audiencia entre perfis do mesmo time

CRESCIMENTO YOUTUBE — KAYNAN
TATICAS:
1. SHORTS viralizados no TikTok repostados com SEO
2. Videos de tour ranqueando pra buscas "fyness como funciona"
3. Build in public cria audiencia fiel de longo prazo`;

if (!c.includes(kaynanCrescEnd)) { console.error('FIX 9 FAILED'); process.exit(1); }
c = c.replace(kaynanCrescEnd, kaynanCrescNew);
console.log('FIX 9: Kaynan TikTok + YouTube crescimento added');

// =====================================================================
// FIX 10: Add TikTok to Kaynan's Analise
// =====================================================================
const kaynanAnaliseEnd = `DECISAO:
- Reel com menos de 300 views: gancho fraco. Trocar nos proximos 2 segundos, nao o tema.
- Crescimento parado: buscar collab urgente ou serie tematica nova.`;

const kaynanAnaliseNew = `DECISAO:
- Reel com menos de 300 views: gancho fraco. Trocar nos proximos 2 segundos, nao o tema.
- Crescimento parado: buscar collab urgente ou serie tematica nova.

METRICAS TIKTOK — KAYNAN:
- Views por video (narrativa fundador tende a ter views mais altos)
- Comentarios (indica engajamento real — mais importante que curtidas)
- Follow rate apos video viral
- Cliques no link da bio

METRICAS YOUTUBE — KAYNAN:
- Views nos videos de tour (indica interesse no produto)
- Retencao nos videos de build in public
- Inscritos via Shorts vs Longform`;

if (!c.includes(kaynanAnaliseEnd)) { console.error('FIX 10 FAILED'); process.exit(1); }
c = c.replace(kaynanAnaliseEnd, kaynanAnaliseNew);
console.log('FIX 10: Kaynan TikTok + YouTube metricas added');

// =====================================================================
// FIX 11: Add TikTok to Fyness Institucional Setup
// =====================================================================
const instSetupEnd = `- Pixel do Meta e Google Tag configurados na LP (rastrear cliques do Instagram)`;

const instSetupNew = `- Pixel do Meta e Google Tag configurados na LP (rastrear cliques do Instagram)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIKTOK — @fynessbr (SECUNDARIO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJETIVO: Presenca institucional + repost dos melhores conteudos dos fundadores

POR QUE SECUNDARIO:
No TikTok, perfis pessoais (Robert/Kaynan) performam MUITO melhor que perfil de empresa.
O algoritmo favorece rostos. @fynessbr no TikTok serve pra:
1) Compilar os melhores videos dos fundadores
2) Postar conteudo que nao encaixa nos pessoais (comparativos, dados, produto puro)
3) Ter presenca institucional caso alguem pesquise "fyness" no TikTok

BIO TIKTOK: "Gestao financeira pra quem tem negocio de verdade | Teste gratis ↓"
LINK: LP com UTM utm_source=tiktok&utm_medium=bio&utm_campaign=fynessbr

CONTEUDO:
- Compilacoes de resultados: "3 clientes, 3 negocios, 1 problema"
- Trends adaptadas pro produto
- Demos curtas de features
FREQUENCIA: 3-4 videos/semana (repost + originais)
PRIORIDADE: BAIXA — investir energia nos perfis Robert e Kaynan primeiro

METAS: Mes 1-6: 0 → 2.000 | Mes 7-12: 2.000 → 10.000`;

if (!c.includes(instSetupEnd)) { console.error('FIX 11 FAILED'); process.exit(1); }
c = c.replace(instSetupEnd, instSetupNew);
console.log('FIX 11: Fyness TikTok strategy added');

// =====================================================================
// FIX 12: Rewrite Pool 7 - YouTube Canal Unico
// =====================================================================
const oldPool7Comment = `<!-- POOL 7: DISTRIBUICAO MULTI-PLATAFORMA — TikTok + YouTube Shorts -->`;
c = c.replace(oldPool7Comment, `<!-- POOL 7: YOUTUBE — CANAL UNICO FYNESS -->`);

// Rewrite Pool 7 Start
const oldMultiSetup = `SETUP DAS PLATAFORMAS — FAZER UMA VEZ

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
→ Custo de producao extra: ZERO. Alcance extra: 3-5x`;

const newMultiSetup = `YOUTUBE — CANAL UNICO FYNESS

POR QUE UM CANAL SO (e nao 3 separados):
YouTube recompensa WATCH TIME TOTAL do canal. Dividir em 3 canais fragmenta a audiencia
e enfraquece o algoritmo. No Instagram e TikTok, perfis pessoais vencem.
No YouTube, marca vence. Robert e Kaynan aparecem como APRESENTADORES do canal Fyness.

SETUP DO CANAL:
□ Nome: "Fyness — Gestao pra quem tem negocio de verdade"
□ Descricao: "Sistema de gestao financeira pra dono de padaria, salao, oficina, restaurante.
   Se voce fatura R$10k+ e nao sabe pra onde vai o dinheiro, esse canal e pra voce."
□ Banner: "Chega de perder dinheiro sem saber" + mockup do sistema + CTA teste gratis
□ Link: LP com UTM utm_source=youtube&amp;utm_medium=channel
□ Playlists iniciais:
  - Gestao Financeira pra Iniciante (Robert)
  - Casos Reais de Clientes (Robert)
  - Tour pelo Fyness (Kaynan)
  - Build in Public (Kaynan)
  - Dicas Rapidas (Shorts compilados)

RESPONSAVEL: Kaua (edicao/publicacao) + Robert (longform) + Kaynan (demos/build in public)

POR QUE YOUTUBE E ESTRATEGICO:
→ YouTube e o 2o maior buscador do mundo
→ Conteudo ranqueia por 2-3 ANOS (diferente de TikTok que morre em dias)
→ Lead que pesquisa "como calcular lucro" e o MAIS qualificado (busca ativa)
→ Video longform de 10min converte melhor que qualquer Short porque cria CONFIANCA
→ SEO de video aparece no GOOGLE tambem (double exposure)`;

if (!c.includes(oldMultiSetup)) { console.error('FIX 12 FAILED: Pool 7 setup not found'); process.exit(1); }
c = c.replace(oldMultiSetup, newMultiSetup);
console.log('FIX 12: Pool 7 Start rewritten for YouTube');

// Rewrite Pool 7 Task_Multi_Fluxo
const oldMultiFluxo = `FLUXO DE PUBLICACAO — KAUA EXECUTA

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
→ TOTAL: 12 publicacoes/semana nas 3 plataformas (com apenas 4 gravacoes)`;

const newMultiFluxo = `YOUTUBE — DOIS FORMATOS DE CONTEUDO

FORMATO 1: SHORTS (motor de crescimento rapido)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reaproveitamento DIRETO do TikTok/Reels — mesmo video, upload separado.
POR QUE FUNCIONA: YouTube Shorts tem BUSCA (diferente do TikTok). Titulo e descricao
importam pra SEO. O mesmo video que viralizou no TikTok rankeia no YouTube pra
buscas como "controle financeiro pequeno negocio". Custo incremental: ZERO.

REGRAS:
→ Titulo SEO (diferente do TikTok): "Como saber se seu negocio da lucro | Dica rapida"
→ Descricao: 2-3 linhas com keywords + link Fyness com UTM
→ Upload separado por plataforma (nao usar cross-post automatico)
→ Kaua faz: recebe video editado pro TikTok, adapta titulo, publica
→ YouTube Shorts vive 6+ MESES (Instagram Reel morre em 48h)

FREQUENCIA: 5-7 Shorts/semana (todos os TikToks dos 3 perfis vao pro YouTube)

FORMATO 2: LONGFORM (motor de conversao + SEO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Videos de 8-15 minutos. Conteudo profundo que CONVERTE.
POR QUE FUNCIONA:
1) Quem assiste 10min de video JA CONFIA em voce
2) YouTube favorece watch time longo no algoritmo
3) Aparece no GOOGLE (SEO duplo)
4) Permite explicar o produto sem parecer propaganda

ROBERT APRESENTA (70% dos longforms):
- Tutoriais praticos: "Como calcular preco de venda (passo a passo)"
- Casos reais: "Dono de padaria que perdia R$3mil/mes sem saber"
- Erros comuns: "5 erros financeiros que quebram seu negocio"

KAYNAN APRESENTA (30% dos longforms):
- Tour do produto: "Tudo que voce controla no Fyness pelo celular"
- Build in public: "O que construi essa semana no Fyness"
- Setup por nicho: "Configurando Fyness pra padaria/salao/oficina"

ESTRUTURA LONGFORM:
→ 0:00-0:30 HOOK: problema + promessa (NAO enrolar)
→ 0:30-1:30 CONTEXTO: por que isso importa (exemplo real)
→ 1:30-8:00 CONTEUDO: passo a passo / caso / explicacao (VALOR REAL)
→ 8:00-9:00 RESUMO: recapitular pontos principais
→ 9:00-9:30 CTA: "Link na descricao pra testar gratis" + like/subscribe

FREQUENCIA LONGFORM:
Mes 1-3: 1 video/semana (Robert) + 1 a cada 2 semanas (Kaynan) = ~6/mes
Mes 4+: 2 videos/semana = ~8/mes`;

if (!c.includes(oldMultiFluxo)) { console.error('FIX 12b FAILED: Pool 7 fluxo not found'); process.exit(1); }
c = c.replace(oldMultiFluxo, newMultiFluxo);
console.log('FIX 12b: Pool 7 Fluxo rewritten for YouTube formats');

// Rewrite Pool 7 Task_Multi_Calendario
const oldMultiCal = `CALENDARIO — KAUA PUBLICA NAS 3 PLATAFORMAS

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
  "Controle financeiro MEI em 10 segundos"`;

const newMultiCal = `YOUTUBE — SEO E CALENDARIO DE PUBLICACAO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEO (MAIOR VANTAGEM DO YOUTUBE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POR QUE SEO IMPORTA:
Ads para de funcionar quando para de pagar.
Video ranqueado traz lead TODO MES por 2-3 anos. E juros compostos de conteudo.

TITULO: Keyword no inicio + curiosidade
BOM: "Fluxo de caixa: como montar o do seu negocio (metodo simples)"
BOM: "Como saber se seu negocio da lucro | Metodo pra iniciante"
RUIM: "Dica financeira incrivel que vai mudar sua vida!!!!"
RUIM: "Video 47 — Fyness explica gestao"

DESCRICAO: Primeiras 2 linhas com keywords (Google indexa). Depois: timestamps + link.
Template:
→ Linha 1-2: "Nesse video eu mostro [keyword] pra [publico]."
→ Linha 3: Link Fyness + UTM
→ Linha 4+: Timestamps (capitulos)

THUMBNAIL: Rosto (Robert ou Kaynan) com expressao + texto curto (3-4 palavras) + contraste alto
CTR > 5% = bom. > 8% = otimo. Kaua cria no Canva.

KEYWORDS ALVO (pesquisar volume antes):
"gestao financeira pequeno negocio" | "controle financeiro empreendedor"
"como calcular lucro do meu negocio" | "fluxo de caixa simples"
"como precificar meu produto" | "gestao de restaurante"
"controle de estoque" | "CMV restaurante hamburgueria"
"separar conta PJ e pessoal" | "sistema gestao financeira"
POR QUE: 5.000-20.000 buscas/mes no Brasil, baixa concorrencia de video.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALENDARIO YOUTUBE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHORTS: Kaua publica 1/dia (repost dos TikToks de Robert, Kaynan e Fyness)
LONGFORM: Quinta-feira 18h (Robert) + 2o e 4o sabado 14h (Kaynan, quinzenal)
Horario de publicacao importa MENOS no YouTube (algoritmo distribui ao longo de dias)

PLAYLISTS (YouTube recomenda playlists inteiras — aumenta watch time):
1. Gestao Financeira pra Iniciante (Robert)
2. Casos Reais de Clientes Fyness (Robert)
3. Tour pelo Fyness (Kaynan)
4. Build in Public — Bastidores (Kaynan)
5. Dicas Rapidas (compilacao de Shorts)
6. Precificacao e CMV (Robert)

END SCREEN + CARDS: todo video tem end screen pro proximo + 3 cards relevantes
POR QUE: aumenta tempo de sessao. YouTube recompensa isso no algoritmo.

COMMUNITY TAB (apos 500 inscritos):
Enquetes: "Qual seu maior desafio? Precificacao / Fluxo de caixa / Estoque"
Posts: "Proximo video: o que voces querem ver?"
POR QUE: engajamento barato que alimenta pauta`;

if (!c.includes(oldMultiCal)) { console.error('FIX 12c FAILED: Pool 7 calendario not found'); process.exit(1); }
c = c.replace(oldMultiCal, newMultiCal);
console.log('FIX 12c: Pool 7 Calendario rewritten for YouTube SEO');

// Rewrite Pool 7 Task_Multi_Analise
const oldMultiAnalise = `ANALISE SEMANAL — MULTI-PLATAFORMA
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
→ Se uma plataforma tem views mas zero cliques: problema no CTA ou link na bio`;

const newMultiAnalise = `ANALISE SEMANAL — YOUTUBE + CROSS-PLATFORM
Quando: toda segunda, junto com analise dos outros pools.
Responsavel: Kaynan + Kaua

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
METRICAS YOUTUBE (primarias)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- CTR da thumbnail (>5% = bom, >8% = otimo)
- Retencao media longform (>40% = bom)
- Cliques no link da descricao (conversao real)
- Impressoes de busca (indica SEO funcionando)
- Watch time total do canal (principal metrica do algoritmo)
- Inscritos/semana
- Views Shorts vs Longform (rastrear separado)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPARATIVO CROSS-PLATFORM (semanal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ PLATAFORMA | VIEWS TOTAL | MELHOR VIDEO | SEGUIDORES NOVOS | CLIQUES LINK
  IG Robert    | ___         | ___          | ___              | ___
  IG Kaynan    | ___         | ___          | ___              | ___
  IG Fyness    | ___         | ___          | ___              | ___
  TikTok Robert| ___         | ___          | ___              | ___
  TikTok Kaynan| ___         | ___          | ___              | ___
  YouTube      | ___         | ___          | ___              | ___
  TOTAL        | ___         | ___          | ___              | ___

PERGUNTAS CHAVE:
□ Qual PERFIL trouxe mais leads essa semana? (Robert vs Kaynan vs Fyness)
□ Qual PLATAFORMA trouxe mais cliques no link? (IG vs TikTok vs YouTube)
□ O mesmo video performou diferente por plataforma? Por que?
□ Trials via UTM: robert_ig [X] | robert_tiktok [X] | kaynan_ig [X] | kaynan_tiktok [X] | youtube [X]

FUNIL:
TikTok atrai (topo) → Instagram nutre (meio) → YouTube convence (fundo) → LP converte
POR QUE FUNCIONA: Marketing multi-touch: o cliente precisa de 7-13 pontos de contato
antes de comprar (Google Zero Moment of Truth). 3 perfis × 3 plataformas = muitos
pontos de contato sem parecer spam.

REGRAS CROSS-PLATFORM:
→ Robert NUNCA posta demo (papel do Kaynan)
→ Kaynan NUNCA da conselho financeiro (papel do Robert)
→ Fyness institucional NUNCA tem opiniao pessoal (so fatos, resultados, produto)
→ Todo conteudo menciona @fynessbr (direciona pro institucional)
→ YouTube e canal UNICO — Instagram e TikTok sao perfis SEPARADOS
→ Review semanal: qual plataforma traz mais cliques? Dobrar investimento nela.

DECISOES:
→ Se YouTube Shorts supera TikTok em views de longo prazo: priorizar titulos SEO
→ Se longform tem retencao <30%: hook fraco ou conteudo longo demais — Kaua reedita
→ Se CTR thumbnail <3%: Kaua refaz thumbnail (rosto + texto curto + contraste)`;

if (!c.includes(oldMultiAnalise)) { console.error('FIX 12d FAILED: Pool 7 analise not found'); process.exit(1); }
c = c.replace(oldMultiAnalise, newMultiAnalise);
console.log('FIX 12d: Pool 7 Analise rewritten for YouTube + cross-platform');

// Rewrite Pool 7 Escalar
c = c.replace(
  `ESCALAR — PLATAFORMA COM MELHOR PERFORMANCE

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
→ Manter as outras plataformas no minimo (2 videos/semana) — nao abandonar`,

  `ESCALAR — YOUTUBE CRESCENDO

QUANDO ESCALAR:
→ Videos longform com retencao >40% consistente
→ Shorts trazendo >100 inscritos/semana
→ Videos aparecendo em buscas do Google
→ Cliques no link da descricao crescendo

ACOES:
→ Robert: aumentar de 1 pra 2 longforms/semana
→ Kaynan: aumentar de quinzenal pra semanal
→ Kaua: investir em thumbnails profissionais (template premium)
→ Testar YouTube Ads (Shorts ads — CPV barato, formato novo)
→ Criar series tematicas: "30 Dias de Gestao Financeira" (1 video/dia por 30 dias)
→ Investir em equipamento: microfone melhor, iluminacao consistente

ESCALAR — CROSS-PLATFORM
→ Plataforma vencedora em cliques recebe mais investimento de tempo
→ Testar TikTok Ads (boost de video organico — R$50-100/semana no melhor)
→ Instagram: impulsionar melhor Reel organico (R$100-200/semana)
→ NAO abandonar nenhuma plataforma — manter minimo em todas`
);
console.log('FIX 12e: Pool 7 Escalar rewritten');

// Rewrite Pool 7 Otimizar
c = c.replace(
  `OTIMIZAR — VIEWS OU CLIQUES BAIXOS

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
  Voltar pros pools Robert/Kaynan e revisar ganchos e temas.`,

  `OTIMIZAR — YOUTUBE + CROSS-PLATFORM

DIAGNOSTICO YOUTUBE LONGFORM:
→ CTR thumbnail <3%: thumbnail fraco. Kaua refaz: rosto com expressao + 3-4 palavras
→ Retencao <30%: hook fraco OU conteudo nao entrega o prometido. Testar intro mais direta.
→ Views ok mas poucos cliques no link: CTA fraco. Adicionar card + mencao verbal aos 50% do video.
→ Impressoes de busca caindo: titulo sem keyword. Reformular titulo com keyword principal.

DIAGNOSTICO YOUTUBE SHORTS:
→ Views abaixo de 500 em 7 dias: titulo fraco pra busca.
  Testar: "Como [acao] [tipo de negocio]" (ex: "Como controlar caixa da padaria")
→ Views altos mas zero inscritos: falta CTA verbal e visual de subscribe

DIAGNOSTICO CROSS-PLATFORM:
→ TikTok views baixos: gancho fraco nos primeiros 1.5s. Texto grande na tela + fala direta.
→ Instagram Reels com pouco alcance: testar horarios (18h vs 20h) e formatos (carrossel vs reel)
→ Mesmo video funciona em 1 plataforma e nao em outra: normal. Adaptar formato.
→ Nenhuma plataforma funcionando: problema no CONTEUDO. Voltar pros pools e revisar ganchos.`
);
console.log('FIX 12f: Pool 7 Otimizar rewritten');

// Update Pool 7 LinkThrow documentation
c = c.replace(
  `Trafego organico de TikTok e YouTube chega na LP via link na bio/descricao.
UTMs:
→ TikTok: utm_source=tiktok&amp;utm_medium=organic&amp;utm_campaign=reels
→ YouTube: utm_source=youtube&amp;utm_medium=shorts&amp;utm_campaign=reels`,

  `Trafego organico de TODAS as plataformas chega na LP via link na bio/descricao.
UTMs por perfil e plataforma:
→ Robert IG: utm_source=instagram&amp;utm_medium=bio&amp;utm_campaign=robert
→ Robert TikTok: utm_source=tiktok&amp;utm_medium=bio&amp;utm_campaign=robert
→ Kaynan IG: utm_source=instagram&amp;utm_medium=bio&amp;utm_campaign=kaynan
→ Kaynan TikTok: utm_source=tiktok&amp;utm_medium=bio&amp;utm_campaign=kaynan
→ Fyness IG: utm_source=instagram&amp;utm_medium=bio&amp;utm_campaign=fynessbr
→ Fyness TikTok: utm_source=tiktok&amp;utm_medium=bio&amp;utm_campaign=fynessbr
→ YouTube: utm_source=youtube&amp;utm_medium=channel&amp;utm_campaign=longform
→ YouTube Shorts: utm_source=youtube&amp;utm_medium=shorts&amp;utm_campaign=shorts`
);
console.log('FIX 12g: UTMs updated for all profiles');

// Update Pool 7 Task names
c = c.replace(
  `name="Setup TikTok + YouTube"`,
  `name="Setup YouTube — Canal Unico Fyness"`
);
c = c.replace(
  `name="Fluxo de Reaproveitamento — 1 Conteudo → 3 Plataformas"`,
  `name="Shorts + Longform — Dois Formatos de Conteudo"`
);
c = c.replace(
  `name="Calendario de Publicacao Semanal"`,
  `name="SEO e Calendario YouTube"`
);
c = c.replace(
  `name="Analise Semanal — Metricas por Plataforma"`,
  `name="Analise YouTube + Cross-Platform"`
);
c = c.replace(
  `name="Escalar: Aumentar Frequencia na Plataforma Vencedora"`,
  `name="Escalar: YouTube + Cross-Platform"`
);
c = c.replace(
  `name="Otimizar: Diagnostico por Plataforma"`,
  `name="Otimizar: YouTube + Cross-Platform"`
);
c = c.replace(
  `name="→ Landing Page"`,
  `name="→ Landing Page (todas as plataformas)"`
);
console.log('FIX 13: All Pool 7 task names updated');

// Update diagram comment
c = c.replace(
  `<!-- POOL 7: DISTRIBUICAO MULTI-PLATAFORMA -->`,
  `<!-- POOL 7: YOUTUBE — CANAL UNICO FYNESS -->`
);
console.log('FIX 14: Diagram comment updated');

// =====================================================================
// WRITE
// =====================================================================
writeFileSync(f, c, 'utf8');
console.log('\nAll fixes applied. File saved.');
console.log('Total lines:', c.split('\\n').length);

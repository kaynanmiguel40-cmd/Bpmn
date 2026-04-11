import { readFileSync, writeFileSync } from 'fs';
const filePath = 'src/utils/marketingTemplate.js';
let c = readFileSync(filePath, 'utf8');

// ─────────────────────────────────────────────────────────────
// ROBERT — expandir doc do Start_Robert_Setup
// ─────────────────────────────────────────────────────────────
const ROBERT_DOC_OLD = `<bpmn2:documentation>PERFIL: Robert | 35 anos | Especialista financeiro e comercial
Instagram: ~3.000 seguidores | Conta profissional (Criador de Conteudo)

TOM DE VOZ:
- Serio e direto. Fala como quem ja viveu o problema.
- Autoridade sem arrogancia. Usa numeros e dados reais.
- Frases curtas. Pausa dramatica antes da solucao.
- Nunca condescendente: "Nao e sua culpa, ninguem te ensinou isso."
- Menciona o Fyness em no maximo 20% do conteudo, sempre contextualizado.

BIO:
"Especialista em gestao financeira empresarial
Ajudo empresarios a pararem de trabalhar no escuro
Co-fundador @fynessbr | 7 dias gratis (link abaixo)"

LINK NA BIO: Pagina de trial do Fyness
FOTO: Profissional, expressao seria e confiante
DESTAQUES: Dicas | Perguntas | Fyness | Resultados | Sobre mim
      </bpmn2:documentation>`;

const ROBERT_DOC_NEW = `<bpmn2:documentation>PERFIL: Robert | 35 anos | Especialista financeiro e comercial
Instagram: ~3.000 seguidores | Conta profissional (Criador de Conteudo)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOM DE VOZ — ROBERT (detalhado)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONALIDADE:
Robert tem 35 anos. Ja abriu empresa. Ja quase faliu. Aprendeu na raca.
Fala como quem ja viveu o problema — nao como professor de faculdade.
Autoridade conquistada, nao imposta. O seguidor sente que ele esta do mesmo lado.
Usa a experiencia como ferramenta: "Eu ja vi isso destruir empresas."
Pausa dramatica antes da solucao: deixa o problema "doer" antes de resolver.

LINGUAGEM:
- Frases curtas. Maximo de 10 palavras por frase nos Reels.
- "Voce" direto. Fala com o empresario, nao sobre os empresarios.
- Usa numeros e dados reais sempre que possivel. Numeros chocam e educam.
- Pode ser duro: "Voce esta sangrando e nao sabe." Nunca cruel.
- Evita jargao financeiro pesado (CDI, Selic, derivativos). Foco em gestao operacional.
- Nao usa linguagem de motivador: sem "acredite em voce", sem "vai la".
- Tom de mentor experiente, nao de influencer.

EXEMPLOS DE ABERTURA QUE FUNCIONAM PARA O ROBERT:
- "Voce sabe quanto seu negocio lucrou esse mes? Nao? Problema."
- "Conheco empresarios que faturam R$50k por mes e nao tem R$5k na conta."
- "Planilha nao e controle financeiro. E ilusao de controle."
- "Todo negocio que fechou achava que estava indo bem."
- Dado + pergunta direta: numero chocante nos 3 primeiros segundos, pergunta que forca o seguidor a se posicionar.

O QUE ROBERT NAO FAZ:
- Nao glamouriza empreendedorismo.
- Nao faz discurso motivacional.
- Nao usa linguagem de anuncio no conteudo organico.
- Nao transforma o perfil em vitrine de produto.

COMO MENCIONAR O FYNESS (regra 80/20):
- 80% do conteudo: educativo puro, sem mencionar o produto.
- 20%: mencionar o Fyness de forma natural e contextualizada.
- Sempre contextualizar antes do CTA: "Construi o Fyness porque precisava disso no meu proprio negocio."
- Nunca mencionar preco nos posts organicos. Preco vai para Stories ou DM.
- Exemplos de CTA natural:
  "O Fyness faz isso automaticamente. Link na bio."
  "Hoje uso o Fyness para isso. Me poupou 8h por mes."
  "Aliás, o Fyness resolve exatamente esse problema. 7 dias gratis, link na bio."

POSTURA SOBRE O @FYNESSBR (6 seguidores):
O perfil do Fyness nao tem autoridade propria ainda.
Robert e o motor que constroi essa autoridade por transferencia.
Toda quarta-feira: marcar @fynessbr em pelo menos 1 story.
Ao longo de 6 meses, o @fynessbr acumula credibilidade nas costas do Robert.

BIO:
"Especialista em gestao financeira empresarial
Ajudo empresarios a pararem de trabalhar no escuro
Co-fundador @fynessbr | 7 dias gratis (link abaixo)"

LINK NA BIO: Pagina de trial do Fyness (UTM: utm_campaign=robert_bio)
FOTO: Profissional, terno ou camisa social, expressao seria e confiante
DESTAQUES: Dicas | Perguntas | Fyness | Resultados | Sobre mim
      </bpmn2:documentation>`;

if (c.includes(ROBERT_DOC_OLD)) {
  c = c.replace(ROBERT_DOC_OLD, ROBERT_DOC_NEW);
  console.log('Robert: tom de voz expandido');
} else {
  console.error('Robert doc block nao encontrado');
}

// ─────────────────────────────────────────────────────────────
// KAYNAN — expandir doc do Start_Kaynan_Setup
// ─────────────────────────────────────────────────────────────
const KAYNAN_DOC_OLD = `<bpmn2:documentation>PERFIL: Kaynan | 19 anos | Co-fundador | Build in public
Instagram: ~200 seguidores | Reconstruir como perfil profissional do zero

TOM DE VOZ:
- Jovem, direto, energetico. Fala do que esta acontecendo agora.
- Autentico ao extremo. Mostra erro tanto quanto acerto.
- Linguagem simples: sem jargao tecnico. "Basicamente uma IA que le texto."
- Vulnerabilidade real. "As 2h da manha travei num bug. Aqui esta o que fiz."
- Diferente do Robert: Robert e autoridade, Kaynan e identificacao.

BIO:
"19 anos | Co-fundador @fynessbr
Construindo um SaaS brasileiro ao vivo
Bastidores, erros e tudo mais (link abaixo)"

USERNAME: @kaynanfyness (verificar disponibilidade)
FOTO: Descontraida mas profissional. Pode ter notebook ou celular.
DESTAQUES: Bastidores | Fyness | Aprendi | Sobre mim | Perguntas

SETUP ANTES DO PRIMEIRO POST (Kaua executa):
- Conta no modo Criador de Conteudo
- Bio publicada
- 5 destaques criados com capas no padrao visual
- 9 primeiros posts do feed planejados e prontos antes de publicar qualquer coisa
- Seguir 200 contas estrategicas de tech, empreendedorismo e startup BR
      </bpmn2:documentation>`;

const KAYNAN_DOC_NEW = `<bpmn2:documentation>PERFIL: Kaynan | 19 anos | Co-fundador | Build in public
Instagram: ~200 seguidores | Reconstruir como perfil profissional do zero

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOM DE VOZ — KAYNAN (detalhado)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONALIDADE:
Kaynan tem 19 anos e esta vivendo o processo AGORA. Nao fala de teoria — fala do que esta acontecendo.
Autentico ao extremo: mostra o bug tanto quanto mostra a feature funcionando.
Energia alta. Fala rapido. Ritmo de podcast acelerado.
Vulnerabilidade real e estrategica: "As 2h da manha travei em um bug. Olha como resolvi."
Tom de amigo que conta o que esta fazendo — nao de professor ensinando.
Quem tem 18-28 anos querendo empreender se ve no Kaynan.
Diferente do Robert (que e autoridade): Kaynan e IDENTIFICACAO.

LINGUAGEM:
- Informal mas inteligente. "A gente" mais que "nos".
- Sem jargao tecnico — simplifica tudo: "e basicamente uma API que le texto".
- Frases curtas e energeticas. Sem silencio desnecessario.
- Admite quando nao sabe: "Eu nao sabia isso ate 3 meses atras."
- Pode usar "cara" e "mano" com moderacao — nao exagerar.
- Mostra o processo real, nao so o highlight reel.
- Nao glamouriza: nao posta foto de carro, escritorio bonito, lifestyle.

EXEMPLOS DE ABERTURA QUE FUNCIONAM PARA O KAYNAN:
- "As 2h da manha encontrei um bug critico no dia anterior ao lancamento. Aqui esta o que aconteceu."
- "Quase desisti do Fyness. Vou ser honesto sobre o que aconteceu."
- "Tenho 19 anos e co-fundei um SaaS. Nao vou enfeitar o que foi isso."
- "Deixa eu te mostrar o que fiz essa semana que mudou a direcao do produto."
- Revelacao imediata: situacao real, sem introducao, direto ao ponto.

BUILD IN PUBLIC — REGRA DE OURO:
Transparencia total sobre o processo. Isso inclui:
- Numeros reais (trials novos, bugs corrigidos, features deployadas)
- Erros e o que foi aprendido
- Decisoes dificeis e como foram tomadas
- A dinamica com o Robert (socio mais velho — explorar essa narrativa)
O seguidor sente que esta acompanhando algo real sendo construido.
Isso cria fidelidade que nenhum anuncio consegue comprar.

COMO MENCIONAR O FYNESS:
- Sempre contextualizado: mostrar o produto em uso, nao em anuncio.
- Demo ao vivo vale mais que qualquer copy.
- "Uso o Fyness para controlar as financas do proprio Fyness" — uso real, nao forcado.
- Marcar @fynessbr toda quarta nos stories: construcao gradual do perfil do produto.

O QUE KAYNAN NAO FAZ:
- Nao finge que tudo e perfeito.
- Nao usa linguagem corporativa ("escalabilidade", "sinergia").
- Nao posta conteudo generico de motivacao.
- Nao tenta soar mais velho do que e — a idade e um diferencial, nao um problema.

BIO:
"19 anos | Co-fundador @fynessbr
Construindo um SaaS brasileiro ao vivo
Bastidores, erros e tudo mais (link abaixo)"

USERNAME: @kaynanfyness (verificar disponibilidade)
FOTO: Descontraida mas profissional. Pode ter notebook ou celular. Fundo neutro.
DESTAQUES: Bastidores | Fyness | Aprendi | Sobre mim | Perguntas

SETUP ANTES DO PRIMEIRO POST (Kaua executa):
- Conta no modo Criador de Conteudo
- Bio publicada
- 5 destaques criados com capas no padrao visual
- 9 primeiros posts do feed planejados e prontos antes de publicar qualquer coisa
- Seguir 200 contas estrategicas de tech, empreendedorismo e startup BR
      </bpmn2:documentation>`;

if (c.includes(KAYNAN_DOC_OLD)) {
  c = c.replace(KAYNAN_DOC_OLD, KAYNAN_DOC_NEW);
  console.log('Kaynan: tom de voz expandido');
} else {
  console.error('Kaynan doc block nao encontrado');
}

// ─────────────────────────────────────────────────────────────
// INSTITUCIONAL — expandir doc do Start_Inst_Setup
// ─────────────────────────────────────────────────────────────
const INST_DOC_OLD = `<bpmn2:documentation>PERFIL: @fynessbr | 6 seguidores | Recém-criado
Conta Empresa (nao Criador). Categoria: Software.

PAPEL NO ECOSSISTEMA:
Nao e o perfil que gera audiencia — isso e funcao de Robert e Kaynan.
E o perfil que confirma a decisao de compra.
Quando o lead viu Robert ou Kaynan e ficou curioso → vai no @fynessbr.
O que precisa encontrar: produto real, prova social, CTA claro.

TOM DE VOZ:
- Profissional e direto. Orientado a resultado.
- Sempre especifico: "Registre sua venda em 10 segundos", nao "gestao facil".
- Nunca generico. Nunca linguagem de startup ("revolucionario", "disruptivo").
- Cada post tem um objetivo: mostrar o produto, gerar confianca ou converter.

BIO:
"Gestao financeira empresarial pelo WhatsApp
Mande uma mensagem. Controle seu negocio.
7 dias gratis — sem cartao (link abaixo)"

LINK NA BIO: Direto para a LP (sem Linktree — menos friccao)
FOTO: Logo Fyness em alta resolucao, fundo na cor da marca
DESTAQUES: Demo | Clientes | Features | FAQ | Trial

CRESCIMENTO ESPERADO (realista):
Mes 1: 6 → 80 (via mencoes de Robert e Kaynan)
Mes 2: 80 → 250 (conteudo proprio + reposts)
Mes 3: 250 → 600 (primeiros clientes marcando)
Mes 6: 1.500+

SETUP ANTES DO PRIMEIRO POST:
- Conta no modo Empresa
- Bio publicada com link direto para LP
- 5 destaques criados com capas no padrao visual
- 9 primeiros posts do grid planejados e prontos
      </bpmn2:documentation>`;

const INST_DOC_NEW = `<bpmn2:documentation>PERFIL: @fynessbr | 6 seguidores | Recem-criado
Conta Empresa (nao Criador). Categoria: Software.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAPEL NO ECOSSISTEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NAO e o perfil que gera audiencia — isso e funcao de Robert e Kaynan.
E o perfil que CONFIRMA a decisao de compra.
Jornada do lead: ve conteudo do Robert ou Kaynan → fica curioso → vai no @fynessbr → decide comprar ou nao.
O que precisa encontrar ao chegar: produto real funcionando, prova social, CTA claro.
Se o perfil estiver vazio ou desorganizado, o lead vai embora.
Missao unica: converter quem ja chegou aquecido pelos fundadores.

CRESCIMENTO ESPERADO (realista — cresce na cauda dos fundadores):
Mes 1: 6 → 80 (via mencoes de Robert e Kaynan — toda quarta)
Mes 2: 80 → 250 (conteudo proprio + reposts dos fundadores)
Mes 3: 250 → 600 (primeiros clientes marcando espontaneamente)
Mes 6: 1.500+ (crescimento organico + trafego pago levando ao perfil)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOM DE VOZ — @FYNESSBR (detalhado)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONALIDADE DO PERFIL:
O @fynessbr nao tem "personalidade humana" como Robert e Kaynan.
Tem personalidade de produto: confiante, claro, orientado a resultado.
Fala como o produto que e — nao como startup empolgada tentando parecer cool.
Cada post comunica uma coisa: "isso funciona, e simples, e para o seu negocio."

LINGUAGEM:
- Profissional mas nao frio. Tem voz propria, mas sem gíria.
- Sempre especifico e mensuravel: "registre sua venda em 10 segundos" — nunca "gestao facil e rapida".
- Orientado a resultado: o que o produto FAZ pelo cliente, nao o que o produto E.
- Nunca linguagem de startup hipster: sem "revolucionario", "disruptivo", "game changer".
- Nunca linguagem de anuncio forcado: sem "NAO PERCA!", "OFERTA LIMITADA!".
- Frases curtas. Uma ideia por post. Um CTA por post.

EXEMPLOS DE LINGUAGEM CERTA vs ERRADA:
ERRADO: "Gestao financeira revolucionaria para o seu negocio crescer!"
CERTO:  "Voce manda uma mensagem. O Fyness lanca no financeiro. Em 2 segundos."

ERRADO: "Plataforma intuitiva com dashboard completo e relatórios avancados."
CERTO:  "DRE do mes atual. Agora. Sem esperar o fim do mes."

ERRADO: "Nao fique de fora da revolucao financeira!"
CERTO:  "7 dias gratis. Sem cartao. Comeca em 2 minutos."

QUANDO MENCIONAR OS FUNDADORES:
- Repostar conteudo de Robert e Kaynan nos sabados (com credito).
- Marcar @robert e @kaynan em posts de bastidor ou lancamento de feature.
- Nunca deixar o perfil parecer anonimo — os fundadores dao rosto ao produto.

BIO:
"Gestao financeira empresarial pelo WhatsApp
Mande uma mensagem. Controle seu negocio.
7 dias gratis — sem cartao (link abaixo)"

LINK NA BIO: Direto para a LP (sem Linktree — menos friccao, mais conversao)
FOTO: Logo Fyness em alta resolucao, fundo na cor primaria da marca
DESTAQUES: Demo | Clientes | Features | FAQ | Trial

SETUP ANTES DO PRIMEIRO POST (Kaua executa):
- Conta no modo Empresa, categoria Software
- Bio publicada com link direto para LP
- 5 destaques criados com capas no padrao visual Fyness
- 9 primeiros posts do grid planejados, produzidos e prontos para publicar
- Pixel do Meta e Google Tag configurados na LP (rastrear cliques do Instagram)
      </bpmn2:documentation>`;

if (c.includes(INST_DOC_OLD)) {
  c = c.replace(INST_DOC_OLD, INST_DOC_NEW);
  console.log('Institucional: tom de voz expandido');
} else {
  console.error('Institucional doc block nao encontrado');
}

writeFileSync(filePath, c, 'utf8');
console.log(`\nArquivo salvo: ${c.length} chars, ${c.split('\n').length} linhas`);

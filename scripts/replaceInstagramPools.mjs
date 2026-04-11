import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/utils/marketingTemplate.js';
let content = readFileSync(filePath, 'utf8');

// ─────────────────────────────────────────────────────────────
// POOL 3 — ROBERT
// ─────────────────────────────────────────────────────────────
const ROBERT_NEW = `<!-- POOL 3: ROBERT — AUTORIDADE FINANCEIRA (Instagram ~3k seguidores) -->
  <!-- ============================================================ -->
  <bpmn2:process id="Process_Robert" isExecutable="false">

    <bpmn2:startEvent id="Start_Robert_Setup" name="Setup e Posicionamento do Perfil">
      <bpmn2:documentation>PERFIL: Robert | 35 anos | Especialista financeiro e comercial
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
      </bpmn2:documentation>
      <bpmn2:outgoing>Flow_Robert_Setup_Semanal</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_Robert_Calendario" name="Calendario Semanal de Conteudo">
      <bpmn2:documentation>CALENDARIO SEMANAL — ROBERT

SEGUNDA — Carrossel educativo (feed)
Tipo: conteudo denso, 7 a 10 slides, tema de gestao financeira.
Tom: professor experiente, dados reais, linguagem acessivel.
Exemplo de tema: "7 sinais que seu financeiro esta fora de controle"
Exemplo de slide 1: "7 sinais que seu financeiro esta fora de controle. Se voce marcar 3, a gente precisa conversar."
Publicar: 18h. Nos primeiros 30 min, Robert responde todos os comentarios.

TERCA — Reel educativo (feed)
Tipo: video 45-75 segundos, um unico problema financeiro com solucao direta.
Tom: serio, dado chocante nos primeiros 3 segundos, solucao no final.
Exemplo de gancho: "Voce sabe quanto seu negocio lucrou em janeiro? Se demorou mais de 3 segundos pra responder, a gente precisa conversar."
Publicar: 19h.

QUARTA — Stories: bastidores do Fyness (3 a 5 stories)
Tipo: video curto mostrando algo do produto, print de conversa com Kaynan, demo de feature.
Tom: informal, transparente, sem roteiro.
Obrigatorio: marcar @fynessbr em pelo menos 1 story.
Objetivo: transferir autoridade do Robert para o perfil do Fyness gradualmente.

QUINTA — Stories: responde perguntas da semana (3 a 5 stories)
Tipo: Robert responde em video (15-30s) as perguntas recebidas na caixa da segunda.
Tom: direto, como mentor respondendo um aluno.
Exemplo: "Pergunta da [nome]: como sei se meu produto da lucro? Resposta em 30 segundos."

SEXTA — Stories: dica rapida + link do trial (2 a 3 stories)
Tipo: 1 dica financeira pratica em 15 segundos + 1 story com link direto para o trial.
Exemplo de dica: "Toda sexta, dedique 15 minutos para revisar o que entrou e saiu essa semana. So isso ja muda tudo."

SABADO — Repost ou conteudo leve
Tipo: compartilhar o melhor Reel da semana nos stories ou conteudo pessoal sem roteiro.

DOMINGO — Story de reflexao + caixa de perguntas
Tipo: pergunta para a audiencia sobre dor financeira. Alimenta pauta da proxima semana.
Exemplo: "Qual e sua maior dificuldade financeira no negocio agora? Manda aqui."
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Setup_Semanal</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Reels_Stories</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Robert_Crescimento" name="Taticas de Crescimento de Seguidores">
      <bpmn2:documentation>CRESCIMENTO ORGANICO — ACOES SEMANAIS

META:
Mes 1-2: +500 seguidores (base consistente)
Mes 3-4: +1.500 seguidores (primeiro Reel acima de 50k views)
Mes 6: 10.000+ seguidores

ACOES FIXAS POR SEMANA:
- Responder 100% dos comentarios nos primeiros 30 min apos cada post.
- Responder todas as DMs em ate 24h (mesmo que uma linha).
- Comentar em 10 posts de contas grandes do nicho (empreendedorismo, financas).
- Seguir 20 contas de pequenos empresarios relevantes.
- Toda quarta: marcar @fynessbr em pelo menos 1 story (construcao do perfil do produto).

FORMATOS COM MAIOR RETORNO DE SEGUIDORES:
1. Carrossel com lista numerada (saves altos = mais alcance organico)
2. Reel com dado chocante no gancho (compartilhamento alto)
3. Story com caixa de perguntas respondida em video (engajamento real)

COLABORACOES (1 por mes):
- Gravar 1 Reel com Kaynan (audiencias diferentes, cross-follow).
- Abordar 3 criadores do nicho (10k a 100k seguidores) com proposta de collab clara.
  Modelo de abordagem: "Tenho [X] seguidores no nicho de financas empresariais.
  Podemos gravar um Reel sobre [tema especifico]? Beneficio para as duas audiencias."

QUANDO ESCALAR (a partir do mes 3):
- Passar de 2 para 3 Reels por semana.
- Criar lead magnet (PDF "7 relatorios financeiros essenciais") para captura de email.
- Testar anuncio de Stories com o melhor Reel organico (R$300/mes).
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Reels_Stories</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Crescimento_Ciclo</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Robert_Semanal" name="Ciclo Semanal (P7D)">
      <bpmn2:incoming>Flow_Robert_Crescimento_Ciclo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Analise</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Robert_Analise" name="Analise Semanal — Metricas e Decisao">
      <bpmn2:documentation>ANALISE SEMANAL — ROBERT
Quando: toda segunda-manha, antes de planejar a semana.

METRICAS A VERIFICAR:
- Novos seguidores da semana (meta mes 1: +100/semana)
- Reel com mais views: replicar o formato/gancho
- Carrossel com mais saves: replicar o tema
- Cliques no link da bio (meta: acima de 50/semana)
- Seguidores novos no @fynessbr vindos das mencoes do Robert

DECISAO:
- O que mais engajou? Fazer mais do mesmo na proxima semana.
- O que nao engajou? Trocar o gancho, nao o tema.
- Cliques na bio baixos? Revisar o CTA do ultimo story de sexta.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Analise</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Gateway</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Robert_Crescimento" name="Crescimento no Ritmo Esperado?">
      <bpmn2:incoming>Flow_Robert_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Escalar</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Robert_Otimizar</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:task id="Task_Robert_Escalar" name="Escalar: Aumentar Frequencia e Colaboracoes">
      <bpmn2:documentation>QUANDO ESCALAR:
- Taxa de seguidores acima de 1% (seguidores novos / alcance)
- Reel acima de 50k views
- Crescimento acima de 500 seguidores/semana

ACOES:
- Aumentar de 2 para 3 Reels/semana.
- Ativar lead magnet PDF via link na bio.
- Agendar collab com conta maior do nicho.
- Investir R$300/mes em anuncio de Stories com o melhor Reel organico.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Escalar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Mensal_Timer</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Robert_Otimizar" name="Otimizar: Revisar Gancho e Formato">
      <bpmn2:documentation>DIAGNOSTICO POR PROBLEMA:

Views baixos (menos de 500 em 7 dias):
- Problema: gancho fraco nos primeiros 3 segundos.
- Solucao: testar 3 variantes de gancho para o mesmo tema.
  Dado chocante | Pergunta direta | Afirmacao polêmica.

Saves baixos no carrossel (menos de 2%):
- Problema: conteudo interessante mas nao acionavel.
- Solucao: adicionar checklist ou passo a passo no ultimo slide.

Muita visita ao perfil mas poucos seguidores novos:
- Problema: bio ou grid nao convence.
- Solucao: revisar bio e garantir que os 9 ultimos posts comunicam autoridade.

Crescimento parado por 2 semanas seguidas:
- Solucao: buscar collab urgente com conta maior.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Otimizar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Mensal_Timer</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Robert_Mensal" name="Avaliacao Mensal (P30D)">
      <bpmn2:incoming>Flow_Robert_Mensal_Timer</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Mensal</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P30D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Robert_Mensal" name="Relatorio Mensal e Planejamento">
      <bpmn2:documentation>RELATORIO MENSAL — ROBERT

CRESCIMENTO:
- Seguidores: [inicio] → [fim] | Meta era [X] | Atingiu?
- Melhor Reel: [titulo] | [X] views | [Y] saves
- @fynessbr: ganhou [X] seguidores via mencoes do Robert

CONVERSAO:
- Cliques no link da bio: [X]
- Trials iniciados via Robert (UTM): [X]

PLANEJAMENTO PROXIMO MES:
- Temas que performaram → replicar com angulo diferente
- Colaboracoes agendadas: [listar]
- Frequencia de Reels: 2x ou 3x por semana?
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Mensal</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Gateway_LP</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Robert_Engajou" name="Lead Clicou no Link da Bio?">
      <bpmn2:incoming>Flow_Robert_Gateway_LP</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Robert_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Robert_LP" name="Landing Page">
      <bpmn2:documentation>Lead clicou no link da bio do Robert.
UTM: utm_source=instagram&amp;utm_medium=organic&amp;utm_campaign=robert_bio</bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_LP" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:endEvent id="End_Robert_Organico" name="Continua no Feed (Maturacao)">
      <bpmn2:documentation>Lead nao converteu agora. Continua recebendo conteudo.
Ciclo natural: pode converter em semanas ou meses.
Quando estiver pronto, busca o link da bio espontaneamente.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Nao</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:sequenceFlow id="Flow_Robert_Setup_Semanal"  sourceRef="Start_Robert_Setup"        targetRef="Task_Robert_Calendario" />
    <bpmn2:sequenceFlow id="Flow_Robert_Reels_Stories"  sourceRef="Task_Robert_Calendario"    targetRef="Task_Robert_Crescimento" />
    <bpmn2:sequenceFlow id="Flow_Robert_Crescimento_Ciclo" sourceRef="Task_Robert_Crescimento" targetRef="Timer_Robert_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Robert_Analise"        sourceRef="Timer_Robert_Semanal"      targetRef="Task_Robert_Analise" />
    <bpmn2:sequenceFlow id="Flow_Robert_Gateway"        sourceRef="Task_Robert_Analise"       targetRef="Gateway_Robert_Crescimento" />
    <bpmn2:sequenceFlow id="Flow_Robert_Escalar"  name="No ritmo"      sourceRef="Gateway_Robert_Crescimento" targetRef="Task_Robert_Escalar" />
    <bpmn2:sequenceFlow id="Flow_Robert_Otimizar" name="Abaixo da meta" sourceRef="Gateway_Robert_Crescimento" targetRef="Task_Robert_Otimizar" />
    <bpmn2:sequenceFlow id="Flow_Robert_Mensal_Timer"   sourceRef="Task_Robert_Escalar"       targetRef="Timer_Robert_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Robert_Mensal_Timer2"  sourceRef="Task_Robert_Otimizar"      targetRef="Timer_Robert_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Robert_Mensal"         sourceRef="Timer_Robert_Mensal"       targetRef="Task_Robert_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Robert_Gateway_LP"     sourceRef="Task_Robert_Mensal"        targetRef="Gateway_Robert_Engajou" />
    <bpmn2:sequenceFlow id="Flow_Robert_Sim"  name="Sim" sourceRef="Gateway_Robert_Engajou"   targetRef="LinkThrow_Robert_LP" />
    <bpmn2:sequenceFlow id="Flow_Robert_Nao"  name="Nao" sourceRef="Gateway_Robert_Engajou"   targetRef="End_Robert_Organico" />

  </bpmn2:process>

  <!-- ============================================================ -->
`;

// ─────────────────────────────────────────────────────────────
// POOL 4 — KAYNAN
// ─────────────────────────────────────────────────────────────
const KAYNAN_NEW = `<!-- POOL 4: KAYNAN — PROXIMIDADE E PRODUTO (Build in Public)      -->
  <!-- ============================================================ -->
  <bpmn2:process id="Process_Kaynan" isExecutable="false">

    <bpmn2:startEvent id="Start_Kaynan_Setup" name="Setup do Perfil Kaynan (Do Zero)">
      <bpmn2:documentation>PERFIL: Kaynan | 19 anos | Co-fundador | Build in public
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
      </bpmn2:documentation>
      <bpmn2:outgoing>Flow_Kaynan_Setup_Perfil</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_Kaynan_CriarPerfil" name="Configurar Perfil (Fase Zero — Antes de Publicar)">
      <bpmn2:documentation>CHECKLIST DE SETUP (fazer uma vez, antes de qualquer post):

- Trocar para conta Criador de Conteudo
- Definir username: @kaynanfyness
- Publicar bio e link na bio (Linktree com: trial Fyness, @fynessbr, WhatsApp)
- Fazer foto profissional (Kaua fotografa)
- Criar 5 destaques com capas no padrao de cores Fyness
- Planejar e produzir os 9 primeiros posts do grid
- Publicar os 9 posts em 3 dias (3 por dia) antes de qualquer crescimento

GRID INICIAL (9 posts, em ordem):
1. Reel: "Quem sou e o que estou construindo"
2. Carrossel: "Construi um SaaS com 19 anos — o que aprendi"
3. Reel: Demo do Fyness funcionando (produto em acao)
4. Carrossel: "Por que construimos no WhatsApp e nao num app"
5. Reel: Feature favorita do produto (bastidor)
6. Carrossel: "Erros que quase me fizeram desistir"
7. Reel: Collab com Robert — "Dois fundadores, dois perfis opostos"
8. Carrossel: "Stack do Fyness explicado para nao tecnicos"
9. Reel: "Dia 1 do lancamento — o que aconteceu"
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Setup_Perfil</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Perfil_Reels</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Kaynan_Calendario" name="Calendario Semanal de Conteudo">
      <bpmn2:documentation>CALENDARIO SEMANAL — KAYNAN

SEGUNDA — Reel de bastidor (feed)
Tipo: video 20-45 segundos mostrando algo real do processo de construcao do produto.
Tom: espontaneo, como se fosse contar para um amigo.
Exemplo de gancho: "As 2h da manha encontrei um bug critico no dia anterior ao lancamento. Aqui esta o que aconteceu."
Publicar: 20h.

TERCA — Stories: bastidor de desenvolvimento (4 a 5 stories)
Tipo: print ou video de algo sendo construido ou corrigido.
Tom: transparente, sem filtro.
Obrigatorio: caixa de perguntas aberta. "Pergunta sobre o produto ou sobre empreender."
Objetivo: gerar perguntas reais para o conteudo da quarta.

QUARTA — Stories: responde perguntas + mencao ao @fynessbr (4 a 5 stories)
Tipo: Kaynan responde em video 2 a 3 perguntas recebidas na terca.
Obrigatorio: 1 story marcando @fynessbr com algo novo do produto.

QUINTA — Reel ou Carrossel de empreendedorismo jovem (feed)
Tipo: aprendizado pessoal, erro cometido, decisao importante — build in public.
Tom: vulneravel e direto. Nao glamouriza. Mostra o real.
Exemplo de gancho: "Quase desisti do Fyness. Vou ser honesto sobre o que aconteceu."

SEXTA — Stories: resultados da semana (3 stories)
Tipo: transparencia sobre o que aconteceu na semana. Trials novos, feature deployada, numero real.
Tom: sem exagero. Um numero real vale mais do que qualquer elogio.
Exemplo: "Essa semana: 8 trials novos, 1 feature deployada, 1 bug corrigido que me tirou o sono."

SABADO — Conteudo pessoal leve (stories)
Tipo: vida fora do Fyness. Academia, amigos, hobby. Humanizar.

DOMINGO — Story de reflexao + enquete (2 stories)
Tipo: o que aprendeu essa semana + pergunta para a audiencia.
Exemplo: "Aprendi essa semana: produto que resolve dor real vende. Produto bonito que nao resolve dor, nao vende."

COLLAB COM ROBERT (1 vez por mes):
Gravar 1 Reel juntos. Mesma gravacao, corte diferente para cada perfil.
Publicar nos 3 perfis: @kaynan, @robert, @fynessbr.
Formato: "19 anos vs 35 anos — como tomamos decisao no Fyness."
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Perfil_Reels</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Calendario_Crescimento</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Kaynan_Crescimento" name="Taticas de Crescimento de Seguidores">
      <bpmn2:documentation>CRESCIMENTO ORGANICO — ACOES SEMANAIS

META:
Mes 1: 200 → 700 (+500)
Mes 2: 700 → 1.500 (+800)
Mes 3: 1.500 → 2.500 (+1.000)
Mes 6: 5.000+

ACOES FIXAS POR SEMANA:
- Responder 100% dos comentarios nos primeiros 30 min apos cada post.
- Responder todas as DMs em ate 24h.
- Seguir ativamente quem comenta (audiencia pequena = conexao real possivel).
- Comentar em posts de outros criadores de tech e startup BR.
- Marcar @fynessbr toda quarta — sem falta.

FORMATOS COM MAIOR RETORNO DE SEGUIDORES:
1. Reel de bastidor com bug ou erro real (compartilhamento alto — identificacao)
2. Reel de "antes e depois" do produto (curiosidade + produto em acao)
3. Carrossel de licoes numeradas (saves altos = mais alcance)

ESCALA (a partir do mes 3):
- Passar de 2 para 3 Reels/semana.
- Criar serie semanal "Semana do Build in Public" (7 dias mostrando 1 aspecto do produto).
- Testar anuncio de Stories (R$200/mes) com o melhor Reel organico.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Calendario_Crescimento</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Collab_Ciclo</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Kaynan_Semanal" name="Ciclo Semanal (P7D)">
      <bpmn2:incoming>Flow_Kaynan_Collab_Ciclo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Analise</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Kaynan_Analise" name="Analise Semanal — Metricas e Ajuste">
      <bpmn2:documentation>ANALISE SEMANAL — KAYNAN
Quando: toda segunda-manha, junto com Robert.

METRICAS A VERIFICAR:
- Novos seguidores (meta mes 1: +100/semana)
- Reel com mais views: replicar gancho/formato
- Story com mais respostas: replicar tipo de conteudo
- Cliques no link da bio
- @fynessbr: quantos seguidores novos vieram das mencoes do Kaynan

DECISAO:
- Reel com menos de 300 views: gancho fraco. Trocar nos proximos 2 segundos, nao o tema.
- Crescimento parado: buscar collab urgente ou serie tematica nova.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Analise</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Gateway_Cresc</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Kaynan_Crescimento" name="Crescimento no Ritmo?">
      <bpmn2:incoming>Flow_Kaynan_Gateway_Cresc</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Escalar</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Kaynan_Otimizar</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:task id="Task_Kaynan_Escalar" name="Escalar: Frequencia e Build in Public Aprofundado">
      <bpmn2:documentation>QUANDO ESCALAR:
- +200 seguidores/semana consistente
- Reel acima de 20k views
- DMs espontaneas sobre o produto chegando

ACOES:
- 3 Reels/semana ao inves de 2.
- Serie "7 dias de Build in Public" — mostrar um aspecto diferente do produto por dia.
- Anuncio de Stories com melhor Reel organico (R$200/mes).
- Collab com criador de tech ou startup com mais de 10k.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Escalar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Mensal</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Kaynan_Otimizar" name="Otimizar: Gancho, Autenticidade e Formato">
      <bpmn2:documentation>DIAGNOSTICO POR PROBLEMA:

Reels com poucos views (menos de 300):
- Problema: gancho fraco nos 2 primeiros segundos.
- Solucao: comecar com revelacao imediata ou situacao absurda.
  "As 2h da manha..." | "Quase perdi tudo por causa disso..." | "Deixa eu te mostrar..."

Views ok mas sem novos seguidores:
- Problema: conteudo entretém mas nao faz querer mais.
- Solucao: CTA mais claro no final. "Segue aqui para acompanhar a jornada."

Crescimento parado por 2 semanas:
- Solucao: collab urgente ou novo angulo de conteudo (ex: mostrar dados reais do produto).
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Otimizar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Mensal</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Kaynan_Mensal" name="Avaliacao Mensal (P30D)">
      <bpmn2:incoming>Flow_Kaynan_Mensal</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Relatorio</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P30D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Kaynan_Relatorio" name="Relatorio Mensal e Planejamento">
      <bpmn2:documentation>RELATORIO MENSAL — KAYNAN

CRESCIMENTO:
- Seguidores: [inicio] → [fim] | Meta era [X]
- Melhor Reel: [titulo] | [X] views
- @fynessbr: [X] seguidores novos via Kaynan esse mes
- Trials iniciados via Kaynan (UTM): [X]

PLANEJAMENTO:
- Temas que performaram → replicar
- Colaboracoes agendadas: [listar]
- Frequencia de Reels: manter 2x ou aumentar para 3x?
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Relatorio</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Gateway_LP</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Kaynan_Engajou" name="Lead Clicou no Link da Bio?">
      <bpmn2:incoming>Flow_Kaynan_Gateway_LP</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Kaynan_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Kaynan_LP" name="Landing Page">
      <bpmn2:documentation>Lead clicou no link da bio do Kaynan.
UTM: utm_source=instagram&amp;utm_medium=organic&amp;utm_campaign=kaynan_bio</bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_LP" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:endEvent id="End_Kaynan_Organico" name="Continua no Feed (Maturacao)">
      <bpmn2:documentation>Lead nao converteu agora. Continua recebendo conteudo.
Build in public cria fidelidade — seguidores do Kaynan sao os mais engajados.
Quando estiver pronto, busca o link espontaneamente.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Nao</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:sequenceFlow id="Flow_Kaynan_Setup_Perfil"         sourceRef="Start_Kaynan_Setup"        targetRef="Task_Kaynan_CriarPerfil" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Perfil_Reels"         sourceRef="Task_Kaynan_CriarPerfil"   targetRef="Task_Kaynan_Calendario" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Calendario_Crescimento" sourceRef="Task_Kaynan_Calendario"  targetRef="Task_Kaynan_Crescimento" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Collab_Ciclo"         sourceRef="Task_Kaynan_Crescimento"   targetRef="Timer_Kaynan_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Analise"              sourceRef="Timer_Kaynan_Semanal"      targetRef="Task_Kaynan_Analise" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Gateway_Cresc"        sourceRef="Task_Kaynan_Analise"       targetRef="Gateway_Kaynan_Crescimento" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Escalar"  name="No ritmo"      sourceRef="Gateway_Kaynan_Crescimento" targetRef="Task_Kaynan_Escalar" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Otimizar" name="Abaixo da meta" sourceRef="Gateway_Kaynan_Crescimento" targetRef="Task_Kaynan_Otimizar" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Mensal"               sourceRef="Task_Kaynan_Escalar"       targetRef="Timer_Kaynan_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Mensal2"              sourceRef="Task_Kaynan_Otimizar"      targetRef="Timer_Kaynan_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Relatorio"            sourceRef="Timer_Kaynan_Mensal"       targetRef="Task_Kaynan_Relatorio" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Gateway_LP"           sourceRef="Task_Kaynan_Relatorio"     targetRef="Gateway_Kaynan_Engajou" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Sim"  name="Sim" sourceRef="Gateway_Kaynan_Engajou"        targetRef="LinkThrow_Kaynan_LP" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Nao"  name="Nao" sourceRef="Gateway_Kaynan_Engajou"        targetRef="End_Kaynan_Organico" />

  </bpmn2:process>

  <!-- ============================================================ -->
`;

// ─────────────────────────────────────────────────────────────
// POOL 5 — FYNESS INSTITUCIONAL
// ─────────────────────────────────────────────────────────────
const INST_NEW = `<!-- POOL 5: FYNESS INSTITUCIONAL (@fynessbr — 6 seguidores, do zero) -->
  <!-- ============================================================ -->
  <bpmn2:process id="Process_Institucional" isExecutable="false">

    <bpmn2:startEvent id="Start_Inst_Setup" name="Setup do @fynessbr (Do Zero)">
      <bpmn2:documentation>PERFIL: @fynessbr | 6 seguidores | Recém-criado
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
      </bpmn2:documentation>
      <bpmn2:outgoing>Flow_Inst_Setup_Calendario</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_Inst_Calendario" name="Calendario Editorial Semanal — 4 Pilares">
      <bpmn2:documentation>CALENDARIO SEMANAL — @FYNESSBR
Frequencia: 1 post por dia no feed + 5 stories por dia
Horario de post no feed: 18h30

SEGUNDA — Produto em acao (Reel 15-30s)
Tipo: screen recording do produto funcionando. 1 feature por video.
Tom: produto fala por si. Minimo de texto, maximo de demonstracao.
Exemplo: usuario digita "vendi R$2.000 hoje" no WhatsApp. Fyness confirma em 2 segundos. Dashboard atualiza.
Legenda exemplo: "Sua venda registrada em 2 segundos. Sem planilha. Sem app novo. So o WhatsApp. Teste 7 dias: link na bio."

TERCA — Educativo com solucao (Carrossel 6-8 slides)
Tipo: problema financeiro real → o Fyness como solucao natural.
Tom: objetivo, sem rodeios. O produto aparece sempre como resposta, nao como produto.
Exemplo de titulo: "Voce sabe qual e o lucro real do seu negocio esse mes?"
Exemplo de ultimo slide: "O Fyness responde isso em 3 segundos. 7 dias gratis: link na bio."

QUARTA — Prova social (Depoimento ou Case)
Fase inicial (sem clientes): usar depoimento dos fundadores.
Exemplo Robert: "Uso o Fyness todos os dias. Nao porque sou co-fundador. Porque funciona."
Fase com clientes: print de mensagem ou video de 30s. Resultado especifico obrigatorio.
Exemplo de formato: "Antes: planilha que ninguem atualizava. Depois: DRE em tempo real. — [nome], [setor]"

QUINTA — Produto em acao (Feature especifica)
Tipo: demo de uma feature diferente da segunda-feira.
Rotacao de features: DRE em tempo real | alerta de vencimento | analise de margem | projecao de caixa | registro por audio.
Legenda padrao: "[descricao do que esta sendo mostrado]. Isso e o Fyness. 7 dias gratis: link na bio."

SEXTA — Oferta direta (Carrossel ou Reel)
Tipo: post com CTA direto para o trial. 1 vez por semana.
Exemplo de copy: "7 dias gratis. Sem cartao. Cancele quando quiser.
O que voce leva: controle financeiro completo, DRE automatico, alertas de vencimento, analise de margem.
Tudo pelo WhatsApp. Link na bio."
Tratar objecoes em rodizio semanal: "nao tenho tempo" | "ja uso planilha" | "e seguro?" | "funciona para meu negocio?"

SABADO — Repost do melhor conteudo dos fundadores
Tipo: repostar o melhor Reel ou carrossel da semana de Robert ou Kaynan.
Legenda: "De @[perfil] — Isso e exatamente o que o Fyness resolve. Trial gratis: link na bio."

DOMINGO — Story de engajamento
Tipo: enquete ou caixa de perguntas sobre dor financeira do seguidor.
Objetivo: coletar dados reais sobre o publico + alimentar pauta da proxima semana.
Exemplo: "Voce usa alguma ferramenta de controle financeiro no seu negocio?" [Sim] [Nao]

STORIES DIARIOS (5 por dia, Kaua programa):
- 1 story com link direto para o trial (obrigatorio, todos os dias)
- 1 story com dado ou estatistica sobre financas de PMEs (2x/semana)
- 1 story de demo rapida do produto em 10 segundos (2x/semana)
- 1 story de enquete ou caixa de perguntas (2x/semana)
- 1 story repostando mencao de fundador (quando disponivel)
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Setup_Calendario</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Calendario_PS</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Inst_ProvasSociais" name="Coleta e Publicacao de Prova Social">
      <bpmn2:documentation>PROTOCOLO DE COLETA DE DEPOIMENTOS

FASE 1 — SEM CLIENTES (primeiros 30-60 dias):
Usar depoimentos dos fundadores como prova social inicial.
Robert e Kaynan gravam video de 30s cada sobre o proprio uso do produto.
Publicar como post de quarta-feira.

FASE 2 — PRIMEIROS CLIENTES:
Dia 3 do trial → mensagem: "Como esta sendo a experiencia? Tem algo que poderia melhorar?"
Dia 7 do trial → mensagem: "Em uma frase: o que o Fyness fez pelo seu negocio ate agora?"
Apos conversao → pedir depoimento em video de 30s. Incentivo: 1 mes extra gratis.

COMO PUBLICAR:
- Video editado por Kaua (logo Fyness, legenda, nome e setor do cliente)
- Print de mensagem (com permissao — bloquear sobrenome se necessario)
- Formato obrigatorio: resultado especifico, nao elogio generico.
  RUIM: "Otimo produto, recomendo!"
  BOM: "Descobri que um servico meu dava prejuizo. Cortei. Lucro subiu R$3.200/mes."

META: 10 depoimentos publicados ate o mes 3.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Calendario_PS</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_PS_CTA</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Inst_CTA" name="CTA Diario e Conversao para Trial">
      <bpmn2:documentation>CONVERSAO — ACOES DIARIAS

STORY COM LINK (todos os dias, sem excecao):
- 1 story por dia com link direto para o trial.
- Variar o visual a cada semana (Kaua cria templates rotativos).
- Texto base: "7 dias gratis — sem cartao — comeca aqui"

DESTAQUES ATUALIZADOS SEMANALMENTE:
- Demo: ultimas demos publicadas no feed
- Clientes: depoimentos coletados
- Features: uma feature por story explicada
- FAQ: respostas das duvidas mais frequentes
- Trial: como funciona, o que inclui, como comecar

METRICAS DE CONVERSAO (mais importante que seguidores):
- Cliques no link da bio (UTM: utm_campaign=fynessbr_organico)
- Cliques nos links dos stories (UTM: utm_campaign=fynessbr_stories)
- Trials iniciados via @fynessbr
- Meta: taxa de conversao acima de 8% (cliques → trials)
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_PS_CTA</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_CTA_Ciclo</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Inst_Semanal" name="Ciclo Semanal (P7D)">
      <bpmn2:incoming>Flow_Inst_CTA_Ciclo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Analise</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Inst_Analise" name="Analise Semanal — Foco em Conversao">
      <bpmn2:documentation>ANALISE SEMANAL — @FYNESSBR
Quando: toda segunda-manha, junto com Robert e Kaynan.

METRICAS PRINCIPAIS (foco em conversao, nao em seguidores):
- Cliques no link da bio: [X] (meta: crescer toda semana)
- Cliques nos links de stories: [X]
- Trials iniciados via Instagram: [X]
- Taxa de conversao: trials / cliques × 100 (meta: acima de 8%)

METRICAS SECUNDARIAS:
- Qual post gerou mais cliques na bio? (replicar)
- Qual story de link teve mais cliques? (replicar horario e visual)
- Novos seguidores: [X] (crescem via mencoes dos fundadores)

DIAGNOSTICO:
- Cliques baixos: CTA fraco ou story de link sem apelo visual — Kaua refaz.
- Cliques ok mas trials baixos: problema esta na LP, nao no Instagram.
- Sem crescimento de seguidores: verificar se Robert e Kaynan estao marcando @fynessbr.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Analise</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Gateway</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Inst_Conversao" name="Taxa de Conversao Acima de 8%?">
      <bpmn2:incoming>Flow_Inst_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Escalar</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Inst_Otimizar</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:task id="Task_Inst_Escalar" name="Escalar: Ampliar Demos e Prova Social">
      <bpmn2:documentation>QUANDO ESCALAR:
- Taxa de conversao consistente acima de 8%
- Stories de link com mais de 5% de cliques
- Trials novos por semana crescendo

ACOES:
- 2 stories de link por dia ao inves de 1.
- Acelerar coleta de depoimentos (contatar todos os trials convertidos).
- Serie "Feature da semana" — uma feature nova a cada semana.
- Solicitar a Robert e Kaynan que aumentem mencoes ao @fynessbr.
- Testar anuncio de Stories do @fynessbr (R$200/mes) com o melhor post organico.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Escalar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Mensal</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Inst_Otimizar" name="Otimizar: CTA, Visual e Frequencia de Link">
      <bpmn2:documentation>DIAGNOSTICO POR PROBLEMA:

Cliques baixos no story de link:
- Story de link sem apelo visual — Kaua refaz com novo design.
- Testar textos diferentes: "7 dias gratis" vs "Comeca gratis agora" vs "Ver o Fyness funcionando".

Alcance baixo no feed:
- Testar horarios diferentes: 12h e 19h alem do 18h30.
- Revisar consistencia visual do grid.

Trials baixos mesmo com cliques ok:
- Problema esta na LP (acionar ciclo de CRO do Pool 6).
- Passar dados para Kaua: "pessoas chegam mas nao convertem".
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Otimizar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Mensal</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Inst_Mensal" name="Avaliacao Mensal (P30D)">
      <bpmn2:incoming>Flow_Inst_Mensal</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Relatorio</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P30D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Inst_Relatorio" name="Relatorio Mensal e Planejamento Editorial">
      <bpmn2:documentation>RELATORIO MENSAL — @FYNESSBR

CONVERSAO (principal):
- Cliques no link da bio: [X]
- Trials iniciados via Instagram: [X]
- Taxa de conversao: [X]%
- Melhor post de conversao: [titulo]

CRESCIMENTO:
- Seguidores: [inicio] → [fim]
- Depoimentos coletados esse mes: [X]

PLANEJAMENTO:
- Novas features a demonstrar: [listar]
- Depoimentos agendados: [listar]
- Anuncio de Stories? [Sim/Nao — budget]
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Relatorio</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_LP</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Inst_LP" name="Landing Page">
      <bpmn2:documentation>Lead clicou no link do @fynessbr.
UTM: utm_source=instagram&amp;utm_medium=bio&amp;utm_campaign=fynessbr_organico</bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_LP</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_LP" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:sequenceFlow id="Flow_Inst_Setup_Calendario"  sourceRef="Start_Inst_Setup"         targetRef="Task_Inst_Calendario" />
    <bpmn2:sequenceFlow id="Flow_Inst_Calendario_PS"     sourceRef="Task_Inst_Calendario"     targetRef="Task_Inst_ProvasSociais" />
    <bpmn2:sequenceFlow id="Flow_Inst_PS_CTA"            sourceRef="Task_Inst_ProvasSociais"  targetRef="Task_Inst_CTA" />
    <bpmn2:sequenceFlow id="Flow_Inst_CTA_Ciclo"         sourceRef="Task_Inst_CTA"            targetRef="Timer_Inst_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Inst_Analise"           sourceRef="Timer_Inst_Semanal"       targetRef="Task_Inst_Analise" />
    <bpmn2:sequenceFlow id="Flow_Inst_Gateway"           sourceRef="Task_Inst_Analise"        targetRef="Gateway_Inst_Conversao" />
    <bpmn2:sequenceFlow id="Flow_Inst_Escalar"  name="Acima de 8%"  sourceRef="Gateway_Inst_Conversao" targetRef="Task_Inst_Escalar" />
    <bpmn2:sequenceFlow id="Flow_Inst_Otimizar" name="Abaixo de 8%" sourceRef="Gateway_Inst_Conversao" targetRef="Task_Inst_Otimizar" />
    <bpmn2:sequenceFlow id="Flow_Inst_Mensal"            sourceRef="Task_Inst_Escalar"        targetRef="Timer_Inst_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Inst_Mensal2"           sourceRef="Task_Inst_Otimizar"       targetRef="Timer_Inst_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Inst_Relatorio"         sourceRef="Timer_Inst_Mensal"        targetRef="Task_Inst_Relatorio" />
    <bpmn2:sequenceFlow id="Flow_Inst_LP"                sourceRef="Task_Inst_Relatorio"      targetRef="LinkThrow_Inst_LP" />

  </bpmn2:process>

  <!-- ============================================================ -->
`;

// ─────────────────────────────────────────────────────────────
// APPLY ALL THREE REPLACEMENTS
// ─────────────────────────────────────────────────────────────

function replacePool(c, startMarker, endMarker, newContent) {
  const startIdx = c.indexOf(startMarker);
  const endIdx   = c.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) {
    console.error(`Marker not found: "${startMarker}" or "${endMarker}"`);
    return c;
  }
  return c.slice(0, startIdx) + newContent + c.slice(endIdx);
}

content = replacePool(content, '<!-- POOL 3: ROBERT', '<!-- POOL 4: KAYNAN', ROBERT_NEW);
console.log('Pool 3 (Robert) substituido');

content = replacePool(content, '<!-- POOL 4: KAYNAN', '<!-- POOL 5:', KAYNAN_NEW);
console.log('Pool 4 (Kaynan) substituido');

content = replacePool(content, '<!-- POOL 5:', '<!-- POOL 6:', INST_NEW);
console.log('Pool 5 (Institucional) substituido');

writeFileSync(filePath, content, 'utf8');
console.log(`\nArquivo salvo: ${content.length} chars, ${content.split('\n').length} linhas`);

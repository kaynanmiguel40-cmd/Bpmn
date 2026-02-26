/**
 * Template BPMN - JORNADA COMERCIAL FYNESS V9 (COMPLETO ENXUTO)
 * Template com TODAS as 7 POOLS SEPARADAS - Versão reestruturada
 * SINCRONIZADO COM SUPABASE em Tue Feb 10 09:52:28 -03 2026
 */

export const COMERCIAL_V9_COMPLETE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0" id="Definitions_ComercialV9" targetNamespace="http://fyness.com/bpmn/comercial-v9">
  <bpmn2:collaboration id="Collaboration_Comercial">
    <bpmn2:participant id="Participant_Educacao" name="EDUCAÇÃO" processRef="Process_Educacao" />
    <bpmn2:participant id="Participant_Indicacao" name="INDICAÇÃO" processRef="Process_Indicacao" />
    <bpmn2:participant id="Participant_Conteudo" name="PRODUÇÃO De CONTEÚDO" processRef="Process_Conteudo" />
    <bpmn2:participant id="Participant_Prospeccao" name="🎯 PROSPECÇÃO ATIVA - Ligação Direta" processRef="Process_Prospeccao" />
    <bpmn2:participant id="Participant_Google" name="GOOGLE" processRef="Process_Google" />
    <bpmn2:participant id="Participant_Nucleo" name="Gateway Asaas" processRef="Process_Nucleo" />
    <bpmn2:participant id="Participant_Meta" name="META ADS" processRef="Process_Meta" />
    <bpmn2:participant id="Participant_Trial" name="🎯 TRIAL 7 DIAS" processRef="Process_Trial" />
  </bpmn2:collaboration>
  <bpmn2:process id="Process_Educacao" isExecutable="false">
    <bpmn2:startEvent id="Start_Educacao" name="Lead Quer Aprender Gestão">
      <bpmn2:documentation>LEAD EDUCAÇÃO — FUNIL INVERTIDO:
Lead veio por conteúdo educativo (webinar, aula gratuita, post sobre gestão).

⚡ ESTRATÉGIA: FUNIL INVERTIDO
Não vende primeiro. ENTREGA VALOR primeiro.
1. D0: Entrega Aula Secreta (resultado real)
2. D1: Follow-up consultivo ("Conseguiu aplicar?")
3. D3: Demo do Fyness ("Quer automatizar o que aprendeu?")
4. D7: Escassez ("Turma fecha em X dias")

A VENDA É CONSEQUÊNCIA do valor entregue.
Lead que experimentou o resultado COMPRA SOZINHO.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Edu_Start</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:serviceTask id="Task_Tag_Educacao" name="CRM: Tag [LEAD_EDUCACAO]">
      <bpmn2:documentation>CRM ACTION:
Tag: [LEAD_EDUCACAO]
Origem: Conteúdo educativo / Webinar / Aula gratuita
→ Lead quer aprender, não comprar. NÃO VENDER AGORA.
→ Primeiro entregar valor, depois a venda vem sozinha.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Tag</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:sendTask id="Task_Edu_D0_MiniAula" name="D0 - Entrega Aula Secreta">
      <bpmn2:documentation>🔒 D0 — AULA SECRETA (NÃO VENDE):

FUNIL INVERTIDO: O primeiro contato NÃO é ligação, é ENTREGA DE RESULTADO.

WHATSAPP AUTOMÁTICO:
"Oi [Nome]! Vi que você se interessou por gestão financeira.

Separei uma Aula Secreta exclusiva pra você:
🔒 'Os 3 Erros que Fazem Empresários Perderem Dinheiro Sem Saber'
[Link da Aula Secreta]

É prática — você vai aplicar no seu negócio agora.
Depois me conta como foi!"

CONTEÚDO DA AULA SECRETA (20-25 min):
1. Os 3 erros fatais de gestão financeira (5 min)
2. O que é DRE e por que 90% dos MEIs não fazem (5 min)
3. Passo a passo: montar DRE com receitas e despesas reais (7 min)
4. Como ler o resultado: você tá lucrando ou perdendo? (3 min)
5. CTA FINAL → CURSO COMPLETO (2-3 min):
   "Isso foi só 1 módulo. O curso completo tem X módulos:
   Fluxo de Caixa, Precificação, Impostos, Indicadores...
   E de BÔNUS você ganha o Fyness (software que automatiza tudo).
   [Botão: Quero o Curso Completo]"

⏱️ TRIGGER DE WATCH-TIME (10 MINUTOS):
→ Quando o lead assistir 10+ min (40%) da Aula Secreta:
  • Automação notifica o Closer: "Lead [Nome] assistiu 10 min da Aula Secreta"
  • Closer envia WhatsApp: "Vi que você tá assistindo! Qualquer dúvida, me chama."
  • Tom: consultivo, ajuda. NÃO vender.
→ Se assistiu menos de 10 min: NÃO mandar msg. Esperar D1.
→ Se assistiu 100% (chegou no CTA): Lead QUENTE — priorizar no D1.
→ Se clicou no CTA "Quero o Curso": Lead PRONTO — Closer liga imediatamente.

RESULTADO: Lead aplica no próprio negócio e VÊ o valor.
No final, é levado naturalmente pro Curso completo.
NÃO LIGAR. NÃO VENDER. Só entregar.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Tag</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_D0</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:intermediateCatchEvent id="Timer_Edu_D1" name="1 dia">
      <bpmn2:incoming>Flow_Edu_D0</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Timer_D1</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P1D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sendTask id="Task_Edu_D1_Followup" name="D1 - Follow-up: Conseguiu Aplicar?">
      <bpmn2:documentation>📱 D1 — FOLLOW-UP CONSULTIVO (NÃO VENDE):

WHATSAPP:
"E aí [Nome], conseguiu montar o DRE?

Se fez: Qual foi o resultado? Lucro ou prejuízo?
Se não fez: Normal, posso te ajudar. Qual sua maior dúvida?"

→ SE RESPONDEU:
  Conversa natural. Ajuda de verdade. Não menciona produto.
  Se ele perguntar "como automatizar?": "Posso te mostrar amanhã em 15 min."
  
→ SE NÃO RESPONDEU:
  Seguir cadência. Não insistir.

REGRA DE OURO: Se o lead pedir ajuda, AJUDE.
A venda vem depois. Confiança primeiro.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Timer_D1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_D1</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:intermediateCatchEvent id="Timer_Edu_D3" name="2 dias">
      <bpmn2:incoming>Flow_Edu_D1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Timer_D3</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P2D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:task id="Task_Edu_D3_Demo" name="D3 - Demo: Automatizar com Fyness">
      <bpmn2:documentation>🎬 D3 — PONTO DE VIRADA (MOSTRAR O SOFTWARE DENTRO DO CURSO):

O lead já aprendeu o conceito (DRE na Aula Secreta). Agora mostrar
que o SOFTWARE FAZ PARTE DO CURSO — não é separado, é integrado.

WHATSAPP + LIGAÇÃO:
"[Nome], lembra do DRE que você montou na Aula Secreta?

Imagina se em vez de fazer na mão, você falasse por áudio
e o sistema montasse sozinho. Em 10 segundos.

Isso é o Fyness — e ele já vem DENTRO do curso.
Posso te mostrar em 15 min como funciona?"

DEMO (15 min):
1. Abrir Fyness → lançar receita por ÁUDIO (momento WOW)
2. Gráfico aparece automaticamente → "Esse é o DRE que você fez na mão"
3. Mostrar DRE automático + Fluxo de Caixa + Alertas
4. OFERTA: "O curso ensina o método. O Fyness, que vem dentro, automatiza tudo."

⚠️ IMPORTANTE: NÃO EXISTE TRIAL SEPARADO DO SOFTWARE.
O Fyness está DENTRO da plataforma de Educação.
O lead compra o Curso e já tem acesso ao software integrado.

OFERTA COMPLETA:
✅ Curso completo de gestão financeira (todos os módulos)
✅ Software Fyness integrado (acesso dentro da plataforma)
✅ Comunidade de empresários
✅ Mentorias ao vivo
"Quer se inscrever? [Link do checkout]"

BANCO DE DEMOS POR SETOR:
→ Contabilidade | Comércio | Clínica | Prestador | Academia | Restaurante

A VENDA AQUI É NATURAL: lead já viu o valor manual,
agora vê o valor automatizado. A compra é óbvia.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Timer_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_D3</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:exclusiveGateway id="Gateway_Edu_Quer_Trial" name="Quer o Curso?">
      <bpmn2:incoming>Flow_Edu_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Trial_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Edu_Trial_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:endEvent id="LinkThrow_Educacao_Trial" name="→ Checkout Curso">
      <bpmn2:documentation>CONVERSÃO — LEAD QUER O CURSO:

Lead aceitou a oferta (após D3 Demo ou D7 Escassez).
→ Direcionar para página de checkout do Curso
→ O Software (Fyness) já está DENTRO do curso como ferramenta
→ NÃO existe Trial separado — o lead compra o pacote completo

PACOTE:
✅ Curso completo de gestão financeira (todos os módulos)
✅ Software Fyness integrado (acesso dentro da plataforma)
✅ Comunidade de empresários
✅ Mentorias ao vivo

Se abandonar o checkout → Fluxo de Abandono de Carrinho cuida.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Trial_Sim</bpmn2:incoming>
      <bpmn2:incoming>Flow_Edu_Resp_Sim</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:intermediateCatchEvent id="Timer_Edu_D7" name="4 dias">
      <bpmn2:incoming>Flow_Edu_Trial_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Timer_D7</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P4D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sendTask id="Task_Edu_D7_Escassez" name="D7 - Escassez: Turma Fecha">
      <bpmn2:documentation>⏰ D7 — ESCASSEZ (ÚLTIMA CHANCE):

WHATSAPP:
"[Nome], última mensagem sobre o método.

Lembra do DRE que você aprendeu a montar?
Os alunos que automatizaram com o Fyness estão economizando
em média 8 horas por mês em gestão financeira.

Estamos fechando as vagas da turma de [mês].
Depois só na próxima.

Quer garantir a sua?"

+ 1 LIGAÇÃO FINAL (se não respondeu em 4h):
"[Nome], vi que você não respondeu.
Só queria saber se ficou alguma dúvida sobre o curso.
Se não for pra agora, sem problema — posso te avisar da próxima turma."

→ Se respondeu → Checkout Curso (curso + software integrado)
→ Se ignorou → Nurturing</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Timer_D7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_D7</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:exclusiveGateway id="Gateway_Edu_Respondeu" name="Respondeu?">
      <bpmn2:incoming>Flow_Edu_D7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Resp_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Edu_Resp_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:serviceTask id="Task_Edu_Nurturing" name="Grupo Nurturing Educação">
      <bpmn2:documentation>GRUPO NURTURING — LEAD EDUCAÇÃO:

Lead recebeu valor mas não converteu. Sem problema — continua nutrindo.

CADÊNCIA SEMANAL:
- SEG: Dica prática de gestão (mini-conteúdo real)
- QUA: Case de resultado: "[Empresário] economizou R$ X com o método"
- SEX: Conteúdo gratuito (Aula Secreta, planilha, checklist)

REATIVAÇÃO:
- Se clicar 2x em conteúdo → Ligar: "Vi que você tá acompanhando..."
- Campanhas sazonais: "Nova turma do método aberta"
- A cada 30 dias: nova Aula Secreta (mantém ciclo do funil invertido)

CRM: Tag [LEAD_EDUCACAO_NURTURING]
Esse lead JÁ VIU VALOR. Quando estiver pronto, volta.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Resp_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Nurturing_End</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:endEvent id="End_Edu_Nurturing" name="Nurturing Ativo">
      <bpmn2:incoming>Flow_Edu_Nurturing_End</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:startEvent id="Start_Edu_Abandono" name="Carrinho Abandonado">
      <bpmn2:documentation>🛒 TRIGGER — ABANDONO DE CARRINHO:

Lead clicou "Quero o Curso" (CTA da Aula Secreta ou oferta na demo)
e INICIOU o checkout, mas NÃO completou a compra.

QUANDO DISPARA:
→ Lead chegou na página de checkout/pagamento
→ Inseriu dados mas NÃO finalizou
→ Ou clicou "Quero o Curso" mas não avançou pro pagamento

AUTOMAÇÃO:
→ Plataforma detecta abandono → dispara cadência de recuperação
→ 3 tentativas em 48h (30min, 24h, 48h)
→ Cada msg com estratégia diferente (urgência leve, prova social, escassez)

REGRA: Se completar a compra em QUALQUER momento → cancelar cadência.
Se não recuperar após 48h → Lead volta ao funil normal (D1 follow-up).</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Edu_Ab_Start</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:intermediateCatchEvent id="Timer_Edu_Ab_30min" name="30 min">
      <bpmn2:incoming>Flow_Edu_Ab_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Ab_Timer30</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT30M</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sendTask id="Task_Edu_Abandono_30min" name="30min - Vi Que Faltou Pouco">
      <bpmn2:documentation>⏰ 30 MINUTOS — RECOVERY 1 (URGÊNCIA LEVE):

WHATSAPP AUTOMÁTICO:
"Oi [Nome]! Vi que você começou a se inscrever no curso mas não finalizou.

Acontece — às vezes a internet falha, o celular trava...

Seu acesso tá reservado por mais algumas horas.
É só clicar aqui pra finalizar: [Link do checkout]

Qualquer dúvida, me chama!"

ESTRATÉGIA:
→ Tom amigável, assume problema técnico (não culpa o lead)
→ NÃO pressionar. NÃO dar desconto ainda.
→ Só facilitar o caminho de volta ao checkout
→ Link direto pro checkout (sem precisar refazer dados)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Ab_Timer30</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Ab_30</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:intermediateCatchEvent id="Timer_Edu_Ab_24h" name="24h">
      <bpmn2:incoming>Flow_Edu_Ab_30</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Ab_Timer24</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P1D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sendTask id="Task_Edu_Abandono_24h" name="24h - Depoimento + Bônus">
      <bpmn2:documentation>📱 24 HORAS — RECOVERY 2 (PROVA SOCIAL + BÔNUS):

WHATSAPP:
"[Nome], o [Empresário do mesmo setor] começou igual a você —
assistiu a Aula Secreta, se inscreveu no curso, e em 30 dias
identificou R$ 2.800 em gastos invisíveis no negócio dele.

E lembra que assinando você GANHA o Fyness (software
de gestão financeira) de bônus? O método ensina, o software automatiza.

Seu acesso ainda tá reservado: [Link do checkout]"

ESTRATÉGIA:
→ Prova social real (case do mesmo segmento do lead)
→ Reforço do bônus (Software grátis com Educação)
→ Aumentar valor percebido, não baixar preço
→ Se respondeu interessado: Closer liga (máx 1 ligação)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Ab_Timer24</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Ab_24</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:intermediateCatchEvent id="Timer_Edu_Ab_48h" name="48h">
      <bpmn2:incoming>Flow_Edu_Ab_24</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Ab_Timer48</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P1D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sendTask id="Task_Edu_Abandono_48h" name="48h - Última Chance">
      <bpmn2:documentation>🔥 48 HORAS — RECOVERY 3 (ESCASSEZ + LIGAÇÃO FINAL):

WHATSAPP:
"[Nome], última mensagem sobre o curso.

Seu acesso reservado expira HOJE.
Depois disso, só na próxima turma (e o preço pode mudar).

Lembra tudo que você leva:
✅ Curso completo de gestão financeira
✅ Fyness (software) de BÔNUS
✅ Comunidade de empresários
✅ Mentorias ao vivo

Tudo isso por [preço]. [Link FINAL do checkout]

Se tiver alguma dúvida que te travou, me chama: [telefone]"

→ Se não respondeu em 4h: 1 LIGAÇÃO FINAL do Closer
→ Script: "Vi que você quase se inscreveu. Aconteceu algo?
   Posso te ajudar com alguma dúvida?"

ESTRATÉGIA:
→ Escassez REAL (acesso expira, preço pode mudar)
→ Resumo de tudo que o lead ganha (stack completo)
→ Ligação humanizada — não vender, tirar dúvida
→ Se não converter: NÃO insistir. Lead volta ao funil normal.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Ab_Timer48</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Ab_48</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:exclusiveGateway id="Gateway_Edu_Recuperou" name="Recuperou?">
      <bpmn2:incoming>Flow_Edu_Ab_48</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Recuperou_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Edu_Recuperou_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:endEvent id="End_Edu_Cliente" name="Cliente Educação">
      <bpmn2:documentation>CONVERSÃO! Lead completou a compra do curso.
→ Acesso ao Curso completo liberado
→ Bônus: Fyness (software) ativado
→ Adicionado à Comunidade de empresários
→ Agenda mentoria ao vivo
→ CRM: Tag [CLIENTE_EDUCACAO] + [RECUPERADO_CARRINHO]</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Recuperou_Sim</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:endEvent id="End_Edu_Volta_Funil" name="Volta ao Funil">
      <bpmn2:documentation>Lead NÃO recuperou no carrinho abandonado.
MAS não é lead perdido — ele já assistiu a Aula Secreta e QUASE comprou.

→ Volta ao funil normal (D1 follow-up consultivo)
→ CRM: Tag [ABANDONO_CARRINHO_NAO_RECUPEROU]
→ Priorizar este lead no D1 e D3 (alta intenção comprovada)
→ No D3 Demo, mencionar: "Vi que você quase se inscreveu no curso..."</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Recuperou_Nao</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_Edu_Start" sourceRef="Start_Educacao" targetRef="Task_Tag_Educacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_Tag" sourceRef="Task_Tag_Educacao" targetRef="Task_Edu_D0_MiniAula" />
    <bpmn2:sequenceFlow id="Flow_Edu_D0" sourceRef="Task_Edu_D0_MiniAula" targetRef="Timer_Edu_D1" />
    <bpmn2:sequenceFlow id="Flow_Edu_Timer_D1" sourceRef="Timer_Edu_D1" targetRef="Task_Edu_D1_Followup" />
    <bpmn2:sequenceFlow id="Flow_Edu_D1" sourceRef="Task_Edu_D1_Followup" targetRef="Timer_Edu_D3" />
    <bpmn2:sequenceFlow id="Flow_Edu_Timer_D3" sourceRef="Timer_Edu_D3" targetRef="Task_Edu_D3_Demo" />
    <bpmn2:sequenceFlow id="Flow_Edu_D3" sourceRef="Task_Edu_D3_Demo" targetRef="Gateway_Edu_Quer_Trial" />
    <bpmn2:sequenceFlow id="Flow_Edu_Trial_Sim" name="Sim" sourceRef="Gateway_Edu_Quer_Trial" targetRef="LinkThrow_Educacao_Trial" />
    <bpmn2:sequenceFlow id="Flow_Edu_Trial_Nao" name="Não" sourceRef="Gateway_Edu_Quer_Trial" targetRef="Timer_Edu_D7" />
    <bpmn2:sequenceFlow id="Flow_Edu_Timer_D7" sourceRef="Timer_Edu_D7" targetRef="Task_Edu_D7_Escassez" />
    <bpmn2:sequenceFlow id="Flow_Edu_D7" sourceRef="Task_Edu_D7_Escassez" targetRef="Gateway_Edu_Respondeu" />
    <bpmn2:sequenceFlow id="Flow_Edu_Resp_Sim" name="Sim" sourceRef="Gateway_Edu_Respondeu" targetRef="LinkThrow_Educacao_Trial" />
    <bpmn2:sequenceFlow id="Flow_Edu_Resp_Nao" name="Não" sourceRef="Gateway_Edu_Respondeu" targetRef="Task_Edu_Nurturing" />
    <bpmn2:sequenceFlow id="Flow_Edu_Nurturing_End" sourceRef="Task_Edu_Nurturing" targetRef="End_Edu_Nurturing" />
    <bpmn2:startEvent id="Start_Edu_100_SemCTA" name="Assistiu 100% Sem CTA">
      <bpmn2:documentation>⏱️ TRIGGER — ASSISTIU AULA SECRETA INTEIRA MAS NÃO CLICOU NO CTA:

Lead assistiu os 20-25 min da Aula Secreta até o final,
VIU o CTA "Quero o Curso Completo", mas NÃO clicou.

DIFERENÇA DO ABANDONO DE CARRINHO:
→ Abandono: clicou CTA, iniciou checkout, não pagou (problema de decisão/pagamento)
→ Este caso: NÃO clicou CTA (ainda não se convenceu de que precisa do curso)

POR QUE ESSE LEAD É ESPECIAL:
→ Investiu 20-25 min assistindo — comprometimento ALTO
→ Viu o CTA mas não agiu — precisa de empurrão consultivo
→ Diferente de quem não assistiu: esse lead SABE o valor

AUTOMAÇÃO:
→ Plataforma detecta: watch-time = 100% + CTA_click = false
→ Espera 2h (não ser invasivo)
→ Dispara mensagem consultiva (NÃO de venda)</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Edu_100_Start</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:intermediateCatchEvent id="Timer_Edu_100_2h" name="2h">
      <bpmn2:incoming>Flow_Edu_100_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_100_Timer</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT2H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sendTask id="Task_Edu_100_Followup" name="2h - Qual Parte Mais Útil?">
      <bpmn2:documentation>📱 2 HORAS APÓS 100% — FOLLOW-UP CONSULTIVO:

O lead assistiu TUDO. Viu o CTA mas não clicou.
Ele precisa de um empurrão consultivo, não de venda.

WHATSAPP:
"[Nome], vi que você assistiu a Aula Secreta inteira! 💪

Qual parte foi mais útil pro seu negócio?
O DRE? O fluxo de caixa? A leitura de resultado?

Pergunto porque dependendo da sua resposta, posso
te indicar o próximo passo mais certeiro."

→ SE RESPONDEU:
  Conversa natural. Baseado na resposta dele:
  - Se falou DRE: "Quer ver como o Fyness monta o DRE automático? Posso te mostrar em 15 min."
  - Se falou fluxo: "Tem um módulo inteiro sobre isso no curso. Quer ver o conteúdo?"
  - Se fez pergunta: Responder e direcionar pro curso naturalmente

→ SE NÃO RESPONDEU:
  Não insistir. D1 Follow-up cuida amanhã.

REGRA: A pergunta "qual parte foi mais útil?" faz o lead
REVIVER o valor que ele absorveu. É recall + engajamento.
Se ele responder, a porta do curso se abre naturalmente.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_100_Timer</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_100_End</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:endEvent id="End_Edu_100_Seguir" name="Segue D1">
      <bpmn2:documentation>Mensagem consultiva enviada. Lead segue pro D1 Follow-up normalmente.
Se respondeu → Closer dá continuidade na conversa.
Se não respondeu → D1 cuida amanhã.
CRM: Tag [ASSISTIU_100_SEM_CTA]</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_100_End</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_Edu_Ab_Start" sourceRef="Start_Edu_Abandono" targetRef="Timer_Edu_Ab_30min" />
    <bpmn2:sequenceFlow id="Flow_Edu_Ab_Timer30" sourceRef="Timer_Edu_Ab_30min" targetRef="Task_Edu_Abandono_30min" />
    <bpmn2:sequenceFlow id="Flow_Edu_Ab_30" sourceRef="Task_Edu_Abandono_30min" targetRef="Timer_Edu_Ab_24h" />
    <bpmn2:sequenceFlow id="Flow_Edu_Ab_Timer24" sourceRef="Timer_Edu_Ab_24h" targetRef="Task_Edu_Abandono_24h" />
    <bpmn2:sequenceFlow id="Flow_Edu_Ab_24" sourceRef="Task_Edu_Abandono_24h" targetRef="Timer_Edu_Ab_48h" />
    <bpmn2:sequenceFlow id="Flow_Edu_Ab_Timer48" sourceRef="Timer_Edu_Ab_48h" targetRef="Task_Edu_Abandono_48h" />
    <bpmn2:sequenceFlow id="Flow_Edu_Ab_48" sourceRef="Task_Edu_Abandono_48h" targetRef="Gateway_Edu_Recuperou" />
    <bpmn2:sequenceFlow id="Flow_Edu_Recuperou_Sim" name="Sim" sourceRef="Gateway_Edu_Recuperou" targetRef="End_Edu_Cliente" />
    <bpmn2:sequenceFlow id="Flow_Edu_Recuperou_Nao" name="Não" sourceRef="Gateway_Edu_Recuperou" targetRef="End_Edu_Volta_Funil" />
    <bpmn2:sequenceFlow id="Flow_Edu_100_Start" sourceRef="Start_Edu_100_SemCTA" targetRef="Timer_Edu_100_2h" />
    <bpmn2:sequenceFlow id="Flow_Edu_100_Timer" sourceRef="Timer_Edu_100_2h" targetRef="Task_Edu_100_Followup" />
    <bpmn2:sequenceFlow id="Flow_Edu_100_End" sourceRef="Task_Edu_100_Followup" targetRef="End_Edu_100_Seguir" />
  </bpmn2:process>
  <bpmn2:process id="Process_Indicacao" isExecutable="false">
    <bpmn2:startEvent id="Start_Indicacao_Ativo" name="Parceiro Entrega Contato">
      <bpmn2:documentation>CENÁRIO A (ATIVO): O parceiro entrega o contato do lead.

⚡ REGRA INBOUND: LIGAR EM &lt; 5 MINUTOS.
Lead de indicação é QUENTE — parceiro já vendeu por você.
Se demorar, parceiro perde credibilidade.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Ind_Ativo_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:startEvent id="Start_Indicacao_Passivo" name="Lead Procura (Indicação)">
      <bpmn2:documentation>CENÁRIO B (PASSIVO): O lead procura você mencionando o parceiro.

⚡ REGRA: RESPONDER EM TEMPO REAL (&lt; 5 min).
Lead veio por conta própria mencionando parceiro = altíssima intenção.
Não usar automação burra — atendimento humano imediato.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Ind_Passivo_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:endEvent id="End_Perdido_Motivo_Indicacao" name="Lost (Motivo Registrado)">
      <bpmn2:incoming>Flow_Ind_Motivo</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:endEvent id="End_Bloqueio_Indicacao" name="Bloqueou/Saiu do Grupo">
      <bpmn2:incoming>Flow_Ind_Nurturing</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:serviceTask id="Task_Tag_Ativo" name="CRM">
      <bpmn2:documentation>CRM ACTION:
1. Cadastrar lead no sistema
2. Adicionar tag obrigatória: [INDICAÇÃO: NOME_DO_PARCEIRO]
3. Definir prioridade: SLA &lt; 30 min
4. Notificar vendedor responsável</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Ativo_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Ativo_2</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Task_Tag_Passivo" name="CRM">
      <bpmn2:documentation>CRM ACTION:
1. Perguntar: "Qual nome do parceiro que te indicou?"
2. Cadastrar lead
3. Adicionar tag: [INDICAÇÃO: NOME_DO_PARCEIRO]
4. Resposta em tempo real (WhatsApp/Instagram)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Passivo_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Passivo_2</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Task_D0_Instagram_Indicacao" name="D0 - Instagram (Final do Dia) - Social Selling">
      <bpmn2:documentation>📱 FINAL DO DIA - SOCIAL SELLING:

AÇÃO MANUAL DO VENDEDOR:
1. Seguir a empresa/perfil do lead no Instagram
2. Curtir 2 fotos recentes (não mais que isso)

POR QUÊ?
- Mostra que você é real
- Mostra interesse genuíno
- Cria proximidade social antes da venda

IMPORTANTE: Não mandar DM no Instagram. Isso é só warming.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D0_Zap1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Instagram</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:intermediateThrowEvent id="LinkThrow_Indicacao_Trial" name="→ Trial">
      <bpmn2:incoming>Flow_Ind_Trial_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Trial" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:serviceTask id="Task_GrupoNurturing_Indicacao" name="Grupo WhatsApp Nurturing">
      <bpmn2:documentation>NURTURING - GRUPO WHATSAPP:
Lead que não converteu é adicionado em grupo de WhatsApp para:
- Receber promoções especiais
- Ver casos de sucesso do parceiro
- Ofertas de reativação

CONSIDERADO PERDIDO: Apenas se bloquear/sair do grupo</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Respondeu_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Nurturing</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:sendTask id="Task_D0_WhatsApp1_Indicacao" name="D0 - WhatsApp 1 (Min 15) - Áudio Pessoal">
      <bpmn2:documentation>⏱️ MINUTO 15 (Sem resposta na ligação):

MENSAGEM:
"Fala [Nome], tudo bem? O [Nome do Parceiro] me passou seu contato e disse que você precisava organizar o financeiro aí urgente. Ele me fez prometer que eu ia te dar um atendimento VIP. Pode falar?"

OBJETIVO: Reforçar autoridade emprestada via áudio pessoal.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D0_NaoAtendeu</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Zap1</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:userTask id="Task_D1_WhatsApp2_Indicacao" name="D1 - Ligação + Cobrança do Amigo">
      <bpmn2:documentation>📞 DIA 1 - LIGAÇÃO + COBRANÇA DO AMIGO:

1️⃣ LIGAR PRIMEIRO:
"Opa [Nome]! Aqui é o [Vendedor]. O [Parceiro] me mandou msg perguntando se a gente já se falou.
Disse pra ele que você devia estar na correria. Mas ele insistiu que eu te ligasse porque mudou o jogo pra ele.
Pode falar 2 minutinhos?"

2️⃣ SE NÃO ATENDER → WHATSAPP:
"Opa [Nome]. O [Parceiro] perguntou se a gente já se falou.
Posso te mandar um áudio de 30s mostrando o que mudou
o jogo pra ele?"

GATILHO: Compromisso social + Parceiro acompanhando.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D0_Merge</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D1_Zap2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D3_WhatsApp3_Indicacao" name="D3 - Ligação + Bastidor do Parceiro">
      <bpmn2:documentation>📞 DIA 3 - LIGAÇÃO + BASTIDOR DO PARCEIRO:

1️⃣ LIGAR PRIMEIRO:
"[Nome], tudo bem? Liguei porque lembrei de você. O [Parceiro] adora essa função de DRE no WhatsApp.
Ele me mostrou ontem o dashboard dele — imagina você tendo essa clareza na sexta-feira à tarde?
Tenho um horário livre às 15h, bora?"

2️⃣ SE NÃO ATENDER → WHATSAPP:
"Lembrei de você. O [Parceiro] adora essa função aqui de DRE no WhatsApp [Mandar Print/Vídeo].
Imagina você tendo essa clareza na sexta-feira à tarde? Tenho um horário livre às 15h, bora?"

GATILHO: Espelhamento do parceiro. Print/vídeo real dele usando. Ligação tem impacto emocional maior.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Timer_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D3_Zap3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D6_WhatsApp4_Indicacao" name="D6 - Ligação + Ultimato VIP">
      <bpmn2:documentation>📞 DIA 6 - LIGAÇÃO + ULTIMATO VIP:

1️⃣ LIGAR PRIMEIRO:
"Fala [Nome]! Liguei porque a condição especial que separei pra você (por vir pelo [Parceiro]) expira amanhã.
É a isenção da taxa de adesão + bônus de implantação.
Você quer segurar essa vaga ou posso liberar pra outro? Sem pressão."

2️⃣ SE NÃO ATENDER → WHATSAPP:
"Fala [Nome]. A condição VIP que separei pra você (via [Parceiro])
expira amanhã. Quer segurar ou libero pra outro?"

GATILHO: Escassez + Benefício exclusivo VIP.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Timer_D6</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D6_Zap4</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sendTask id="Task_D10_WhatsApp5_Indicacao" name="D10 - WhatsApp 5 (Manhã) - Break-up Elegante">
      <bpmn2:documentation>☠️ DIA 10 - MANHÃ (O BREAK-UP ELEGANTE):

MENSAGEM:
"Vou assumir que a rotina te engoliu ou você resolveu continuar como está.

Vou encerrar seu atendimento por aqui para não ficar te incomodando e não chatear o [Parceiro].

Se o caos voltar, meu número é esse. Um abraço e sucesso!"

OBJETIVO: Encerrar o ciclo de venda ativa sem queimar a ponte.
DIFERENCIAL: Menciona o parceiro para não queimar o relacionamento dele também.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Timer_D10</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D10_Check</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_AvisaParceiro" name="Avisar Parceiro (Validar Ego)">
      <bpmn2:documentation>SCRIPT:
"Grande [Parceiro]! Só pra avisar que o [Lead] já é nosso cliente e tá sendo super bem cuidado. Obrigado pela confiança!

Se tiver mais alguém sofrendo com planilha, manda pra cá."

POR QUE ISSO É VITAL?
- Valida o ego do parceiro
- Estimula novas indicações</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Converteu_Sim</bpmn2:incoming>
      <bpmn2:incoming>Flow_1kc5wwv</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Aviso</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:userTask id="Task_QuebraGelo_Ativo" name="WhatsApp Áudio - Script Ativo">
      <bpmn2:documentation>SCRIPT CENÁRIO A (Você chama):

"Fala [Nome do Lead], tudo bem? Aqui é o [Seu Nome] da Fyness.

O [Nome do Parceiro] me passou seu contato agora há pouco e me disse que você é um cara 100%, mas que a gestão financeira aí tá tirando seu sono, igual tirava o dele.

Ele me fez prometer que eu ia te dar uma atenção VIP aqui. Pode falar 2 minutinhos?"

OBJETIVO: Transferir confiança do parceiro para você.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Ativo_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Ativo_3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_QuebraGelo_Passivo" name="WhatsApp Áudio - Script Passivo">
      <bpmn2:documentation>SCRIPT CENÁRIO B (Ele chama):

"Opa [Nome], que honra! O [Nome do Parceiro] é um grande parceiro nosso.

Se você é amigo dele, já é de casa. Me conta, ele te mostrou como a gente organizou o caixa dele?"

OBJETIVO: Validar a relação e mostrar resultado do parceiro.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Passivo_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Passivo_3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D0_Ligacao_Indicacao" name="D0 - Ligação (Min 0)">
      <bpmn2:documentation>📞 AUTORIDADE EMPRESTADA - MINUTO 0:

SCRIPT SE ATENDER:
"Fala [Nome]! Aqui é o [Vendedor]. O [Parceiro] me falou muito bem da sua empresa e disse que você precisava organizar o financeiro. Tá na frente do computador?"

OBJETIVO: Transferir a autoridade do parceiro imediatamente.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Merged</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Lig</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D0_Qualifica_Indicacao" name="D0 - Qualifica (Autoridade Parceiro)">
      <bpmn2:documentation>✅ ATENDEU - CARTEIRADA:

SCRIPT:
"O [Parceiro] me fez prometer que eu ia te dar um atendimento VIP aqui. Ele me disse que o financeiro aí tá tirando seu sono, igual tirava o dele antes.

Você tá usando planilha hoje ou caderno?"

OBJETIVO: Qualificar usando a confiança do parceiro como moeda.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D0_Atendeu</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Check</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_SelecaoMotivo_Indicacao" name="CRM: Selecionar Motivo da Perda">
      <bpmn2:documentation>📊 MARCAR COMO PERDIDO (LOST):
Vendedor deve selecionar o motivo real da perda:

MOTIVOS OBRIGATÓRIOS:
□ Sem Contato (Ghosting) - Nunca respondeu
□ Preço - Achou caro
□ Concorrência - Fechou com outro
□ Desqualificado - Não é decisor / Curioso
□ Timing - "Não é o momento"
□ Outro - Especificar

CRM ACTION: Marcar lead como LOST com motivo + TAG [INDICAÇÃO: NOME_DO_PARCEIRO].

IMPORTANTE: Avisar o parceiro que o lead não converteu (para não cobrar comissão inexistente).</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Respondeu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Motivo</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_FlashDemo_Indicacao" name="Demo Contextualizada">
      <bpmn2:documentation>🎬 DEMO CONTEXTUALIZADA — AUTOMÁTICA + PARCEIRO COMO PROVA:

📹 ENVIO AUTOMÁTICO (CRM identifica setor na qualificação):
→ Automação envia demo gravada do SETOR do lead
→ Personalizada com referência ao PARCEIRO que indicou

SETORES COM DEMO PRONTA (envio automático):
• Contabilidade / Escritório • Comércio / Loja
• Clínica / Consultório • Prestador de serviço
• Academia / Estúdio • Restaurante / Alimentação

🎙️ NICHO ESPECÍFICO (demo sob demanda):
→ Se setor NÃO tem demo gravada: vendedor grava personalizada
→ Usar a DOR que o parceiro comentou como gancho
→ Salvar no banco de demos pra reutilizar

SCRIPT PÓS-DEMO (vendedor liga):
"[Nome], o [Parceiro] gosta disso aqui ó: ele manda o áudio e a IA já lança. Viu na demo como funciona? É essa agilidade que você busca?"

⚠️ DIFERENCIAL INDICAÇÃO: Sempre use o PARCEIRO como prova social.

🛡️ OBJEÇÕES COMUNS (use o parceiro como prova):
• "Tá caro" → "O [Parceiro] disse que se paga em 2 semanas. Quer ver os números dele?"
• "Preciso pensar" → "Sem pressa! Testa 7 dias grátis, igual o [Parceiro] fez."
• "Já uso planilha" → "O [Parceiro] também usava. Olha o antes/depois dele."
• "Não tenho tempo" → "É por áudio no WhatsApp. O [Parceiro] gasta 10s por lançamento."
• "Vou falar com meu sócio" → "Posso mandar um resumo? O [Parceiro] aprova a gente."

🎓 BÔNUS EDUCAÇÃO (mencionar na oferta):
"E o melhor: assinando o Fyness, você ganha acesso à nossa Plataforma de Educação — cursos de gestão, comunidade de empresários, mentorias ao vivo. Tudo de bônus."
→ Educação é BÔNUS da assinatura, não venda separada
→ Aumenta valor percebido do software</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D0_Converteu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Demo</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:exclusiveGateway id="Gateway_Atendeu_D0_Indicacao" name="Atendeu?">
      <bpmn2:incoming>Flow_Ind_D0_Lig</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Atendeu</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_D0_NaoAtendeu</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Converteu_D0_Indicacao" name="Fechou na hora?">
      <bpmn2:incoming>Flow_Ind_D0_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Converteu_Nao</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_1kc5wwv</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Merge_D0_Indicacao" name="Merge D0">
      <bpmn2:incoming>Flow_Ind_D0_Instagram</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Trial_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Merge</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Converteu_Indicacao" name="Converteu?">
      <bpmn2:incoming>Flow_Ind_D10_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Converteu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Converteu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Respondeu_Breakup_Indicacao" name="Respondeu?">
      <bpmn2:incoming>Flow_Ind_Check_Breakup</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Respondeu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Respondeu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_MergeIndicacao">
      <bpmn2:incoming>Flow_Ind_Ativo_3</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Passivo_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Merged</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_24h_Breakup_Indicacao" name="24h">
      <bpmn2:documentation>⏰ TIMER PÓS-BREAKUP:
Aguarda 24h para ver se o lead responde ao ultimato elegante.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Converteu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Check_Breakup</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateThrowEvent id="LinkThrow_Indicacao" name="→ Checkout">
      <bpmn2:incoming>Flow_Ind_Aviso</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:sequenceFlow id="Flow_Ind_Ativo_1" sourceRef="Start_Indicacao_Ativo" targetRef="Task_Tag_Ativo" />
    <bpmn2:sequenceFlow id="Flow_Ind_Ativo_2" sourceRef="Task_Tag_Ativo" targetRef="Task_QuebraGelo_Ativo" />
    <bpmn2:sequenceFlow id="Flow_Ind_Ativo_3" sourceRef="Task_QuebraGelo_Ativo" targetRef="Gateway_MergeIndicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Passivo_1" sourceRef="Start_Indicacao_Passivo" targetRef="Task_Tag_Passivo" />
    <bpmn2:sequenceFlow id="Flow_Ind_Passivo_2" sourceRef="Task_Tag_Passivo" targetRef="Task_QuebraGelo_Passivo" />
    <bpmn2:sequenceFlow id="Flow_Ind_Passivo_3" sourceRef="Task_QuebraGelo_Passivo" targetRef="Gateway_MergeIndicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Merged" sourceRef="Gateway_MergeIndicacao" targetRef="Task_D0_Ligacao_Indicacao" />
    <bpmn2:exclusiveGateway id="Gateway_AceitouTrial_Indicacao" name="Aceitou Trial?">
      <bpmn2:incoming>Flow_Ind_Demo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Trial_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Trial_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="Flow_Ind_Demo" sourceRef="Task_FlashDemo_Indicacao" targetRef="Gateway_AceitouTrial_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Trial_Sim" name="Sim" sourceRef="Gateway_AceitouTrial_Indicacao" targetRef="LinkThrow_Indicacao_Trial" />
    <bpmn2:sequenceFlow id="Flow_Ind_Trial_Nao" name="Não" sourceRef="Gateway_AceitouTrial_Indicacao" targetRef="Gateway_Merge_D0_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Aviso" sourceRef="Task_AvisaParceiro" targetRef="LinkThrow_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Nurturing" sourceRef="Task_GrupoNurturing_Indicacao" targetRef="End_Bloqueio_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Lig" sourceRef="Task_D0_Ligacao_Indicacao" targetRef="Gateway_Atendeu_D0_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Atendeu" name="Sim" sourceRef="Gateway_Atendeu_D0_Indicacao" targetRef="Task_D0_Qualifica_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_NaoAtendeu" name="Não" sourceRef="Gateway_Atendeu_D0_Indicacao" targetRef="Task_D0_WhatsApp1_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Check" sourceRef="Task_D0_Qualifica_Indicacao" targetRef="Gateway_Converteu_D0_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Converteu_Nao" name="Não" sourceRef="Gateway_Converteu_D0_Indicacao" targetRef="Task_FlashDemo_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Zap1" sourceRef="Task_D0_WhatsApp1_Indicacao" targetRef="Task_D0_Instagram_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Instagram" sourceRef="Task_D0_Instagram_Indicacao" targetRef="Gateway_Merge_D0_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Merge" sourceRef="Gateway_Merge_D0_Indicacao" targetRef="Task_D1_WhatsApp2_Indicacao" />
    <bpmn2:intermediateCatchEvent id="Timer_48h_D1D3_Ind" name="48h">
      <bpmn2:incoming>Flow_Ind_D1_Zap2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Timer_D3</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>PT48H</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateCatchEvent id="Timer_72h_D3D6_Ind" name="72h">
      <bpmn2:incoming>Flow_Ind_D3_Zap3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Timer_D6</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>PT72H</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateCatchEvent id="Timer_96h_D6D10_Ind" name="96h">
      <bpmn2:incoming>Flow_Ind_D6_Zap4</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Timer_D10</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>PT96H</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sequenceFlow id="Flow_Ind_D1_Zap2" sourceRef="Task_D1_WhatsApp2_Indicacao" targetRef="Timer_48h_D1D3_Ind" />
    <bpmn2:sequenceFlow id="Flow_Ind_Timer_D3" sourceRef="Timer_48h_D1D3_Ind" targetRef="Task_D3_WhatsApp3_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D3_Zap3" sourceRef="Task_D3_WhatsApp3_Indicacao" targetRef="Timer_72h_D3D6_Ind" />
    <bpmn2:sequenceFlow id="Flow_Ind_Timer_D6" sourceRef="Timer_72h_D3D6_Ind" targetRef="Task_D6_WhatsApp4_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D6_Zap4" sourceRef="Task_D6_WhatsApp4_Indicacao" targetRef="Timer_96h_D6D10_Ind" />
    <bpmn2:sequenceFlow id="Flow_Ind_Timer_D10" sourceRef="Timer_96h_D6D10_Ind" targetRef="Task_D10_WhatsApp5_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D10_Check" sourceRef="Task_D10_WhatsApp5_Indicacao" targetRef="Gateway_Converteu_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Converteu_Sim" name="Sim" sourceRef="Gateway_Converteu_Indicacao" targetRef="Task_AvisaParceiro" />
    <bpmn2:sequenceFlow id="Flow_Ind_Converteu_Nao" name="Não" sourceRef="Gateway_Converteu_Indicacao" targetRef="IntermediateTimer_24h_Breakup_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Check_Breakup" sourceRef="IntermediateTimer_24h_Breakup_Indicacao" targetRef="Gateway_Respondeu_Breakup_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Respondeu_Nao" name="Não" sourceRef="Gateway_Respondeu_Breakup_Indicacao" targetRef="Task_SelecaoMotivo_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Motivo" sourceRef="Task_SelecaoMotivo_Indicacao" targetRef="End_Perdido_Motivo_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Respondeu_Sim" name="Sim" sourceRef="Gateway_Respondeu_Breakup_Indicacao" targetRef="Task_GrupoNurturing_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_1kc5wwv" name="Sim" sourceRef="Gateway_Converteu_D0_Indicacao" targetRef="Task_AvisaParceiro" />
  </bpmn2:process>
  <bpmn2:process id="Process_Conteudo" isExecutable="false">
    <bpmn2:startEvent id="Start_Conteudo_Pessoal" name="Pessoal">
      <bpmn2:documentation>ENTRADA: Lead comenta/interage no story de um SÓCIO/PARCEIRO.

CONTEXTO: É um seguidor do perfil pessoal que confia no indivíduo, não na marca.
GATILHO MENTAL: Autoridade emprestada do líder.

⚡ REGRA INBOUND: RESPONDER EM &lt; 5 MINUTOS.
Lead de conteúdo pessoal = confia no SÓCIO, não na marca.
Demora = perde a conexão emocional.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Cont_Pessoal_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:startEvent id="Start_Conteudo_Empresa" name="Fyness">
      <bpmn2:documentation>ENTRADA: Lead comenta/envia direct no perfil OFICIAL da Fyness.

CONTEXTO: É um seguidor frio que busca PRODUTO, não pessoa.
GATILHO MENTAL: Solução de problema (dor funcional).

⚡ REGRA INBOUND: RESPONDER EM &lt; 5 MINUTOS.
Lead frio precisa de resposta rápida senão esquece.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Cont_Empresa_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:serviceTask id="Task_ManyChat_Pessoal" name="Responde Comentário + Pede Zap">
      <bpmn2:documentation>AUTOMAÇÃO MANYCHAT:
1. Detecta comentário no story do sócio
2. Responde automaticamente via Direct:
   "Opa! Vi que você curtiu o story. Vou te chamar no Zap, beleza?"
3. Captura número de telefone
4. Tag no CRM: [CONTEÚDO: PESSOAL]

Sócio pode conduzir a venda direto ou transferir para Closer.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Pessoal_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Pessoal_2</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:userTask id="Task_WhatsApp_Pessoal" name="D0 - WhatsApp - Autoridade (Sócio)">
      <bpmn2:documentation>🤝 MODELO HÍBRIDO — SÓCIO FAZ D0, CLOSER ASSUME DEPOIS

SCRIPT DO SÓCIO (D0 — MENSAGEM DE AUTORIDADE):
"Fala [Nome]! Vi que você interagiu no meu Story sobre [Assunto X].

Cara, eu uso isso no dia a dia e mudou minha gestão financeira.
Vou pedir pro [Closer] da minha equipe te mostrar como funciona — ele é especialista nisso e vai te dar atenção total. 💪"

SE O LEAD RESPONDER COM DÚVIDA:
Sócio responde 1x com credibilidade, depois faz handoff:
"Exatamente! O [Closer] vai te explicar tudo em detalhes, ele conhece cada funcionalidade."

HANDOFF PARA CLOSER (obrigatório):
- Closer entra na conversa: "Fala [Nome]! Sou o [Closer], o [Sócio] me passou seu contato. Vou te mostrar o sistema que ele usa. Bora?"
- A partir daqui CLOSER conduz TUDO (demo, follow-up, fechamento)

REGRA: Sócio NÃO faz demo, NÃO faz follow-up, NÃO fecha.
EXCEÇÃO: Negócio grande (ticket alto) — Sócio entra pra dar peso.

PRÓXIMO PASSO:
- Closer assume → Flash Demo
- Se ghostou → Closer faz cadência D1-D3-D7</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Pessoal_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Pessoal_3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_FlashDemo_Pessoal" name="D0 - Demo (Closer)">
      <bpmn2:documentation>🎬 DEMO — AUTOMÁTICA POR SETOR + AUTORIDADE DO SÓCIO:

📹 ENVIO AUTOMÁTICO (CRM identifica setor na qualificação):
→ Automação envia demo gravada do SETOR do lead
→ Junto com print de resultado + mensagem do sócio

SETORES COM DEMO PRONTA (envio automático):
• Contabilidade / Escritório • Comércio / Loja
• Clínica / Consultório • Prestador de serviço
• Academia / Estúdio • Restaurante / Alimentação

🎙️ NICHO ESPECÍFICO (demo sob demanda):
→ Se setor NÃO tem demo gravada: vendedor grava personalizada
→ Foco na DOR específica do lead
→ Salvar no banco de demos pra reutilizar

APÓS ENVIO DA DEMO (vendedor liga):
"Fala [Nome]! O [Sócio] me pediu pra te mostrar o sistema que ele usa. Viu a demo que mandei? Ele grava um áudio e a IA já lança. É essa agilidade que você busca?"

GATILHO: Lead quer ser igual ao ídolo. Vendedor usa autoridade emprestada do sócio.

FECHAMENTO:
"Quer testar 7 dias grátis igual o [Sócio] quando começou?"

🛡️ OBJEÇÕES COMUNS:
• "Tá caro" → "Quanto você perde por mês sem controle? O Fyness se paga em 1 semana."
• "Preciso pensar" → "Claro! Enquanto isso, testa 7 dias grátis. Sem compromisso."
• "Já uso planilha" → "Planilha não te avisa quando tá vazando dinheiro. Olha esse alerta aqui."
• "Não tenho tempo" → "Por isso que funciona por áudio. 10 segundos e já lançou."
• "Vou falar com meu sócio" → "Perfeito! Posso mandar um resumo pro WhatsApp dele?"

🎓 BÔNUS EDUCAÇÃO (mencionar na oferta):
"E assinando, você ganha acesso à Plataforma de Educação — cursos de gestão, comunidade, mentorias. O [Sócio] já usa. Tudo de bônus."
→ Educação é BÔNUS da assinatura, não venda separada
→ Aumenta valor percebido do software</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Pessoal_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Pessoal_Merge</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:serviceTask id="Task_SDR_Empresa" name="[ROBO] Qualificação Automática via DM">
      <bpmn2:documentation>🤖 QUALIFICAÇÃO AUTOMATIZADA (ManyChat/Chatbot):
Bot responde automaticamente no Direct para QUALIFICAR antes de passar pro Zap.

FLUXO AUTOMÁTICO:
1. Detecta DM de empresa (palavras-chave: "financeiro", "gestão", "sistema")
2. Envia pergunta de qualificação: "Você é o dono do negócio ou cuida da parte financeira?"
3. Se decisor → pede WhatsApp automaticamente
4. Se não decisor → encerra com educação
5. Registra no CRM com tag [CONTEÚDO: EMPRESA]

OBJETIVO:
- Desqualificar curiosos 24/7 sem intervenção humana
- Identificar decisor automaticamente
- Capturar WhatsApp e encaminhar para abordagem consultiva</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Empresa_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Empresa_2</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:userTask id="Task_WhatsApp_Empresa" name="D0 - WhatsApp - Abordagem Consultiva">
      <bpmn2:documentation>SCRIPT - ABORDAGEM CONSULTIVA:
"Oi [Nome], recebi seu contato pelo Instagram da Fyness.

Vi que você perguntou sobre o preço. Antes de te passar, deixa eu te perguntar: hoje você usa planilha ou caderno?"

GATILHO: Ele é COMPRADOR FRIO. Quer a FERRAMENTA.

OBJETIVO: Descobrir a dor para contextualizar demo.

PRÓXIMO PASSO: Flash Demo focada na DOR.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Empresa_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Empresa_3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_FlashDemo_Empresa" name="D0 - Demo - Função (Dor)">
      <bpmn2:documentation>🎬 DEMO — AUTOMÁTICA POR SETOR (FOCO NA DOR):

📹 ENVIO AUTOMÁTICO (CRM identifica setor na qualificação):
→ Automação envia demo gravada do SETOR do lead
→ Foco na DOR específica que o lead mencionou na DM

SETORES COM DEMO PRONTA (envio automático):
• Contabilidade / Escritório • Comércio / Loja
• Clínica / Consultório • Prestador de serviço
• Academia / Estúdio • Restaurante / Alimentação

🎙️ NICHO ESPECÍFICO (demo sob demanda):
→ Se setor NÃO tem demo gravada: vendedor grava personalizada
→ Mostra apenas a função que RESOLVE A DOR do lead
→ Salvar no banco de demos pra reutilizar

APÓS ENVIO DA DEMO (vendedor liga):
"Viu a demo que mandei? Você falou que usa planilha — olha como o áudio resolve isso em 10 segundos. Quer testar?"

GATILHO: Lead empresarial quer RESOLVER o problema, não copiar ninguém.

🛡️ OBJEÇÕES COMUNS:
• "Tá caro" → "Quanto você gasta de hora do contador? O Fyness reduz 70% desse custo."
• "Preciso pensar" → "Sem problema! Testa 7 dias grátis e decide depois."
• "Já uso planilha" → "A planilha não gera DRE automático. Olha isso em 1 clique."
• "Não tenho tempo" → "Funciona por áudio — manda no WhatsApp e pronto."
• "Vou falar com meu sócio" → "Posso fazer uma demo rápida pros dois?"

🎓 BÔNUS EDUCAÇÃO (mencionar na oferta):
"E assinando, sua equipe ganha acesso à Plataforma de Educação — cursos de gestão financeira, comunidade de empresários, mentorias ao vivo. Tudo de bônus."
→ Educação é BÔNUS da assinatura, não venda separada
→ Aumenta valor percebido do software</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Empresa_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Empresa_Merge</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:exclusiveGateway id="Gateway_Merge_Conteudo">
      <bpmn2:incoming>Flow_Cont_Pessoal_Merge</bpmn2:incoming>
      <bpmn2:incoming>Flow_Cont_Empresa_Merge</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Merged</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Converteu_Imediato_Conteudo" name="Fechou na hora?">
      <bpmn2:documentation>DECISÃO: Lead converteu imediatamente após Flash Demo?

SIM → Checkout
NÃO → Cadência de follow-up (D1, D3, D7)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Merged</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Imediato_Nao</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_0c7r836</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="Flow_Cont_Pessoal_1" sourceRef="Start_Conteudo_Pessoal" targetRef="Task_ManyChat_Pessoal" />
    <bpmn2:sequenceFlow id="Flow_Cont_Pessoal_2" sourceRef="Task_ManyChat_Pessoal" targetRef="Task_WhatsApp_Pessoal" />
    <bpmn2:sequenceFlow id="Flow_Cont_Pessoal_3" sourceRef="Task_WhatsApp_Pessoal" targetRef="Task_FlashDemo_Pessoal" />
    <bpmn2:sequenceFlow id="Flow_Cont_Pessoal_Merge" sourceRef="Task_FlashDemo_Pessoal" targetRef="Gateway_Merge_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Empresa_1" sourceRef="Start_Conteudo_Empresa" targetRef="Task_SDR_Empresa" />
    <bpmn2:sequenceFlow id="Flow_Cont_Empresa_2" sourceRef="Task_SDR_Empresa" targetRef="Task_WhatsApp_Empresa" />
    <bpmn2:sequenceFlow id="Flow_Cont_Empresa_3" sourceRef="Task_WhatsApp_Empresa" targetRef="Task_FlashDemo_Empresa" />
    <bpmn2:sequenceFlow id="Flow_Cont_Empresa_Merge" sourceRef="Task_FlashDemo_Empresa" targetRef="Gateway_Merge_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Merged" sourceRef="Gateway_Merge_Conteudo" targetRef="Gateway_Converteu_Imediato_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Imediato_Nao" name="Não" sourceRef="Gateway_Converteu_Imediato_Conteudo" targetRef="Task_Cont_D1" />
    <bpmn2:intermediateThrowEvent id="Event_1iw749o" name="→ Checkout">
      <bpmn2:incoming>Flow_0c7r836</bpmn2:incoming>
      <bpmn2:linkEventDefinition id="LinkEventDefinition_1xn0hg8" name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:sequenceFlow id="Flow_0c7r836" name="SIM" sourceRef="Gateway_Converteu_Imediato_Conteudo" targetRef="Event_1iw749o" />
    <bpmn2:userTask id="Task_Cont_D1" name="D1 - Ligação + Reengajamento (Closer)">
      <bpmn2:documentation>📞 DIA 1 - CLOSER FAZ LIGAÇÃO + REENGAJAMENTO:

1️⃣ LIGAR PRIMEIRO (CLOSER):
"Fala [Nome]! Aqui é o [Closer] da equipe do [Sócio]. Liguei pra ver se conseguiu pensar sobre o que conversamos.
Sem pressão! Só queria te mostrar um resultado rápido de um cliente
parecido com você..."

2️⃣ SE NÃO ATENDER → WHATSAPP (CLOSER):
"Sem pressão! Só queria compartilhar esse resultado de um cliente
parecido com você: [print do dashboard com gráficos]
Ele começou testando 7 dias grátis, igual te ofereci.
Se quiser, o link tá aqui: [link trial]"

REGRA: Closer conduz TODO o follow-up. Sócio só fez o D0.
OBJETIVO: Ligação converte 3x mais que mensagem. WhatsApp é backup.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Imediato_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_D1_D3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_Cont_D3" name="D3 - Ligação + Bastidor do Sócio (Closer)">
      <bpmn2:documentation>📞 DIA 3 - CLOSER USA BASTIDOR DO SÓCIO:

CONTEXTO: Lead veio pelo conteúdo do SÓCIO (Story, Reels, Post).
Ele já conhece o sócio. Usar isso como arma.

1️⃣ LIGAR PRIMEIRO (CLOSER):
"[Nome], aqui é o [Closer] da equipe do [Sócio]. Liguei porque
o [Sócio] postou um resultado no Story ontem que é a cara do
seu negócio. Ele cortou R$ 4.800 de gastos invisíveis usando
o Fyness. Quer que eu te mostre exatamente como ele fez?"

→ Se atender: mostrar print/vídeo real do SÓCIO usando o sistema
→ Lead quer copiar o ídolo — não um case genérico

2️⃣ SE NÃO ATENDER → WHATSAPP (CLOSER):
"[Nome], o [Sócio] postou esse resultado ontem: [Print do Story]
Ele cortou R$ 4.800 de gasto invisível em 1 mês.
Quer ver como ele fez? Te mostro em 2 min."

DIFERENCIAL CONTEÚDO: Usar resultado REAL do sócio (não case genérico).
Lead segue o sócio → quer resultado dele → efeito espelho.
REGRA: Closer conduz. Sócio só fez o D0.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Timer_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_D3_D7</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sendTask id="Task_Cont_D7_Breakup" name="D7 - Break-up (Closer)">
      <bpmn2:documentation>👋 DIA 7 - CLOSER ENVIA BREAK-UP (ULTIMATO ELEGANTE):

MENSAGEM (WhatsApp — CLOSER):
"[Nome], aqui é o [Closer]. Vou encerrar seu atendimento por aqui.
Entendo que o timing pode não ser ideal agora.
Se algum dia a gestão financeira virar prioridade,
meu contato tá salvo. Sucesso! 🚀"

REGRA: Closer encerra. Sócio NÃO entra no break-up.
PSICOLOGIA: Aversão à perda + profissionalismo.
Muitos respondem DEPOIS do break-up por medo de perder a oportunidade.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Timer_D7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_D7_Timer</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:intermediateCatchEvent id="Timer_24h_Breakup_Cont" name="24h">
      <bpmn2:documentation>⏰ TIMER PÓS-BREAKUP:
Aguarda 24h para ver se o lead responde ao ultimato elegante.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_D7_Timer</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Timer_Check</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:exclusiveGateway id="Gateway_Cont_Respondeu" name="Respondeu?">
      <bpmn2:incoming>Flow_Cont_Timer_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Resp_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Cont_Resp_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Cont_Quer_Testar" name="Quer testar?">
      <bpmn2:incoming>Flow_Cont_Resp_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Trial_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Cont_Trial_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:intermediateThrowEvent id="LinkThrow_Conteudo_Trial" name="→ Trial">
      <bpmn2:incoming>Flow_Cont_Trial_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Trial" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:serviceTask id="Task_Cont_Nurturing" name="Grupo WhatsApp Nurturing">
      <bpmn2:documentation>NURTURING - GRUPO WHATSAPP:
Lead que respondeu é adicionado em grupo de WhatsApp para:
- Receber promoções especiais
- Ver cases de sucesso semanais
- Ofertas de reativação

CONSIDERADO PERDIDO: Apenas se bloquear/sair do grupo</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Trial_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Nurturing_End</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:userTask id="Task_Cont_MotivoPerda" name="CRM: Seleciona Motivo Perda">
      <bpmn2:documentation>📋 REGISTRO DE MOTIVO NO CRM:

MOTIVOS POSSÍVEIS:
1. Preço - Achou caro demais
2. Timing - Não é o momento
3. Já usa outro - Concorrente
4. Não entendeu o valor - Faltou clareza
5. Ghostou - Sumiu sem explicação

AÇÃO: Registrar no CRM para análise de padrões e remarketing futuro.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Resp_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Motivo_End</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:endEvent id="End_Cont_Nurturing" name="Nurturing Ativo">
      <bpmn2:incoming>Flow_Cont_Nurturing_End</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:endEvent id="End_Cont_Perdido" name="Perdido (Motivo)">
      <bpmn2:incoming>Flow_Cont_Motivo_End</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:intermediateCatchEvent id="Timer_48h_D1D3_Cont" name="48h">
      <bpmn2:incoming>Flow_Cont_D1_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Timer_D3</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>PT48H</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateCatchEvent id="Timer_96h_D3D7_Cont" name="96h">
      <bpmn2:incoming>Flow_Cont_D3_D7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Timer_D7</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>PT96H</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sequenceFlow id="Flow_Cont_D1_D3" sourceRef="Task_Cont_D1" targetRef="Timer_48h_D1D3_Cont" />
    <bpmn2:sequenceFlow id="Flow_Cont_Timer_D3" sourceRef="Timer_48h_D1D3_Cont" targetRef="Task_Cont_D3" />
    <bpmn2:sequenceFlow id="Flow_Cont_D3_D7" sourceRef="Task_Cont_D3" targetRef="Timer_96h_D3D7_Cont" />
    <bpmn2:sequenceFlow id="Flow_Cont_Timer_D7" sourceRef="Timer_96h_D3D7_Cont" targetRef="Task_Cont_D7_Breakup" />
    <bpmn2:sequenceFlow id="Flow_Cont_D7_Timer" sourceRef="Task_Cont_D7_Breakup" targetRef="Timer_24h_Breakup_Cont" />
    <bpmn2:sequenceFlow id="Flow_Cont_Timer_Check" sourceRef="Timer_24h_Breakup_Cont" targetRef="Gateway_Cont_Respondeu" />
    <bpmn2:sequenceFlow id="Flow_Cont_Resp_Sim" name="Sim" sourceRef="Gateway_Cont_Respondeu" targetRef="Gateway_Cont_Quer_Testar" />
    <bpmn2:sequenceFlow id="Flow_Cont_Resp_Nao" name="Não" sourceRef="Gateway_Cont_Respondeu" targetRef="Task_Cont_MotivoPerda" />
    <bpmn2:sequenceFlow id="Flow_Cont_Nurturing_End" sourceRef="Task_Cont_Nurturing" targetRef="End_Cont_Nurturing" />
    <bpmn2:sequenceFlow id="Flow_Cont_Motivo_End" sourceRef="Task_Cont_MotivoPerda" targetRef="End_Cont_Perdido" />
    <bpmn2:sequenceFlow id="Flow_Cont_Trial_Sim" name="Sim" sourceRef="Gateway_Cont_Quer_Testar" targetRef="LinkThrow_Conteudo_Trial" />
    <bpmn2:sequenceFlow id="Flow_Cont_Trial_Nao" name="Não" sourceRef="Gateway_Cont_Quer_Testar" targetRef="Task_Cont_Nurturing" />
  </bpmn2:process>
  <bpmn2:process id="Process_Prospeccao" isExecutable="false">
    <bpmn2:startEvent id="Start_Prospeccao" name="Prospecção Ativa">
      <bpmn2:documentation>PROSPECÇÃO ATIVA VIA LIGAÇÃO DIRETA:
Foco em ME/EPP (Micro e Pequenas Empresas).
Canal principal: LIGAÇÃO TELEFÔNICA.

⚡ REGRA #1: INBOUND &lt; 5 MINUTOS — SEMPRE.
→ Lead inbound chegou? PARA o que estiver fazendo e atende.
→ Outbound pode esperar. Lead pago NÃO pode.

📅 ROTINA DIÁRIA — MODELO INBOUND-FIRST:

🕗 08h-08h30 → SETUP DO DIA
• Revisar pipeline CRM (callbacks, follow-ups pendentes)
• Checar leads inbound que chegaram de madrugada (responder TODOS)
• Priorizar: leads quentes &gt; follow-ups &gt; cold calls

🕘 08h30-12h → BLOCO PRODUTIVO (Inbound + Outbound)
• Responder IMEDIATAMENTE qualquer inbound novo (&lt; 5 min)
• Entre inbounds: cold calls outbound (lista da sexta)
• Se volume inbound alto: outbound espera

🕐 13h-14h → Almoço

🕑 14h-16h30 → FOLLOW-UPS + DEMOS
• Ligações D1/D3/D7 (follow-ups agendados)
• Demos agendadas (ligar após envio automático da demo)
• Continuar respondendo inbounds (&lt; 5 min)
• Se sobrar tempo: mais cold calls outbound

🕟 16h30-17h → FECHAMENTO DO DIA
• Atualizar CRM (status de todos os leads tocados)
• Agendar callbacks do dia seguinte
• Registrar motivo de perda em leads perdidos

📅 SEXTA 14h-17h → PREPARAÇÃO DA SEMANA:
• Revisar lista automática que chega domingo (priorizar setores)
• Gravar demos de nichos novos (se necessário)

⚠️ NÃO MEDIR SÓ DISCAGENS — o que vende é CONVERSA.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Prosp_Start_Lista</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:serviceTask id="Task_Prosp_CriacaoLista" name="[AUTOMAÇÃO] Geração de Lista">
      <bpmn2:documentation>🤖 CRIAÇÃO DE LISTA — AUTOMATIZADA:

O sistema gera a lista de prospecção automaticamente.
Vendedor recebe lista pronta no CRM toda segunda-feira.

FONTES AUTOMATIZADAS:
1. CNAE (Receita Federal) — filtrar por atividade:
   - Contabilidades, escritórios, comércios, serviços
   - Clínicas, consultórios, academias
   - Prestadores de serviço
2. Junta Comercial — empresas abertas nos últimos 90 dias
3. Google Maps — scraping por segmento + cidade
4. Enriquecimento automático: nome do decisor + telefone + WhatsApp

FILTROS AUTOMÁTICOS:
- ME ou EPP (faturamento até R$ 4,8M/ano)
- Dono/sócio identificável
- Segmento compatível com Fyness
- Remove duplicatas e já contatados

FORMATO NO CRM (automático):
| Nome | Empresa | CNPJ | Segmento | Telefone | Fonte |

ENTREGA: Lista nova todo domingo à noite → vendedor abre segunda já pronta.

⚠️ VENDEDOR SÓ REVISA E PRIORIZA (5-10 min):
→ Olhar os setores que mais convertem
→ Priorizar empresas recém-abertas (mais receptivas)
→ Adicionar manualmente: indicações frias, contatos de eventos</bpmn2:documentation>
      <bpmn2:incoming>Flow_Prosp_Start_Lista</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_1</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:userTask id="Task_Prosp_DM_Auto" name="Cold Call (Lista de Leads)">
      <bpmn2:documentation>📞 COLD CALL — LISTA DE LEADS ME/EPP:

ANTES DE LIGAR (2 min de pesquisa):
1. Pesquisar empresa no Google (CNPJ, segmento, tamanho)
2. Anotar nome do dono/gestor
3. Preparar case do MESMO RAMO

SCRIPT DA LIGAÇÃO (abrir com DOR, não com apresentação):
"[Nome]? Aqui é [Vendedor]. Rápido: você ainda
fecha o financeiro na planilha, né? [PAUSA — deixa responder]
Pergunto porque um [profissão similar] aqui da região
descobriu que tava perdendo R$ 3 mil por mês sem saber.
Posso te contar em 2 min como ele resolveu?"

⚠️ REGRAS DA ABERTURA:
1. NÃO diga "sou da Fyness" nos primeiros 15 segundos
2. Abra com PERGUNTA DE DOR (planilha, caderno, nota errada)
3. PAUSA após a pergunta — silêncio vende
4. Social proof LOCAL ("aqui da região", "do seu ramo")
5. Perda em REAIS, não em horas (R$ 3 mil &gt; 8h/mês)
6. Pedir 2 min, não 3 — ME/EPP tem pressa

📞 CADÊNCIA DE TENTATIVAS (D0 — mesmo dia):

🔴 TENTATIVA 1 (manhã, 09h-11h):
→ Ligar com script acima
→ Se atendeu e engajou → qualificar na mesma ligação
→ Se não atendeu → NÃO deixar recado, NÃO mandar WhatsApp ainda

🔴 TENTATIVA 2 (2h depois, horário diferente):
→ Ligar novamente — mesmo script
→ Se atendeu → qualificar
→ Se não atendeu → marcar no CRM "2 tentativas sem resposta"

🔴 TENTATIVA 3 (tarde, 14h-16h):
→ Última tentativa do dia — horário diferente dos anteriores
→ Se atendeu → qualificar
→ Se não atendeu → CRM dispara WhatsApp automático:
"Oi [Nome], tentei te ligar 3x hoje. Um [profissão] do seu ramo
achou R$ 3 mil perdidos no fluxo de caixa. Quer saber como?"

⚠️ REGRAS DAS TENTATIVAS:
• 3 tentativas por lead por dia de cadência (D0, D1, D3, D7)
• Variar horários: manhã → almoço → tarde (pegar o decisor)
• WhatsApp SÓ após a 3ª tentativa sem resposta (automação envia)
• Se atendeu secretária/funcionário: perguntar melhor horário do dono
• Se número errado/inexistente: marcar no CRM e descartar
• Se pediu pra ligar em outro horário: agendar callback no CRM

📊 RESULTADO ESPERADO DO D0:
De cada 15-20 leads ligados no dia:
• ~5-7 atendem (taxa ~35%)
• ~3-4 engajam (conversa 30s+)
• ~1-2 qualificam pra demo
• ~8-13 não atendem → entram na cadência D1/D3/D7</bpmn2:documentation>
      <bpmn2:incoming>Flow_Prosp_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_DM_Qualif</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_Prosp_Qualificacao" name="Qualificação: É dono/gestor?">
      <bpmn2:documentation>🎯 QUALIFICAÇÃO NA PRÓPRIA LIGAÇÃO:

DURANTE A CALL, CONFIRMAR:
1. "Você é o dono/sócio da empresa, certo?"
2. "Quantas pessoas trabalham com você?"
3. "Hoje o financeiro tá em planilha, caderno ou sistema?"

QUALIFICADO (ME/EPP):
- Dono/sócio/gestor com poder de decisão
- 1 a 50 funcionários (ME ou EPP)
- Não usa sistema financeiro robusto (planilha/caderno/nada)

DESQUALIFICADO:
- Funcionário sem poder de decisão → pedir contato do dono
- Já usa ERP completo (Conta Azul, Omie etc.) → registrar e encerrar
- Empresa grande (+100 func) → fora do perfil ME/EPP

SE DESQUALIFICADO MAS RECEPTIVO:
→ "Entendi! Vou te adicionar num grupo nosso de conteúdo
   financeiro grátis. Se mudar de ideia, é só me chamar."</bpmn2:documentation>
      <bpmn2:incoming>Flow_Prosp_DM_Qualif</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_Qualif_Check</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:exclusiveGateway id="Gateway_Prosp_Qualificado" name="Qualificado?">
      <bpmn2:incoming>Flow_Prosp_Qualif_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_Qualif_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Prosp_Qualif_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:userTask id="Task_Prosp_Demo" name="Demo Rápida (Ligação)">
      <bpmn2:documentation>🎬 DEMO — AUTOMÁTICA POR SETOR (GRAVADAS):

📹 SETORES COMUNS (demo pré-gravada — automação envia):
→ CRM identifica o setor na qualificação
→ Automação envia demo gravada do SETOR + print WhatsApp
→ Vendedor NÃO precisa gravar — já tem banco de demos

SETORES COM DEMO PRONTA:
• Contabilidade / Escritório
• Comércio / Loja
• Clínica / Consultório
• Prestador de serviço (encanador, eletricista, etc.)
• Academia / Estúdio
• Restaurante / Alimentação

🎙️ NICHO ESPECÍFICO (demo sob demanda):
→ Se setor NÃO tem demo gravada: vendedor grava
→ Áudio 40s + print personalizado do nicho
→ Salvar no banco de demos pra reutilizar

APÓS ENVIO DA DEMO (vendedor liga):
→ "Viu a demo que mandei? O que achou?"
→ Se engajou: fechar trial na hora
→ Se pedir pra ligar depois: CRM Agendar Retorno
→ 30-40% pedem callback — é normal, NÃO é rejeição

⚡ COMPARATIVO RÁPIDO (quando citar concorrente):
Conta Azul: R$ 200/mês, digita tudo, precisa de contador
Omie: R$ 250/mês, complexo, treinamento de 2 semanas
Planilha: R$ 0, mas 8h/mês de retrabalho, sem relatório
Fyness: R$ 197/mês (mensal) ou R$ 137/mês (anual) — manda áudio, relatório automático

🛡️ MANUAL DE OBJEÇÕES (resposta + técnica):

1. "TÁ CARO" (preço)
Técnica: Reframe pra custo do problema
→ "Entendo. Quanto você gasta de tempo por mês fechando
na planilha? [pausa] Um [profissão] calculou que perdia
R$ 800/mês em retrabalho. Fyness é R$ 137 no anual. Mas olha —
trial é grátis. Testa 7 dias, cancela se não fizer sentido."

2. "PRECISO PENSAR" (indecisão)
Técnica: Eliminar o risco
→ "Total! E pra te ajudar a pensar com dados: libero o
trial agora, grátis, sem cartão. Você testa com seus
números reais e decide. Se não gostar, cancela em 1 clique.
O que você tem a perder testando?"

3. "JÁ USO PLANILHA" (status quo)
Técnica: Dor futura + prova
→ "A maioria dos nossos clientes veio da planilha. O
problema é que ela não avisa quando tem nota errada ou
dinheiro sumindo. Um [profissão] achava que tava tudo
certo — no Fyness descobriu R$ 3 mil de furo em 2 semanas.
Testa lado a lado: deixa a planilha e testa o Fyness junto."

4. "JÁ USO CONTA AZUL / OMIE" (concorrente)
Técnica: Diferencial único + troca sem dor
→ "Boa! Conta Azul é bom sistema. A diferença: no Fyness
você lança por ÁUDIO no WhatsApp — 10 segundos vs digitar
tudo. Pra quem tá no corre, isso muda o jogo. E migrar
leva 15 min. Quer ver como funciona o áudio? Posso mandar
um de 40s aqui agora."

5. "NÃO TENHO TEMPO" (prioridade)
Técnica: Mostrar que economiza tempo
→ "Justamente por isso! O Fyness funciona por áudio no
WhatsApp. Você manda um áudio de 10s e o sistema lança
tudo sozinho. Quanto tempo você gasta hoje digitando?
[pausa] Posso te mandar um áudio de demonstração aqui
agora — 40 segundos."

REGRA DE OURO: Nunca rebater — CONCORDAR primeiro.
"Entendo", "Total", "Faz sentido" → depois reframe.

🎓 BÔNUS EDUCAÇÃO (mencionar na oferta):
"E o melhor: assinando o Fyness, você ganha acesso à Plataforma de Educação — cursos de gestão, comunidade de empresários, mentorias. Tudo de bônus."
→ Educação é BÔNUS da assinatura, não venda separada
→ Aumenta valor percebido do software</bpmn2:documentation>
      <bpmn2:incoming>Flow_Prosp_Qualif_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_Demo_Check</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:exclusiveGateway id="Gateway_Prosp_Converteu" name="Interessado?">
      <bpmn2:incoming>Flow_Prosp_Demo_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_Conv_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Prosp_Conv_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:intermediateThrowEvent id="LinkThrow_Prospeccao" name="→ Trial">
      <bpmn2:incoming>Flow_Prosp_Conv_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Trial" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:endEvent id="End_Prosp_Desqualificado" name="Desqualificado (CRM)">
      <bpmn2:documentation>📋 AÇÕES ANTES DE ENCERRAR:
1. CRM: Tag [DESQUALIFICADO_PROSP] + motivo (não-decisor / ERP / grande)
2. Se receptivo → adicionar ao grupo WhatsApp Nurturing
3. Se pediu contato do dono → criar novo lead com nome do dono
4. Agendar reabordagem 90 dias (empresa pode mudar de perfil)

NÃO É DEAD END: Todo desqualificado vira oportunidade futura.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Prosp_Qualif_Nao</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:userTask id="Task_Prosp_D1" name="D1 - WhatsApp Valor + Ligação">
      <bpmn2:documentation>📱 DIA 1 — WHATSAPP DE VALOR + LIGAÇÃO SE REAGIR (24h após D0):

CONTEXTO: Não atendeu 3 ligações no D0 = provavelmente não VIU, não rejeitou.
Estratégia: MUDAR DE CANAL. WhatsApp abre caminho, ligação só se reagir.

📱 PASSO 1 — WhatsApp de VALOR (manhã, automação):
CRM dispara mensagem com CONTEÚDO ÚTIL (não pitch):
"Oi [Nome]! Tentei te ligar ontem. Enquanto isso, olha esse dado:
um [profissão do ramo] descobriu que perdia R$ 3 mil/mês
só por controlar no caderno. [Print do resultado]
Se quiser saber como ele resolveu, me responde aqui. 👇"

→ OBJETIVO: Gerar resposta. Não vender.

📞 PASSO 2 — Ligação SÓ SE REAGIR:
• Se RESPONDEU WhatsApp → vendedor liga em &lt; 5 min
  "[Nome]? Vi sua mensagem! Posso te contar em 2 min como funciona?"
• Se VISUALIZOU mas não respondeu → vendedor liga 1x à tarde
  "Vi que você viu a mensagem, [Nome]. Posso te contar rapidinho?"
• Se NEM VISUALIZOU → NÃO ligar. Esperar D3.

⚠️ REGRAS DO D1:
• WhatsApp PRIMEIRO, ligação DEPOIS (escalada de canal)
• Máximo 1 ligação no D1 (não 3 como no D0)
• Se atendeu e pediu callback → agendar no CRM
• Se objeção → Manual de Objeções (task Demo)
• Se não visualizou WhatsApp → pular pro D3 (não insistir)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Prosp_Conv_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_D1_D3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_Prosp_D3" name="D3 - Áudio Pessoal + Case">
      <bpmn2:documentation>🎙️ DIA 3 — ÁUDIO PESSOAL + CASE DO RAMO (72h após D0):

CONTEXTO: Lead não respondeu ligação (D0) nem WhatsApp texto (D1).
Estratégia: ESCALAR PRA ÁUDIO PESSOAL. Áudio gera 3x mais resposta que texto.

🎙️ PASSO 1 — Áudio pessoal no WhatsApp (manhã, vendedor grava):
Vendedor grava áudio de 20-30s PERSONALIZADO:
"Fala [Nome], aqui é [Vendedor]. Tentei te ligar esses dias.
Olha, um [profissão do ramo dele] aqui da região achava que
tava tudo certo no financeiro — em 2 semanas descobriu R$ 3.200
sumindo. Te mandei o print aqui embaixo. Dá uma olhada e me
fala o que acha. Abraço!"

+ Enviar PRINT do case (antes/depois) logo após o áudio.

→ OBJETIVO: Áudio = pessoal, humano, diferente de spam.

📞 PASSO 2 — Ligação SÓ SE REAGIR:
• Se RESPONDEU (texto ou áudio) → vendedor liga em &lt; 5 min
• Se VISUALIZOU o áudio → vendedor liga 1x à tarde
• Se NEM VISUALIZOU → NÃO ligar. Esperar D7.

⚠️ REGRAS DO D3:
• ÁUDIO OBRIGATÓRIO (não vale texto copiado)
• Case OBRIGATÓRIO do MESMO RAMO com NÚMEROS em R$
• Máximo 1 ligação no D3 (só se reagiu)
• Se até aqui 0 visualizações → lead pode ter número errado
  → Verificar no CRM se WhatsApp é válido
  → Se inválido → descartar e seguir lista</bpmn2:documentation>
      <bpmn2:incoming>Flow_Prosp_Timer_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_D3_D6</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_Prosp_D6" name="D7 - Escassez + Última Ligação">
      <bpmn2:documentation>🚨 DIA 7 — ESCASSEZ + ÚLTIMA LIGAÇÃO (7 dias após D0):

CONTEXTO: Lead recebeu 3 ligações (D0) + WhatsApp texto (D1) + áudio pessoal (D3).
Se chegou aqui sem reagir = última tentativa antes do break-up.

🚨 PASSO 1 — WhatsApp de ESCASSEZ (manhã, automação):
CRM dispara mensagem com urgência:
"[Nome], últimas vagas do trial gratuito esse mês.
7 dias pra testar tudo — sem compromisso, sem cartão.
Reservo a sua? Só preciso de um 'sim'. 👇"

📞 PASSO 2 — Ligação FINAL (tarde):
Independente de ter reagido ou não, vendedor faz 1 ÚLTIMA ligação:
"[Nome], fala! Tô te ligando pela última vez — as vagas do
trial gratuito tão acabando. Quero reservar uma pra você.
7 dias pra testar tudo, sem compromisso."

→ Se atendeu → fechar trial NA HORA
→ Se pediu callback → agendar (é a ÚLTIMA CHANCE)
→ Se não atendeu → break-up automático D14

⚠️ REGRAS DO D7:
• Tom de URGÊNCIA + RESPEITO (não é spam, é última oportunidade)
• Apenas 1 ligação (não 3 — lead já foi contatado várias vezes)
• Após D7 sem resposta → break-up automático D14

📊 RESUMO DA CADÊNCIA COMPLETA (D0 a D7):
D0: 3 ligações (manhã/almoço/tarde) + WhatsApp automático
D1: WhatsApp de valor + ligação só se reagiu (máx 1)
D3: Áudio pessoal + case do ramo + ligação só se reagiu (máx 1)
D7: WhatsApp escassez + 1 última ligação
D14: Break-up automático
D21: Última mensagem automática
TOTAL: ~6 ligações + 4 WhatsApps + 1 áudio em 21 dias
→ Menos invasivo, mais inteligente, escala de canal a cada etapa</bpmn2:documentation>
      <bpmn2:incoming>Flow_Prosp_Timer_D6</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_D6_D10</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sendTask id="Task_Prosp_D10_Breakup" name="D14 - Break-up Automático">
      <bpmn2:documentation>🤖 DIA 14 - BREAK-UP AUTOMÁTICO (CRM DISPARA):

CONTEXTO: Lead recebeu ~6 ligações + 4 WhatsApps + 1 áudio em 7 dias.
Se chegou aqui sem responder = não é o momento. Respeitar.

MENSAGEM (WhatsApp — automação):
"[Nome], vou encerrar por aqui pra não ficar te incomodando.
Sei que você tá na correria. Se algum dia quiser organizar
o financeiro sem planilha, meu número tá salvo. Sucesso! 🚀"

⚠️ REGRAS:
• Tom LEVE — você ligou pra ele, não ele que veio
• Vendedor NÃO envia — CRM dispara automaticamente
• Muitos respondem DEPOIS do break-up (medo de perder)

⏰ REABORDAGEM AUTOMÁTICA (D21):
CRM agenda última mensagem 7 dias depois:
"[Nome], última vez que passo por aqui. Ainda temos
aquela vaga do trial. Quer que eu libere?"
→ Se responder → Vendedor retoma manualmente
→ Se não responder → Lead vai pro nurturing (grupo WhatsApp)

📊 CADÊNCIA COMPLETA OUTBOUND (resumo):
D0: 3 ligações + 1 WhatsApp automático
D1: 1 WhatsApp de valor + ligação só se reagiu (máx 1)
D3: 1 áudio pessoal + case + ligação só se reagiu (máx 1)
D7: 1 WhatsApp escassez + 1 última ligação
D14: Break-up automático (WhatsApp)
D21: Última mensagem automática
TOTAL: ~6 ligações + 4 WhatsApps + 1 áudio em 21 dias</bpmn2:documentation>
      <bpmn2:incoming>Flow_Prosp_Timer_D10</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_D10_Timer</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:intermediateCatchEvent id="Timer_24h_Breakup_Prosp" name="24h">
      <bpmn2:documentation>⏰ TIMER PÓS-BREAKUP:
Aguarda 24h para ver se o lead responde ao ultimato elegante.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Prosp_D10_Timer</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_Timer_Check</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:exclusiveGateway id="Gateway_Prosp_Respondeu" name="Respondeu?">
      <bpmn2:incoming>Flow_Prosp_Timer_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_Resp_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Prosp_Resp_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:serviceTask id="Task_Prosp_Nurturing" name="Grupo WhatsApp Nurturing">
      <bpmn2:documentation>NURTURING - GRUPO WHATSAPP:
Lead que não converteu é adicionado em grupo de WhatsApp para:
- Receber promoções especiais
- Ver cases de sucesso semanais
- Ofertas de reativação

CONSIDERADO PERDIDO: Apenas se bloquear/sair do grupo</bpmn2:documentation>
      <bpmn2:incoming>Flow_Prosp_Resp_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_Nurturing_End</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:userTask id="Task_Prosp_MotivoPerda" name="CRM: Seleciona Motivo Perda">
      <bpmn2:documentation>📋 REGISTRO DE MOTIVO NO CRM:

MOTIVOS POSSÍVEIS:
1. Preço - Achou caro demais
2. Timing - Não é o momento
3. Já usa outro - Tem ERP/planilha e não quer trocar
4. Não entendeu o valor - Não viu benefício
5. Ghostou - Simplesmente parou de responder

AÇÃO: Registrar no CRM para análise de padrões e remarketing futuro.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Prosp_Resp_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_Motivo_End</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:endEvent id="End_Prosp_Nurturing" name="Nurturing Ativo">
      <bpmn2:incoming>Flow_Prosp_Nurturing_End</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:endEvent id="End_Prosp_Perdido" name="Perdido (Motivo)">
      <bpmn2:incoming>Flow_Prosp_Motivo_End</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_Prosp_Start_Lista" sourceRef="Start_Prospeccao" targetRef="Task_Prosp_CriacaoLista" />
    <bpmn2:sequenceFlow id="Flow_Prosp_1" sourceRef="Task_Prosp_CriacaoLista" targetRef="Task_Prosp_DM_Auto" />
    <bpmn2:sequenceFlow id="Flow_Prosp_DM_Qualif" sourceRef="Task_Prosp_DM_Auto" targetRef="Task_Prosp_Qualificacao" />
    <bpmn2:sequenceFlow id="Flow_Prosp_Qualif_Check" sourceRef="Task_Prosp_Qualificacao" targetRef="Gateway_Prosp_Qualificado" />
    <bpmn2:sequenceFlow id="Flow_Prosp_Qualif_Sim" name="Sim" sourceRef="Gateway_Prosp_Qualificado" targetRef="Task_Prosp_Demo" />
    <bpmn2:sequenceFlow id="Flow_Prosp_Qualif_Nao" name="Não" sourceRef="Gateway_Prosp_Qualificado" targetRef="End_Prosp_Desqualificado" />
    <bpmn2:sequenceFlow id="Flow_Prosp_Demo_Check" sourceRef="Task_Prosp_Demo" targetRef="Gateway_Prosp_Converteu" />
    <bpmn2:sequenceFlow id="Flow_Prosp_Conv_Sim" name="Sim" sourceRef="Gateway_Prosp_Converteu" targetRef="LinkThrow_Prospeccao" />
    <bpmn2:sequenceFlow id="Flow_Prosp_Conv_Nao" name="Não" sourceRef="Gateway_Prosp_Converteu" targetRef="Task_Prosp_D1" />
    <bpmn2:intermediateCatchEvent id="Timer_48h_D1D3_Prosp" name="48h">
      <bpmn2:incoming>Flow_Prosp_D1_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_Timer_D3</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>PT48H</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateCatchEvent id="Timer_72h_D3D6_Prosp" name="4 dias">
      <bpmn2:incoming>Flow_Prosp_D3_D6</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_Timer_D6</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>PT96H</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateCatchEvent id="Timer_96h_D6D10_Prosp" name="7 dias">
      <bpmn2:incoming>Flow_Prosp_D6_D10</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_Timer_D10</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>PT168H</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sequenceFlow id="Flow_Prosp_D1_D3" sourceRef="Task_Prosp_D1" targetRef="Timer_48h_D1D3_Prosp" />
    <bpmn2:sequenceFlow id="Flow_Prosp_Timer_D3" sourceRef="Timer_48h_D1D3_Prosp" targetRef="Task_Prosp_D3" />
    <bpmn2:sequenceFlow id="Flow_Prosp_D3_D6" sourceRef="Task_Prosp_D3" targetRef="Timer_72h_D3D6_Prosp" />
    <bpmn2:sequenceFlow id="Flow_Prosp_Timer_D6" sourceRef="Timer_72h_D3D6_Prosp" targetRef="Task_Prosp_D6" />
    <bpmn2:sequenceFlow id="Flow_Prosp_D6_D10" sourceRef="Task_Prosp_D6" targetRef="Timer_96h_D6D10_Prosp" />
    <bpmn2:sequenceFlow id="Flow_Prosp_Timer_D10" sourceRef="Timer_96h_D6D10_Prosp" targetRef="Task_Prosp_D10_Breakup" />
    <bpmn2:sequenceFlow id="Flow_Prosp_D10_Timer" sourceRef="Task_Prosp_D10_Breakup" targetRef="Timer_24h_Breakup_Prosp" />
    <bpmn2:sequenceFlow id="Flow_Prosp_Timer_Check" sourceRef="Timer_24h_Breakup_Prosp" targetRef="Gateway_Prosp_Respondeu" />
    <bpmn2:sequenceFlow id="Flow_Prosp_Resp_Sim" name="Sim" sourceRef="Gateway_Prosp_Respondeu" targetRef="Task_Prosp_Nurturing" />
    <bpmn2:sequenceFlow id="Flow_Prosp_Resp_Nao" name="Não" sourceRef="Gateway_Prosp_Respondeu" targetRef="Task_Prosp_MotivoPerda" />
    <bpmn2:sequenceFlow id="Flow_Prosp_Nurturing_End" sourceRef="Task_Prosp_Nurturing" targetRef="End_Prosp_Nurturing" />
    <bpmn2:sequenceFlow id="Flow_Prosp_Motivo_End" sourceRef="Task_Prosp_MotivoPerda" targetRef="End_Prosp_Perdido" />
  </bpmn2:process>
  <bpmn2:process id="Process_Google" isExecutable="false">
    <bpmn2:startEvent id="Start_Google" name="Landing Page (Google Ads)">
      <bpmn2:documentation>GOOGLE ADS — LEAD DE ALTA INTENÇÃO:
Lead pesquisou "Gestão Financeira PME" e clicou no anúncio.
Alta intenção de compra — PRIORIDADE MÁXIMA.

⚡ REGRA DE OURO — INBOUND &lt; 5 MINUTOS:
→ Lead Google tem a MAIOR intenção de compra (pesquisou ativamente)
→ Responder em &lt; 5 min = 21x mais chance de qualificar
→ Se demorar &gt; 30 min = lead esfria, compara concorrente
→ SEMPRE priorizar inbound sobre outbound em andamento</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Goo_Start</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:endEvent id="End_Perdido_Motivo_Google" name="Lost (Motivo Registrado)">
      <bpmn2:incoming>Flow_Goo_Motivo</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:endEvent id="End_Google_Ativado" name="Cliente Ativado">
      <bpmn2:incoming>Flow_Goo_Mandou</bpmn2:incoming>
      <bpmn2:incoming>Flow_Goo_Alerta</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:serviceTask id="Task_AutomacaoBoasVindas" name="Automação D0 - Boas-vindas">
      <bpmn2:documentation>AUTOMAÇÃO IMEDIATA (D0):
1. Criação da conta no sistema
2. Envio de WhatsApp automático

MENSAGEM:
"Parabéns [Nome]! 🚀 Sua IA tá pronta.

Salva meu número e manda o primeiro áudio: 'Gastei 50 reais de almoço'."

OBJETIVO: Primeira vitória rápida.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Sucesso</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_BoasVindas</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Task_RecuperacaoCarrinho" name="Recuperação (10 min)">
      <bpmn2:documentation>AUTOMAÇÃO (10 MIN DEPOIS):
Disparo de recuperação se cartão recusou ou fechou a aba.

MENSAGEM:
"Oi [Nome], vi que deu erro no pagamento do Anual.

O banco às vezes barra o limite. Tenta esse link do Semestral que costuma passar direto: [Link]"

DOWNSELL: Anual → Semestral → Trimestral</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Falha</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Recuperacao</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:intermediateThrowEvent id="LinkThrow_Google_Trial" name="→ Trial">
      <bpmn2:incoming>Flow_Goo_Trial_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Trial" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:userTask id="Task_ClickCheckout_Self" name="Clica &#39;Testar Agora/Assinar&#39;">
      <bpmn2:documentation>PERFIL APRESSADO:
Já comparou, gostou da promessa, quer resolver agora (mesmo que seja 3 da manhã).

CTA na LP: "Testar Agora" ou "Assinar Anual"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Self</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Self_1</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_PreencheDados_Self" name="Preenche Dados + Cartão">
      <bpmn2:documentation>FORMULÁRIO DE CHECKOUT:
- Nome completo
- E-mail
- Telefone (WhatsApp)
- CPF/CNPJ
- Dados do cartão

MONITORAMENTO DE ABANDONO:
Se lead preencheu e-mail/telefone mas NÃO completou pagamento:
→ 2 min: pop-up "Precisa de ajuda? Fale com um especialista"
→ 10 min: WhatsApp automático: "Vi que você começou mas não
   finalizou. Posso te ajudar? É rápido!"
→ 1h: Vendedor liga se telefone foi preenchido
→ 24h: E-mail de recuperação com link direto pro checkout

DADO CAPTURADO = LEAD ATIVO. Não deixar morrer.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Self_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Self_2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_AlertaHumano_Google" name="Alerta Humano - Ligar AGORA">
      <bpmn2:documentation>ALERTA PARA VENDEDOR:
"Cliente [Nome] pagou e não usou. Ligar agora."

SCRIPT LIGAÇÃO:
"[Nome], vi que você assinou mas ainda não mandou o primeiro áudio.

Tá com dúvida de como funciona? Vamos fazer juntos agora na linha?"

OBJETIVO: Ativação forçada antes de pedir chargeback.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_NaoMandou</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Alerta</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_ClickWhatsApp" name="Clica WhatsApp">
      <bpmn2:documentation>PERFIL DESCONFIADO:
Gostou mas tem dúvida se funciona pro nicho dele ou quer negociar.

CTA na LP: "Falar com Especialista"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Zap</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Zap_1</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_SpeedToLead_Google" name="Responsta &#60; 5 min">
      <bpmn2:documentation>REGRA DE OURO: Vendedor responde em &lt; 5 minutos.

SCRIPT ABERTURA:
"Opa, tudo bem? Vi que veio do Google. Você tá usando planilha hoje ou o caderno?"

OBJETIVO: Qualificar rapidamente a dor.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Zap_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Zap_2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_SelecaoMotivo_Google" name="CRM: Selecionar Motivo da Perda">
      <bpmn2:documentation>📊 MARCAR COMO PERDIDO (LOST):
Vendedor deve selecionar o motivo real da perda:

MOTIVOS OBRIGATÓRIOS:
□ Sem Contato (Ghosting) - Nunca respondeu
□ Preço - Achou caro e não aceitou Downsell
□ Concorrência - Fechou com outro
□ Desqualificado - Não é dono de empresa / Curioso
□ Timing - "Não é o momento" (válido)
□ Outro - Especificar

CRM ACTION: Marcar lead como LOST com motivo selecionado.

MÉTRICA CRÍTICA: Taxa de conversão por motivo de perda.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Respondeu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Motivo</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:exclusiveGateway id="Gateway_CaminhoGoogle" name="Qual botão clicou?">
      <bpmn2:incoming>Flow_Goo_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Self</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Zap</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Pagamento_Self" name="Pagamento?">
      <bpmn2:incoming>Flow_Goo_Self_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Sucesso</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Falha</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_PrimeiroAudio" name="Mandou áudio?">
      <bpmn2:incoming>Flow_Goo_Check24h</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_NaoMandou</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Mandou</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_24h_Google" name="24h">
      <bpmn2:documentation>O GUARDIÃO DE ATIVAÇÃO:
Monitora se cliente pagou mas NÃO usou em 24h.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_BoasVindas</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Check24h</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sequenceFlow id="Flow_Goo_Start" sourceRef="Start_Google" targetRef="Gateway_CaminhoGoogle" />
    <bpmn2:sequenceFlow id="Flow_Goo_Self" name="Checkout Direto" sourceRef="Gateway_CaminhoGoogle" targetRef="Task_ClickCheckout_Self" />
    <bpmn2:sequenceFlow id="Flow_Goo_Self_1" sourceRef="Task_ClickCheckout_Self" targetRef="Task_PreencheDados_Self" />
    <bpmn2:sequenceFlow id="Flow_Goo_Self_2" sourceRef="Task_PreencheDados_Self" targetRef="Gateway_Pagamento_Self" />
    <bpmn2:sequenceFlow id="Flow_Goo_Sucesso" name="Sucesso" sourceRef="Gateway_Pagamento_Self" targetRef="Task_AutomacaoBoasVindas" />
    <bpmn2:sequenceFlow id="Flow_Goo_Falha" name="Falha/Abandono" sourceRef="Gateway_Pagamento_Self" targetRef="Task_RecuperacaoCarrinho" />
    <bpmn2:sequenceFlow id="Flow_Goo_BoasVindas" sourceRef="Task_AutomacaoBoasVindas" targetRef="IntermediateTimer_24h_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Recuperacao" sourceRef="Task_RecuperacaoCarrinho" targetRef="Gateway_AceitouTrial_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Check24h" sourceRef="IntermediateTimer_24h_Google" targetRef="Gateway_PrimeiroAudio" />
    <bpmn2:sequenceFlow id="Flow_Goo_NaoMandou" name="Não" sourceRef="Gateway_PrimeiroAudio" targetRef="Task_AlertaHumano_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Mandou" name="Sim" sourceRef="Gateway_PrimeiroAudio" targetRef="End_Google_Ativado" />
    <bpmn2:sequenceFlow id="Flow_Goo_Alerta" sourceRef="Task_AlertaHumano_Google" targetRef="End_Google_Ativado" />
    <bpmn2:sequenceFlow id="Flow_Goo_Zap" name="WhatsApp" sourceRef="Gateway_CaminhoGoogle" targetRef="Task_ClickWhatsApp" />
    <bpmn2:sequenceFlow id="Flow_Goo_Zap_1" sourceRef="Task_ClickWhatsApp" targetRef="Task_SpeedToLead_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Zap_2" sourceRef="Task_SpeedToLead_Google" targetRef="Task_FlashDemo_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Zap_3" sourceRef="Task_FlashDemo_Google" targetRef="Task_OfertaTrial_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_ToGatewayTrial" sourceRef="Task_OfertaTrial_Google" targetRef="Gateway_AceitouTrial_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Trial_Sim" name="Sim (Aceitou)" sourceRef="Gateway_AceitouTrial_Google" targetRef="LinkThrow_Google_Trial" />
    <bpmn2:sequenceFlow id="Flow_Goo_Respondeu_Nao" name="Não" sourceRef="Gateway_Respondeu_Breakup_Google" targetRef="Task_SelecaoMotivo_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Motivo" sourceRef="Task_SelecaoMotivo_Google" targetRef="End_Perdido_Motivo_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Trial_Nao" name="Não (Recusou)" sourceRef="Gateway_AceitouTrial_Google" targetRef="Gateway_Merge_D0_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Check_Breakup" sourceRef="IntermediateTimer_24h_Breakup_Google" targetRef="Gateway_Respondeu_Breakup_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Converteu_Sim" name="Sim" sourceRef="Gateway_Converteu_Google" targetRef="LinkThrow_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D7" sourceRef="Task_D7_Fechamento_Google" targetRef="Gateway_Converteu_Google" />
    <bpmn2:intermediateCatchEvent id="Timer_48h_D5D7_Goo" name="48h">
      <bpmn2:incoming>Flow_Goo_D5_Lig3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Timer_D7</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>PT48H</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sequenceFlow id="Flow_Goo_D5_Lig3" sourceRef="Task_D5_Ligacao3_Google" targetRef="Timer_48h_D5D7_Goo" />
    <bpmn2:sequenceFlow id="Flow_Goo_Timer_D7" sourceRef="Timer_48h_D5D7_Goo" targetRef="Task_D7_Fechamento_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Breakup" sourceRef="Task_D7_WhatsApp6_Breakup_Google" targetRef="IntermediateTimer_24h_Breakup_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Converteu_Nao" name="Não" sourceRef="Gateway_Converteu_Google" targetRef="Task_D7_WhatsApp6_Breakup_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D5_Zap5" sourceRef="Task_D5_WhatsApp5_Pressao_Google" targetRef="Task_D5_Ligacao3_Google" />
    <bpmn2:intermediateCatchEvent id="Timer_48h_D3D5_Goo" name="48h">
      <bpmn2:incoming>Flow_Goo_D3_Zap4</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Timer_D5</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>PT48H</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateCatchEvent id="Timer_48h_D1D3_Goo" name="48h">
      <bpmn2:incoming>Flow_Goo_D1_Lig2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Timer_D3</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>PT48H</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sequenceFlow id="Flow_Goo_D3_Zap4" sourceRef="Task_D3_WhatsApp4_Case_Google" targetRef="Timer_48h_D3D5_Goo" />
    <bpmn2:sequenceFlow id="Flow_Goo_Timer_D5" sourceRef="Timer_48h_D3D5_Goo" targetRef="Task_D5_WhatsApp5_Pressao_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D1_Lig2" sourceRef="Task_D1_Ligacao2_Google" targetRef="Timer_48h_D1D3_Goo" />
    <bpmn2:sequenceFlow id="Flow_Goo_Timer_D3" sourceRef="Timer_48h_D1D3_Goo" targetRef="Task_D3_WhatsApp4_Case_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D1_Zap3" sourceRef="Task_D1_WhatsApp3_Diferenca_Google" targetRef="Task_D1_Ligacao2_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D0_Merge" sourceRef="Gateway_Merge_D0_Google" targetRef="Task_D1_WhatsApp3_Diferenca_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Respondeu_Sim" name="Sim" sourceRef="Gateway_Respondeu_Breakup_Google" targetRef="Task_GrupoNurturing_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Nurturing" sourceRef="Task_GrupoNurturing_Google" targetRef="End_Bloqueio_Google" />
    <bpmn2:exclusiveGateway id="Gateway_Merge_D0_Google" name="Juncao Follow">
      <bpmn2:incoming>Flow_Goo_Trial_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D0_Merge</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:intermediateThrowEvent id="LinkThrow_Google" name="→ Checkout">
      <bpmn2:incoming>Flow_Goo_Converteu_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_24h_Breakup_Google" name="24h">
      <bpmn2:documentation>⏰ TIMER PÓS-BREAKUP:
Aguarda 24h para ver se o lead responde ao ultimato.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Breakup</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Check_Breakup</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:exclusiveGateway id="Gateway_Respondeu_Breakup_Google" name="Respondeu?">
      <bpmn2:incoming>Flow_Goo_Check_Breakup</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Respondeu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Respondeu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Converteu_Google" name="Converteu?">
      <bpmn2:incoming>Flow_Goo_D7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Converteu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Converteu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:userTask id="Task_D5_Ligacao3_Google" name="D5 - Ligação 3 (Última Tentativa)">
      <bpmn2:documentation>📞 DIA 5 - ÚLTIMA TENTATIVA DE VOZ:

SCRIPT:
"[Nome], vi que você ainda não definiu. Tá com alguma dúvida ou quer que eu te mostre algo específico do seu ramo?"

OBJETIVO: Última chance de falar antes do ultimato D7.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D5_Zap5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D5_Lig3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D1_Ligacao2_Google" name="D1 - Ligação 2 (Tarde)">
      <bpmn2:documentation>📞 DIA 1 - TARDE:

SCRIPT:
"Tô com a sua ficha de pré-cadastro aqui. Só falta um 'ok' pra eu liberar seu teste. Tá na correria?"

OBJETIVO: Mostrar que ele está sendo acompanhado pessoalmente.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D1_Zap3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D1_Lig2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_D7_Fechamento_Google" name="D7 - Fechamento (Escada Downsell)">
      <bpmn2:documentation>O FECHAMENTO BINÁRIO (D7 - FINAL DO TRIAL):

ESCADA DE DOWNSELL:

Tentativa 1: Plano Anual (R$ 1.497)
- Foco: Maior desconto + Caixa antecipado
- Script: "Você testou, viu que funciona. Vou te dar 40% de desconto no anual."

Tentativa 2 (Se recusar/falhar): Plano Semestral (R$ 997)
- Argumento: "O limite do cartão não passou? Faz o semestral que alivia a parcela."

Tentativa 3 (Misericórdia): Plano Trimestral (R$ 561)
- Argumento: "Faz o seguinte: não casa comigo. Namora por 3 meses. É um teste pago pra você organizar a casa."

OBJETIVO: Não perder o cliente. Se ele não pode pagar o ideal, ele paga o possível.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Timer_D7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D7</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sendTask id="Task_D7_WhatsApp6_Breakup_Google" name="D7 - WhatsApp 6 - Break-up (Ultimato)">
      <bpmn2:documentation>☠️ DIA 7 - O ULTIMATO (BREAK-UP):
Tudo ou nada. Técnica de "retirar a oferta".

MENSAGEM:
"Fala [Nome]. Como não tivemos retorno, vou assumir que organizar o financeiro não é prioridade agora ou você decidiu continuar com as planilhas.

Vou encerrar seu processo por aqui para não te incomodar mais.

Se no futuro o caos voltar, meu contato é esse. Abraço!"

OBJETIVO: Provocar reação ou confirmar desinteresse.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Converteu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Breakup</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_D5_WhatsApp5_Pressao_Google" name="D5 - WhatsApp 5 - A Pressão">
      <bpmn2:documentation>⚠️ DIA 5 - PRESSÃO DO BENEFÍCIO:
Lead está morno. Hora de provocar.

MENSAGEM:
"[Nome], o sistema segura seu pré-cadastro com a condição de isenção de taxa de adesão até amanhã. Depois volta pro preço cheio. Consegue falar hoje à tarde?"

GATILHO MENTAL: Escassez + Benefício.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Timer_D5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D5_Zap5</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_D3_WhatsApp4_Case_Google" name="D3 - WhatsApp 4 - A Cobrança Social">
      <bpmn2:documentation>💼 DIA 3 - COBRANÇA SOCIAL (Se ele sumiu/Ghosting):

MENSAGEM:
"Lembrei de você. Esse cliente aqui é do seu ramo [Mandar Print de Relatório/Depoimento]. Ele organizou o caixa em 2 dias. Falta o que pra gente fazer o mesmo aí?"

CRM: Mover para etapa "Tentativa de Contato 3".

OBJETIVO: Soft touch mostrando prova social do nicho dele.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Timer_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D3_Zap4</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_D1_WhatsApp3_Diferenca_Google" name="D1 - WhatsApp 3 (Manhã) - A Diferença">
      <bpmn2:documentation>📊 DIA 1 - MANHÃ:
Ele provavelmente está cotando Conta Azul ou Omie.

MENSAGEM:
"E aí [Nome]. Uma dúvida rápida: você prefere ficar preenchendo formulário chato (igual nos outros sistemas) ou prefere mandar áudio no Zap? Só pra eu saber o que te mostrar."

OBJETIVO: Matar a concorrência mostrando a diferença.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D0_Merge</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D1_Zap3</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:serviceTask id="Task_GrupoNurturing_Google" name="Grupo Promoções + Remarketing">
      <bpmn2:documentation>NURTURING - LISTA PROMOÇÕES:
Lead Google que não converteu vai para lista de:
- Remarketing via Google Ads
- E-mails com promoções especiais
- WhatsApp com ofertas relâmpago

CONSIDERADO PERDIDO: Apenas se descadastrar/bloquear</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Respondeu_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Nurturing</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:endEvent id="End_Bloqueio_Google" name="Descadastrou/Bloqueou">
      <bpmn2:incoming>Flow_Goo_Nurturing</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:exclusiveGateway id="Gateway_AceitouTrial_Google" name="Aceitou Trial?">
      <bpmn2:incoming>Flow_Goo_ToGatewayTrial</bpmn2:incoming>
      <bpmn2:incoming>Flow_Goo_Recuperacao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Trial_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Trial_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:userTask id="Task_FlashDemo_Google" name="Flash Demo (Áudio + Print)">
      <bpmn2:documentation>🎬 DEMO — AUTOMÁTICA POR SETOR (LEAD GOOGLE = COMPARADOR):

📹 ENVIO AUTOMÁTICO (CRM identifica setor na qualificação):
→ Automação envia demo gravada do SETOR do lead
→ Lead Google COMPARA com concorrentes — demo deve mostrar DIFERENCIAL

SETORES COM DEMO PRONTA (envio automático):
• Contabilidade / Escritório • Comércio / Loja
• Clínica / Consultório • Prestador de serviço
• Academia / Estúdio • Restaurante / Alimentação

🎙️ NICHO ESPECÍFICO (demo sob demanda):
→ Se setor NÃO tem demo gravada: vendedor grava personalizada
→ Foco no DIFERENCIAL vs concorrência (áudio vs formulário)
→ Salvar no banco de demos pra reutilizar

APÓS ENVIO DA DEMO (vendedor liga):
"Viu a demo que mandei? A mágica é essa: áudio de 3s e o DRE já sai pronto. Nenhum outro sistema faz isso. Quer testar 7 dias grátis?"

GATILHO: Lead Google pesquisa ativamente — mostrar que Fyness é DIFERENTE.

🛡️ OBJEÇÕES COMUNS (lead de Google compara com Conta Azul/Omie):
• "Tá caro" → "Conta Azul cobra R$ 200+/mês. Fyness é R$ 137 no anual."
• "Qual a diferença pro Conta Azul?" → "Lá você preenche formulário. Aqui manda áudio."
• "Preciso pensar" → "Testa 7 dias grátis. Decide depois."
• "Já uso outro sistema" → "Quanto tempo gasta por dia nele? Aqui é 10 segundos."
• "Funciona offline?" → "Sim, funciona por áudio no WhatsApp."

🎓 BÔNUS EDUCAÇÃO (mencionar na oferta):
"E assinando, você ganha acesso à Plataforma de Educação — cursos de gestão, comunidade, mentorias ao vivo. Nenhum concorrente oferece isso. Tudo de bônus."
→ Educação é BÔNUS da assinatura, não venda separada
→ Diferencial vs Conta Azul/Omie: eles NÃO têm educação</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Zap_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Zap_3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_OfertaTrial_Google" name="Oferta Trial 7d">
      <bpmn2:documentation>O GANCHO:

SCRIPT:
"Vou liberar 7 dias grátis pra você brincar. Se a IA não te economizar 2 horas na semana, você nem precisa assinar."

OBJEÇÃO ELIMINADA: "E se não der certo?" → Risco zero.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Zap_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_ToGatewayTrial</bpmn2:outgoing>
    </bpmn2:userTask>
  </bpmn2:process>
  <bpmn2:process id="Process_Nucleo" isExecutable="false">
    <bpmn2:endEvent id="End_Cliente_Ativo" name="✅ Cliente Ativo">
      <bpmn2:documentation>CLIENTE CONVERTIDO E ATIVO
Acesso liberado
Receita capturada
Onboarding em andamento</bpmn2:documentation>
      <bpmn2:incoming>Flow_Para_Cliente_Ativo</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:endEvent id="End_Pagamento_Falhou" name="❌ Pagamento Falhou">
      <bpmn2:documentation>❌ TODAS AS TENTATIVAS ESGOTADAS:
- Anual (R$ 1.497): Recusado
- Semestral (R$ 997): Recusado
- Trimestral (R$ 561): Recusado

📞 SCRIPT DE ENCERRAMENTO (Vendedor liga):
"[Nome], vi que todas as tentativas de pagamento falharam.
Sei que quer organizar o financeiro mas o banco tá complicando.
Vou te adicionar no nosso grupo VIP pra quando resolver
a questão bancária, você já entra direto. Pode ser?"

AÇÕES OBRIGATÓRIAS:
1. Vendedor liga para entender motivo real (banco? Não quer?)
2. Se banco → adicionar ao nurturing + lembrete 30 dias
3. Se não quer → registrar motivo real no CRM
4. Adicionar ao grupo de nurturing para remarketing futuro
5. CRM: Tag [PAGAMENTO_FALHOU] + motivo</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trimestral_Recusado</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:task id="Task_Checkout_Anual" name="Checkout: Plano Anual (R$ 1.497)">
      <bpmn2:documentation>DEGRAU 1: OFERTA PRINCIPAL
Valor: R$ 1.497/ano (R$ 124,75/mês)
Estratégia: Máximo cashflow antecipado
Parcelamento: Até 12x no cartão (juros por conta do cliente)
Link: hotmart.com/fyness-anual
Gateway: Hotmart + Asaas (fallback)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Para_Anual</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Anual_Para_Gateway</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:exclusiveGateway id="Gateway_Tem_Parceiro" name="Indicação?">
      <bpmn2:incoming>Flow_Anual_Aprovado</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Parceiro_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Parceiro_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:task id="Task_Split_Parceiro" name="Split: 30% Comissão Parceiro">
      <bpmn2:documentation>SPLIT AUTOMÁTICO (SE TAG: INDICACAO)
Gateway: Asaas Split Payments
Parceiro recebe: 30% do valor (R$ 449,10 no Anual)
Timing: D+30 (após garantia)
Nota: Apenas para leads vindos de Lane_Indicacao</bpmn2:documentation>
      <bpmn2:incoming>Flow_Parceiro_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Split_Para_Onboarding</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_Onboarding_Pago" name="Onboarding: Acesso Imediato">
      <bpmn2:documentation>ONBOARDING CLIENTE PAGANTE:
1. E-mail de boas-vindas com credenciais
2. Acesso liberado ao sistema Fyness
3. WhatsApp de boas-vindas + link de suporte
4. Adiciona ao grupo VIP de clientes
5. Envia tutorial de primeiros passos
Timing: Imediato (webhook pós-pagamento)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Split_Para_Onboarding</bpmn2:incoming>
      <bpmn2:incoming>Flow_Parceiro_Nao</bpmn2:incoming>
      <bpmn2:incoming>Flow_Semestral_Aprovado</bpmn2:incoming>
      <bpmn2:incoming>Flow_0na0lv9</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Para_Cliente_Ativo</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_Webhook_Falha" name="Webhook: Detecta Falha no Pagamento">
      <bpmn2:documentation>DETECÇÃO AUTOMÁTICA DE RECUSA
Sistema: Webhook do gateway de pagamento
Trigger: Cartão recusado por:
- Limite insuficiente
- Segurança do banco
- Dados incorretos
Ação: Dispara sequência de downsell automático</bpmn2:documentation>
      <bpmn2:incoming>Flow_Anual_Recusado</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Falha_Para_WhatsApp</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_WhatsApp_5min" name="WhatsApp Automático: Link Semestral (5min)">
      <bpmn2:documentation>DOWNSELL AUTOMÁTICO (5 MINUTOS APÓS FALHA)
Via: WhatsApp (ManyChat ou Evolution API)
Script:
"Oi [Nome], vi aqui que o banco barrou a transação do plano Anual por segurança ou limite.

Isso é super comum com valores maiores!

Tenta esse link do Semestral que costuma passar direto (valor menor, mesmo benefício):
[Link Semestral]

Qualquer coisa me chama! 💚"

Link: hotmart.com/fyness-semestral</bpmn2:documentation>
      <bpmn2:incoming>Flow_Falha_Para_WhatsApp</bpmn2:incoming>
      <bpmn2:outgoing>Flow_WhatsApp_Para_Semestral</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_Checkout_Semestral" name="Checkout: Plano Semestral (R$ 997)">
      <bpmn2:documentation>DEGRAU 2: DOWNSELL AUTOMÁTICO
Valor: R$ 997/semestre (R$ 166,17/mês)
Estratégia: Ticket menor, mais fácil de passar no cartão
Parcelamento: Até 12x no cartão
Link: hotmart.com/fyness-semestral
Nota: NÃO fica exposto no site principal</bpmn2:documentation>
      <bpmn2:incoming>Flow_WhatsApp_Para_Semestral</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Semestral_Para_Gateway</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_Vendedor_Trimestral" name="Vendedor: Oferta Trimestral">
      <bpmn2:documentation>DEGRAU 3: CARTA NA MANGA DO VENDEDOR
Timing: D+2 após falha do Semestral
Responsável: SDR/Closer
Canal: WhatsApp ou ligação
Argumento:
"[Nome], entendo que o timing não está ideal agora.

Não casa comigo. Que tal namorar por 3 meses?

É um teste pago de R$ 561 pra você organizar a casa e decidir se vale continuar.

Se em 90 dias não mudou nada, cancela. Sem problema.

Bora testar?"

Link: hotmart.com/fyness-trimestral (NÃO EXPOSTO NO SITE)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Timer_Para_Vendedor</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Vendedor_Para_Trimestral</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_Checkout_Trimestral" name="Checkout: Plano Trimestral (R$ 561)">
      <bpmn2:documentation>DEGRAU 3: LAST RESORT (NÃO PÚBLICO)
Valor: R$ 561/trimestre (R$ 187/mês)
Estratégia: Teste pago, menor compromisso
Parcelamento: Até 3x no cartão
Link: hotmart.com/fyness-trimestral (privado)
Uso: Apenas para recuperação manual via vendedor</bpmn2:documentation>
      <bpmn2:incoming>Flow_Vendedor_Para_Trimestral</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trimestral_Para_Gateway</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:exclusiveGateway id="Gateway_Checkout_Merge" name="Direciona Checkout">
      <bpmn2:incoming>Flow_0m1sjfy</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Para_Anual</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Pagamento_Anual" name="Pagamento Anual Aprovado?">
      <bpmn2:incoming>Flow_Anual_Para_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Anual_Aprovado</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Anual_Recusado</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Pagamento_Semestral" name="Pagamento Semestral Aprovado?">
      <bpmn2:incoming>Flow_Semestral_Para_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Semestral_Aprovado</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Semestral_Recusado</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:exclusiveGateway id="Gateway_Pagamento_Trimestral" name="Pagamento Trimestral Aprovado?">
      <bpmn2:incoming>Flow_Trimestral_Para_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trimestral_Recusado</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_0na0lv9</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_D2" name="⏱ Timer: 48h">
      <bpmn2:documentation>COOLING OFF PERIOD
Aguarda 2 dias antes da última tentativa
Permite que cliente resolva questões bancárias
Evita spam excessivo</bpmn2:documentation>
      <bpmn2:incoming>Flow_Semestral_Recusado</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Timer_Para_Vendedor</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT48H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sequenceFlow id="Flow_Para_Cliente_Ativo" sourceRef="Task_Onboarding_Pago" targetRef="End_Cliente_Ativo" />
    <bpmn2:sequenceFlow id="Flow_Trimestral_Recusado" name="NÃO" sourceRef="Gateway_Pagamento_Trimestral" targetRef="End_Pagamento_Falhou" />
    <bpmn2:sequenceFlow id="Flow_Para_Anual" sourceRef="Gateway_Checkout_Merge" targetRef="Task_Checkout_Anual" />
    <bpmn2:sequenceFlow id="Flow_Anual_Para_Gateway" sourceRef="Task_Checkout_Anual" targetRef="Gateway_Pagamento_Anual" />
    <bpmn2:sequenceFlow id="Flow_Anual_Aprovado" name="SIM" sourceRef="Gateway_Pagamento_Anual" targetRef="Gateway_Tem_Parceiro" />
    <bpmn2:sequenceFlow id="Flow_Split_Para_Onboarding" sourceRef="Task_Split_Parceiro" targetRef="Task_Onboarding_Pago" />
    <bpmn2:sequenceFlow id="Flow_Semestral_Aprovado" name="SIM" sourceRef="Gateway_Pagamento_Semestral" targetRef="Task_Onboarding_Pago" />
    <bpmn2:sequenceFlow id="Flow_Anual_Recusado" name="NÃO" sourceRef="Gateway_Pagamento_Anual" targetRef="Task_Webhook_Falha" />
    <bpmn2:sequenceFlow id="Flow_Falha_Para_WhatsApp" sourceRef="Task_Webhook_Falha" targetRef="Task_WhatsApp_5min" />
    <bpmn2:sequenceFlow id="Flow_WhatsApp_Para_Semestral" sourceRef="Task_WhatsApp_5min" targetRef="Task_Checkout_Semestral" />
    <bpmn2:sequenceFlow id="Flow_Semestral_Para_Gateway" sourceRef="Task_Checkout_Semestral" targetRef="Gateway_Pagamento_Semestral" />
    <bpmn2:sequenceFlow id="Flow_Timer_Para_Vendedor" sourceRef="IntermediateTimer_D2" targetRef="Task_Vendedor_Trimestral" />
    <bpmn2:sequenceFlow id="Flow_Vendedor_Para_Trimestral" sourceRef="Task_Vendedor_Trimestral" targetRef="Task_Checkout_Trimestral" />
    <bpmn2:sequenceFlow id="Flow_Trimestral_Para_Gateway" sourceRef="Task_Checkout_Trimestral" targetRef="Gateway_Pagamento_Trimestral" />
    <bpmn2:sequenceFlow id="Flow_Semestral_Recusado" name="NÃO" sourceRef="Gateway_Pagamento_Semestral" targetRef="IntermediateTimer_D2" />
    <bpmn2:intermediateCatchEvent id="Event_0u9h6ak" name="← Checkout">
      <bpmn2:outgoing>Flow_0m1sjfy</bpmn2:outgoing>
      <bpmn2:linkEventDefinition id="LinkEventDefinition_0jv44ni" name="Link_Checkout" />
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sequenceFlow id="Flow_0m1sjfy" sourceRef="Event_0u9h6ak" targetRef="Gateway_Checkout_Merge" />
    <bpmn2:sequenceFlow id="Flow_0na0lv9" name="SIM" sourceRef="Gateway_Pagamento_Trimestral" targetRef="Task_Onboarding_Pago" />
    <bpmn2:sequenceFlow id="Flow_Parceiro_Sim" name="Sim" sourceRef="Gateway_Tem_Parceiro" targetRef="Task_Split_Parceiro" />
    <bpmn2:sequenceFlow id="Flow_Parceiro_Nao" name="Não" sourceRef="Gateway_Tem_Parceiro" targetRef="Task_Onboarding_Pago" />
  </bpmn2:process>
  <bpmn2:process id="Process_Meta" isExecutable="false">
    <bpmn2:intermediateThrowEvent id="Event_1q9m63q" name="→ Checkout">
      <bpmn2:incoming>Flow_0lfarjy</bpmn2:incoming>
      <bpmn2:linkEventDefinition id="LinkEventDefinition_1cr0lzg" name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:intermediateCatchEvent id="Timer_24h_Meta_D1" name="24h">
      <bpmn2:incoming>Flow_0fm6hqw</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D1_Start</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:userTask id="Task_Meta_D1_Reapproach" name="D1 - Ligação + Reabordagem">
      <bpmn2:documentation>📞 DIA 1 - LIGAÇÃO + REABORDAGEM:

1️⃣ LIGAR PRIMEIRO:
"[Nome], aqui é [Vendedor] da Fyness. Ontem a gente conversou rapidinho
e eu separei um caso de um cliente do seu ramo que organizou tudo em 7 dias.
Posso te contar em 2 minutos?"

→ Se atender: contar case + reengajar com demonstração
→ Ligação pega o lead "desprevenido" e converte mais

2️⃣ SE NÃO ATENDER → WHATSAPP:
"[Nome], separei um conteúdo que pode mudar sua visão:
[Link vídeo case de sucesso do nicho]
Esse cliente do seu ramo organizou todo o financeiro em 7 dias.
Vale 2 minutos do seu tempo?"

OBJETIVO: Ligação D1 resgata leads que só precisam de um empurrão.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_D1_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D1_Check</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:exclusiveGateway id="Gateway_Meta_Respondeu_D1" name="Respondeu?">
      <bpmn2:incoming>Flow_Meta_D1_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D1_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Meta_D1_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:endEvent id="End_Meta_Perdido" name="Perdido (Motivo)">
      <bpmn2:incoming>Flow_Meta_Motivo_End</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:intermediateThrowEvent id="LinkThrow_Meta_Trial" name="→ Trial">
      <bpmn2:incoming>Flow_1qdoel0</bpmn2:incoming>
      <bpmn2:incoming>Flow_Meta_D1_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Trial" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:exclusiveGateway id="Gateway_Converteu_Imediato_Meta" name="Fechou na hora?">
      <bpmn2:incoming>Flow_Meta_Interessado_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0lfarjy</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_1qdoel0</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="Flow_0lfarjy" name="Sim" sourceRef="Gateway_Converteu_Imediato_Meta" targetRef="Event_1q9m63q" />
    <bpmn2:sequenceFlow id="Flow_1qdoel0" name="Não" sourceRef="Gateway_Converteu_Imediato_Meta" targetRef="LinkThrow_Meta_Trial" />
    <bpmn2:exclusiveGateway id="Gateway_Interessado_D0_Meta" name="Interessado?">
      <bpmn2:incoming>Flow_Meta_FlashDemo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0fm6hqw</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Meta_Interessado_Sim</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="Flow_0fm6hqw" name="Nao" sourceRef="Gateway_Interessado_D0_Meta" targetRef="Timer_24h_Meta_D1" />
    <bpmn2:sequenceFlow id="Flow_Meta_Interessado_Sim" name="Sim" sourceRef="Gateway_Interessado_D0_Meta" targetRef="Gateway_Converteu_Imediato_Meta" />
    <bpmn2:userTask id="Task_PaginaFiltro_Meta" name="Página Captura">
      <bpmn2:documentation>🎯 PÁGINA DE FILTRO META ADS:

Lead vem de anúncio de descoberta (topo de funil).

LANDING PAGE:
- Título: "Transforme áudios em organização financeira"
- Filtro de qualificação: "Você é dono/gestor?"
- Formulário: Nome, WhatsApp, Segmento

OBJETIVO: Capturar contato qualificado antes da abordagem.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Filtro</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_Meta_Filtro" sourceRef="Task_PaginaFiltro_Meta" targetRef="Task_WhatsApp_D0_Meta" />
    <bpmn2:sendTask id="Task_FlashDemo_D0_Meta" name="D0 - Demo - Áudio + Print">
      <bpmn2:documentation>🎬 DEMO — AUTOMÁTICA POR SETOR (LEAD META = CURIOSO):

📹 ENVIO AUTOMÁTICO (após resposta ou 15min):
→ Automação envia demo gravada do SETOR do lead
→ Lead Meta é TOPO DE FUNIL — demo deve ser SIMPLES e IMPRESSIONANTE

SETORES COM DEMO PRONTA (envio automático):
• Contabilidade / Escritório • Comércio / Loja
• Clínica / Consultório • Prestador de serviço
• Academia / Estúdio • Restaurante / Alimentação

🎙️ NICHO ESPECÍFICO (demo sob demanda):
→ Se setor NÃO tem demo gravada: vendedor grava personalizada
→ Foco em mostrar a MÁGICA (áudio → resultado pronto)
→ Salvar no banco de demos pra reutilizar

MENSAGEM JUNTO COM A DEMO:
"Olha só que demais. Você manda um áudio falando o que precisa e a IA já organiza tudo. [Demo do setor] Testou algo parecido antes?"

OBJETIVO: Mostrar o produto funcionando antes de qualquer pitch.

🛡️ OBJEÇÕES COMUNS (lead de Meta é topo de funil — mais dúvidas):
• "O que é isso exatamente?" → "É um sistema que organiza seu financeiro por áudio."
• "Tá caro" → "Tem trial grátis de 7 dias. Sem compromisso."
• "Preciso pensar" → "Claro! Te mando o link do trial pra testar no seu tempo."
• "Já uso planilha" → "Planilha não gera relatório automático. Olha esse DRE."
• "Funciona pro meu ramo?" → "Sim! Temos clientes de [nicho]. Posso te mostrar."

🎓 BÔNUS EDUCAÇÃO (mencionar na oferta):
"E assinando, você ganha acesso à Plataforma de Educação — cursos de gestão financeira, comunidade de empresários, mentorias. Tudo de bônus."
→ Educação é BÔNUS da assinatura, não venda separada
→ Lead Meta é curioso — bônus aumenta conversão</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_D0_Zap</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_FlashDemo</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sequenceFlow id="Flow_Meta_FlashDemo" sourceRef="Task_FlashDemo_D0_Meta" targetRef="Gateway_Interessado_D0_Meta" />
    <bpmn2:sendTask id="Task_WhatsApp_D0_Meta" name="D0 - WhatsApp (Min 0-5) - Abordagem Ativa">
      <bpmn2:documentation>⚡ SPEED TO LEAD - META ADS (0-5 MINUTOS):

MENSAGEM INICIAL:
"Oi [Nome]! Vi que você acabou de preencher o formulário sobre gestão financeira.

Trabalha com [Segmento] mesmo? 🤔"

OBJETIVO: Quebra de gelo e confirmação de interesse real.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Filtro</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D0_Zap</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sequenceFlow id="Flow_Meta_D0_Zap" sourceRef="Task_WhatsApp_D0_Meta" targetRef="Task_FlashDemo_D0_Meta" />
    <bpmn2:startEvent id="Start_Meta" name="Meta Ads">
      <bpmn2:documentation>META ADS — LEAD DE DESCOBERTA (TOPO DE FUNIL):
Lead vem de anúncio de descoberta — NÃO estava procurando solução.
Intenção menor que Google, mas volume maior.

⚡ REGRA DE OURO — INBOUND &lt; 5 MINUTOS:
→ Lead Meta esfria MUITO rápido (estava scrollando, não pesquisando)
→ Responder em &lt; 5 min = pegar no pico de curiosidade
→ Se demorar &gt; 1h = já esqueceu que preencheu o formulário
→ SEMPRE priorizar inbound sobre outbound em andamento</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Meta_Start</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:sequenceFlow id="Flow_Meta_Start" sourceRef="Start_Meta" targetRef="Task_PaginaFiltro_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_D1_Start" sourceRef="Timer_24h_Meta_D1" targetRef="Task_Meta_D1_Reapproach" />
    <bpmn2:sequenceFlow id="Flow_Meta_D1_Check" sourceRef="Task_Meta_D1_Reapproach" targetRef="Gateway_Meta_Respondeu_D1" />
    <bpmn2:sequenceFlow id="Flow_Meta_D1_Sim" name="Sim" sourceRef="Gateway_Meta_Respondeu_D1" targetRef="LinkThrow_Meta_Trial" />
    <bpmn2:intermediateCatchEvent id="Timer_48h_D1D3_Meta" name="48h">
      <bpmn2:incoming>Flow_Meta_D1_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Timer_D3</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>PT48H</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sequenceFlow id="Flow_Meta_D1_Nao" name="Não" sourceRef="Gateway_Meta_Respondeu_D1" targetRef="Timer_48h_D1D3_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Timer_D3" sourceRef="Timer_48h_D1D3_Meta" targetRef="Task_Meta_D3" />
    <bpmn2:userTask id="Task_Meta_D3" name="D3 - Ligação + Case do Nicho (Meta)">
      <bpmn2:documentation>📞 DIA 3 - LIGAÇÃO + CASE DO NICHO (META ADS):

CONTEXTO: Lead veio de anúncio no Instagram/Facebook.
Ele clicou num criativo → preencheu formulário → já viu a demo.
Usar isso a seu favor: "Você viu o anúncio, agora veja o resultado real."

1️⃣ LIGAR PRIMEIRO:
"[Nome], aqui é o [Vendedor] da Fyness. Você preencheu nosso
formulário uns dias atrás. Antes de você decidir, quero te contar
o que aconteceu com o [Fulano] do seu ramo — ele veio pelo
mesmo anúncio que você e em 2 semanas organizou tudo.
Tem 2 minutinhos?"

→ Se atender: conectar com a origem (anúncio) + contar case real
→ Lead de Meta responde bem a "outras pessoas como você fizeram"

2️⃣ SE NÃO ATENDER → WHATSAPP:
"[Nome], lembra do formulário que você preencheu?
Esse cliente do seu ramo também veio pelo nosso anúncio.
Resultado dele em 14 dias: [Print dashboard]
Vale 2 min do seu tempo?"

DIFERENCIAL META: Referenciar o anúncio como ponto de conexão.
Lead de Meta já demonstrou interesse ao preencher formulário.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Timer_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D3_D7</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_Meta_D7" name="D7 - Ligação + Ultimato (Meta)">
      <bpmn2:documentation>📞 DIA 7 - LIGAÇÃO + ULTIMATO (META ADS):

CONTEXTO: Lead de Meta já viu anúncio + preencheu form + recebeu demo + case.
Ele SABE o que é o produto. Falta o empurrão final.

1️⃣ LIGAR PRIMEIRO:
"[Nome], aqui é o [Vendedor]. Sei que você já viu como funciona
pelo nosso anúncio e pela demo. Faltam poucas vagas do trial
gratuito esse mês. Quero segurar uma pra você antes que feche.
Posso liberar agora?"

→ Se atender: fechar trial na hora
→ Referenciar que ele JÁ VIU o produto (reduzir atrito)

2️⃣ SE NÃO ATENDER → WHATSAPP:
"[Nome], você já viu o sistema funcionando.
Últimas vagas do trial grátis esse mês.
Libero a sua com um 'sim'. Sem compromisso."

DIFERENCIAL META: Lead de anúncio já foi educado. Não precisa
re-explicar o produto — só criar urgência para agir.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Timer_D7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D7_D10</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sendTask id="Task_Meta_D10_Breakup" name="D10 - Break-up (Meta)">
      <bpmn2:documentation>👋 DIA 10 - BREAK-UP (META ADS):

MENSAGEM (WhatsApp):
"[Nome], vou encerrar seu atendimento por aqui.
Sei que você se interessou pelo anúncio, mas entendo
que o timing pode não ser ideal. Se mudar de ideia,
meu contato tá salvo. Sucesso! 🚀"

DIFERENCIAL META: Mencionar o anúncio reforça que ELE tomou
a iniciativa de clicar. Gera mais culpa/reflexão que um break-up genérico.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Timer_D10</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D10_Timer</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:intermediateCatchEvent id="Timer_24h_Breakup_Meta" name="24h">
      <bpmn2:documentation>⏰ TIMER PÓS-BREAKUP:
Aguarda 24h para ver se o lead responde ao ultimato elegante.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_D10_Timer</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Timer_Check_Final</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:exclusiveGateway id="Gateway_Meta_Respondeu_Final" name="Respondeu?">
      <bpmn2:incoming>Flow_Meta_Timer_Check_Final</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Resp_Final_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Meta_Resp_Final_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:serviceTask id="Task_Meta_Nurturing" name="Grupo WhatsApp Nurturing">
      <bpmn2:documentation>NURTURING - GRUPO WHATSAPP:
Lead que respondeu é adicionado em grupo de WhatsApp para:
- Receber promoções especiais
- Ver cases de sucesso semanais
- Ofertas de reativação</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Resp_Final_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Nurturing_End</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:userTask id="Task_Meta_MotivoPerda" name="CRM: Seleciona Motivo Perda (Meta)">
      <bpmn2:documentation>📋 REGISTRO DE MOTIVO NO CRM (META ADS):

MOTIVOS POSSÍVEIS:
1. Preço - Achou caro demais
2. Timing - Não é o momento
3. Já usa outro - Tem ERP/concorrente
4. Não entendeu o valor - Faltou clareza na demo
5. Ghostou - Sumiu após preencher formulário
6. Clicou sem intenção - Curiosidade do anúncio

AÇÃO: Registrar com tag [META_ADS] + ID da campanha.
INSIGHT: Se motivo 6 for frequente → revisar segmentação da campanha Meta.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Resp_Final_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Motivo_End</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:endEvent id="End_Meta_Nurturing" name="Nurturing Ativo">
      <bpmn2:incoming>Flow_Meta_Nurturing_End</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:intermediateCatchEvent id="Timer_96h_D3D7_Meta" name="96h">
      <bpmn2:incoming>Flow_Meta_D3_D7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Timer_D7</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>PT96H</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateCatchEvent id="Timer_72h_D7D10_Meta" name="72h">
      <bpmn2:incoming>Flow_Meta_D7_D10</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Timer_D10</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>PT72H</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sequenceFlow id="Flow_Meta_D3_D7" sourceRef="Task_Meta_D3" targetRef="Timer_96h_D3D7_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Timer_D7" sourceRef="Timer_96h_D3D7_Meta" targetRef="Task_Meta_D7" />
    <bpmn2:sequenceFlow id="Flow_Meta_D7_D10" sourceRef="Task_Meta_D7" targetRef="Timer_72h_D7D10_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Timer_D10" sourceRef="Timer_72h_D7D10_Meta" targetRef="Task_Meta_D10_Breakup" />
    <bpmn2:sequenceFlow id="Flow_Meta_D10_Timer" sourceRef="Task_Meta_D10_Breakup" targetRef="Timer_24h_Breakup_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Timer_Check_Final" sourceRef="Timer_24h_Breakup_Meta" targetRef="Gateway_Meta_Respondeu_Final" />
    <bpmn2:sequenceFlow id="Flow_Meta_Resp_Final_Sim" name="Sim" sourceRef="Gateway_Meta_Respondeu_Final" targetRef="Task_Meta_Nurturing" />
    <bpmn2:sequenceFlow id="Flow_Meta_Resp_Final_Nao" name="Não" sourceRef="Gateway_Meta_Respondeu_Final" targetRef="Task_Meta_MotivoPerda" />
    <bpmn2:sequenceFlow id="Flow_Meta_Nurturing_End" sourceRef="Task_Meta_Nurturing" targetRef="End_Meta_Nurturing" />
    <bpmn2:sequenceFlow id="Flow_Meta_Motivo_End" sourceRef="Task_Meta_MotivoPerda" targetRef="End_Meta_Perdido" />
  </bpmn2:process>
  <bpmn2:process id="Process_Trial" isExecutable="false">
    <bpmn2:intermediateCatchEvent id="LinkCatch_Trial" name="← Trial">
      <bpmn2:outgoing>Flow_Trial_D0</bpmn2:outgoing>
      <bpmn2:linkEventDefinition name="Link_Trial" />
    </bpmn2:intermediateCatchEvent>
    <bpmn2:serviceTask id="Task_Trial_D0_BoasVindas" name="D0 - Boas-vindas + Guia Rápido">
      <bpmn2:documentation>ONBOARDING IMEDIATO:
- E-mail/WhatsApp de boas-vindas com vídeo de 2 min
- Guia rápido: "3 passos para seu primeiro lançamento"
- CTA: "Faça seu primeiro lançamento agora"

OBJETIVO: Primeiro valor em menos de 5 minutos.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trial_D0</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D0_D1</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:intermediateCatchEvent id="Timer_Trial_24h" name="24h">
      <bpmn2:incoming>Flow_Trial_D0_D1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D1_Check</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:exclusiveGateway id="Gateway_Trial_D1_Uso" name="Usou D0?">
      <bpmn2:incoming>Flow_Trial_D1_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D1_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Trial_D1_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sendTask id="Task_Trial_D1_Dica" name="D1 - Dica Feature-Chave">
      <bpmn2:documentation>SE USOU:
"Vi que você já fez seu primeiro lançamento!
Agora experimenta essa função que nossos clientes mais amam: [Feature-Chave do nicho]"

OBJETIVO: Aprofundar o uso e criar aha moment.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trial_D1_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D1_Merge</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_Trial_D1_Reengajamento" name="D1 - Reengajamento (Não Usou)">
      <bpmn2:documentation>SE NÃO USOU:
"Oi [Nome]! Vi que você ainda não fez o primeiro lançamento.
É super rápido: manda um áudio 'Gastei 50 reais de almoço' e vê a mágica acontecer.
Precisa de ajuda? Me chama!"

OBJETIVO: Reengajar antes que esfrie.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trial_D1_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D1_Merge2</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:exclusiveGateway id="Gateway_Trial_D1_Merge">
      <bpmn2:incoming>Flow_Trial_D1_Merge</bpmn2:incoming>
      <bpmn2:incoming>Flow_Trial_D1_Merge2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D1_D2</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:intermediateCatchEvent id="Timer_Trial_D2" name="24h">
      <bpmn2:incoming>Flow_Trial_D1_D2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D2_Start</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sendTask id="Task_Trial_D2_Case" name="D2 - Case de Sucesso">
      <bpmn2:documentation>PROVA SOCIAL:
"[Nome], olha o resultado desse cliente do seu ramo em apenas 7 dias: [Print/Depoimento]

Ele começou igual você. Imagina onde você vai estar daqui a uma semana!"

OBJETIVO: Prova social + projeção de futuro.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trial_D2_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D2_D3</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:intermediateCatchEvent id="Timer_Trial_D3" name="24h">
      <bpmn2:incoming>Flow_Trial_D2_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D3_Check</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:exclusiveGateway id="Gateway_Trial_D3_Uso" name="Usou em 48h?">
      <bpmn2:incoming>Flow_Trial_D3_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D3_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Trial_D3_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sendTask id="Task_Trial_D3_Parabens" name="D3 - Parabéns + Próximo Nível">
      <bpmn2:documentation>SE USOU:
"Parabéns! Você já tem 3 dias de histórico. Quer ver seu mini-DRE?"

OBJETIVO: Mostrar valor tangível.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trial_D3_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D3_Merge1</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:userTask id="Task_Trial_D3_Resgate" name="D3 - Ligação de Resgate">
      <bpmn2:documentation>SE NÃO USOU EM 48H:
Ligação de resgate. "Oi [Nome], vi que travou. Vamos fazer juntos? 15 minutos e você já sai com o caixa organizado."

OBJETIVO: Salvar trial antes de esfriar.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trial_D3_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D3_Merge2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:exclusiveGateway id="Gateway_Trial_D3_Merge">
      <bpmn2:incoming>Flow_Trial_D3_Merge1</bpmn2:incoming>
      <bpmn2:incoming>Flow_Trial_D3_Merge2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D3_D5</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:intermediateCatchEvent id="Timer_Trial_D5" name="48h">
      <bpmn2:incoming>Flow_Trial_D3_D5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D5_Start</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT48H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:userTask id="Task_Trial_D5_Urgencia" name="D5 - Ligação + Urgência">
      <bpmn2:documentation>📞 DIA 5 - LIGAÇÃO + URGÊNCIA (FALTAM 2 DIAS):

1️⃣ LIGAR PRIMEIRO (lead engajado merece contato humano):
"[Nome], aqui é o [Vendedor]. Vi que você tá testando o Fyness
e faltam 2 dias. Tem alguma dúvida? Quero te ajudar a tirar
o máximo antes de acabar."

→ Se atender: ajudar com configuração + perguntar se quer converter
→ Ligação no D5 cria relacionamento antes da oferta D6

2️⃣ SE NÃO ATENDER → WHATSAPP:
"[Nome], faltam 2 dias do seu trial!
Tem alguma dúvida? Estou aqui pra ajudar."

OBJETIVO: Criar urgência com suporte genuíno.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trial_D5_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D5_D6</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:intermediateCatchEvent id="Timer_Trial_D6" name="24h">
      <bpmn2:incoming>Flow_Trial_D5_D6</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D6_Start</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:userTask id="Task_Trial_D6_Oferta" name="D6 - Ligação + Oferta de Conversão">
      <bpmn2:documentation>📞 DIA 6 - LIGAÇÃO + OFERTA FINAL:

1️⃣ LIGAR PRIMEIRO:
"[Nome], amanhã seu trial acaba. Vi que você usou [X lançamentos].
Consegui uma condição especial pra você:
Plano Anual com 40% OFF + onboarding prioritário.
Bora garantir antes que expire?"

→ Se atender: apresentar oferta + responder objeções na hora
→ Ligação no último dia converte 4x mais que mensagem

2️⃣ SE NÃO ATENDER → WHATSAPP:
"[Nome], amanhã acaba seu trial. Condição especial:
Anual com 40% OFF. Bora garantir?"

OBJETIVO: Converter antes do fim do trial com contato humano.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trial_D6_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D6_Ext</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:exclusiveGateway id="Gateway_Trial_Extensao" name="Quer extensão?">
      <bpmn2:incoming>Flow_Trial_D6_Ext</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_Ext_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Trial_Ext_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:serviceTask id="Task_Trial_Extension" name="Extensão +3 Dias (Reset Trial)">
      <bpmn2:documentation>🔄 EXTENSÃO DE TRIAL (+3 DIAS):

CONDIÇÕES:
- Lead respondeu à oferta D6
- Pediu mais tempo para testar
- Demonstrou interesse real

AÇÃO:
- Resetar contador de trial +3 dias
- Enviar mensagem: "Pronto! Liberei mais 3 dias pra você. Aproveita pra testar [Feature X] que nossos clientes mais usam."
- CRM: Tag [TRIAL_EXTENDED]

OBJETIVO: Dar mais uma chance de conversão para leads engajados.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trial_Ext_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_Ext_Timer</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:intermediateCatchEvent id="Timer_Trial_D10" name="72h">
      <bpmn2:incoming>Flow_Trial_Ext_Timer</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D10_Conv</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT72H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateCatchEvent id="Timer_Trial_D7" name="24h">
      <bpmn2:incoming>Flow_Trial_Ext_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_D7_End</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:exclusiveGateway id="Gateway_Trial_Converteu" name="Converteu?">
      <bpmn2:incoming>Flow_Trial_D7_End</bpmn2:incoming>
      <bpmn2:incoming>Flow_Trial_D10_Conv</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_Conv_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Trial_Conv_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:intermediateThrowEvent id="LinkThrow_Trial_Checkout" name="→ Checkout">
      <bpmn2:incoming>Flow_Trial_Conv_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:intermediateThrowEvent id="LinkThrow_Trial_Desconto" name="→ Checkout (Desconto)">
      <bpmn2:incoming>Flow_Trial_Desconto_Checkout</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:userTask id="Task_Trial_Breakup" name="D7 - Break-up Elegante">
      <bpmn2:documentation>📞 ANTES DO BREAK-UP → LIGAR PRIMEIRO (Resgate Secundário):

1️⃣ LIGAR:
"[Nome], aqui é [Vendedor]. Seu trial acaba hoje e queria
entender: o que faltou pra você decidir? Se for preço, tenho
uma condição especial. Se for funcionalidade, posso te mostrar
o que não deu tempo de ver."

→ Se atender e disser PREÇO: oferecer 25% OFF na hora
→ Se atender e disser TIMING: oferecer extensão +3 dias
→ Se atender e disser OUTRO: registrar motivo real no CRM
→ Se não atender: enviar break-up por WhatsApp

2️⃣ SE NÃO ATENDER → WHATSAPP (Break-up):
"Fala [Nome]. Seu trial de 7 dias acabou.
Como não tivemos retorno, vou assumir que não é o momento.
Mas seu histórico fica salvo por 30 dias caso mude de ideia.
Se o caos voltar, meu contato é esse. Abraço!"

OBJETIVO: Último resgate por ligação. Break-up só como backup.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trial_Conv_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_Breakup_Timer</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:intermediateCatchEvent id="Timer_Trial_Breakup" name="24h">
      <bpmn2:incoming>Flow_Trial_Breakup_Timer</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_Breakup_Check</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:exclusiveGateway id="Gateway_Trial_Respondeu" name="Respondeu?">
      <bpmn2:incoming>Flow_Trial_Breakup_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_Resp_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Trial_Resp_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:serviceTask id="Task_Trial_Nurturing" name="Grupo Nurturing">
      <bpmn2:documentation>NURTURING (RESPONDEU AO BREAK-UP = LEAD QUENTE):

⚠️ ATENÇÃO: Se o lead respondeu ao break-up, ele TEM interesse.
Antes de jogar no grupo genérico, LIGAR e oferecer condição:

1. Vendedor liga: "Vi que você respondeu! O que faltou?"
2. Se preço → 25% OFF nos primeiros 3 meses
3. Se timing → extensão +3 dias ou lembrete 30d
4. Se já decidiu que não quer → grupo de nurturing

GRUPO DE AQUECIMENTO:
- Promoções especiais
- Cases de sucesso semanais
- Ofertas de reativação (Black Friday, aniversário etc.)

CONSIDERADO PERDIDO: Apenas se bloquear/sair do grupo.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trial_Resp_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_Nurt</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:userTask id="Task_Trial_MotivoPerda" name="CRM: Motivo da Perda">
      <bpmn2:documentation>MARCAR COMO PERDIDO (LOST):
Motivos:
- Sem Contato (Ghosting)
- Preço
- Concorrência
- Desqualificado
- Timing
- Outro</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trial_Resp_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_Motivo_Check</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:exclusiveGateway id="Gateway_Trial_Motivo" name="Motivo?">
      <bpmn2:incoming>Flow_Trial_Motivo_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_Motivo_Preco</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Trial_Motivo_Timing</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Trial_Motivo_Outro</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sendTask id="Task_Trial_OfertaDesconto" name="Oferta Desconto Especial">
      <bpmn2:documentation>💰 RECUPERAÇÃO POR PREÇO:

MENSAGEM:
"[Nome], entendo que o investimento pesa. Consegui
25% OFF nos primeiros 3 meses pra você. Cancela
quando quiser e mantém o histórico do trial.
O que acha?"

OBJETIVO: Converter lead por preço sem desvalorizar o produto.
REGRA: Máximo 25% — acima disso vira commodity.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trial_Motivo_Preco</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_Desconto_Checkout</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:serviceTask id="Task_Trial_Lembrete30d" name="CRM: Lembrete 30 Dias">
      <bpmn2:documentation>⏰ RECUPERAÇÃO POR TIMING:

AÇÃO CRM:
- Tag [TIMING_RETRY]
- Agendar lembrete para 30 dias
- Mensagem automática em 30 dias:
"Oi [Nome]! Faz 30 dias que você testou o Fyness.
Como estão as coisas por aí? Ainda usando planilha?
Liberamos um novo trial de 7 dias pra você. Quer experimentar de novo?"

OBJETIVO: Reengajar quando o timing for melhor.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trial_Motivo_Timing</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_Timing_Timer</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:intermediateCatchEvent id="Timer_30d_Trial" name="30 dias">
      <bpmn2:incoming>Flow_Trial_Timing_Timer</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trial_Timing_Retry</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P30D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateThrowEvent id="LinkThrow_Trial_Retry" name="→ Trial (Retry)">
      <bpmn2:incoming>Flow_Trial_Timing_Retry</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Trial" />
    </bpmn2:intermediateThrowEvent>
    <bpmn2:endEvent id="End_Trial_Nurturing" name="Nurturing">
      <bpmn2:incoming>Flow_Trial_Nurt</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:endEvent id="End_Trial_Lost" name="Lost (Outro Motivo)">
      <bpmn2:incoming>Flow_Trial_Motivo_Outro</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_Trial_D0" sourceRef="LinkCatch_Trial" targetRef="Task_Trial_D0_BoasVindas" />
    <bpmn2:sequenceFlow id="Flow_Trial_D0_D1" sourceRef="Task_Trial_D0_BoasVindas" targetRef="Timer_Trial_24h" />
    <bpmn2:sequenceFlow id="Flow_Trial_D1_Check" sourceRef="Timer_Trial_24h" targetRef="Gateway_Trial_D1_Uso" />
    <bpmn2:sequenceFlow id="Flow_Trial_D1_Sim" name="Sim" sourceRef="Gateway_Trial_D1_Uso" targetRef="Task_Trial_D1_Dica" />
    <bpmn2:sequenceFlow id="Flow_Trial_D1_Nao" name="Não" sourceRef="Gateway_Trial_D1_Uso" targetRef="Task_Trial_D1_Reengajamento" />
    <bpmn2:sequenceFlow id="Flow_Trial_D1_Merge" sourceRef="Task_Trial_D1_Dica" targetRef="Gateway_Trial_D1_Merge" />
    <bpmn2:sequenceFlow id="Flow_Trial_D1_Merge2" sourceRef="Task_Trial_D1_Reengajamento" targetRef="Gateway_Trial_D1_Merge" />
    <bpmn2:sequenceFlow id="Flow_Trial_D1_D2" sourceRef="Gateway_Trial_D1_Merge" targetRef="Timer_Trial_D2" />
    <bpmn2:sequenceFlow id="Flow_Trial_D2_Start" sourceRef="Timer_Trial_D2" targetRef="Task_Trial_D2_Case" />
    <bpmn2:sequenceFlow id="Flow_Trial_D2_D3" sourceRef="Task_Trial_D2_Case" targetRef="Timer_Trial_D3" />
    <bpmn2:sequenceFlow id="Flow_Trial_D3_Check" sourceRef="Timer_Trial_D3" targetRef="Gateway_Trial_D3_Uso" />
    <bpmn2:sequenceFlow id="Flow_Trial_D3_Sim" name="Sim" sourceRef="Gateway_Trial_D3_Uso" targetRef="Task_Trial_D3_Parabens" />
    <bpmn2:sequenceFlow id="Flow_Trial_D3_Nao" name="Não" sourceRef="Gateway_Trial_D3_Uso" targetRef="Task_Trial_D3_Resgate" />
    <bpmn2:sequenceFlow id="Flow_Trial_D3_Merge1" sourceRef="Task_Trial_D3_Parabens" targetRef="Gateway_Trial_D3_Merge" />
    <bpmn2:sequenceFlow id="Flow_Trial_D3_Merge2" sourceRef="Task_Trial_D3_Resgate" targetRef="Gateway_Trial_D3_Merge" />
    <bpmn2:sequenceFlow id="Flow_Trial_D3_D5" sourceRef="Gateway_Trial_D3_Merge" targetRef="Timer_Trial_D5" />
    <bpmn2:sequenceFlow id="Flow_Trial_D5_Start" sourceRef="Timer_Trial_D5" targetRef="Task_Trial_D5_Urgencia" />
    <bpmn2:sequenceFlow id="Flow_Trial_D5_D6" sourceRef="Task_Trial_D5_Urgencia" targetRef="Timer_Trial_D6" />
    <bpmn2:sequenceFlow id="Flow_Trial_D6_Start" sourceRef="Timer_Trial_D6" targetRef="Task_Trial_D6_Oferta" />
    <bpmn2:sequenceFlow id="Flow_Trial_D6_Ext" sourceRef="Task_Trial_D6_Oferta" targetRef="Gateway_Trial_Extensao" />
    <bpmn2:sequenceFlow id="Flow_Trial_Ext_Sim" name="Sim" sourceRef="Gateway_Trial_Extensao" targetRef="Task_Trial_Extension" />
    <bpmn2:sequenceFlow id="Flow_Trial_Ext_Nao" name="Não" sourceRef="Gateway_Trial_Extensao" targetRef="Timer_Trial_D7" />
    <bpmn2:sequenceFlow id="Flow_Trial_Ext_Timer" sourceRef="Task_Trial_Extension" targetRef="Timer_Trial_D10" />
    <bpmn2:sequenceFlow id="Flow_Trial_D10_Conv" sourceRef="Timer_Trial_D10" targetRef="Gateway_Trial_Converteu" />
    <bpmn2:sequenceFlow id="Flow_Trial_D7_End" sourceRef="Timer_Trial_D7" targetRef="Gateway_Trial_Converteu" />
    <bpmn2:sequenceFlow id="Flow_Trial_Conv_Sim" name="Sim" sourceRef="Gateway_Trial_Converteu" targetRef="LinkThrow_Trial_Checkout" />
    <bpmn2:sequenceFlow id="Flow_Trial_Conv_Nao" name="Não" sourceRef="Gateway_Trial_Converteu" targetRef="Task_Trial_Breakup" />
    <bpmn2:sequenceFlow id="Flow_Trial_Breakup_Timer" sourceRef="Task_Trial_Breakup" targetRef="Timer_Trial_Breakup" />
    <bpmn2:sequenceFlow id="Flow_Trial_Breakup_Check" sourceRef="Timer_Trial_Breakup" targetRef="Gateway_Trial_Respondeu" />
    <bpmn2:sequenceFlow id="Flow_Trial_Resp_Sim" name="Sim" sourceRef="Gateway_Trial_Respondeu" targetRef="Task_Trial_Nurturing" />
    <bpmn2:sequenceFlow id="Flow_Trial_Resp_Nao" name="Não" sourceRef="Gateway_Trial_Respondeu" targetRef="Task_Trial_MotivoPerda" />
    <bpmn2:sequenceFlow id="Flow_Trial_Nurt" sourceRef="Task_Trial_Nurturing" targetRef="End_Trial_Nurturing" />
    <bpmn2:sequenceFlow id="Flow_Trial_Motivo_Check" sourceRef="Task_Trial_MotivoPerda" targetRef="Gateway_Trial_Motivo" />
    <bpmn2:sequenceFlow id="Flow_Trial_Motivo_Preco" name="Preço" sourceRef="Gateway_Trial_Motivo" targetRef="Task_Trial_OfertaDesconto" />
    <bpmn2:sequenceFlow id="Flow_Trial_Motivo_Timing" name="Timing" sourceRef="Gateway_Trial_Motivo" targetRef="Task_Trial_Lembrete30d" />
    <bpmn2:sequenceFlow id="Flow_Trial_Motivo_Outro" name="Outro" sourceRef="Gateway_Trial_Motivo" targetRef="End_Trial_Lost" />
    <bpmn2:sequenceFlow id="Flow_Trial_Desconto_Checkout" sourceRef="Task_Trial_OfertaDesconto" targetRef="LinkThrow_Trial_Desconto" />
    <bpmn2:sequenceFlow id="Flow_Trial_Timing_Timer" sourceRef="Task_Trial_Lembrete30d" targetRef="Timer_30d_Trial" />
    <bpmn2:sequenceFlow id="Flow_Trial_Timing_Retry" sourceRef="Timer_30d_Trial" targetRef="LinkThrow_Trial_Retry" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_Comercial">
      <bpmndi:BPMNShape id="Shape_Participant_Educacao" bpmnElement="Participant_Educacao" isHorizontal="true" bioc:stroke="#51cf66" bioc:fill="#e0ffe0">
        <dc:Bounds x="160" y="80" width="4400" height="520" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Educacao" bpmnElement="Start_Educacao">
        <dc:Bounds x="232" y="252" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Tag_Educacao" bpmnElement="Task_Tag_Educacao">
        <dc:Bounds x="330" y="230" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Edu_D0_MiniAula" bpmnElement="Task_Edu_D0_MiniAula">
        <dc:Bounds x="490" y="230" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_Edu_D1" bpmnElement="Timer_Edu_D1">
        <dc:Bounds x="652" y="252" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Edu_D1_Followup" bpmnElement="Task_Edu_D1_Followup">
        <dc:Bounds x="740" y="230" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_Edu_D3" bpmnElement="Timer_Edu_D3">
        <dc:Bounds x="902" y="252" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Edu_D3_Demo" bpmnElement="Task_Edu_D3_Demo">
        <dc:Bounds x="990" y="230" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Edu_Quer_Trial" bpmnElement="Gateway_Edu_Quer_Trial" isMarkerVisible="true">
        <dc:Bounds x="1150" y="245" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1140" y="221" width="70" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Educacao_Trial" bpmnElement="LinkThrow_Educacao_Trial">
        <dc:Bounds x="1157" y="142" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1156" y="118" width="38" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_Edu_D7" bpmnElement="Timer_Edu_D7">
        <dc:Bounds x="1262" y="252" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Edu_D7_Escassez" bpmnElement="Task_Edu_D7_Escassez">
        <dc:Bounds x="1350" y="230" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Edu_Respondeu" bpmnElement="Gateway_Edu_Respondeu" isMarkerVisible="true">
        <dc:Bounds x="1510" y="245" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1505" y="221" width="60" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Edu_Nurturing" bpmnElement="Task_Edu_Nurturing">
        <dc:Bounds x="1620" y="360" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Edu_Nurturing" bpmnElement="End_Edu_Nurturing">
        <dc:Bounds x="1772" y="382" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1753" y="418" width="74" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Start" bpmnElement="Flow_Edu_Start">
        <di:waypoint x="268" y="270" />
        <di:waypoint x="330" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Tag" bpmnElement="Flow_Edu_Tag">
        <di:waypoint x="430" y="270" />
        <di:waypoint x="490" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_D0" bpmnElement="Flow_Edu_D0">
        <di:waypoint x="590" y="270" />
        <di:waypoint x="652" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Timer_D1" bpmnElement="Flow_Edu_Timer_D1">
        <di:waypoint x="688" y="270" />
        <di:waypoint x="740" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_D1" bpmnElement="Flow_Edu_D1">
        <di:waypoint x="840" y="270" />
        <di:waypoint x="902" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Timer_D3" bpmnElement="Flow_Edu_Timer_D3">
        <di:waypoint x="938" y="270" />
        <di:waypoint x="990" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_D3" bpmnElement="Flow_Edu_D3">
        <di:waypoint x="1090" y="270" />
        <di:waypoint x="1150" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Trial_Sim" bpmnElement="Flow_Edu_Trial_Sim">
        <di:waypoint x="1175" y="245" />
        <di:waypoint x="1175" y="178" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Trial_Nao" bpmnElement="Flow_Edu_Trial_Nao">
        <di:waypoint x="1200" y="270" />
        <di:waypoint x="1262" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Timer_D7" bpmnElement="Flow_Edu_Timer_D7">
        <di:waypoint x="1298" y="270" />
        <di:waypoint x="1350" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_D7" bpmnElement="Flow_Edu_D7">
        <di:waypoint x="1450" y="270" />
        <di:waypoint x="1510" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Resp_Sim" bpmnElement="Flow_Edu_Resp_Sim">
        <di:waypoint x="1535" y="245" />
        <di:waypoint x="1535" y="160" />
        <di:waypoint x="1175" y="160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Resp_Nao" bpmnElement="Flow_Edu_Resp_Nao">
        <di:waypoint x="1535" y="295" />
        <di:waypoint x="1535" y="400" />
        <di:waypoint x="1620" y="400" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Nurturing_End" bpmnElement="Flow_Edu_Nurturing_End">
        <di:waypoint x="1720" y="400" />
        <di:waypoint x="1772" y="400" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Start_Edu_Abandono" bpmnElement="Start_Edu_Abandono">
        <dc:Bounds x="232" y="472" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="205" y="513" width="90" height="28" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_Edu_Ab_30min" bpmnElement="Timer_Edu_Ab_30min">
        <dc:Bounds x="322" y="472" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Edu_Abandono_30min" bpmnElement="Task_Edu_Abandono_30min">
        <dc:Bounds x="410" y="450" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_Edu_Ab_24h" bpmnElement="Timer_Edu_Ab_24h">
        <dc:Bounds x="562" y="472" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Edu_Abandono_24h" bpmnElement="Task_Edu_Abandono_24h">
        <dc:Bounds x="650" y="450" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_Edu_Ab_48h" bpmnElement="Timer_Edu_Ab_48h">
        <dc:Bounds x="802" y="472" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Edu_Abandono_48h" bpmnElement="Task_Edu_Abandono_48h">
        <dc:Bounds x="890" y="450" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Edu_Recuperou" bpmnElement="Gateway_Edu_Recuperou" isMarkerVisible="true">
        <dc:Bounds x="1045" y="465" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1040" y="441" width="60" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Edu_Cliente" bpmnElement="End_Edu_Cliente">
        <dc:Bounds x="1152" y="422" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1122" y="398" width="96" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Edu_Volta_Funil" bpmnElement="End_Edu_Volta_Funil">
        <dc:Bounds x="1152" y="522" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1133" y="563" width="74" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Ab_Start" bpmnElement="Flow_Edu_Ab_Start">
        <di:waypoint x="268" y="490" />
        <di:waypoint x="322" y="490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Ab_Timer30" bpmnElement="Flow_Edu_Ab_Timer30">
        <di:waypoint x="358" y="490" />
        <di:waypoint x="410" y="490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Ab_30" bpmnElement="Flow_Edu_Ab_30">
        <di:waypoint x="510" y="490" />
        <di:waypoint x="562" y="490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Ab_Timer24" bpmnElement="Flow_Edu_Ab_Timer24">
        <di:waypoint x="598" y="490" />
        <di:waypoint x="650" y="490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Ab_24" bpmnElement="Flow_Edu_Ab_24">
        <di:waypoint x="750" y="490" />
        <di:waypoint x="802" y="490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Ab_Timer48" bpmnElement="Flow_Edu_Ab_Timer48">
        <di:waypoint x="838" y="490" />
        <di:waypoint x="890" y="490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Ab_48" bpmnElement="Flow_Edu_Ab_48">
        <di:waypoint x="990" y="490" />
        <di:waypoint x="1045" y="490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Recuperou_Sim" bpmnElement="Flow_Edu_Recuperou_Sim">
        <di:waypoint x="1070" y="465" />
        <di:waypoint x="1070" y="440" />
        <di:waypoint x="1152" y="440" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Recuperou_Nao" bpmnElement="Flow_Edu_Recuperou_Nao">
        <di:waypoint x="1070" y="515" />
        <di:waypoint x="1070" y="540" />
        <di:waypoint x="1152" y="540" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Start_Edu_100_SemCTA" bpmnElement="Start_Edu_100_SemCTA">
        <dc:Bounds x="1900" y="472" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1872" y="513" width="92" height="28" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_Edu_100_2h" bpmnElement="Timer_Edu_100_2h">
        <dc:Bounds x="1990" y="472" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Edu_100_Followup" bpmnElement="Task_Edu_100_Followup">
        <dc:Bounds x="2070" y="450" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Edu_100_Seguir" bpmnElement="End_Edu_100_Seguir">
        <dc:Bounds x="2222" y="472" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2210" y="513" width="60" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_100_Start" bpmnElement="Flow_Edu_100_Start">
        <di:waypoint x="1936" y="490" />
        <di:waypoint x="1990" y="490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_100_Timer" bpmnElement="Flow_Edu_100_Timer">
        <di:waypoint x="2026" y="490" />
        <di:waypoint x="2070" y="490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_100_End" bpmnElement="Flow_Edu_100_End">
        <di:waypoint x="2170" y="490" />
        <di:waypoint x="2222" y="490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Participant_Indicacao" bpmnElement="Participant_Indicacao" isHorizontal="true" bioc:stroke="#ff6b6b" bioc:fill="#ffe0e0">
        <dc:Bounds x="160" y="650" width="4400" height="630" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Indicacao_Ativo" bpmnElement="Start_Indicacao_Ativo">
        <dc:Bounds x="232" y="682" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Indicacao_Passivo" bpmnElement="Start_Indicacao_Passivo">
        <dc:Bounds x="232" y="902" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Perdido_Motivo_Indicacao" bpmnElement="End_Perdido_Motivo_Indicacao">
        <dc:Bounds x="2867" y="1122" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Bloqueio_Indicacao" bpmnElement="End_Bloqueio_Indicacao">
        <dc:Bounds x="2867" y="1012" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Tag_Ativo" bpmnElement="Task_Tag_Ativo">
        <dc:Bounds x="355" y="660" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Tag_Passivo" bpmnElement="Task_Tag_Passivo">
        <dc:Bounds x="355" y="880" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D0_Instagram_Indicacao" bpmnElement="Task_D0_Instagram_Indicacao">
        <dc:Bounds x="1130" y="880" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_AceitouTrial_Indicacao" bpmnElement="Gateway_AceitouTrial_Indicacao" isMarkerVisible="true">
        <dc:Bounds x="1580" y="1005" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1571" y="981" width="67" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Indicacao_Trial" bpmnElement="LinkThrow_Indicacao_Trial">
        <dc:Bounds x="1680" y="1012" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1673" y="1048" width="50" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_GrupoNurturing_Indicacao" bpmnElement="Task_GrupoNurturing_Indicacao">
        <dc:Bounds x="2680" y="990" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D0_WhatsApp1_Indicacao" bpmnElement="Task_D0_WhatsApp1_Indicacao">
        <dc:Bounds x="975" y="880" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D1_WhatsApp2_Indicacao" bpmnElement="Task_D1_WhatsApp2_Indicacao">
        <dc:Bounds x="1750" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D3_WhatsApp3_Indicacao" bpmnElement="Task_D3_WhatsApp3_Indicacao">
        <dc:Bounds x="1905" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D6_WhatsApp4_Indicacao" bpmnElement="Task_D6_WhatsApp4_Indicacao">
        <dc:Bounds x="2060" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D10_WhatsApp5_Indicacao" bpmnElement="Task_D10_WhatsApp5_Indicacao">
        <dc:Bounds x="2215" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_AvisaParceiro" bpmnElement="Task_AvisaParceiro">
        <dc:Bounds x="2680" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_QuebraGelo_Ativo" bpmnElement="Task_QuebraGelo_Ativo">
        <dc:Bounds x="510" y="660" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_QuebraGelo_Passivo" bpmnElement="Task_QuebraGelo_Passivo">
        <dc:Bounds x="510" y="880" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D0_Ligacao_Indicacao" bpmnElement="Task_D0_Ligacao_Indicacao">
        <dc:Bounds x="820" y="770" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D0_Qualifica_Indicacao" bpmnElement="Task_D0_Qualifica_Indicacao">
        <dc:Bounds x="1130" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_SelecaoMotivo_Indicacao" bpmnElement="Task_SelecaoMotivo_Indicacao">
        <dc:Bounds x="2680" y="1100" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_FlashDemo_Indicacao" bpmnElement="Task_FlashDemo_Indicacao">
        <dc:Bounds x="1440" y="990" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Atendeu_D0_Indicacao" bpmnElement="Gateway_Atendeu_D0_Indicacao" isMarkerVisible="true">
        <dc:Bounds x="1000" y="785" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_D0_Indicacao" bpmnElement="Gateway_Converteu_D0_Indicacao" isMarkerVisible="true">
        <dc:Bounds x="1310" y="785" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1293" y="761" width="84" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Merge_D0_Indicacao" bpmnElement="Gateway_Merge_D0_Indicacao" isMarkerVisible="true">
        <dc:Bounds x="1620" y="785" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_Indicacao" bpmnElement="Gateway_Converteu_Indicacao" isMarkerVisible="true">
        <dc:Bounds x="2395" y="785" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2391" y="761" width="57" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Respondeu_Breakup_Indicacao" bpmnElement="Gateway_Respondeu_Breakup_Indicacao" isMarkerVisible="true">
        <dc:Bounds x="2550" y="1115" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_MergeIndicacao" bpmnElement="Gateway_MergeIndicacao" isMarkerVisible="true">
        <dc:Bounds x="690" y="785" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_24h_Breakup_Indicacao" bpmnElement="IntermediateTimer_24h_Breakup_Indicacao">
        <dc:Bounds x="2402" y="1122" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Indicacao" bpmnElement="LinkThrow_Indicacao">
        <dc:Bounds x="2557" y="792" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Ativo_1" bpmnElement="Flow_Ind_Ativo_1">
        <di:waypoint x="268" y="700" />
        <di:waypoint x="355" y="700" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Ativo_2" bpmnElement="Flow_Ind_Ativo_2">
        <di:waypoint x="455" y="700" />
        <di:waypoint x="510" y="700" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Ativo_3" bpmnElement="Flow_Ind_Ativo_3">
        <di:waypoint x="610" y="700" />
        <di:waypoint x="640" y="700" />
        <di:waypoint x="640" y="810" />
        <di:waypoint x="690" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Passivo_1" bpmnElement="Flow_Ind_Passivo_1">
        <di:waypoint x="268" y="920" />
        <di:waypoint x="355" y="920" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Passivo_2" bpmnElement="Flow_Ind_Passivo_2">
        <di:waypoint x="455" y="920" />
        <di:waypoint x="510" y="920" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Passivo_3" bpmnElement="Flow_Ind_Passivo_3">
        <di:waypoint x="610" y="920" />
        <di:waypoint x="640" y="920" />
        <di:waypoint x="640" y="810" />
        <di:waypoint x="690" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Merged" bpmnElement="Flow_Ind_Merged">
        <di:waypoint x="740" y="810" />
        <di:waypoint x="820" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Demo" bpmnElement="Flow_Ind_Demo">
        <di:waypoint x="1540" y="1030" />
        <di:waypoint x="1580" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Trial_Sim" bpmnElement="Flow_Ind_Trial_Sim">
        <di:waypoint x="1630" y="1030" />
        <di:waypoint x="1680" y="1030" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1645" y="1012" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Trial_Nao" bpmnElement="Flow_Ind_Trial_Nao">
        <di:waypoint x="1605" y="1005" />
        <di:waypoint x="1605" y="870" />
        <di:waypoint x="1645" y="870" />
        <di:waypoint x="1645" y="835" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1610" y="935" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
<bpmndi:BPMNEdge id="Edge_Flow_Ind_Aviso" bpmnElement="Flow_Ind_Aviso">
        <di:waypoint x="2730" y="850" />
        <di:waypoint x="2730" y="870" />
        <di:waypoint x="2575" y="870" />
        <di:waypoint x="2575" y="828" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Nurturing" bpmnElement="Flow_Ind_Nurturing">
        <di:waypoint x="2780" y="1030" />
        <di:waypoint x="2867" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Lig" bpmnElement="Flow_Ind_D0_Lig">
        <di:waypoint x="920" y="810" />
        <di:waypoint x="1000" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Atendeu" bpmnElement="Flow_Ind_D0_Atendeu">
        <di:waypoint x="1050" y="810" />
        <di:waypoint x="1130" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_NaoAtendeu" bpmnElement="Flow_Ind_D0_NaoAtendeu">
        <di:waypoint x="1025" y="835" />
        <di:waypoint x="1025" y="880" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1059" y="853" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Check" bpmnElement="Flow_Ind_D0_Check">
        <di:waypoint x="1230" y="810" />
        <di:waypoint x="1310" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Converteu_Nao" bpmnElement="Flow_Ind_D0_Converteu_Nao">
        <di:waypoint x="1335" y="835" />
        <di:waypoint x="1335" y="1030" />
        <di:waypoint x="1440" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Zap1" bpmnElement="Flow_Ind_D0_Zap1">
        <di:waypoint x="1075" y="920" />
        <di:waypoint x="1130" y="920" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Instagram" bpmnElement="Flow_Ind_D0_Instagram">
        <di:waypoint x="1230" y="920" />
        <di:waypoint x="1420" y="920" />
        <di:waypoint x="1420" y="810" />
        <di:waypoint x="1620" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Merge" bpmnElement="Flow_Ind_D0_Merge">
        <di:waypoint x="1670" y="810" />
        <di:waypoint x="1750" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Timer_48h_D1D3_Ind" bpmnElement="Timer_48h_D1D3_Ind">
        <dc:Bounds x="1860" y="792" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="1867" y="828" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_72h_D3D6_Ind" bpmnElement="Timer_72h_D3D6_Ind">
        <dc:Bounds x="2015" y="792" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="2022" y="828" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_96h_D6D10_Ind" bpmnElement="Timer_96h_D6D10_Ind">
        <dc:Bounds x="2170" y="792" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="2177" y="828" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D1_Zap2" bpmnElement="Flow_Ind_D1_Zap2">
        <di:waypoint x="1850" y="810" />
        <di:waypoint x="1860" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Timer_D3" bpmnElement="Flow_Ind_Timer_D3">
        <di:waypoint x="1896" y="810" />
        <di:waypoint x="1905" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D3_Zap3" bpmnElement="Flow_Ind_D3_Zap3">
        <di:waypoint x="2005" y="810" />
        <di:waypoint x="2015" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Timer_D6" bpmnElement="Flow_Ind_Timer_D6">
        <di:waypoint x="2051" y="810" />
        <di:waypoint x="2060" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D6_Zap4" bpmnElement="Flow_Ind_D6_Zap4">
        <di:waypoint x="2160" y="810" />
        <di:waypoint x="2170" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Timer_D10" bpmnElement="Flow_Ind_Timer_D10">
        <di:waypoint x="2206" y="810" />
        <di:waypoint x="2215" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D10_Check" bpmnElement="Flow_Ind_D10_Check">
        <di:waypoint x="2315" y="810" />
        <di:waypoint x="2395" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Converteu_Sim" bpmnElement="Flow_Ind_Converteu_Sim">
        <di:waypoint x="2445" y="810" />
        <di:waypoint x="2680" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Converteu_Nao" bpmnElement="Flow_Ind_Converteu_Nao">
        <di:waypoint x="2420" y="835" />
        <di:waypoint x="2420" y="1122" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Check_Breakup" bpmnElement="Flow_Ind_Check_Breakup">
        <di:waypoint x="2438" y="1140" />
        <di:waypoint x="2550" y="1140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Respondeu_Nao" bpmnElement="Flow_Ind_Respondeu_Nao">
        <di:waypoint x="2600" y="1140" />
        <di:waypoint x="2680" y="1140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Motivo" bpmnElement="Flow_Ind_Motivo">
        <di:waypoint x="2780" y="1140" />
        <di:waypoint x="2867" y="1140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Respondeu_Sim" bpmnElement="Flow_Ind_Respondeu_Sim">
        <di:waypoint x="2600" y="1140" />
        <di:waypoint x="2630" y="1140" />
        <di:waypoint x="2630" y="1030" />
        <di:waypoint x="2680" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1kc5wwv_di" bpmnElement="Flow_1kc5wwv">
        <di:waypoint x="1335" y="785" />
        <di:waypoint x="1335" y="730" />
        <di:waypoint x="2730" y="730" />
        <di:waypoint x="2730" y="770" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2020" y="712" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Participant_Conteudo" bpmnElement="Participant_Conteudo" isHorizontal="true" bioc:stroke="#9775fa" bioc:fill="#f0e0ff">
        <dc:Bounds x="160" y="1330" width="4400" height="620" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Conteudo_Pessoal" bpmnElement="Start_Conteudo_Pessoal">
        <dc:Bounds x="232" y="1582" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="231" y="1618" width="40" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Conteudo_Empresa" bpmnElement="Start_Conteudo_Empresa">
        <dc:Bounds x="232" y="1362" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="233" y="1398" width="36" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_ManyChat_Pessoal" bpmnElement="Task_ManyChat_Pessoal">
        <dc:Bounds x="355" y="1560" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_WhatsApp_Pessoal" bpmnElement="Task_WhatsApp_Pessoal">
        <dc:Bounds x="510" y="1560" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_FlashDemo_Pessoal" bpmnElement="Task_FlashDemo_Pessoal">
        <dc:Bounds x="665" y="1560" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_SDR_Empresa" bpmnElement="Task_SDR_Empresa">
        <dc:Bounds x="355" y="1340" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_WhatsApp_Empresa" bpmnElement="Task_WhatsApp_Empresa">
        <dc:Bounds x="510" y="1340" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_FlashDemo_Empresa" bpmnElement="Task_FlashDemo_Empresa">
        <dc:Bounds x="665" y="1340" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Merge_Conteudo" bpmnElement="Gateway_Merge_Conteudo" isMarkerVisible="true">
        <dc:Bounds x="845" y="1465" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_Imediato_Conteudo" bpmnElement="Gateway_Converteu_Imediato_Conteudo" isMarkerVisible="true">
        <dc:Bounds x="1000" y="1465" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="983" y="1441" width="84" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_1em5f2z" bpmnElement="Event_1iw749o">
        <dc:Bounds x="1007" y="1622" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="995" y="1658" width="61" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Pessoal_1" bpmnElement="Flow_Cont_Pessoal_1">
        <di:waypoint x="268" y="1600" />
        <di:waypoint x="355" y="1600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Pessoal_2" bpmnElement="Flow_Cont_Pessoal_2">
        <di:waypoint x="455" y="1600" />
        <di:waypoint x="510" y="1600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Pessoal_3" bpmnElement="Flow_Cont_Pessoal_3">
        <di:waypoint x="610" y="1600" />
        <di:waypoint x="665" y="1600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Pessoal_Merge" bpmnElement="Flow_Cont_Pessoal_Merge">
        <di:waypoint x="765" y="1600" />
        <di:waypoint x="795" y="1600" />
        <di:waypoint x="795" y="1490" />
        <di:waypoint x="845" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Empresa_1" bpmnElement="Flow_Cont_Empresa_1">
        <di:waypoint x="268" y="1380" />
        <di:waypoint x="355" y="1380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Empresa_2" bpmnElement="Flow_Cont_Empresa_2">
        <di:waypoint x="455" y="1380" />
        <di:waypoint x="510" y="1380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Empresa_3" bpmnElement="Flow_Cont_Empresa_3">
        <di:waypoint x="610" y="1380" />
        <di:waypoint x="665" y="1380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Empresa_Merge" bpmnElement="Flow_Cont_Empresa_Merge">
        <di:waypoint x="765" y="1380" />
        <di:waypoint x="795" y="1380" />
        <di:waypoint x="795" y="1490" />
        <di:waypoint x="845" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Merged" bpmnElement="Flow_Cont_Merged">
        <di:waypoint x="895" y="1490" />
        <di:waypoint x="1000" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Imediato_Nao" bpmnElement="Flow_Cont_Imediato_Nao">
        <di:waypoint x="1050" y="1490" />
        <di:waypoint x="1075" y="1490" />
        <di:waypoint x="1075" y="1770" />
        <di:waypoint x="1100" y="1770" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1055" y="1500" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0c7r836_di" bpmnElement="Flow_0c7r836">
        <di:waypoint x="1025" y="1515" />
        <di:waypoint x="1025" y="1622" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1030" y="1566" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Task_Cont_D1" bpmnElement="Task_Cont_D1">
        <dc:Bounds x="1100" y="1730" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Cont_D3" bpmnElement="Task_Cont_D3">
        <dc:Bounds x="1260" y="1730" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Cont_D7_Breakup" bpmnElement="Task_Cont_D7_Breakup">
        <dc:Bounds x="1420" y="1730" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_24h_Breakup_Cont" bpmnElement="Timer_24h_Breakup_Cont">
        <dc:Bounds x="1570" y="1752" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1575" y="1788" width="25" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Cont_Respondeu" bpmnElement="Gateway_Cont_Respondeu" isMarkerVisible="true">
        <dc:Bounds x="1660" y="1745" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1653" y="1725" width="64" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Cont_Quer_Testar" bpmnElement="Gateway_Cont_Quer_Testar" isMarkerVisible="true">
        <dc:Bounds x="1770" y="1745" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1763" y="1725" width="64" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Conteudo_Trial" bpmnElement="LinkThrow_Conteudo_Trial">
        <dc:Bounds x="1777" y="1680" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1779" y="1660" width="32" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Cont_Nurturing" bpmnElement="Task_Cont_Nurturing">
        <dc:Bounds x="1880" y="1730" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Cont_MotivoPerda" bpmnElement="Task_Cont_MotivoPerda">
        <dc:Bounds x="1760" y="1840" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Cont_Nurturing" bpmnElement="End_Cont_Nurturing">
        <dc:Bounds x="2012" y="1752" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1993" y="1788" width="74" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Cont_Perdido" bpmnElement="End_Cont_Perdido">
        <dc:Bounds x="1892" y="1862" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1870" y="1898" width="80" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_48h_D1D3_Cont" bpmnElement="Timer_48h_D1D3_Cont">
        <dc:Bounds x="1212" y="1752" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="1219" y="1788" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_96h_D3D7_Cont" bpmnElement="Timer_96h_D3D7_Cont">
        <dc:Bounds x="1372" y="1752" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="1379" y="1788" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_D1_D3" bpmnElement="Flow_Cont_D1_D3">
        <di:waypoint x="1200" y="1770" />
        <di:waypoint x="1212" y="1770" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Timer_D3" bpmnElement="Flow_Cont_Timer_D3">
        <di:waypoint x="1248" y="1770" />
        <di:waypoint x="1260" y="1770" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_D3_D7" bpmnElement="Flow_Cont_D3_D7">
        <di:waypoint x="1360" y="1770" />
        <di:waypoint x="1372" y="1770" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Timer_D7" bpmnElement="Flow_Cont_Timer_D7">
        <di:waypoint x="1408" y="1770" />
        <di:waypoint x="1420" y="1770" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_D7_Timer" bpmnElement="Flow_Cont_D7_Timer">
        <di:waypoint x="1520" y="1770" />
        <di:waypoint x="1570" y="1770" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Timer_Check" bpmnElement="Flow_Cont_Timer_Check">
        <di:waypoint x="1606" y="1770" />
        <di:waypoint x="1660" y="1770" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Resp_Sim" bpmnElement="Flow_Cont_Resp_Sim">
        <di:waypoint x="1710" y="1770" />
        <di:waypoint x="1770" y="1770" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1730" y="1752" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Resp_Nao" bpmnElement="Flow_Cont_Resp_Nao">
        <di:waypoint x="1685" y="1795" />
        <di:waypoint x="1685" y="1880" />
        <di:waypoint x="1760" y="1880" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1690" y="1830" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Trial_Sim" bpmnElement="Flow_Cont_Trial_Sim">
        <di:waypoint x="1795" y="1745" />
        <di:waypoint x="1795" y="1716" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1800" y="1725" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Trial_Nao" bpmnElement="Flow_Cont_Trial_Nao">
        <di:waypoint x="1820" y="1770" />
        <di:waypoint x="1880" y="1770" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1840" y="1752" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Nurturing_End" bpmnElement="Flow_Cont_Nurturing_End">
        <di:waypoint x="1980" y="1770" />
        <di:waypoint x="2012" y="1770" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Motivo_End" bpmnElement="Flow_Cont_Motivo_End">
        <di:waypoint x="1860" y="1880" />
        <di:waypoint x="1892" y="1880" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Participant_Prospeccao" bpmnElement="Participant_Prospeccao" isHorizontal="true" bioc:stroke="#fa5252" bioc:fill="#ffe0e0">
        <dc:Bounds x="160" y="2000" width="4400" height="260" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Prospeccao" bpmnElement="Start_Prospeccao">
        <dc:Bounds x="232" y="2032" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Prosp_CriacaoLista" bpmnElement="Task_Prosp_CriacaoLista">
        <dc:Bounds x="320" y="2010" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Prosp_DM_Auto" bpmnElement="Task_Prosp_DM_Auto">
        <dc:Bounds x="475" y="2010" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Prosp_Qualificacao" bpmnElement="Task_Prosp_Qualificacao">
        <dc:Bounds x="630" y="2010" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Prosp_Qualificado" bpmnElement="Gateway_Prosp_Qualificado" isMarkerVisible="true">
        <dc:Bounds x="785" y="2025" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="775" y="2005" width="70" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Prosp_Demo" bpmnElement="Task_Prosp_Demo">
        <dc:Bounds x="890" y="2010" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Prosp_Converteu" bpmnElement="Gateway_Prosp_Converteu" isMarkerVisible="true">
        <dc:Bounds x="1045" y="2025" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1035" y="2005" width="70" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Prospeccao" bpmnElement="LinkThrow_Prospeccao">
        <dc:Bounds x="1157" y="2032" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1150" y="2068" width="50" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Prosp_Desqualificado" bpmnElement="End_Prosp_Desqualificado">
        <dc:Bounds x="792" y="2112" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="770" y="2148" width="80" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Prosp_D1" bpmnElement="Task_Prosp_D1">
        <dc:Bounds x="1215" y="2120" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Prosp_D3" bpmnElement="Task_Prosp_D3">
        <dc:Bounds x="1375" y="2120" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Prosp_D6" bpmnElement="Task_Prosp_D6">
        <dc:Bounds x="1535" y="2120" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Prosp_D10_Breakup" bpmnElement="Task_Prosp_D10_Breakup">
        <dc:Bounds x="1695" y="2120" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_24h_Breakup_Prosp" bpmnElement="Timer_24h_Breakup_Prosp">
        <dc:Bounds x="1845" y="2142" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1850" y="2178" width="25" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Prosp_Respondeu" bpmnElement="Gateway_Prosp_Respondeu" isMarkerVisible="true">
        <dc:Bounds x="1935" y="2135" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1928" y="2115" width="64" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Prosp_Nurturing" bpmnElement="Task_Prosp_Nurturing">
        <dc:Bounds x="2035" y="2120" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Prosp_Nurturing" bpmnElement="End_Prosp_Nurturing">
        <dc:Bounds x="2167" y="2142" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2148" y="2178" width="74" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Prosp_MotivoPerda" bpmnElement="Task_Prosp_MotivoPerda">
        <dc:Bounds x="2035" y="2215" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Prosp_Perdido" bpmnElement="End_Prosp_Perdido">
        <dc:Bounds x="2167" y="2237" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2145" y="2273" width="80" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_Start_Lista" bpmnElement="Flow_Prosp_Start_Lista">
        <di:waypoint x="268" y="2050" />
        <di:waypoint x="320" y="2050" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_1" bpmnElement="Flow_Prosp_1">
        <di:waypoint x="420" y="2050" />
        <di:waypoint x="475" y="2050" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_DM_Qualif" bpmnElement="Flow_Prosp_DM_Qualif">
        <di:waypoint x="575" y="2050" />
        <di:waypoint x="630" y="2050" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_Qualif_Check" bpmnElement="Flow_Prosp_Qualif_Check">
        <di:waypoint x="730" y="2050" />
        <di:waypoint x="785" y="2050" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_Qualif_Sim" bpmnElement="Flow_Prosp_Qualif_Sim">
        <di:waypoint x="835" y="2050" />
        <di:waypoint x="890" y="2050" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="853" y="2032" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_Qualif_Nao" bpmnElement="Flow_Prosp_Qualif_Nao">
        <di:waypoint x="810" y="2075" />
        <di:waypoint x="810" y="2112" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="815" y="2085" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_Demo_Check" bpmnElement="Flow_Prosp_Demo_Check">
        <di:waypoint x="990" y="2050" />
        <di:waypoint x="1045" y="2050" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_Conv_Sim" bpmnElement="Flow_Prosp_Conv_Sim">
        <di:waypoint x="1095" y="2050" />
        <di:waypoint x="1157" y="2050" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1116" y="2032" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_Conv_Nao" bpmnElement="Flow_Prosp_Conv_Nao">
        <di:waypoint x="1070" y="2075" />
        <di:waypoint x="1070" y="2160" />
        <di:waypoint x="1215" y="2160" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1075" y="2105" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Timer_48h_D1D3_Prosp" bpmnElement="Timer_48h_D1D3_Prosp">
        <dc:Bounds x="1327" y="2142" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="1334" y="2178" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_72h_D3D6_Prosp" bpmnElement="Timer_72h_D3D6_Prosp">
        <dc:Bounds x="1487" y="2142" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="1494" y="2178" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_96h_D6D10_Prosp" bpmnElement="Timer_96h_D6D10_Prosp">
        <dc:Bounds x="1647" y="2142" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="1654" y="2178" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_D1_D3" bpmnElement="Flow_Prosp_D1_D3">
        <di:waypoint x="1315" y="2160" />
        <di:waypoint x="1327" y="2160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_Timer_D3" bpmnElement="Flow_Prosp_Timer_D3">
        <di:waypoint x="1363" y="2160" />
        <di:waypoint x="1375" y="2160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_D3_D6" bpmnElement="Flow_Prosp_D3_D6">
        <di:waypoint x="1475" y="2160" />
        <di:waypoint x="1487" y="2160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_Timer_D6" bpmnElement="Flow_Prosp_Timer_D6">
        <di:waypoint x="1523" y="2160" />
        <di:waypoint x="1535" y="2160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_D6_D10" bpmnElement="Flow_Prosp_D6_D10">
        <di:waypoint x="1635" y="2160" />
        <di:waypoint x="1647" y="2160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_Timer_D10" bpmnElement="Flow_Prosp_Timer_D10">
        <di:waypoint x="1683" y="2160" />
        <di:waypoint x="1695" y="2160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_D10_Timer" bpmnElement="Flow_Prosp_D10_Timer">
        <di:waypoint x="1795" y="2160" />
        <di:waypoint x="1845" y="2160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_Timer_Check" bpmnElement="Flow_Prosp_Timer_Check">
        <di:waypoint x="1881" y="2160" />
        <di:waypoint x="1935" y="2160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_Resp_Sim" bpmnElement="Flow_Prosp_Resp_Sim">
        <di:waypoint x="1985" y="2160" />
        <di:waypoint x="2035" y="2160" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2000" y="2142" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_Resp_Nao" bpmnElement="Flow_Prosp_Resp_Nao">
        <di:waypoint x="1960" y="2185" />
        <di:waypoint x="1960" y="2255" />
        <di:waypoint x="2035" y="2255" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1965" y="2210" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_Nurturing_End" bpmnElement="Flow_Prosp_Nurturing_End">
        <di:waypoint x="2135" y="2160" />
        <di:waypoint x="2167" y="2160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_Motivo_End" bpmnElement="Flow_Prosp_Motivo_End">
        <di:waypoint x="2135" y="2255" />
        <di:waypoint x="2167" y="2255" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Participant_Google" bpmnElement="Participant_Google" isHorizontal="true" bioc:stroke="#4dabf7" bioc:fill="#e0f0ff">
        <dc:Bounds x="160" y="2310" width="4400" height="660" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Start_Google_di" bpmnElement="Start_Google">
        <dc:Bounds x="250" y="2502" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Perdido_Motivo_Google_di" bpmnElement="End_Perdido_Motivo_Google">
        <dc:Bounds x="3282" y="2722" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Google_Ativado_di" bpmnElement="End_Google_Ativado">
        <dc:Bounds x="1332" y="2392" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1316" y="2428" width="68" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_AutomacaoBoasVindas_di" bpmnElement="Task_AutomacaoBoasVindas">
        <dc:Bounds x="870" y="2370" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_RecuperacaoCarrinho_di" bpmnElement="Task_RecuperacaoCarrinho">
        <dc:Bounds x="870" y="2700" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_AceitouTrial_Google_di" bpmnElement="Gateway_AceitouTrial_Google" isMarkerVisible="true">
        <dc:Bounds x="1105" y="2605" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1096" y="2581" width="67" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_FlashDemo_Google_di" bpmnElement="Task_FlashDemo_Google">
        <dc:Bounds x="820" y="2590" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_OfertaTrial_Google_di" bpmnElement="Task_OfertaTrial_Google">
        <dc:Bounds x="960" y="2590" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="LinkThrow_Google_Trial_di" bpmnElement="LinkThrow_Google_Trial">
        <dc:Bounds x="1112" y="2692" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1105" y="2728" width="50" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ClickCheckout_Self_di" bpmnElement="Task_ClickCheckout_Self">
        <dc:Bounds x="500" y="2370" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_PreencheDados_Self_di" bpmnElement="Task_PreencheDados_Self">
        <dc:Bounds x="640" y="2370" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_AlertaHumano_Google_di" bpmnElement="Task_AlertaHumano_Google">
        <dc:Bounds x="1180" y="2370" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ClickWhatsApp_di" bpmnElement="Task_ClickWhatsApp">
        <dc:Bounds x="500" y="2590" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_SpeedToLead_Google_di" bpmnElement="Task_SpeedToLead_Google">
        <dc:Bounds x="640" y="2590" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_SelecaoMotivo_Google_di" bpmnElement="Task_SelecaoMotivo_Google">
        <dc:Bounds x="3140" y="2700" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_CaminhoGoogle_di" bpmnElement="Gateway_CaminhoGoogle" isMarkerVisible="true">
        <dc:Bounds x="370" y="2495" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Pagamento_Self_di" bpmnElement="Gateway_Pagamento_Self" isMarkerVisible="true">
        <dc:Bounds x="780" y="2385" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_PrimeiroAudio_di" bpmnElement="Gateway_PrimeiroAudio" isMarkerVisible="true">
        <dc:Bounds x="1090" y="2385" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="IntermediateTimer_24h_Google_di" bpmnElement="IntermediateTimer_24h_Google">
        <dc:Bounds x="1010" y="2392" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Merge_D0_Google_di" bpmnElement="Gateway_Merge_D0_Google" isMarkerVisible="true">
        <dc:Bounds x="1750" y="2495" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1740" y="2552" width="71" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="LinkThrow_Google_di" bpmnElement="LinkThrow_Google">
        <dc:Bounds x="2830" y="2502" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2818" y="2538" width="61" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="IntermediateTimer_24h_Breakup_Google_di" bpmnElement="IntermediateTimer_24h_Breakup_Google">
        <dc:Bounds x="2972" y="2612" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2981" y="2648" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Respondeu_Breakup_Google_di" bpmnElement="Gateway_Respondeu_Breakup_Google" isMarkerVisible="true">
        <dc:Bounds x="3050" y="2605" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3044" y="2655" width="63" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Converteu_Google_di" bpmnElement="Gateway_Converteu_Google" isMarkerVisible="true">
        <dc:Bounds x="2720" y="2495" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2717" y="2545" width="57" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D5_Ligacao3_Google_di" bpmnElement="Task_D5_Ligacao3_Google">
        <dc:Bounds x="2440" y="2480" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D1_Ligacao2_Google_di" bpmnElement="Task_D1_Ligacao2_Google">
        <dc:Bounds x="2020" y="2480" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D7_Fechamento_Google_di" bpmnElement="Task_D7_Fechamento_Google">
        <dc:Bounds x="2580" y="2480" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D7_WhatsApp6_Breakup_Google_di" bpmnElement="Task_D7_WhatsApp6_Breakup_Google">
        <dc:Bounds x="2830" y="2590" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D5_WhatsApp5_Pressao_Google_di" bpmnElement="Task_D5_WhatsApp5_Pressao_Google">
        <dc:Bounds x="2300" y="2480" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D3_WhatsApp4_Case_Google_di" bpmnElement="Task_D3_WhatsApp4_Case_Google">
        <dc:Bounds x="2160" y="2480" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D1_WhatsApp3_Diferenca_Google_di" bpmnElement="Task_D1_WhatsApp3_Diferenca_Google">
        <dc:Bounds x="1880" y="2480" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_GrupoNurturing_Google_di" bpmnElement="Task_GrupoNurturing_Google">
        <dc:Bounds x="3140" y="2590" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Bloqueio_Google_di" bpmnElement="End_Bloqueio_Google">
        <dc:Bounds x="3282" y="2612" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3260" y="2648" width="81" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_Goo_Start_di" bpmnElement="Flow_Goo_Start">
        <di:waypoint x="286" y="2520" />
        <di:waypoint x="370" y="2520" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Self_di" bpmnElement="Flow_Goo_Self">
        <di:waypoint x="395" y="2495" />
        <di:waypoint x="395" y="2410" />
        <di:waypoint x="500" y="2410" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="400" y="2373" width="79" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Self_1_di" bpmnElement="Flow_Goo_Self_1">
        <di:waypoint x="600" y="2410" />
        <di:waypoint x="640" y="2410" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Self_2_di" bpmnElement="Flow_Goo_Self_2">
        <di:waypoint x="740" y="2410" />
        <di:waypoint x="780" y="2410" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Sucesso_di" bpmnElement="Flow_Goo_Sucesso">
        <di:waypoint x="830" y="2410" />
        <di:waypoint x="870" y="2410" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Falha_di" bpmnElement="Flow_Goo_Falha">
        <di:waypoint x="805" y="2435" />
        <di:waypoint x="805" y="2740" />
        <di:waypoint x="870" y="2740" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="699" y="2733" width="81" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_BoasVindas_di" bpmnElement="Flow_Goo_BoasVindas">
        <di:waypoint x="970" y="2410" />
        <di:waypoint x="1010" y="2410" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Recuperacao_di" bpmnElement="Flow_Goo_Recuperacao">
        <di:waypoint x="970" y="2740" />
        <di:waypoint x="1130" y="2740" />
        <di:waypoint x="1130" y="2655" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Check24h_di" bpmnElement="Flow_Goo_Check24h">
        <di:waypoint x="1046" y="2410" />
        <di:waypoint x="1090" y="2410" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_NaoMandou_di" bpmnElement="Flow_Goo_NaoMandou">
        <di:waypoint x="1140" y="2410" />
        <di:waypoint x="1180" y="2410" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Mandou_di" bpmnElement="Flow_Goo_Mandou">
        <di:waypoint x="1115" y="2385" />
        <di:waypoint x="1115" y="2355" />
        <di:waypoint x="1350" y="2355" />
        <di:waypoint x="1350" y="2392" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Alerta_di" bpmnElement="Flow_Goo_Alerta">
        <di:waypoint x="1280" y="2410" />
        <di:waypoint x="1332" y="2410" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Zap_di" bpmnElement="Flow_Goo_Zap">
        <di:waypoint x="395" y="2545" />
        <di:waypoint x="395" y="2630" />
        <di:waypoint x="500" y="2630" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="404" y="2633" width="51" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Zap_1_di" bpmnElement="Flow_Goo_Zap_1">
        <di:waypoint x="600" y="2630" />
        <di:waypoint x="640" y="2630" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Zap_2_di" bpmnElement="Flow_Goo_Zap_2">
        <di:waypoint x="740" y="2630" />
        <di:waypoint x="820" y="2630" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Zap_3_di" bpmnElement="Flow_Goo_Zap_3">
        <di:waypoint x="920" y="2630" />
        <di:waypoint x="960" y="2630" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_ToGatewayTrial_di" bpmnElement="Flow_Goo_ToGatewayTrial">
        <di:waypoint x="1060" y="2630" />
        <di:waypoint x="1105" y="2630" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Trial_Sim_di" bpmnElement="Flow_Goo_Trial_Sim">
        <di:waypoint x="1130" y="2655" />
        <di:waypoint x="1130" y="2692" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1136" y="2662" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Respondeu_Nao_di" bpmnElement="Flow_Goo_Respondeu_Nao">
        <di:waypoint x="3075" y="2655" />
        <di:waypoint x="3075" y="2740" />
        <di:waypoint x="3140" y="2740" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3080" y="2688" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Motivo_di" bpmnElement="Flow_Goo_Motivo">
        <di:waypoint x="3240" y="2740" />
        <di:waypoint x="3282" y="2740" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Trial_Nao_di" bpmnElement="Flow_Goo_Trial_Nao">
        <di:waypoint x="1155" y="2630" />
        <di:waypoint x="1200" y="2630" />
        <di:waypoint x="1200" y="2520" />
        <di:waypoint x="1750" y="2520" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1178" y="2565" width="74" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Check_Breakup_di" bpmnElement="Flow_Goo_Check_Breakup">
        <di:waypoint x="3008" y="2630" />
        <di:waypoint x="3050" y="2630" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Converteu_Sim_di" bpmnElement="Flow_Goo_Converteu_Sim">
        <di:waypoint x="2770" y="2520" />
        <di:waypoint x="2830" y="2520" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2791" y="2495" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D7_di" bpmnElement="Flow_Goo_D7">
        <di:waypoint x="2680" y="2520" />
        <di:waypoint x="2720" y="2520" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Timer_48h_D5D7_Goo" bpmnElement="Timer_48h_D5D7_Goo">
        <dc:Bounds x="2542" y="2502" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="2549" y="2538" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_Goo_D5_Lig3_di" bpmnElement="Flow_Goo_D5_Lig3">
        <di:waypoint x="2540" y="2520" />
        <di:waypoint x="2542" y="2520" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_Timer_D7" bpmnElement="Flow_Goo_Timer_D7">
        <di:waypoint x="2578" y="2520" />
        <di:waypoint x="2580" y="2520" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Breakup_di" bpmnElement="Flow_Goo_Breakup">
        <di:waypoint x="2930" y="2630" />
        <di:waypoint x="2972" y="2630" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Converteu_Nao_di" bpmnElement="Flow_Goo_Converteu_Nao">
        <di:waypoint x="2745" y="2545" />
        <di:waypoint x="2745" y="2630" />
        <di:waypoint x="2830" y="2630" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2750" y="2578" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D5_Zap5_di" bpmnElement="Flow_Goo_D5_Zap5">
        <di:waypoint x="2400" y="2520" />
        <di:waypoint x="2440" y="2520" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Timer_48h_D3D5_Goo" bpmnElement="Timer_48h_D3D5_Goo">
        <dc:Bounds x="2262" y="2502" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="2269" y="2538" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_48h_D1D3_Goo" bpmnElement="Timer_48h_D1D3_Goo">
        <dc:Bounds x="2122" y="2502" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="2129" y="2538" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_Goo_D3_Zap4_di" bpmnElement="Flow_Goo_D3_Zap4">
        <di:waypoint x="2260" y="2520" />
        <di:waypoint x="2262" y="2520" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_Timer_D5" bpmnElement="Flow_Goo_Timer_D5">
        <di:waypoint x="2298" y="2520" />
        <di:waypoint x="2300" y="2520" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D1_Lig2_di" bpmnElement="Flow_Goo_D1_Lig2">
        <di:waypoint x="2120" y="2520" />
        <di:waypoint x="2122" y="2520" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_Timer_D3" bpmnElement="Flow_Goo_Timer_D3">
        <di:waypoint x="2158" y="2520" />
        <di:waypoint x="2160" y="2520" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D1_Zap3_di" bpmnElement="Flow_Goo_D1_Zap3">
        <di:waypoint x="1980" y="2520" />
        <di:waypoint x="2020" y="2520" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D0_Merge_di" bpmnElement="Flow_Goo_D0_Merge">
        <di:waypoint x="1800" y="2520" />
        <di:waypoint x="1880" y="2520" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Respondeu_Sim_di" bpmnElement="Flow_Goo_Respondeu_Sim">
        <di:waypoint x="3100" y="2630" />
        <di:waypoint x="3140" y="2630" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3111" y="2605" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Nurturing_di" bpmnElement="Flow_Goo_Nurturing">
        <di:waypoint x="3240" y="2630" />
        <di:waypoint x="3282" y="2630" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Participant_Meta" bpmnElement="Participant_Meta" isHorizontal="true" bioc:stroke="#cc5de8" bioc:fill="#f3e0ff">
        <dc:Bounds x="160" y="3020" width="4400" height="530" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Meta" bpmnElement="Start_Meta">
        <dc:Bounds x="232" y="3052" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="227" y="3088" width="46" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_WhatsApp_D0_Meta" bpmnElement="Task_WhatsApp_D0_Meta">
        <dc:Bounds x="510" y="3030" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_FlashDemo_D0_Meta" bpmnElement="Task_FlashDemo_D0_Meta">
        <dc:Bounds x="665" y="3030" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Meta_Trial" bpmnElement="LinkThrow_Meta_Trial">
        <dc:Bounds x="1162" y="3052" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1155" y="3088" width="50" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_PaginaFiltro_Meta" bpmnElement="Task_PaginaFiltro_Meta">
        <dc:Bounds x="355" y="3030" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Interessado_D0_Meta" bpmnElement="Gateway_Interessado_D0_Meta" isMarkerVisible="true">
        <dc:Bounds x="845" y="3045" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="838" y="3021" width="64" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_Imediato_Meta" bpmnElement="Gateway_Converteu_Imediato_Meta" isMarkerVisible="true">
        <dc:Bounds x="1000" y="3045" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="983" y="3021" width="84" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_24h_Meta_D1" bpmnElement="Timer_24h_Meta_D1">
        <dc:Bounds x="920" y="3182" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="928" y="3218" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Meta_D1_Reapproach" bpmnElement="Task_Meta_D1_Reapproach">
        <dc:Bounds x="1010" y="3160" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Meta_Respondeu_D1" bpmnElement="Gateway_Meta_Respondeu_D1" isMarkerVisible="true">
        <dc:Bounds x="1160" y="3175" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1152" y="3225" width="66" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Meta_Perdido" bpmnElement="End_Meta_Perdido">
        <dc:Bounds x="2112" y="3392" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2085" y="3428" width="80" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_0vgh499" bpmnElement="Event_1q9m63q">
        <dc:Bounds x="1007" y="3182" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="995" y="3218" width="61" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Start" bpmnElement="Flow_Meta_Start">
        <di:waypoint x="268" y="3070" />
        <di:waypoint x="355" y="3070" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Filtro" bpmnElement="Flow_Meta_Filtro">
        <di:waypoint x="455" y="3070" />
        <di:waypoint x="510" y="3070" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D0_Zap" bpmnElement="Flow_Meta_D0_Zap">
        <di:waypoint x="610" y="3070" />
        <di:waypoint x="665" y="3070" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_FlashDemo" bpmnElement="Flow_Meta_FlashDemo">
        <di:waypoint x="765" y="3070" />
        <di:waypoint x="845" y="3070" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Interessado_Sim" bpmnElement="Flow_Meta_Interessado_Sim">
        <di:waypoint x="895" y="3070" />
        <di:waypoint x="1000" y="3070" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="938" y="3045" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0fm6hqw_di" bpmnElement="Flow_0fm6hqw">
        <di:waypoint x="870" y="3095" />
        <di:waypoint x="870" y="3200" />
        <di:waypoint x="920" y="3200" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="875" y="3136" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1qdoel0_di" bpmnElement="Flow_1qdoel0">
        <di:waypoint x="1050" y="3070" />
        <di:waypoint x="1162" y="3070" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1097" y="3052" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0lfarjy_di" bpmnElement="Flow_0lfarjy">
        <di:waypoint x="1025" y="3095" />
        <di:waypoint x="1025" y="3182" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1031" y="3130" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D1_Start" bpmnElement="Flow_Meta_D1_Start">
        <di:waypoint x="956" y="3200" />
        <di:waypoint x="1010" y="3200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D1_Check" bpmnElement="Flow_Meta_D1_Check">
        <di:waypoint x="1110" y="3200" />
        <di:waypoint x="1160" y="3200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D1_Sim" bpmnElement="Flow_Meta_D1_Sim">
        <di:waypoint x="1185" y="3175" />
        <di:waypoint x="1180" y="3088" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1188" y="3126" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Timer_48h_D1D3_Meta" bpmnElement="Timer_48h_D1D3_Meta">
        <dc:Bounds x="1247" y="3282" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="1254" y="3318" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D1_Nao" bpmnElement="Flow_Meta_D1_Nao">
        <di:waypoint x="1210" y="3200" />
        <di:waypoint x="1265" y="3200" />
        <di:waypoint x="1265" y="3282" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1215" y="3178" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Timer_D3" bpmnElement="Flow_Meta_Timer_D3">
        <di:waypoint x="1283" y="3300" />
        <di:waypoint x="1320" y="3300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Shape_Task_Meta_D3" bpmnElement="Task_Meta_D3">
        <dc:Bounds x="1320" y="3260" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Meta_D7" bpmnElement="Task_Meta_D7">
        <dc:Bounds x="1480" y="3260" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Meta_D10_Breakup" bpmnElement="Task_Meta_D10_Breakup">
        <dc:Bounds x="1640" y="3260" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_24h_Breakup_Meta" bpmnElement="Timer_24h_Breakup_Meta">
        <dc:Bounds x="1790" y="3282" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1795" y="3318" width="25" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Meta_Respondeu_Final" bpmnElement="Gateway_Meta_Respondeu_Final" isMarkerVisible="true">
        <dc:Bounds x="1880" y="3275" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1873" y="3255" width="64" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Meta_Nurturing" bpmnElement="Task_Meta_Nurturing">
        <dc:Bounds x="1980" y="3260" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Meta_MotivoPerda" bpmnElement="Task_Meta_MotivoPerda">
        <dc:Bounds x="1980" y="3370" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Meta_Nurturing" bpmnElement="End_Meta_Nurturing">
        <dc:Bounds x="2112" y="3282" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2093" y="3318" width="74" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_96h_D3D7_Meta" bpmnElement="Timer_96h_D3D7_Meta">
        <dc:Bounds x="1432" y="3282" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="1439" y="3318" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Timer_72h_D7D10_Meta" bpmnElement="Timer_72h_D7D10_Meta">
        <dc:Bounds x="1592" y="3282" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="1599" y="3318" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D3_D7" bpmnElement="Flow_Meta_D3_D7">
        <di:waypoint x="1420" y="3300" />
        <di:waypoint x="1432" y="3300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Timer_D7" bpmnElement="Flow_Meta_Timer_D7">
        <di:waypoint x="1468" y="3300" />
        <di:waypoint x="1480" y="3300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D7_D10" bpmnElement="Flow_Meta_D7_D10">
        <di:waypoint x="1580" y="3300" />
        <di:waypoint x="1592" y="3300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Timer_D10" bpmnElement="Flow_Meta_Timer_D10">
        <di:waypoint x="1628" y="3300" />
        <di:waypoint x="1640" y="3300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D10_Timer" bpmnElement="Flow_Meta_D10_Timer">
        <di:waypoint x="1740" y="3300" />
        <di:waypoint x="1790" y="3300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Timer_Check_Final" bpmnElement="Flow_Meta_Timer_Check_Final">
        <di:waypoint x="1826" y="3300" />
        <di:waypoint x="1880" y="3300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Resp_Final_Sim" bpmnElement="Flow_Meta_Resp_Final_Sim">
        <di:waypoint x="1930" y="3300" />
        <di:waypoint x="1980" y="3300" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1945" y="3282" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Resp_Final_Nao" bpmnElement="Flow_Meta_Resp_Final_Nao">
        <di:waypoint x="1905" y="3325" />
        <di:waypoint x="1905" y="3410" />
        <di:waypoint x="1980" y="3410" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1910" y="3360" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Nurturing_End" bpmnElement="Flow_Meta_Nurturing_End">
        <di:waypoint x="2080" y="3300" />
        <di:waypoint x="2112" y="3300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Motivo_End" bpmnElement="Flow_Meta_Motivo_End">
        <di:waypoint x="2080" y="3410" />
        <di:waypoint x="2112" y="3410" />
      </bpmndi:BPMNEdge>
      <!-- ====== TRIAL 7 DIAS Pool ====== -->
      <bpmndi:BPMNShape id="Shape_Participant_Trial" bpmnElement="Participant_Trial" isHorizontal="true" bioc:stroke="#ff922b" bioc:fill="#fff4e0">
        <dc:Bounds x="160" y="3600" width="4400" height="580" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="LinkCatch_Trial_di" bpmnElement="LinkCatch_Trial">
        <dc:Bounds x="232" y="3800" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="225" y="3836" width="50" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D0_BoasVindas_di" bpmnElement="Task_Trial_D0_BoasVindas">
        <dc:Bounds x="300" y="3778" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_24h_di" bpmnElement="Timer_Trial_24h">
        <dc:Bounds x="422" y="3800" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_D1_Uso_di" bpmnElement="Gateway_Trial_D1_Uso" isMarkerVisible="true">
        <dc:Bounds x="480" y="3793" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D1_Dica_di" bpmnElement="Task_Trial_D1_Dica">
        <dc:Bounds x="555" y="3708" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D1_Reengajamento_di" bpmnElement="Task_Trial_D1_Reengajamento">
        <dc:Bounds x="555" y="3868" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_D1_Merge_di" bpmnElement="Gateway_Trial_D1_Merge" isMarkerVisible="true">
        <dc:Bounds x="680" y="3793" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D2_di" bpmnElement="Timer_Trial_D2">
        <dc:Bounds x="752" y="3800" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D2_Case_di" bpmnElement="Task_Trial_D2_Case">
        <dc:Bounds x="810" y="3778" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D3_di" bpmnElement="Timer_Trial_D3">
        <dc:Bounds x="932" y="3800" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_D3_Uso_di" bpmnElement="Gateway_Trial_D3_Uso" isMarkerVisible="true">
        <dc:Bounds x="990" y="3793" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D3_Parabens_di" bpmnElement="Task_Trial_D3_Parabens">
        <dc:Bounds x="1065" y="3708" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D3_Resgate_di" bpmnElement="Task_Trial_D3_Resgate">
        <dc:Bounds x="1065" y="3868" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_D3_Merge_di" bpmnElement="Gateway_Trial_D3_Merge" isMarkerVisible="true">
        <dc:Bounds x="1190" y="3793" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D5_di" bpmnElement="Timer_Trial_D5">
        <dc:Bounds x="1262" y="3800" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D5_Urgencia_di" bpmnElement="Task_Trial_D5_Urgencia">
        <dc:Bounds x="1320" y="3778" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D6_di" bpmnElement="Timer_Trial_D6">
        <dc:Bounds x="1442" y="3800" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D6_Oferta_di" bpmnElement="Task_Trial_D6_Oferta">
        <dc:Bounds x="1500" y="3778" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_Extensao_di" bpmnElement="Gateway_Trial_Extensao" isMarkerVisible="true">
        <dc:Bounds x="1620" y="3793" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1605" y="3769" width="80" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_Extension_di" bpmnElement="Task_Trial_Extension">
        <dc:Bounds x="1610" y="3908" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D10_di" bpmnElement="Timer_Trial_D10">
        <dc:Bounds x="1732" y="3930" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1740" y="3966" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D7_di" bpmnElement="Timer_Trial_D7">
        <dc:Bounds x="1722" y="3800" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_Converteu_di" bpmnElement="Gateway_Trial_Converteu" isMarkerVisible="true">
        <dc:Bounds x="1780" y="3793" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1777" y="3769" width="57" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="LinkThrow_Trial_Checkout_di" bpmnElement="LinkThrow_Trial_Checkout">
        <dc:Bounds x="1922" y="3800" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1910" y="3836" width="61" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_Breakup_di" bpmnElement="Task_Trial_Breakup">
        <dc:Bounds x="1870" y="3908" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_Breakup_di" bpmnElement="Timer_Trial_Breakup">
        <dc:Bounds x="1992" y="3930" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_Respondeu_di" bpmnElement="Gateway_Trial_Respondeu" isMarkerVisible="true">
        <dc:Bounds x="2050" y="3923" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2044" y="3973" width="63" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_Nurturing_di" bpmnElement="Task_Trial_Nurturing">
        <dc:Bounds x="2125" y="3908" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Trial_Nurturing_di" bpmnElement="End_Trial_Nurturing">
        <dc:Bounds x="2250" y="3930" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2238" y="3966" width="61" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_MotivoPerda_di" bpmnElement="Task_Trial_MotivoPerda">
        <dc:Bounds x="2125" y="4018" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_Motivo_di" bpmnElement="Gateway_Trial_Motivo" isMarkerVisible="true">
        <dc:Bounds x="2275" y="4033" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2285" y="4013" width="42" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_OfertaDesconto_di" bpmnElement="Task_Trial_OfertaDesconto">
        <dc:Bounds x="2375" y="3948" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="LinkThrow_Trial_Desconto_di" bpmnElement="LinkThrow_Trial_Desconto">
        <dc:Bounds x="2520" y="3970" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2495" y="4006" width="86" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_Lembrete30d_di" bpmnElement="Task_Trial_Lembrete30d">
        <dc:Bounds x="2375" y="4058" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_30d_Trial_di" bpmnElement="Timer_30d_Trial">
        <dc:Bounds x="2520" y="4080" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2515" y="4116" width="46" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="LinkThrow_Trial_Retry_di" bpmnElement="LinkThrow_Trial_Retry">
        <dc:Bounds x="2600" y="4080" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2580" y="4116" width="77" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Trial_Lost_di" bpmnElement="End_Trial_Lost">
        <dc:Bounds x="2282" y="4120" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2260" y="4156" width="80" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_Trial_D0_di" bpmnElement="Flow_Trial_D0">
        <di:waypoint x="268" y="3818" />
        <di:waypoint x="300" y="3818" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D0_D1_di" bpmnElement="Flow_Trial_D0_D1">
        <di:waypoint x="400" y="3818" />
        <di:waypoint x="422" y="3818" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_Check_di" bpmnElement="Flow_Trial_D1_Check">
        <di:waypoint x="458" y="3818" />
        <di:waypoint x="480" y="3818" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_Sim_di" bpmnElement="Flow_Trial_D1_Sim">
        <di:waypoint x="505" y="3793" />
        <di:waypoint x="505" y="3748" />
        <di:waypoint x="555" y="3748" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="511" y="3721" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_Nao_di" bpmnElement="Flow_Trial_D1_Nao">
        <di:waypoint x="505" y="3843" />
        <di:waypoint x="505" y="3908" />
        <di:waypoint x="555" y="3908" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="510" y="3911" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_Merge_di" bpmnElement="Flow_Trial_D1_Merge">
        <di:waypoint x="655" y="3748" />
        <di:waypoint x="705" y="3748" />
        <di:waypoint x="705" y="3793" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_Merge2_di" bpmnElement="Flow_Trial_D1_Merge2">
        <di:waypoint x="655" y="3908" />
        <di:waypoint x="705" y="3908" />
        <di:waypoint x="705" y="3843" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_D2_di" bpmnElement="Flow_Trial_D1_D2">
        <di:waypoint x="730" y="3818" />
        <di:waypoint x="752" y="3818" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D2_Start_di" bpmnElement="Flow_Trial_D2_Start">
        <di:waypoint x="788" y="3818" />
        <di:waypoint x="810" y="3818" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D2_D3_di" bpmnElement="Flow_Trial_D2_D3">
        <di:waypoint x="910" y="3818" />
        <di:waypoint x="932" y="3818" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_Check_di" bpmnElement="Flow_Trial_D3_Check">
        <di:waypoint x="968" y="3818" />
        <di:waypoint x="990" y="3818" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_Sim_di" bpmnElement="Flow_Trial_D3_Sim">
        <di:waypoint x="1015" y="3793" />
        <di:waypoint x="1015" y="3748" />
        <di:waypoint x="1065" y="3748" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1021" y="3721" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_Nao_di" bpmnElement="Flow_Trial_D3_Nao">
        <di:waypoint x="1015" y="3843" />
        <di:waypoint x="1015" y="3908" />
        <di:waypoint x="1065" y="3908" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1020" y="3911" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_Merge1_di" bpmnElement="Flow_Trial_D3_Merge1">
        <di:waypoint x="1165" y="3748" />
        <di:waypoint x="1215" y="3748" />
        <di:waypoint x="1215" y="3793" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_Merge2_di" bpmnElement="Flow_Trial_D3_Merge2">
        <di:waypoint x="1165" y="3908" />
        <di:waypoint x="1215" y="3908" />
        <di:waypoint x="1215" y="3843" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_D5_di" bpmnElement="Flow_Trial_D3_D5">
        <di:waypoint x="1240" y="3818" />
        <di:waypoint x="1262" y="3818" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D5_Start_di" bpmnElement="Flow_Trial_D5_Start">
        <di:waypoint x="1298" y="3818" />
        <di:waypoint x="1320" y="3818" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D5_D6_di" bpmnElement="Flow_Trial_D5_D6">
        <di:waypoint x="1420" y="3818" />
        <di:waypoint x="1442" y="3818" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D6_Start_di" bpmnElement="Flow_Trial_D6_Start">
        <di:waypoint x="1478" y="3818" />
        <di:waypoint x="1500" y="3818" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D6_Ext_di" bpmnElement="Flow_Trial_D6_Ext">
        <di:waypoint x="1600" y="3818" />
        <di:waypoint x="1620" y="3818" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Ext_Sim_di" bpmnElement="Flow_Trial_Ext_Sim">
        <di:waypoint x="1645" y="3843" />
        <di:waypoint x="1645" y="3908" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1651" y="3868" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Ext_Nao_di" bpmnElement="Flow_Trial_Ext_Nao">
        <di:waypoint x="1670" y="3818" />
        <di:waypoint x="1722" y="3818" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1686" y="3793" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Ext_Timer_di" bpmnElement="Flow_Trial_Ext_Timer">
        <di:waypoint x="1710" y="3948" />
        <di:waypoint x="1732" y="3948" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D10_Conv_di" bpmnElement="Flow_Trial_D10_Conv">
        <di:waypoint x="1768" y="3948" />
        <di:waypoint x="1805" y="3948" />
        <di:waypoint x="1805" y="3843" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D7_End_di" bpmnElement="Flow_Trial_D7_End">
        <di:waypoint x="1758" y="3818" />
        <di:waypoint x="1780" y="3818" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Conv_Sim_di" bpmnElement="Flow_Trial_Conv_Sim">
        <di:waypoint x="1830" y="3818" />
        <di:waypoint x="1922" y="3818" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1867" y="3793" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Conv_Nao_di" bpmnElement="Flow_Trial_Conv_Nao">
        <di:waypoint x="1830" y="3830" />
        <di:waypoint x="1845" y="3830" />
        <di:waypoint x="1845" y="3948" />
        <di:waypoint x="1870" y="3948" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1850" y="3885" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Breakup_Timer_di" bpmnElement="Flow_Trial_Breakup_Timer">
        <di:waypoint x="1970" y="3948" />
        <di:waypoint x="1992" y="3948" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Breakup_Check_di" bpmnElement="Flow_Trial_Breakup_Check">
        <di:waypoint x="2028" y="3948" />
        <di:waypoint x="2050" y="3948" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Resp_Sim_di" bpmnElement="Flow_Trial_Resp_Sim">
        <di:waypoint x="2100" y="3948" />
        <di:waypoint x="2125" y="3948" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2104" y="3923" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Resp_Nao_di" bpmnElement="Flow_Trial_Resp_Nao">
        <di:waypoint x="2075" y="3973" />
        <di:waypoint x="2075" y="4058" />
        <di:waypoint x="2125" y="4058" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2080" y="4011" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Nurt_di" bpmnElement="Flow_Trial_Nurt">
        <di:waypoint x="2225" y="3948" />
        <di:waypoint x="2250" y="3948" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Motivo_Check_di" bpmnElement="Flow_Trial_Motivo_Check">
        <di:waypoint x="2225" y="4058" />
        <di:waypoint x="2275" y="4058" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Motivo_Preco_di" bpmnElement="Flow_Trial_Motivo_Preco">
        <di:waypoint x="2300" y="4033" />
        <di:waypoint x="2300" y="3988" />
        <di:waypoint x="2375" y="3988" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2308" y="4000" width="30" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Motivo_Timing_di" bpmnElement="Flow_Trial_Motivo_Timing">
        <di:waypoint x="2325" y="4058" />
        <di:waypoint x="2375" y="4098" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2333" y="4068" width="36" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Motivo_Outro_di" bpmnElement="Flow_Trial_Motivo_Outro">
        <di:waypoint x="2300" y="4083" />
        <di:waypoint x="2300" y="4120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2308" y="4095" width="28" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Desconto_Checkout_di" bpmnElement="Flow_Trial_Desconto_Checkout">
        <di:waypoint x="2475" y="3988" />
        <di:waypoint x="2520" y="3988" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Timing_Timer_di" bpmnElement="Flow_Trial_Timing_Timer">
        <di:waypoint x="2475" y="4098" />
        <di:waypoint x="2520" y="4098" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_Timing_Retry_di" bpmnElement="Flow_Trial_Timing_Retry">
        <di:waypoint x="2556" y="4098" />
        <di:waypoint x="2600" y="4098" />
      </bpmndi:BPMNEdge>
      <!-- ====== NUCLEO FINANCEIRO Pool (shifted +630) ====== -->
      <bpmndi:BPMNShape id="Shape_Participant_Nucleo" bpmnElement="Participant_Nucleo" isHorizontal="true" bioc:stroke="#868e96" bioc:fill="#f0f0f0">
        <dc:Bounds x="160" y="4230" width="4400" height="410" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Cliente_Ativo" bpmnElement="End_Cliente_Ativo">
        <dc:Bounds x="1257" y="4302" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1237" y="4338" width="76" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Pagamento_Falhou" bpmnElement="End_Pagamento_Falhou">
        <dc:Bounds x="1807" y="4522" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1790" y="4558" width="71" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Checkout_Anual" bpmnElement="Task_Checkout_Anual">
        <dc:Bounds x="535" y="4280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Tem_Parceiro" bpmnElement="Gateway_Tem_Parceiro" isMarkerVisible="true">
        <dc:Bounds x="800" y="4295" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="793" y="4275" width="64" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Split_Parceiro" bpmnElement="Task_Split_Parceiro">
        <dc:Bounds x="915" y="4280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Onboarding_Pago" bpmnElement="Task_Onboarding_Pago">
        <dc:Bounds x="1070" y="4280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Webhook_Falha" bpmnElement="Task_Webhook_Falha">
        <dc:Bounds x="690" y="4390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_WhatsApp_5min" bpmnElement="Task_WhatsApp_5min">
        <dc:Bounds x="845" y="4390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Checkout_Semestral" bpmnElement="Task_Checkout_Semestral">
        <dc:Bounds x="1000" y="4390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Vendedor_Trimestral" bpmnElement="Task_Vendedor_Trimestral">
        <dc:Bounds x="1310" y="4500" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Checkout_Trimestral" bpmnElement="Task_Checkout_Trimestral">
        <dc:Bounds x="1465" y="4500" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Checkout_Merge" bpmnElement="Gateway_Checkout_Merge" isMarkerVisible="true">
        <dc:Bounds x="405" y="4295" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="407" y="4345" width="47" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Pagamento_Anual" bpmnElement="Gateway_Pagamento_Anual" isMarkerVisible="true">
        <dc:Bounds x="715" y="4295" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="656" y="4266" width="87" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Pagamento_Semestral" bpmnElement="Gateway_Pagamento_Semestral" isMarkerVisible="true">
        <dc:Bounds x="1180" y="4405" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1241" y="4400" width="57" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Pagamento_Trimestral" bpmnElement="Gateway_Pagamento_Trimestral" isMarkerVisible="true">
        <dc:Bounds x="1645" y="4515" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1642" y="4565" width="57" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_D2" bpmnElement="IntermediateTimer_D2">
        <dc:Bounds x="1187" y="4522" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1172" y="4558" width="67" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_1hfrp4l" bpmnElement="Event_0u9h6ak">
        <dc:Bounds x="302" y="4302" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="290" y="4338" width="61" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Edge_Flow_Para_Cliente_Ativo" bpmnElement="Flow_Para_Cliente_Ativo">
        <di:waypoint x="1170" y="4320" />
        <di:waypoint x="1257" y="4320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Trimestral_Recusado" bpmnElement="Flow_Trimestral_Recusado">
        <di:waypoint x="1695" y="4540" />
        <di:waypoint x="1807" y="4540" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1739" y="4515" width="24" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Para_Anual" bpmnElement="Flow_Para_Anual">
        <di:waypoint x="455" y="4320" />
        <di:waypoint x="535" y="4320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Anual_Para_Gateway" bpmnElement="Flow_Anual_Para_Gateway">
        <di:waypoint x="635" y="4320" />
        <di:waypoint x="715" y="4320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Anual_Aprovado" bpmnElement="Flow_Anual_Aprovado">
        <di:waypoint x="765" y="4320" />
        <di:waypoint x="800" y="4320" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="773" y="4295" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Parceiro_Sim" bpmnElement="Flow_Parceiro_Sim">
        <di:waypoint x="850" y="4320" />
        <di:waypoint x="915" y="4320" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="873" y="4295" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Parceiro_Nao" bpmnElement="Flow_Parceiro_Nao">
        <di:waypoint x="825" y="4295" />
        <di:waypoint x="825" y="4260" />
        <di:waypoint x="1120" y="4260" />
        <di:waypoint x="1120" y="4280" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="963" y="4242" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Split_Para_Onboarding" bpmnElement="Flow_Split_Para_Onboarding">
        <di:waypoint x="1015" y="4320" />
        <di:waypoint x="1070" y="4320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Semestral_Aprovado" bpmnElement="Flow_Semestral_Aprovado">
        <di:waypoint x="1205" y="4405" />
        <di:waypoint x="1205" y="4369" />
        <di:waypoint x="1120" y="4369" />
        <di:waypoint x="1120" y="4360" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1153" y="4344" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Anual_Recusado" bpmnElement="Flow_Anual_Recusado">
        <di:waypoint x="740" y="4345" />
        <di:waypoint x="740" y="4390" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="743" y="4358" width="24" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Falha_Para_WhatsApp" bpmnElement="Flow_Falha_Para_WhatsApp">
        <di:waypoint x="790" y="4430" />
        <di:waypoint x="845" y="4430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_WhatsApp_Para_Semestral" bpmnElement="Flow_WhatsApp_Para_Semestral">
        <di:waypoint x="945" y="4430" />
        <di:waypoint x="1000" y="4430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Semestral_Para_Gateway" bpmnElement="Flow_Semestral_Para_Gateway">
        <di:waypoint x="1100" y="4430" />
        <di:waypoint x="1180" y="4430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Timer_Para_Vendedor" bpmnElement="Flow_Timer_Para_Vendedor">
        <di:waypoint x="1223" y="4540" />
        <di:waypoint x="1310" y="4540" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Vendedor_Para_Trimestral" bpmnElement="Flow_Vendedor_Para_Trimestral">
        <di:waypoint x="1410" y="4540" />
        <di:waypoint x="1465" y="4540" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Trimestral_Para_Gateway" bpmnElement="Flow_Trimestral_Para_Gateway">
        <di:waypoint x="1565" y="4540" />
        <di:waypoint x="1645" y="4540" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Semestral_Recusado" bpmnElement="Flow_Semestral_Recusado">
        <di:waypoint x="1205" y="4455" />
        <di:waypoint x="1205" y="4522" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1208" y="4479" width="24" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0m1sjfy_di" bpmnElement="Flow_0m1sjfy">
        <di:waypoint x="338" y="4320" />
        <di:waypoint x="405" y="4320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0na0lv9_di" bpmnElement="Flow_0na0lv9">
        <di:waypoint x="1670" y="4515" />
        <di:waypoint x="1670" y="4290" />
        <di:waypoint x="1170" y="4290" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1676" y="4400" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`;

export default COMERCIAL_V9_COMPLETE_XML;
export const COMERCIAL_DIAGRAM_XML = COMERCIAL_V9_COMPLETE_XML;

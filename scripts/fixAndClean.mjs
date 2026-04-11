import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/utils/marketingTemplate.js';
let c = readFileSync(filePath, 'utf8');

// ═══════════════════════════════════════════════════════════════
// FIX 1 — Adicionar Start_LP_Monitoramento para iniciar o ciclo CRO
// O Timer_LP_Semanal não tinha nenhum trigger inicial (só o loop back)
// ═══════════════════════════════════════════════════════════════

// Adicionar incoming ao Timer_LP_Semanal
c = c.replace(
  '<bpmn2:intermediateCatchEvent id="Timer_LP_Semanal" name="Ciclo CRO Semanal (P7D)">\n      <bpmn2:incoming>Flow_LP_CRO_Ciclo</bpmn2:incoming>',
  '<bpmn2:intermediateCatchEvent id="Timer_LP_Semanal" name="Ciclo CRO Semanal (P7D)">\n      <bpmn2:incoming>Flow_LP_CRO_Ciclo</bpmn2:incoming>\n      <bpmn2:incoming>Flow_LP_Monitor_Start</bpmn2:incoming>'
);

// Adicionar o Start Event de monitoramento antes dos sequence flows do Pool LP
const lpSeqStart = '    <!-- SEQUENCE FLOWS -->\n    <bpmn2:sequenceFlow id="Flow_LP_Start_Auditoria"';
c = c.replace(
  lpSeqStart,
  `    <!-- Start do ciclo de monitoramento CRO (paralelo ao fluxo de visitantes) -->
    <bpmn2:startEvent id="Start_LP_Monitoramento" name="Inicio do Ciclo de Monitoramento CRO">
      <bpmn2:documentation>Inicio paralelo do ciclo semanal de CRO.
Roda independente do fluxo de visitantes.
Responsavel: Kaua + Kaynan, toda segunda-feira.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_LP_Monitor_Start</bpmn2:outgoing>
    </bpmn2:startEvent>

    <!-- SEQUENCE FLOWS -->
    <bpmn2:sequenceFlow id="Flow_LP_Start_Auditoria"`
);

// Adicionar o sequenceFlow que conecta o start ao timer
const lpLastFlow = '    <bpmn2:sequenceFlow id="Flow_LP_CRO_Loop2"        sourceRef="Task_LP_Otimizar"      targetRef="Timer_LP_Loop" />';
c = c.replace(
  lpLastFlow,
  lpLastFlow + '\n    <bpmn2:sequenceFlow id="Flow_LP_Monitor_Start"      sourceRef="Start_LP_Monitoramento" targetRef="Timer_LP_Semanal" />'
);

console.log('Fix 1 aplicado: Start_LP_Monitoramento -> Timer_LP_Semanal');

// ═══════════════════════════════════════════════════════════════
// FIX 2 — Converter LinkThrow_LP_Retargeting em EndEvent
// O retargeting e acionado pelo Pixel automaticamente, nao por fluxo BPMN
// ═══════════════════════════════════════════════════════════════

// Localizar e substituir o intermediateThrowEvent de retargeting
const retargetingBlock = `    <bpmn2:intermediateThrowEvent id="LinkThrow_LP_Retargeting" name="→ Retargeting Meta + Google">
      <bpmn2:documentation>Lead saiu sem converter e sem deixar contato.
→ Meta Pixel registrou a visita → entra automaticamente no público de retargeting do Meta Ads
→ Google Tag registrou → entra no público de Display Retargeting do Google
→ Nos próximos 7-14 dias vai ver anúncios do Fyness no Instagram e em sites
→ Segundo toque: frequência de 2-3 vezes/dia no retargeting
→ Copy do retargeting: diferente da aquisição — foca em objeção específica ou prova social</bpmn2:documentation>
      <bpmn2:incoming>Flow_LP_Popup_Nao</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Retargeting" />
    </bpmn2:intermediateThrowEvent>`;

const retargetingFixed = `    <bpmn2:endEvent id="End_LP_Retargeting" name="Entra no Retargeting via Pixel (Meta + Google)">
      <bpmn2:documentation>Lead saiu sem converter e sem deixar contato.
Meta Pixel registrou a visita: entra automaticamente no publico de retargeting do Meta Ads.
Google Tag registrou: entra no publico de Display Retargeting do Google.
Nos proximos 7-14 dias vera anuncios do Fyness no Instagram e em sites parceiros.
Copy do retargeting: diferente da aquisicao, foca em objecao especifica ou prova social.
Nao requer fluxo BPMN explicito: acionado automaticamente pelo Pixel.</bpmn2:documentation>
      <bpmn2:incoming>Flow_LP_Popup_Nao</bpmn2:incoming>
    </bpmn2:endEvent>`;

if (c.includes(retargetingBlock)) {
  c = c.replace(retargetingBlock, retargetingFixed);
  console.log('Fix 2 aplicado: LinkThrow_LP_Retargeting convertido para EndEvent');
} else {
  // Try a more flexible match
  const idx = c.indexOf('LinkThrow_LP_Retargeting');
  if (idx >= 0) {
    const blockStart = c.lastIndexOf('<bpmn2:intermediateThrowEvent', idx);
    const blockEnd = c.indexOf('</bpmn2:intermediateThrowEvent>', idx) + '</bpmn2:intermediateThrowEvent>'.length;
    const originalBlock = c.slice(blockStart, blockEnd);
    const newBlock = `    <bpmn2:endEvent id="End_LP_Retargeting" name="Entra no Retargeting via Pixel (Meta + Google)">
      <bpmn2:documentation>Lead saiu sem converter e sem deixar contato.
Meta Pixel registrou a visita: entra automaticamente no publico de retargeting do Meta Ads.
Google Tag registrou: entra no publico de Display Retargeting do Google.
Nos proximos 7-14 dias vera anuncios do Fyness no Instagram e em sites parceiros.
Acionado automaticamente pelo Pixel, nao requer fluxo BPMN explicito.</bpmn2:documentation>
      <bpmn2:incoming>Flow_LP_Popup_Nao</bpmn2:incoming>
    </bpmn2:endEvent>`;
    c = c.slice(0, blockStart) + newBlock + c.slice(blockEnd);
    console.log('Fix 2 aplicado (fallback): LinkThrow_LP_Retargeting convertido para EndEvent');
  } else {
    console.log('Fix 2: LinkThrow_LP_Retargeting nao encontrado');
  }
}

// ═══════════════════════════════════════════════════════════════
// FIX 3 — Remover todos os emojis (tornar profissional)
// ═══════════════════════════════════════════════════════════════

const beforeLen = c.length;

// Remove emojis using Unicode ranges
c = c.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');  // Misc Symbols and Pictographs, Emoticons
c = c.replace(/[\u{2600}-\u{27BF}]/gu, '');     // Misc Symbols, Dingbats
c = c.replace(/[\u{2B00}-\u{2BFF}]/gu, '');     // Misc Symbols and Arrows
c = c.replace(/[\u{1F000}-\u{1F02F}]/gu, '');   // Mahjong tiles
c = c.replace(/[\u{1F0A0}-\u{1F0FF}]/gu, '');   // Playing cards
c = c.replace(/[\u{1FA00}-\u{1FA6F}]/gu, '');   // Chess symbols
c = c.replace(/[\u{1FA70}-\u{1FAFF}]/gu, '');   // Symbols and Pictographs Extended-A
c = c.replace(/[\u{FE00}-\u{FE0F}]/gu, '');     // Variation selectors
c = c.replace(/[\u{200D}]/gu, '');              // Zero width joiner
c = c.replace(/[\u{20E3}]/gu, '');              // Combining enclosing keycap
c = c.replace(/[\u{E0020}-\u{E007F}]/gu, '');   // Tags

// Remove common standalone emoji characters
c = c.replace(/[\u{2764}]/gu, '');  // heart
c = c.replace(/[\u{2B50}]/gu, '');  // star
c = c.replace(/[\u{2705}]/gu, '');  // check mark
c = c.replace(/[\u{274C}]/gu, '');  // cross
c = c.replace(/[\u{26A0}]/gu, '');  // warning
c = c.replace(/[\u{2714}]/gu, '');  // check
c = c.replace(/[\u{2716}]/gu, '');  // heavy multiplication
c = c.replace(/[\u{25B6}]/gu, '');  // play button
c = c.replace(/[\u{23F0}]/gu, '');  // alarm clock
c = c.replace(/[\u{1F4CC}-\u{1F4CD}]/gu, ''); // pushpin

const afterLen = c.length;
const removed = beforeLen - afterLen;
console.log(`Fix 3 aplicado: ${removed} caracteres de emoji removidos`);

// Clean up multiple spaces left by emoji removal
c = c.replace(/ {2,}/g, ' ');
// Clean up lines that became empty or just spaces/dashes after emoji removal
c = c.replace(/^\s*[-—]\s*$/gm, '');
// Clean up lines starting with just a space before real content
c = c.replace(/^  ( +\S)/gm, (_, rest) => '  ' + rest.trimStart());

// ═══════════════════════════════════════════════════════════════
// WRITE
// ═══════════════════════════════════════════════════════════════
writeFileSync(filePath, c, 'utf8');
console.log(`\nArquivo salvo: ${c.length} chars, ${c.split('\n').length} linhas`);

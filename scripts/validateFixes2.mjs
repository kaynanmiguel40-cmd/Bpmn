import { readFileSync } from 'fs';

const c = readFileSync('c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js', 'utf8');

const xmlMatch = c.match(/export const MARKETING_TEMPLATE_XML = `([\s\S]*?)`;/);
if (!xmlMatch) { console.error('Could not extract XML'); process.exit(1); }
const xml = xmlMatch[1];

const checks = [
  ['Template literal intact', c.includes('export const MARKETING_TEMPLATE_XML = `')],
  ['XML valid start', xml.startsWith('<?xml')],
  ['XML valid end', xml.trimEnd().endsWith('</bpmn2:definitions>')],
  ['6 pools', (xml.match(/<bpmn2:participant /g) || []).length === 6],
  ['6 processes', (xml.match(/<bpmn2:process /g) || []).length === 6],
  ['2 TextAnnotations', (xml.match(/<bpmn2:textAnnotation /g) || []).length === 2],
  ['CAC annotation present', xml.includes('CAC MAXIMO E UNIT ECONOMICS')],
  ['CAC R$300-400', xml.includes('R$300-400')],
  ['@fynessbr phased (FASE 1)', xml.includes('FASE 1 — MES 1-2')],
  ['@fynessbr phased (FASE 2)', xml.includes('FASE 2 — MES 3+')],
  ['@fynessbr phased (FASE 3)', xml.includes('FASE 3 — MES 6+')],
  ['Gateway pausa pago', xml.includes('PAUSA DO TRÁFEGO PAGO')],
  ['Reel viral trigger', xml.includes('50k+ views')],
  ['Trial reactivation', xml.includes('REATIVAÇÃO DE TRIAL EXPIRADO')],
  ['Reactivation dia 7/10/14/30', xml.includes('Dia 7') && xml.includes('Dia 10') && xml.includes('Dia 14') && xml.includes('Dia 30')],
  ['Email nurture 8 emails', xml.includes('8 emails em 14 dias')],
  ['Nurture FASE 1 educacao', xml.includes('FASE 1 — EDUCAÇÃO')],
  ['Nurture FASE 2 produto', xml.includes('FASE 2 — PRODUTO')],
  ['Nurture FASE 3 conversao', xml.includes('FASE 3 — CONVERSÃO')],
  ['CAC diagram shape', xml.includes('Annotation_CAC_di')],
  ['Diagram integrity', (xml.match(/<bpmndi:BPMNShape /g) || []).length >= 97],
];

let pass = 0;
checks.forEach(([name, ok]) => {
  console.log((ok ? '✓' : '✗') + ' ' + name);
  if (ok) pass++;
});

const shapes = (xml.match(/<bpmndi:BPMNShape /g) || []).length;
const edges = (xml.match(/<bpmndi:BPMNEdge /g) || []).length;
const annotations = (xml.match(/<bpmn2:textAnnotation /g) || []).length;

console.log('\n' + pass + '/' + checks.length + ' checks passed');
console.log('Diagram: ' + shapes + ' shapes, ' + edges + ' edges, ' + annotations + ' annotations');
console.log('File: ' + c.split('\n').length + ' lines');

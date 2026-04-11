import { readFileSync } from 'fs';

const c = readFileSync('c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js', 'utf8');

// Extract XML from template literal
const xmlMatch = c.match(/export const MARKETING_TEMPLATE_XML = `([\s\S]*?)`;/);
if (!xmlMatch) { console.error('Could not extract XML from template literal'); process.exit(1); }
const xml = xmlMatch[1];

const checks = [
  ['Template literal intact', c.includes('export const MARKETING_TEMPLATE_XML = `')],
  ['XML header present', xml.startsWith('<?xml')],
  ['Definitions closed', xml.trimEnd().endsWith('</bpmn2:definitions>')],
  ['6 pools', (xml.match(/<bpmn2:participant /g) || []).length === 6],
  ['6 processes', (xml.match(/<bpmn2:process /g) || []).length === 6],
  ['TextAnnotation (InMarketing)', xml.includes('Annotation_InMarketing')],
  ['CRO checklist (no copy)', xml.includes('CHECKLIST CRO POR')],
  ['No Google Optimize', !xml.includes('Google Optimize')],
  ['VWO present', xml.includes('VWO')],
  ['Cross-channel dashboard', xml.includes('CROSS-CHANNEL')],
  ['Budget phasing note', xml.includes('NOTA DE FASE')],
  ['LinkThrow Comercial V9', xml.includes('LinkThrow_LP_Trial')],
  ['Pricing correct (137/mes no cartao)', xml.includes('R$137/m')],
  ['No cobrado anualmente', !xml.includes('cobrado anualmente')],
  ['Diagram section present', xml.includes('BPMNDiagram')],
  ['Task renamed CRO', xml.includes('Checklist CRO por')],
  ['Task renamed Cross-Channel', xml.includes('Dashboard Cross-Channel')],
];

let pass = 0;
checks.forEach(([name, ok]) => {
  console.log((ok ? '✓' : '✗') + ' ' + name);
  if (ok) pass++;
});
console.log('\n' + pass + '/' + checks.length + ' checks passed');

// Count elements
const shapes = (xml.match(/<bpmndi:BPMNShape /g) || []).length;
const edges = (xml.match(/<bpmndi:BPMNEdge /g) || []).length;
console.log('\nDiagram: ' + shapes + ' shapes, ' + edges + ' edges');
console.log('File: ' + c.split('\n').length + ' lines');

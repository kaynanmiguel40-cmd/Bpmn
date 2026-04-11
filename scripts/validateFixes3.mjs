import { readFileSync } from 'fs';

const c = readFileSync('c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js', 'utf8');
const xmlMatch = c.match(/export const MARKETING_TEMPLATE_XML = `([\s\S]*?)`;/);
if (!xmlMatch) { console.error('Could not extract XML'); process.exit(1); }
const xml = xmlMatch[1];

const checks = [
  ['Template literal intact', c.includes('export const MARKETING_TEMPLATE_XML = `')],
  ['XML valid', xml.startsWith('<?xml') && xml.trimEnd().endsWith('</bpmn2:definitions>')],
  ['7 pools (participants)', (xml.match(/<bpmn2:participant /g) || []).length === 7],
  ['7 processes', (xml.match(/<bpmn2:process /g) || []).length === 7],
  ['Pool 7: MultiPlat exists', xml.includes('Process_MultiPlat')],
  ['Pool 7: TikTok + YouTube', xml.includes('TikTok') && xml.includes('YouTube Shorts')],
  ['Pool 7: Kaua manages', xml.includes('Kaua')],
  ['Pool 7: 1 conteudo 3 plataformas', xml.includes('1 Conteudo')],
  ['Revenue filter: 10k+/mes', xml.includes('R$10k+/mes') || xml.includes('R$10.000/mes')],
  ['No MEI fraco targeting', xml.includes('EVITAR "MEI" isolado')],
  ['Robert bio MEI-free', xml.includes('Ajudo donos de negocio a pararem de perder dinheiro')],
  ['Robert hooks 10k+', xml.includes('fatura R$10, 20, 30 mil')],
  ['Kaynan bio MEI-free', xml.includes('sistema pra donos de negocio controlarem tudo pelo WhatsApp')],
  ['Meta Ads: filtered', xml.includes('FOCO: NEGOCIO COM FATURAMENTO')],
  ['Google Ads: no MEI keywords', xml.includes('NEGOCIO COM OPERACAO')],
  ['CAC: client filter', xml.includes('FILTRO DE CLIENTE IDEAL')],
  ['Header: TikTok+YouTube', c.includes('TIKTOK+YOUTUBE')],
  ['2 TextAnnotations', (xml.match(/<bpmn2:textAnnotation /g) || []).length === 2],
  ['Diagram: Pool 7 shape', xml.includes('Participant_MultiPlat_di')],
];

let pass = 0;
checks.forEach(([name, ok]) => {
  console.log((ok ? '✓' : '✗') + ' ' + name);
  if (ok) pass++;
});

const shapes = (xml.match(/<bpmndi:BPMNShape /g) || []).length;
const edges = (xml.match(/<bpmndi:BPMNEdge /g) || []).length;
const pools = (xml.match(/<bpmn2:participant /g) || []).length;
const processes = (xml.match(/<bpmn2:process /g) || []).length;

console.log('\n' + pass + '/' + checks.length + ' checks passed');
console.log('Pools: ' + pools + ' | Processes: ' + processes);
console.log('Diagram: ' + shapes + ' shapes, ' + edges + ' edges');
console.log('File: ' + c.split('\n').length + ' lines');

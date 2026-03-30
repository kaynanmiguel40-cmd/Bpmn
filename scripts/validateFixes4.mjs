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

  // Pool 7 renamed
  ['Pool 7: YouTube Canal Unico', xml.includes('YOUTUBE — Canal Unico Fyness')],
  ['Pool 7: Setup renamed', xml.includes('Setup YouTube')],
  ['Pool 7: Shorts + Longform task', xml.includes('Shorts + Longform')],
  ['Pool 7: SEO task', xml.includes('SEO e Calendario YouTube')],

  // Robert TikTok
  ['Robert: TikTok section exists', xml.includes('TIKTOK — @robert_fyness')],
  ['Robert: TikTok hooks', xml.includes('HOOK + HISTORIA') && xml.includes('NUMERO CHOCANTE')],
  ['Robert: TikTok calendario', xml.includes('TIKTOK — CALENDARIO ROBERT')],
  ['Robert: TikTok crescimento', xml.includes('CRESCIMENTO TIKTOK — ROBERT')],
  ['Robert: YouTube section', xml.includes('YOUTUBE — Aparece no Canal @fynessbr') || xml.includes('Robert e o apresentador PRINCIPAL')],
  ['Robert: YouTube calendario', xml.includes('YOUTUBE — CALENDARIO ROBERT')],

  // Kaynan TikTok
  ['Kaynan: TikTok section exists', xml.includes('TIKTOK — @kaynan_fyness')],
  ['Kaynan: POV fundador', xml.includes('POV / NARRATIVA FUNDADOR')],
  ['Kaynan: Demo satisfying', xml.includes('DEMO SATISFYING')],
  ['Kaynan: TikTok calendario', xml.includes('TIKTOK — CALENDARIO KAYNAN')],
  ['Kaynan: TikTok crescimento', xml.includes('CRESCIMENTO TIKTOK — KAYNAN')],
  ['Kaynan: YouTube section', xml.includes('YOUTUBE — Aparece no Canal @fynessbr')],

  // Fyness TikTok
  ['Fyness: TikTok section', xml.includes('TIKTOK — @fynessbr (SECUNDARIO)')],
  ['Fyness: TikTok justificativa', xml.includes('POR QUE SECUNDARIO')],

  // YouTube Canal Unico content
  ['YouTube: POR QUE UM CANAL SO', xml.includes('POR QUE UM CANAL SO')],
  ['YouTube: Playlists', xml.includes('Gestao Financeira pra Iniciante')],
  ['YouTube: SEO keywords', xml.includes('gestao financeira pequeno negocio')],
  ['YouTube: Longform structure', xml.includes('0:00-0:30 HOOK')],
  ['YouTube: Robert 70% longform', xml.includes('ROBERT APRESENTA (70%')],
  ['YouTube: Kaynan 30% longform', xml.includes('KAYNAN APRESENTA (30%')],

  // Cross-platform integration
  ['Cross: UTMs per profile', xml.includes('Robert IG:') && xml.includes('Kaynan TikTok:')],
  ['Cross: Funil rule', xml.includes('TikTok atrai (topo)')],
  ['Cross: Role separation', xml.includes('Robert NUNCA posta demo')],

  // Existing checks still pass
  ['Revenue filter: 10k+/mes', xml.includes('R$10k+/mes') || xml.includes('R$10.000/mes')],
  ['No MEI fraco targeting', xml.includes('EVITAR \"MEI\" isolado')],
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

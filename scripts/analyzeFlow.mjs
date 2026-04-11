import { readFileSync } from 'fs';
const c = readFileSync('src/utils/marketingTemplate.js', 'utf8');

const pools = [
  { name: 'MetaAds',    id: 'Process_MetaAds' },
  { name: 'GoogleAds',  id: 'Process_GoogleAds' },
  { name: 'Robert',     id: 'Process_Robert' },
  { name: 'Kaynan',     id: 'Process_Kaynan' },
  { name: 'Inst',       id: 'Process_Institucional' },
  { name: 'LP',         id: 'Process_LP' },
];

const ELEMENT_TAGS = [
  'bpmn2:task',
  'bpmn2:startEvent',
  'bpmn2:endEvent',
  'bpmn2:exclusiveGateway',
  'bpmn2:intermediateCatchEvent',
  'bpmn2:intermediateThrowEvent',
];

pools.forEach(pool => {
  const pStart = c.indexOf(`id="${pool.id}"`);
  const pEnd   = c.indexOf('</bpmn2:process>', pStart);
  const block  = c.slice(pStart, pEnd);

  const allIds    = [];
  const startIds  = [];
  const endIds    = [];

  for (const tag of ELEMENT_TAGS) {
    const re = new RegExp(`<${tag}[^>]+id="([^"]+)"`, 'g');
    let m;
    while ((m = re.exec(block)) !== null) {
      allIds.push(m[1]);
      if (tag === 'bpmn2:startEvent') startIds.push(m[1]);
      if (tag === 'bpmn2:endEvent' || tag === 'bpmn2:intermediateThrowEvent') endIds.push(m[1]);
    }
  }

  const sources = [...block.matchAll(/sourceRef="([^"]+)"/g)].map(m => m[1]);
  const targets = [...block.matchAll(/targetRef="([^"]+)"/g)].map(m => m[1]);

  const noIncoming = allIds.filter(id => !targets.includes(id) && !startIds.includes(id));
  const noOutgoing = allIds.filter(id => !sources.includes(id) && !endIds.includes(id));

  console.log(`\n=== ${pool.name} === (total nodes: ${allIds.length})`);
  console.log(`  Starts: ${startIds.length} | Ends/Throws: ${endIds.length}`);

  if (noIncoming.length > 0) {
    console.log('  SEM INCOMING (orfaos sem entrada):');
    noIncoming.forEach(id => console.log(`    - ${id}`));
  }

  if (noOutgoing.length > 0) {
    console.log('  SEM OUTGOING (dead ends sem saida):');
    noOutgoing.forEach(id => console.log(`    - ${id}`));
  }

  if (noIncoming.length === 0 && noOutgoing.length === 0) {
    console.log('  Todos os nos conectados corretamente.');
  }
});

// Also check: do all incoming/outgoing declared inside elements actually have a sequenceFlow?
console.log('\n=== INCOMING/OUTGOING SEM SEQUENCEFLOW CORRESPONDENTE ===');
const allFlowIds = [...c.matchAll(/id="(Flow_[^"]+)"/g)].map(m => m[1]);
const allIncoming = [...c.matchAll(/<bpmn2:incoming>(Flow_[^<]+)<\/bpmn2:incoming>/g)].map(m => m[1]);
const allOutgoing = [...c.matchAll(/<bpmn2:outgoing>(Flow_[^<]+)<\/bpmn2:outgoing>/g)].map(m => m[1]);

const missingFlows = new Set([...allIncoming, ...allOutgoing].filter(f => !allFlowIds.includes(f)));
if (missingFlows.size > 0) {
  console.log('  Flows referenciados mas sem definicao:');
  missingFlows.forEach(f => console.log(`    - ${f}`));
} else {
  console.log('  Todos os flows referenciados tem definicao correspondente.');
}

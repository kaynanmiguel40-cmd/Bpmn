import { readFileSync } from 'fs';
const c = readFileSync('src/utils/marketingTemplate.js', 'utf8');

console.log('=== TAMANHO DO ARQUIVO ===');
console.log(`Chars: ${c.length} | Lines: ${c.split('\n').length}`);

console.log('\n=== PROCESSES (6 esperados) ===');
const processes = c.match(/id="Process_\w+"/g) || [];
processes.forEach(p => console.log(' ', p));

console.log('\n=== LINK THROW EVENTS ===');
const throws = c.match(/id="LinkThrow_\w+"/g) || [];
throws.forEach(t => console.log(' ', t));

console.log('\n=== LINK NAMES (linkEventDefinition) ===');
const linkNames = c.match(/name="Link_\w+"/g) || [];
const uniqueLinks = [...new Set(linkNames)];
uniqueLinks.forEach(l => console.log(' ', l));

console.log('\n=== DUPLICATE FLOW IDs ===');
const flows = c.match(/id="Flow_\w+"/g) || [];
const seen = new Set();
const dupes = [];
for (const f of flows) {
  if (seen.has(f)) dupes.push(f);
  seen.add(f);
}
if (dupes.length) dupes.forEach(d => console.log('  DUPE:', d));
else console.log('  Nenhum duplicado encontrado ✅');

console.log('\n=== DUPLICATE TASK/GATEWAY/EVENT IDs ===');
const elements = c.match(/id="(Task|Gateway|Timer|Start|End|Link)[^"]+"/g) || [];
const seen2 = new Set();
const dupes2 = [];
for (const e of elements) {
  if (seen2.has(e)) dupes2.push(e);
  seen2.add(e);
}
if (dupes2.length) dupes2.forEach(d => console.log('  DUPE:', d));
else console.log('  Nenhum duplicado encontrado ✅');

console.log('\n=== XML BALANCE ===');
const openTags = (c.match(/<bpmn2:[a-zA-Z]/g) || []).length;
const closeTags = (c.match(/<\/bpmn2:/g) || []).length;
const selfClose = (c.match(/<bpmn2:[^>]+\/>/g) || []).length;
console.log(`  Open: ${openTags} | Close: ${closeTags} | Self-closing: ${selfClose}`);
console.log(`  Balanço: open(${openTags}) vs close+self(${closeTags + selfClose}) → ${openTags === closeTags + selfClose ? '✅ OK' : '⚠️ DIFERENÇA: ' + (openTags - closeTags - selfClose)}`);

console.log('\n=== BROKEN DOCUMENTATION TAGS ===');
// Check for opening documentation tag with wrong quote
const badDocOpen = (c.match(/<bpmn2:documentation">/g) || []).length;
console.log(`  <bpmn2:documentation"> (errado): ${badDocOpen > 0 ? '⚠️ ENCONTRADO ' + badDocOpen + ' ocorrências' : '✅ Nenhum'}`);

console.log('\n=== GATEWAYS SEM 2 SAÍDAS ===');
const gatewayBlocks = c.match(/<bpmn2:exclusiveGateway[\s\S]*?<\/bpmn2:exclusiveGateway>/g) || [];
gatewayBlocks.forEach(block => {
  const id = (block.match(/id="([^"]+)"/) || [])[1];
  const outgoing = (block.match(/<bpmn2:outgoing>/g) || []).length;
  if (outgoing < 2) console.log(`  ⚠️ Gateway "${id}" tem apenas ${outgoing} saída(s)`);
});
if (gatewayBlocks.every(b => (b.match(/<bpmn2:outgoing>/g) || []).length >= 2)) {
  console.log('  Todos os gateways têm 2+ saídas ✅');
}

console.log('\n=== SEQUENCE FLOWS SEM SOURCEREF/TARGETREF ===');
const seqFlows = c.match(/<bpmn2:sequenceFlow[^/]*\/>/g) || [];
const broken = seqFlows.filter(sf => !sf.includes('sourceRef') || !sf.includes('targetRef'));
if (broken.length) broken.forEach(b => console.log('  ⚠️', b.slice(0, 120)));
else console.log('  Todos os sequenceFlows têm sourceRef e targetRef ✅');

console.log('\n=== POOLS NO DIAGRAMA VISUAL ===');
const participants = (c.match(/<bpmndi:BPMNShape[^>]+Participant_/g) || []).length;
console.log(`  Participantes no layout visual: ${participants}`);
const processShapes = (c.match(/<bpmndi:BPMNShape[^>]+Task_/g) || []).length;
console.log(`  Task shapes no layout: ${processShapes}`);

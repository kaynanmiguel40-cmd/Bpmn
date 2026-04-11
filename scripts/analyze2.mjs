import { readFileSync, writeFileSync } from 'fs';

const xml = readFileSync('c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js', 'utf8');

const processPattern = /<bpmn2:process id="(Process_[^"]+)"[^>]*>([\s\S]*?)<\/bpmn2:process>/g;
let m;
const pools = [];

while ((m = processPattern.exec(xml)) !== null) {
  const pid = m[1];
  const content = m[2];

  const elements = [];
  const elemPattern = /<bpmn2:(startEvent|endEvent|task|serviceTask|userTask|exclusiveGateway|parallelGateway|intermediateCatchEvent|intermediateThrowEvent|callActivity)\s[^>]*id="([^"]+)"[^>]*/g;
  let em;
  while ((em = elemPattern.exec(content)) !== null) {
    elements.push({ type: em[1], id: em[2] });
  }

  const flows = [];
  const flowPattern = /<bpmn2:sequenceFlow[^>]*id="([^"]+)"[^>]*sourceRef="([^"]+)"[^>]*targetRef="([^"]+)"/g;
  let fm;
  while ((fm = flowPattern.exec(content)) !== null) {
    flows.push({ id: fm[1], src: fm[2], tgt: fm[3] });
  }

  pools.push({ pid, elements, flows });

  console.log('\n=== ' + pid + ' ===');
  console.log('Elements:', elements.length);
  elements.forEach(e => console.log('  ' + e.type.padEnd(25) + e.id));
  console.log('Flows:', flows.length);
  flows.forEach(f => console.log('  ' + f.id + ': ' + f.src + ' -> ' + f.tgt));
}

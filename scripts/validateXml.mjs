import { readFileSync } from 'fs';

const jsContent = readFileSync('c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js', 'utf8');

// Extract XML from the template literal
const xmlStart = jsContent.indexOf('`<?xml');
const xmlEnd = jsContent.lastIndexOf('`');
const xml = jsContent.slice(xmlStart + 1, xmlEnd);

// Basic checks
const checks = [
  ['Opens bpmn2:definitions', xml.includes('<bpmn2:definitions')],
  ['Closes bpmn2:definitions', xml.includes('</bpmn2:definitions>')],
  ['Has 6 processes', (xml.match(/<bpmn2:process /g) || []).length === 6],
  ['Has BPMNDiagram', xml.includes('<bpmndi:BPMNDiagram')],
  ['Has 6 pool shapes', (xml.match(/Participant_.*isHorizontal/g) || []).length === 6],
  ['No unclosed doc tags', !xml.includes('<bpmn2:documentation">')],
  ['XML starts correctly', xml.startsWith('<?xml')],
];

let allOk = true;
checks.forEach(([name, result]) => {
  const icon = result ? '✓' : '✗';
  console.log(`${icon} ${name}`);
  if (!result) allOk = false;
});

// Count elements
const taskCount = (xml.match(/<bpmn2:(task|serviceTask|userTask) /g) || []).length;
const eventCount = (xml.match(/<bpmn2:(startEvent|endEvent|intermediateCatchEvent|intermediateThrowEvent) /g) || []).length;
const gatewayCount = (xml.match(/<bpmn2:(exclusiveGateway|parallelGateway) /g) || []).length;
const flowCount = (xml.match(/<bpmn2:sequenceFlow /g) || []).length;
const shapeCount = (xml.match(/<bpmndi:BPMNShape /g) || []).length;
const edgeCount = (xml.match(/<bpmndi:BPMNEdge /g) || []).length;

console.log(`\nProcess elements: ${taskCount} tasks, ${eventCount} events, ${gatewayCount} gateways`);
console.log(`Flows: ${flowCount}`);
console.log(`Diagram shapes: ${shapeCount}, edges: ${edgeCount}`);
console.log(`\nTotal XML length: ${(xml.length / 1024).toFixed(1)}KB`);

if (allOk) console.log('\nAll checks passed!');
else console.log('\nSome checks failed!');

import { readFileSync } from 'fs';

const xml = readFileSync('c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js', 'utf8');

// Extract process element IDs
const processElements = new Set();
const elemPattern = /<bpmn2:(startEvent|endEvent|task|serviceTask|userTask|exclusiveGateway|parallelGateway|intermediateCatchEvent|intermediateThrowEvent)[^>]*id="([^"]+)"/g;
let em;
while ((em = elemPattern.exec(xml)) !== null) {
  processElements.add(em[2]);
}

// Extract flow IDs
const flowIds = new Set();
const flowPattern = /<bpmn2:sequenceFlow[^>]*id="([^"]+)"/g;
let fm;
while ((fm = flowPattern.exec(xml)) !== null) {
  flowIds.add(fm[1]);
}

// Find diagram section
const diagStart = xml.indexOf('<bpmndi:BPMNDiagram');
const diagXml = xml.slice(diagStart);

// Get bpmnElement refs in diagram
const diagramRefs = new Set();
const refPattern = /bpmnElement="([^"]+)"/g;
let rm;
while ((rm = refPattern.exec(diagXml)) !== null) {
  diagramRefs.add(rm[1]);
}

const missingElements = [...processElements].filter(id => !diagramRefs.has(id));
const missingFlows = [...flowIds].filter(id => !diagramRefs.has(id));

console.log('Missing elements (need BPMNShape):', missingElements.length);
missingElements.forEach(id => console.log('  -', id));
console.log('\nMissing flows (need BPMNEdge):', missingFlows.length);
missingFlows.forEach(id => console.log('  -', id));
console.log('\nTotal process elements:', processElements.size);
console.log('Total flows:', flowIds.size);
console.log('Total diagram refs:', diagramRefs.size);

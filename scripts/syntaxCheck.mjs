import { readFileSync } from 'fs';

const content = readFileSync('./src/utils/marketingTemplate.js', 'utf8');

// Check template literal balance
const backticks = (content.match(/`/g) || []).length;
console.log('Backtick count:', backticks, backticks % 2 === 0 ? '(balanced)' : '(UNBALANCED!)');

// Extract XML
const xmlStart = content.indexOf('`<?xml');
const xmlEnd = content.lastIndexOf('`');
const xml = content.slice(xmlStart + 1, xmlEnd);

// Check tag balance
const planes = [(xml.match(/<bpmndi:BPMNPlane /g) || []).length, (xml.match(/<\/bpmndi:BPMNPlane>/g) || []).length];
console.log('BPMNPlane open/close:', planes[0], '/', planes[1], planes[0] === planes[1] ? 'OK' : 'MISMATCH');

const diag = [(xml.match(/<bpmndi:BPMNDiagram /g) || []).length, (xml.match(/<\/bpmndi:BPMNDiagram>/g) || []).length];
console.log('BPMNDiagram open/close:', diag[0], '/', diag[1], diag[0] === diag[1] ? 'OK' : 'MISMATCH');

const defn = [(xml.match(/<bpmn2:definitions /g) || []).length, (xml.match(/<\/bpmn2:definitions>/g) || []).length];
console.log('definitions open/close:', defn[0], '/', defn[1], defn[0] === defn[1] ? 'OK' : 'MISMATCH');

const proc = [(xml.match(/<bpmn2:process /g) || []).length, (xml.match(/<\/bpmn2:process>/g) || []).length];
console.log('process open/close:', proc[0], '/', proc[1], proc[0] === proc[1] ? 'OK' : 'MISMATCH');

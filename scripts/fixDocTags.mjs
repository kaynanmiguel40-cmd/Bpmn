import { readFileSync, writeFileSync } from 'fs';
const filePath = 'src/utils/marketingTemplate.js';
let c = readFileSync(filePath, 'utf8');
const before = (c.match(/<bpmn2:documentation">/g) || []).length;
c = c.replaceAll('<bpmn2:documentation">', '<bpmn2:documentation>');
const after = (c.match(/<bpmn2:documentation">/g) || []).length;
writeFileSync(filePath, c, 'utf8');
console.log(`Fixed: ${before} → ${after} broken tags. Lines: ${c.split('\n').length}`);

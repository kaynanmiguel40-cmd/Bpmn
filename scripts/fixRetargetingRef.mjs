import { readFileSync, writeFileSync } from 'fs';
const filePath = 'src/utils/marketingTemplate.js';
let c = readFileSync(filePath, 'utf8');
c = c.replace('targetRef="LinkThrow_LP_Retargeting"', 'targetRef="End_LP_Retargeting"');
writeFileSync(filePath, c, 'utf8');
console.log('Fixed: targetRef updated to End_LP_Retargeting');

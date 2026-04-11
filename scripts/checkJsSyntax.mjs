import { readFileSync } from 'fs';
import { createRequire } from 'module';

const content = readFileSync('./src/utils/marketingTemplate.js', 'utf8');

// Check for problematic characters in template literal that would break JS
const xmlStart = content.indexOf('`<?xml');
const xmlEnd = content.lastIndexOf('`');
const xml = content.slice(xmlStart + 1, xmlEnd);

// Look for unescaped backticks inside template literal
const innerBackticks = xml.match(/`/g);
console.log('Unescaped backticks inside XML:', innerBackticks ? innerBackticks.length : 0);

// Look for unescaped ${} expressions
const templateExpressions = xml.match(/\$\{/g);
console.log('Template expressions inside XML:', templateExpressions ? templateExpressions.length : 0);

// Check for any characters that might break the template literal
const lines = xml.split('\n');
lines.forEach((line, i) => {
  if (line.includes('`') || line.includes('${')) {
    console.log(`Line ${i + 1}: ${line.slice(0, 100)}`);
  }
});

console.log('\nXML length:', xml.length);
console.log('All clear!' );

const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Ben Binu\\.gemini\\antigravity\\brain\\08e1e321-56ea-4b1f-a64d-cde7ffebcd23\\.system_generated\\steps\\4093\\content.md', 'utf8');

const idx = content.indexOf('Summer Bond');
console.log('--- SUMMER BOND SNIPPET ---');
console.log(content.slice(Math.max(0, idx - 400), idx + 800));

const idx2 = content.indexOf('Monochrome');
console.log('--- MONOCHROME SNIPPET ---');
console.log(content.slice(Math.max(0, idx2 - 400), idx2 + 800));

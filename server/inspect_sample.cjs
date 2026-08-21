const fs = require('fs');
const html = fs.readFileSync('./server/full_limited-secrets.html', 'utf8');

// Look for where pet names and values appear together
const lines = html.split('\n');
let samples = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Lord Shock') || lines[i].includes('Ghosdeeri') || lines[i].includes('Tophat') || lines[i].includes('Overlord') || lines[i].includes('Kraken')) {
    samples.push(lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 10)).join('\n'));
    if (samples.length >= 3) break;
  }
}
console.log('Sample table sections:');
console.log(samples.join('\n----------------------\n'));

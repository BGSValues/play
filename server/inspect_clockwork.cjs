const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.startsWith('full_') && f.endsWith('.html'));

console.log('Searching for Clockwork on BGS Collab Value List...');

for (const file of files) {
  const html = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
  const spans = [];
  let m;
  while ((m = pRegex.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
    if (text) spans.push(text);
  }

  const idx = spans.findIndex(s => s.toLowerCase() === 'clockwork');
  if (idx !== -1) {
    console.log(`\n[${file}] Found Clockwork at index ${idx}:`);
    for (let i = Math.max(0, idx - 1); i < Math.min(spans.length, idx + 8); i++) {
      console.log(`  [${i}] "${spans[i]}"`);
    }
  }
}

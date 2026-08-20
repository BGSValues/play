const fs = require('fs');
const html = fs.readFileSync('./server/full_mythic-secrets.html', 'utf8');
const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
const spans = [];
let m;
while ((m = pRegex.exec(html)) !== null) {
  const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
  if (text) spans.push(text);
}

const idx = spans.indexOf('Harmonic Harp');
console.log('Spans around Harmonic Harp in Mythic Secrets:');
for (let i = idx - 1; i < idx + 10; i++) {
  console.log(`[${i}] ${spans[i]}`);
}

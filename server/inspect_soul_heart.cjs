const fs = require('fs');
const html = fs.readFileSync('./server/full_limited-secrets.html', 'utf8');
const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
const spans = [];
let m;
while ((m = pRegex.exec(html)) !== null) {
  const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
  if (text) spans.push(text);
}

const idx = spans.indexOf('Soul Heart');
console.log('Spans around Soul Heart:');
for (let i = idx - 2; i < idx + 16; i++) {
  console.log(`[${i}] ${spans[i]}`);
}

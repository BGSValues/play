const fs = require('fs');
const path = require('path');

const limHtml = fs.readFileSync(path.join(__dirname, 'full_limited-secrets.html'), 'utf8');
const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
const spans = [];
let m;
while ((m = pRegex.exec(limHtml)) !== null) {
  const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
  if (text) spans.push(text);
}

const idx = spans.indexOf('Gingerbread Shard');
console.log('Gingerbread Shard on Limited Secrets:');
for (let i = idx - 1; i < idx + 8; i++) {
  console.log(`[${i}] ${spans[i]}`);
}

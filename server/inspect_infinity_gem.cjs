const fs = require('fs');
const html = fs.readFileSync('./server/full_copy-of-copy-of-limited-secrets.html', 'utf8');

const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
const spans = [];
let m;
while ((m = pRegex.exec(html)) !== null) {
  const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
  if (text) spans.push(text);
}

const idx = spans.indexOf('Infinity Gem');
console.log('Spans around Infinity Gem in copy-of-copy-of-limited-secrets:', spans.slice(Math.max(0, idx - 2), idx + 8));

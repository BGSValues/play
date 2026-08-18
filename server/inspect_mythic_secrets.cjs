const fs = require('fs');
const html = fs.readFileSync('./server/page_mythic-secrets.html', 'utf8');

const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
const spans = [];
let m;
while ((m = pRegex.exec(html)) !== null) {
  const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
  if (text) spans.push(text);
}

const idx = spans.indexOf('Lovely Rose');
console.log('Spans around Lovely Rose:', spans.slice(Math.max(0, idx - 2), idx + 10));

const idx2 = spans.indexOf('Prisma Cube');
console.log('Spans around Prisma Cube:', spans.slice(Math.max(0, idx2 - 2), idx2 + 10));

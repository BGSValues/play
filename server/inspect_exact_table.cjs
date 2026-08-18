const fs = require('fs');
const html = fs.readFileSync('./server/full_limited_secrets.html', 'utf8');

const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
const spans = [];
let m;
while ((m = pRegex.exec(html)) !== null) {
  const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
  if (text) spans.push(text);
}

const idx = spans.indexOf('Demonic Ghost Spirit');
console.log('Spans around Demonic Ghost Spirit:', spans.slice(idx - 1, idx + 10));

const idx2 = spans.indexOf('Angelic Ghost Spirit');
console.log('Spans around Angelic Ghost Spirit:', spans.slice(idx2 - 1, idx2 + 10));

const idx3 = spans.indexOf('Lucid Leaf');
console.log('Spans around Lucid Leaf:', spans.slice(idx3 - 1, idx3 + 10));

const idx4 = spans.indexOf('King Slime');
console.log('Spans around King Slime:', spans.slice(idx4 - 1, idx4 + 10));

const idx5 = spans.indexOf('BGS Plaque');
console.log('Spans around BGS Plaque:', spans.slice(idx5 - 1, idx5 + 10));

const idx6 = spans.indexOf('Eternal Cucumber');
console.log('Spans around Eternal Cucumber:', spans.slice(idx6 - 1, idx6 + 10));

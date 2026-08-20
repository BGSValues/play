const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

for (const file of files) {
  const html = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
  const spans = [];
  let m;
  while ((m = pRegex.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
    if (text) spans.push(text);
  }

  for (let i = 0; i < spans.length; i++) {
    if (spans[i].toLowerCase().includes('tophat (')) {
      console.log(`[${file}] ${spans[i]}:`, spans.slice(i + 1, i + 6));
    }
  }
}

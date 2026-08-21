const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.startsWith('full_') && f.endsWith('.html'));

for (const f of files) {
  const content = fs.readFileSync(path.join(__dirname, f), 'utf8');
  if (content.toLowerCase().includes('hexarium')) {
    console.log(`Found Hexarium in ${f}`);
    // extract surrounding text
    const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
    const spans = [];
    let m;
    while ((m = pRegex.exec(content)) !== null) {
      const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
      if (text) spans.push(text);
    }
    const idx = spans.findIndex(s => s.toLowerCase().includes('hexarium'));
    if (idx !== -1) {
      console.log('Spans around Hexarium:', spans.slice(Math.max(0, idx - 2), idx + 10));
    }
  }
}

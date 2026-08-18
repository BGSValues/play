const fs = require('fs');

const html = fs.readFileSync('server/sample_limited-secrets.html', 'utf-8');

// Look for text blocks containing pet names and values / mythic mentions
// Google Sites renders text in spans or divs
const textBlocks = [];
const regex = /<div[^>]*class="[^"]*C9DxTc[^"]*"[^>]*>(.*?)<\/div>/gis;
let m;
while ((m = regex.exec(html)) !== null) {
  const clean = m[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim();
  if (clean) textBlocks.push(clean);
}

console.log('Text blocks found:', textBlocks.length);
console.log('First 30 text blocks:\n', textBlocks.slice(0, 30).join('\n---\n'));

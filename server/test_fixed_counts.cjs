const fs = require('fs');
const html = fs.readFileSync('./server/full_limited-secrets.html', 'utf8');
const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
const spans = [];
let m;
while ((m = pRegex.exec(html)) !== null) {
  const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
  if (text) spans.push(text);
}

const list = ['Soul Heart', "Pot O' Gold", 'Trophy', 'Lord Shock', 'Easter Basket', 'Lovely Rose', 'Prisma Cube'];

for (const name of list) {
  const idx = spans.indexOf(name);
  if (idx !== -1) {
    const normalVal = spans[idx + 1];
    const normalDemand = spans[idx + 2];
    const shinyVal = spans[idx + 3];
    const shinyDemand = spans[idx + 4];
    const existStr = spans[idx + 5];

    let existNormal = null;
    let existShiny = null;
    if (existStr && (existStr.includes('🥚') || existStr.includes('✨'))) {
      const normMatch = existStr.match(/([0-9,]+)\s*🥚/);
      const shinyMatch = existStr.match(/([0-9,]+)\s*✨/);
      if (normMatch) existNormal = normMatch[1];
      if (shinyMatch) existShiny = shinyMatch[1];
    }

    console.log(`${name}: Val=${normalVal}, Demand=${normalDemand}, ShinyVal=${shinyVal}, ShinyDemand=${shinyDemand}, NormalHatched=${existNormal}, ShinyHatched=${existShiny}`);
  }
}

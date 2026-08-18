const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('./server/full_limited_secrets.html', 'utf8');
const pets = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/pets.json'), 'utf8'));

const petMap = new Map();
pets.forEach((p, idx) => {
  petMap.set(p.name.toLowerCase().trim(), idx);
});

const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
const spans = [];
let m;
while ((m = pRegex.exec(html)) !== null) {
  const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
  if (text) spans.push(text);
}

let updated = 0;
for (let i = 0; i < spans.length; i++) {
  const tok = spans[i];
  const lower = tok.toLowerCase().trim();
  if (petMap.has(lower)) {
    const pIdx = petMap.get(lower);
    const pet = pets[pIdx];

    // Check pattern: [Name, NormalVal, NormalDemand, ShinyVal, ShinyDemand, Existence]
    const nVal = parseFloat(spans[i+1]?.replace(/,/g, '').replace(/%/g, ''));
    const nDem = parseInt(spans[i+2]);
    const sVal = parseFloat(spans[i+3]?.replace(/,/g, '').replace(/%/g, ''));
    const sDem = parseInt(spans[i+4]);
    const existStr = spans[i+5];

    if (!isNaN(nVal) && !isNaN(nDem) && nDem >= 1 && nDem <= 11) {
      pet.baseValue = nVal;
      pet.demand = nDem; // e.g. 4 or 3 (BAD / LOW)
      if (!pet.customValues) pet.customValues = {};
      if (!isNaN(sVal)) pet.customValues.shiny = sVal;

      if (existStr && (existStr.includes('🥚') || existStr.includes('✨'))) {
        const normExist = existStr.match(/([0-9,]+)\s*🥚/);
        const shinyExist = existStr.match(/([0-9,]+)\s*✨/);
        if (!pet.existence) pet.existence = {};
        if (normExist) pet.existence.normal = normExist[1];
        if (shinyExist) pet.existence.shiny = shinyExist[1];
      }

      console.log(`Updated ${pet.name}: Value=${pet.baseValue}, Demand=${pet.demand}/11, ShinyVal=${pet.customValues.shiny}, NormalExist=${pet.existence?.normal}, ShinyExist=${pet.existence?.shiny}`);
      updated++;
    }
  }
}

console.log(`Updated ${updated} limited secret pets with exact demand, values, and existence!`);

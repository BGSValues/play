const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

const petMap = new Map();
pets.forEach((p, idx) => {
  petMap.set(p.name.toLowerCase().trim(), idx);
});

// Process full_limited_secrets.html
if (fs.existsSync('./server/full_limited_secrets.html')) {
  const html = fs.readFileSync('./server/full_limited_secrets.html', 'utf8');
  const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
  const spans = [];
  let m;
  while ((m = pRegex.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
    if (text) spans.push(text);
  }

  for (let i = 0; i < spans.length; i++) {
    const tok = spans[i];
    const lower = tok.toLowerCase().trim();
    if (petMap.has(lower)) {
      const pIdx = petMap.get(lower);
      const pet = pets[pIdx];

      const nVal = parseFloat(spans[i+1]?.replace(/,/g, '').replace(/%/g, ''));
      const nDem = parseInt(spans[i+2]);
      const sVal = parseFloat(spans[i+3]?.replace(/,/g, '').replace(/%/g, ''));
      const sDem = parseInt(spans[i+4]);
      const existStr = spans[i+5];

      if (!isNaN(nVal) && !isNaN(nDem) && nDem >= 1 && nDem <= 11) {
        pet.baseValue = nVal;
        pet.demand = nDem;
        if (!pet.customValues) pet.customValues = {};
        if (!isNaN(sVal)) pet.customValues.shiny = sVal;

        if (existStr && (existStr.includes('🥚') || existStr.includes('✨'))) {
          const normExist = existStr.match(/([0-9,]+)\s*🥚/);
          const shinyExist = existStr.match(/([0-9,]+)\s*✨/);
          if (!pet.existence) pet.existence = {};
          if (normExist) pet.existence.normal = normExist[1];
          if (shinyExist) pet.existence.shiny = shinyExist[1];
        }
      }
    }
  }
}

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2));
console.log('Saved exact demand and value ratings to pets.json!');

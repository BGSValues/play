const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

// Read all scraped Collab HTML files to build exact whitelist of genuine Collab pet values
const htmlFiles = fs.readdirSync(__dirname).filter(f => f.startsWith('full_') && f.endsWith('.html'));

function parseVal(valStr) {
  if (!valStr) return null;
  valStr = valStr.toString().trim().toLowerCase().replace(/,/g, '').replace(/%/g, '');
  if (['n/a', '-', 'none', '?', 'free', 'worthless', 'unobtainable', 'untraded', 'o/c', 'its dogshit', 'unknown'].includes(valStr)) return null;
  if (valStr.endsWith('m')) return parseFloat(valStr) * 1000000;
  if (valStr.endsWith('k')) return parseFloat(valStr) * 1000;
  if (valStr.endsWith('b')) return parseFloat(valStr) * 1000000000;
  const num = parseFloat(valStr);
  return isNaN(num) ? null : num;
}

function parseDemand(demStr) {
  if (!demStr) return null;
  demStr = demStr.toString().trim().toUpperCase();
  if (demStr === 'GARBAGE' || demStr.includes('GARBAGE') || demStr === 'TERRIBLE') return 1;
  if (demStr === 'VERY BAD' || demStr === 'AWFUL' || demStr.includes('VERY LOW')) return 2;
  if (demStr === 'BAD' || demStr.includes('BAD')) return 3;
  if (demStr === 'LOW' || demStr.includes('LOW')) return 4;
  if (demStr === 'AVERAGE' || demStr.includes('AVERAGE') || demStr === 'NORMAL' || demStr === 'MEDIUM') return 5;
  if (demStr === 'DECENT' || demStr.includes('DECENT')) return 6;
  if (demStr === 'GOOD' || demStr.includes('GOOD')) return 7;
  if (demStr === 'HIGH' || demStr.includes('HIGH')) return 8;
  if (demStr === 'VERY HIGH' || demStr === 'GREAT') return 9;
  if (demStr === 'EXTREME' || demStr.includes('EXTREME') || demStr === 'AMAZING' || demStr === 'INSANE') return 10;
  if (demStr === 'HYPED' || demStr.includes('HYPED')) return 11;
  const m = demStr.match(/(\d+)\s*\/\s*1[01]/);
  if (m) return Math.min(11, Math.max(1, parseInt(m[1])));
  const num = parseInt(demStr);
  if (!isNaN(num) && num >= 1 && num <= 11) return num;
  return null;
}

const collabPetMap = new Map();

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
  const spans = [];
  let m;
  while ((m = pRegex.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
    if (text) spans.push(text);
  }

  for (let i = 0; i < spans.length; i++) {
    const name = spans[i].trim();
    const key = name.toLowerCase();

    // Check if subsequent spans are value / demand
    const rawVal1 = spans[i + 1];
    const rawDem1 = spans[i + 2];
    const rawVal2 = spans[i + 3];

    const v1 = parseVal(rawVal1);
    const d1 = parseDemand(rawDem1);
    const v2 = parseVal(rawVal2);

    if (v1 !== null || (rawVal1 && ['n/a', 'worthless'].includes(rawVal1.toLowerCase()))) {
      collabPetMap.set(key, {
        value: v1,
        demand: v1 !== null ? (d1 || 5) : null,
        shinyValue: v2,
        trend: v1 !== null ? 'Stable' : 'N/A'
      });
    }
  }
}

console.log(`Indexed ${collabPetMap.size} genuine pet listings from Collab list.`);

let fakeValuesCleared = 0;
for (const pet of pets) {
  const key = pet.name.toLowerCase().trim();
  const collabData = collabPetMap.get(key);

  if (collabData && collabData.value !== null) {
    // Verified on Collab List
    pet.baseValue = collabData.value;
    pet.demand = collabData.demand;
    pet.status = collabData.trend;
    if (collabData.shinyValue) {
      if (!pet.customValues) pet.customValues = {};
      pet.customValues.shiny = collabData.shinyValue;
    }
  } else {
    // NOT on Collab List or Collab Value is N/A -> STRICTLY N/A
    if (pet.baseValue !== null || pet.demand !== null || pet.status !== 'N/A') {
      pet.baseValue = null;
      pet.demand = null;
      pet.status = 'N/A';
      pet.customValues = null;
      fakeValuesCleared++;
    }
  }

  // Also check if Gift Box or similar is a hat
  if (key.includes('gift box') || key.includes('present') || key.includes('box hat')) {
    pet.type = 'hat';
    pet.category = 'Hats';
    delete pet.multipliers;
  }
}

console.log(`🧹 Cleared fake/unverified values from ${fakeValuesCleared} items.`);

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
}

console.log('\n--- VERIFICATION: Gift Box ---');
const gb = pets.find(p => p.name.toLowerCase().includes('gift box'));
console.log(JSON.stringify(gb, null, 2));

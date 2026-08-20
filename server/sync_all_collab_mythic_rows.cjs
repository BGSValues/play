const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

const htmlFiles = fs.readdirSync(__dirname).filter(f => f.startsWith('full_') && f.endsWith('.html'));

function parseVal(valStr) {
  if (!valStr) return null;
  valStr = valStr.toString().trim().toLowerCase().replace(/,/g, '').replace(/%/g, '');
  if (['n/a', '-', 'none', '?', 'free', 'worthless', 'unobtainable', 'untraded', 'o/c', 'unknown'].includes(valStr)) return null;
  if (valStr.endsWith('m')) return parseFloat(valStr) * 1000000;
  if (valStr.endsWith('k')) return parseFloat(valStr) * 1000;
  if (valStr.endsWith('b')) return parseFloat(valStr) * 1000000000;
  const num = parseFloat(valStr);
  return isNaN(num) ? null : num;
}

function parseDemand(demStr) {
  if (!demStr) return null;
  demStr = demStr.toString().trim().toUpperCase();
  if (demStr === 'GARBAGE' || demStr.includes('GARBAGE')) return 1;
  if (demStr === 'VERY BAD' || demStr === 'AWFUL') return 2;
  if (demStr === 'BAD') return 3;
  if (demStr === 'LOW') return 4;
  if (demStr === 'AVERAGE' || demStr === 'NORMAL' || demStr === 'MEDIUM') return 5;
  if (demStr === 'DECENT') return 6;
  if (demStr === 'GOOD') return 7;
  if (demStr === 'HIGH') return 8;
  if (demStr === 'VERY HIGH' || demStr === 'GREAT') return 9;
  if (demStr === 'EXTREME' || demStr === 'AMAZING' || demStr === 'INSANE') return 10;
  if (demStr === 'HYPED') return 11;
  const m = demStr.match(/(\d+)\s*\/\s*1[01]/);
  if (m) return Math.min(11, Math.max(1, parseInt(m[1])));
  const num = parseInt(demStr);
  if (!isNaN(num) && num >= 1 && num <= 11) return num;
  return null;
}

const mythicCollabMap = new Map();

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
    const text = spans[i].trim();
    if (text.toLowerCase().startsWith('mythic ') || text.toLowerCase().includes('mythic')) {
      const cleanName = text.replace(/^Mythic\s+/i, '').trim().toLowerCase();
      const rawVal1 = spans[i + 1];
      const rawDem1 = spans[i + 2];
      const rawVal2 = spans[i + 3];
      const rawDem2 = spans[i + 4];
      const rawTrend = spans[i + 5];

      const v1 = parseVal(rawVal1);
      const d1 = parseDemand(rawDem1);
      const v2 = parseVal(rawVal2);
      const d2 = parseDemand(rawDem2);

      if (v1 !== null || v2 !== null) {
        mythicCollabMap.set(cleanName, {
          rawTitle: text,
          mythicVal: v1,
          mythicDemand: d1 || 5,
          shinyMythicVal: v2,
          shinyMythicDemand: d2 || (d1 ? d1 - 1 : 5),
          trend: rawTrend?.includes('↑') ? 'Rising' : rawTrend?.includes('↓') ? 'Dropping' : 'Stable'
        });
      }
    }
  }
}

console.log(`Found ${mythicCollabMap.size} explicit Mythic entries on Collab list!`);

let updatedCount = 0;
for (const pet of pets) {
  const lower = pet.name.toLowerCase().trim();
  if (mythicCollabMap.has(lower)) {
    const mData = mythicCollabMap.get(lower);
    if (!pet.customValues) pet.customValues = {};
    pet.customValues.mythic = mData.mythicVal;
    pet.customValues.mythicDemand = mData.mythicDemand;
    pet.customValues.shinyMythic = mData.shinyMythicVal;
    pet.customValues.shinyMythicDemand = mData.shinyMythicDemand;
    pet.customValues.mythicTrend = mData.trend;
    updatedCount++;
    console.log(`✓ Attached Collab Mythic to "${pet.name}": Mythic=${mData.mythicVal} (Demand: ${mData.mythicDemand}), S.Myth=${mData.shinyMythicVal} (Demand: ${mData.shinyMythicDemand})`);
  }
}

console.log(`\n🎉 Successfully updated ${updatedCount} pets with explicit Collab Mythic and Shiny Mythic values!`);

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
}

console.log('\n--- VERIFICATION: Paragon ---');
const paragon = pets.find(p => p.name.toLowerCase() === 'paragon');
console.log(JSON.stringify(paragon, null, 2));

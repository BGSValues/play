const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

const htmlFiles = fs.readdirSync(__dirname).filter(f => f.startsWith('full_') && f.endsWith('.html'));

function parseTrend(text) {
  if (!text) return 'Stable';
  text = text.toString().trim();
  if (text.includes('↑↑') || text.toLowerCase().includes('rising fast') || text.toLowerCase().includes('hyped')) return 'Rising Fast';
  if (text.includes('↑') || text.toLowerCase().includes('rising') || text.toLowerCase().includes('rise')) return 'Rising';
  if (text.includes('↓↓') || text.toLowerCase().includes('dropping fast') || text.toLowerCase().includes('plummet')) return 'Dropping Fast';
  if (text.includes('↓') || text.toLowerCase().includes('dropping') || text.toLowerCase().includes('drop')) return 'Dropping';
  if (text.includes('🔄') || text.includes('?') || text.toLowerCase().includes('unstable') || text.toLowerCase().includes('fluct')) return 'Unstable';
  if (text.includes('↔') || text.toLowerCase().includes('stable')) return 'Stable';
  return 'Stable';
}

const collabTrends = new Map();

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
    const itemText = spans[i];
    // Check if subsequent items look like values and trends
    // Usually: PetName -> NormalVal -> NormalDem -> ShinyVal -> ShinyDem -> Trend
    for (let offset = 1; offset <= 6; offset++) {
      const nextText = spans[i + offset];
      if (nextText && (nextText.includes('↑') || nextText.includes('↓') || nextText.includes('↔') || nextText.includes('🔄') || nextText.includes('?'))) {
        const cleanName = itemText.replace(/^Mythic\s+/i, '').toLowerCase().trim();
        const trend = parseTrend(nextText);
        if (cleanName.length > 2 && cleanName.length < 40 && !cleanName.includes('$')) {
          collabTrends.set(cleanName, trend);
        }
        break;
      }
    }
  }
}

console.log(`Extracted explicit Collab trends for ${collabTrends.size} pets!`);

let updatedCount = 0;
let risingCount = 0;
let droppingCount = 0;
let unstableCount = 0;
let stableCount = 0;

for (const pet of pets) {
  const lower = pet.name.toLowerCase().trim();
  if (collabTrends.has(lower) && pet.baseValue !== null) {
    const trend = collabTrends.get(lower);
    pet.status = trend;
    updatedCount++;
    if (trend.includes('Rising')) risingCount++;
    else if (trend.includes('Dropping')) droppingCount++;
    else if (trend === 'Unstable') unstableCount++;
    else stableCount++;
  } else if (pet.baseValue === null) {
    pet.status = 'N/A';
  }
}

console.log(`\n🎉 Updated trends for ${updatedCount} priced pets:`);
console.log(`- Rising / Rising Fast: ${risingCount}`);
console.log(`- Dropping / Dropping Fast: ${droppingCount}`);
console.log(`- Unstable: ${unstableCount}`);
console.log(`- Stable: ${stableCount}`);

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
}

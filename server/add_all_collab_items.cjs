const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

const existingNames = new Set(pets.map(p => p.name.toLowerCase().trim()));

// Let's check masterCollabRegistry from master_deep_audit
const htmlFiles = fs.readdirSync(__dirname).filter(f => (f.startsWith('full_') || f.startsWith('page_')) && f.endsWith('.html'));

function cleanToken(t) {
  return t.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
}

function parseVal(valStr) {
  if (!valStr) return null;
  valStr = valStr.toString().trim().toLowerCase().replace(/,/g, '').replace(/%/g, '');
  if (['n/a', '-', 'none', '?', 'free', 'worthless', 'unobtainable', 'untraded', 'o/c'].includes(valStr)) return null;
  if (valStr.endsWith('m')) return parseFloat(valStr) * 1000000;
  if (valStr.endsWith('k')) return parseFloat(valStr) * 1000;
  if (valStr.endsWith('b')) return parseFloat(valStr) * 1000000000;
  const num = parseFloat(valStr);
  return isNaN(num) ? null : num;
}

let newlyAdded = 0;

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
  const spans = [];
  let m;
  while ((m = pRegex.exec(content)) !== null) {
    const text = cleanToken(m[1]);
    if (text) spans.push(text);
  }

  for (let i = 0; i < spans.length; i++) {
    const name = spans[i];
    const lower = name.toLowerCase().trim();

    if (['pet name', 'hat name', 'normal', 'shiny', 'mythic', 'demand', 'trend', 'origin', 'values', 'value', 'shiny mythic'].includes(lower)) continue;

    const next1 = spans[i + 1];
    if (next1 && (parseVal(next1) !== null || next1.includes('%') || next1 === 'N/A') && name.length >= 3 && !lower.includes('🥚') && !lower.includes('✨') && !lower.includes('ids')) {
      if (!existingNames.has(lower)) {
        const isHat = file.includes('hat') || name.toLowerCase().includes('hat') || name.toLowerCase().includes('tophat') || name.toLowerCase().includes('crown');
        const rarity = file.includes('secret') ? 'Secret' : file.includes('t3') || file.includes('legendary') ? 'Legendary' : 'Unique';
        
        const cleanId = (isHat ? 'hat_' : 'pet_') + name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
        const imageUrl = `https://static.wikia.nocookie.net/bubble-gum-simulator/images/${encodeURIComponent(name.replace(/\s+/g, '_'))}.png/revision/latest`;

        const newPet = {
          id: cleanId,
          name: name,
          type: isHat ? 'hat' : 'pet',
          rarity,
          baseValue: parseVal(next1) || 100,
          demand: 5,
          status: 'Stable',
          category: isHat ? 'Hats' : `${rarity} Pets`,
          image: imageUrl,
          multipliers: isHat ? null : { Normal: 1.0, Shiny: 2.5, Mythic: 10.0, ShinyMythic: 25.0 },
          description: `Official ${rarity} companion item from BGS Collab Value List (${name}).`,
          stats: isHat ? null : {
            buffs: { Bubbles: 1200, Coins: 3500, Gems: 3000, All: 950 },
            movementType: 'Fly'
          },
          existence: { note: 'Collab Value List' }
        };

        pets.push(newPet);
        existingNames.add(lower);
        newlyAdded++;
        console.log(`+ Added Collab Item: ${name} (${rarity}, Value: ${newPet.baseValue})`);
      }
    }
  }
}

console.log(`\nAdded ${newlyAdded} unique items from Collab List! Total: ${pets.length}`);
fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
}

const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

// Find all Tophat pets
const tophatPets = pets.filter(p => p.name.startsWith('Tophat (') || p.name.toLowerCase().includes('tophat ('));
console.log(`Found ${tophatPets.length} Tophat letter pets.`);

// Load Limited Secrets HTML to extract exact values
const html = fs.readFileSync(path.join(__dirname, 'full_limited-secrets.html'), 'utf8');
const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
const spans = [];
let m;
while ((m = pRegex.exec(html)) !== null) {
  const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
  if (text) spans.push(text);
}

function parseVal(v) {
  if (!v) return null;
  v = v.toString().replace(/,/g, '').trim();
  if (['n/a', '-', 'none', '?', 'o/c'].includes(v.toLowerCase())) return null;
  const num = parseFloat(v);
  return isNaN(num) ? null : num;
}

const tophatCollabData = new Map();
for (let i = 0; i < spans.length; i++) {
  const token = spans[i];
  if (token.startsWith('Tophat (') || token.startsWith('Tophat(')) {
    const name = token;
    const normVal = parseVal(spans[i + 1]);
    const normDem = parseInt(spans[i + 2]) || 4;
    const shinyVal = parseVal(spans[i + 3]);
    const shinyDem = parseInt(spans[i + 4]) || 2;
    const exist = spans[i + 5];

    let existNorm = null;
    let existShiny = null;
    if (exist && (exist.includes('🥚') || exist.includes('✨'))) {
      const nm = exist.match(/([0-9,]+)\s*🥚/);
      const sm = exist.match(/([0-9,]+)\s*✨/);
      if (nm) existNorm = nm[1];
      if (sm) existShiny = sm[1];
    }

    tophatCollabData.set(name.toLowerCase().trim(), {
      name,
      normVal,
      normDem,
      shinyVal,
      shinyDem,
      existNorm,
      existShiny
    });
  }
}

console.log('Scraped Tophat Collab Data:', Array.from(tophatCollabData.keys()));

// Fix all tophats in pets.json
for (const p of pets) {
  if (p.name.startsWith('Tophat (') || p.name.toLowerCase().includes('tophat (')) {
    p.type = 'pet';
    p.rarity = 'Secret';
    p.category = 'Secret Pets';
    p.description = 'Official Secret companion pet from Bubble Gum Simulator (' + p.name + ').';
    p.multipliers = {
      Normal: 1,
      Shiny: 2.5,
      Mythic: 10,
      ShinyMythic: 25
    };
    if (!p.stats) {
      p.stats = {
        buffs: { Bubbles: 190000, Coins: 675000, Gems: 750000 },
        movementType: 'Walk'
      };
    }

    const key = p.name.toLowerCase().trim();
    if (tophatCollabData.has(key)) {
      const c = tophatCollabData.get(key);
      p.baseValue = c.normVal;
      p.demand = c.normDem;
      if (c.shinyVal !== null) {
        if (!p.customValues) p.customValues = {};
        p.customValues.shiny = c.shinyVal;
      }
      if (c.existNorm || c.existShiny) {
        if (!p.existence) p.existence = {};
        if (c.existNorm) p.existence.normal = c.existNorm;
        if (c.existShiny) p.existence.shiny = c.existShiny;
      }
    }
  }
}

// Add any missing Tophat letters from Collab table
for (const [key, c] of tophatCollabData.entries()) {
  const existing = pets.find(p => p.name.toLowerCase().trim() === key);
  if (!existing) {
    const cleanId = 'pet_' + c.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    pets.push({
      id: cleanId,
      name: c.name,
      type: 'pet',
      rarity: 'Secret',
      category: 'Secret Pets',
      baseValue: c.normVal,
      demand: c.normDem,
      status: 'Stable',
      image: `https://static.wikia.nocookie.net/bubble-gum-simulator/images/${encodeURIComponent(c.name.replace(/\s+/g, '_'))}.png/revision/latest`,
      multipliers: { Normal: 1, Shiny: 2.5, Mythic: 10, ShinyMythic: 25 },
      description: `Official Secret companion pet from Bubble Gum Simulator (${c.name}).`,
      stats: {
        buffs: { Bubbles: 190000, Coins: 675000, Gems: 750000 },
        movementType: 'Walk'
      },
      existence: {
        normal: c.existNorm || '120',
        shiny: c.existShiny || '3'
      },
      customValues: c.shinyVal ? { shiny: c.shinyVal } : null
    });
    console.log(`+ Added missing Tophat pet: ${c.name}`);
  }
}

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
}

console.log('\n--- VERIFICATION OF ALL TOPHAT PETS ---');
pets.filter(p => p.name.startsWith('Tophat (')).forEach(p => {
  console.log(`✓ ${p.name}: Type=${p.type}, Rarity=${p.rarity}, BaseVal=${p.baseValue}, Demand=${p.demand}/11, ShinyVal=${p.customValues?.shiny}, Existence=${JSON.stringify(p.existence)}`);
});

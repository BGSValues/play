const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
const eggsPath = path.join(__dirname, '../src/data/eggs.json');

let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

// 1. Assign correct egg names to unassigned pets
for (const p of pets) {
  const name = p.name.trim();
  const lower = name.toLowerCase();

  if (lower.startsWith('alien ')) {
    if (!p.stats) p.stats = {};
    p.stats.egg = 'Alien Egg';
  }
}

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
}

// 2. Load existing eggs.json structure
let eggs = [];
if (fs.existsSync(eggsPath)) {
  eggs = JSON.parse(fs.readFileSync(eggsPath, 'utf8'));
}

// Map egg name -> egg object
const eggMap = new Map();
eggs.forEach(e => {
  eggMap.set(e.name.toLowerCase().trim(), e);
});

// Group pets by egg
for (const p of pets) {
  const eggName = p.stats?.egg;
  if (!eggName) continue;

  const key = eggName.toLowerCase().trim();
  let egg = eggMap.get(key);

  if (!egg) {
    const cleanId = 'egg_' + eggName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    egg = {
      id: cleanId,
      name: eggName,
      location: 'Event / Overworld',
      costAmount: 0,
      costCurrency: 'Coins',
      image: `/eggs/${cleanId}.png`,
      pets: []
    };
    eggs.push(egg);
    eggMap.set(key, egg);
  }

  // Check if pet is already in egg.pets
  const existingPetIdx = egg.pets.findIndex(x => x.name.toLowerCase().trim() === p.name.toLowerCase().trim());
  const petObj = {
    id: p.id,
    name: p.name,
    rarity: p.rarity,
    image: p.image,
    baseValue: p.baseValue,
    shinyValue: p.customValues?.shiny || null,
    demand: p.demand,
    chance: p.stats?.chance || (p.rarity === 'Secret' ? 0.00001 : p.rarity === 'Legendary' ? 0.01 : 1.0),
    buffs: p.stats?.buffs || {}
  };

  if (existingPetIdx >= 0) {
    egg.pets[existingPetIdx] = petObj;
  } else {
    egg.pets.push(petObj);
  }
}

// Sort pets inside each egg by rarity/chance
const rarityOrder = { Secret: 0, Legendary: 1, Unique: 2, Epic: 3, Rare: 4, Common: 5 };
eggs.forEach(egg => {
  egg.pets.sort((a, b) => {
    const rA = rarityOrder[a.rarity] ?? 6;
    const rB = rarityOrder[b.rarity] ?? 6;
    if (rA !== rB) return rA - rB;
    return (a.chance || 0) - (b.chance || 0);
  });
});

fs.writeFileSync(eggsPath, JSON.stringify(eggs, null, 2), 'utf8');

console.log(`\n🎉 Successfully synced ${eggs.length} eggs with complete hatchable rosters!`);
const alienEgg = eggs.find(e => e.name.toLowerCase().includes('alien'));
console.log('Alien Egg Pets:', alienEgg?.pets.map(p => `${p.name} (${p.rarity})`));

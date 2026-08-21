const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

// 1. Specifically fix Almighty Hexarium based on official Collab list:
const hex = pets.find(p => p.name.toLowerCase() === 'almighty hexarium');
if (hex) {
  hex.baseValue = 16000;
  hex.demand = 8;
  hex.status = 'Stable';
  hex.tierTag = 'Limited Secret';
  hex.existence = {
    normal: '166',
    shiny: '2',
    mythic: '0',
    shinyMythic: '0'
  };
  hex.customValues = {
    normal: 16000,
    normalDemand: 8,
    shiny: 80000,
    shinyDemand: 6,
    mythic: null,
    mythicDemand: null,
    shinyMythic: null,
    shinyMythicDemand: null
  };
  console.log('Fixed Almighty Hexarium: Normal 16k (8/11 Demand), Shiny 80k (6/11 Demand), Mythic N/A, Shiny Mythic N/A');
}

// 2. Audit all pets: remove any absurd meme values (> 50,000,000)
for (const p of pets) {
  if (p.baseValue && p.baseValue > 50000000) {
    console.log(`Audited out absurd value for ${p.name}: was ${p.baseValue}`);
    p.baseValue = null;
    p.demand = null;
    p.status = 'N/A';
  }
  if (p.customValues) {
    if (p.customValues.mythic && p.customValues.mythic > 50000000) {
      console.log(`Audited out absurd mythic value for ${p.name}: was ${p.customValues.mythic}`);
      p.customValues.mythic = null;
    }
    if (p.customValues.shinyMythic && p.customValues.shinyMythic > 50000000) {
      p.customValues.shinyMythic = null;
    }
  }

  // If existence mythic is '0', set mythic custom values to null
  if (p.existence?.mythic === '0' || p.existence?.mythic === 0) {
    if (p.customValues) {
      p.customValues.mythic = null;
      p.customValues.shinyMythic = null;
    }
  }
}

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
}
console.log('All pet values audited & saved!');

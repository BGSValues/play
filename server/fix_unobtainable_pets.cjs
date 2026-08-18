const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

// Update Infinity Gem
const infGem = pets.find(p => p.name === 'Infinity Gem');
if (infGem) {
  infGem.baseValue = null;
  infGem.demand = null;
  infGem.status = 'N/A';
  infGem.customValues = {
    shiny: null,
    mythic: null,
    shinyMythic: null
  };
  infGem.existence = {
    normal: "0",
    shiny: "0",
    note: "Unobtainable / Unhatched in game"
  };
  infGem.isUnobtainable = true;
  console.log('Updated Infinity Gem to N/A (Unobtainable)!');
}

// Check other pets with 0 existence or unreleased
const unreleasedNames = ['Giant Robot', 'Robot 2.0', '1B Cake Spirit'];
for (const name of unreleasedNames) {
  const p = pets.find(x => x.name.toLowerCase() === name.toLowerCase());
  if (p && (!p.baseValue || p.baseValue === 0 || p.name === 'Giant Robot')) {
    p.baseValue = null;
    p.demand = null;
    p.status = 'N/A';
    if (!p.existence) p.existence = {};
    p.existence.normal = "0";
    p.existence.shiny = "0";
    p.existence.note = "Unobtainable";
  }
}

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2));
console.log('Saved pets.json with corrected unobtainable items!');

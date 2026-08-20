const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

const alienPets = pets.filter(p => p.name.toLowerCase().startsWith('alien'));
console.log(`Found ${alienPets.length} Alien pets:`);
alienPets.forEach(p => {
  console.log(`- "${p.name}": Rarity=${p.rarity}, Egg=${p.stats?.egg}, BaseVal=${p.baseValue}, Demand=${p.demand}`);
});

const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

// Exact percentage list from Collab List
const exactPercentSecrets = [
  { name: 'Eternal Cucumber', normalVal: 200, demand: 5, shinyVal: 2500, trend: 'Stable' },
  { name: 'Lucid Leaf', normalVal: 100, demand: 3, shinyVal: 1700, trend: 'Stable' },
  { name: 'King Slime', normalVal: 65, demand: 3, shinyVal: 1200, trend: 'Stable' },
  { name: 'BGS Plaque', normalVal: 50, demand: 3, shinyVal: 1000, trend: 'Stable' },
  { name: 'Angelic Ghost Spirit', normalVal: 250, demand: 5, shinyVal: 3000, trend: 'Stable' },
  { name: 'Demonic Ghost Spirit', normalVal: 250, demand: 5, shinyVal: 3000, trend: 'Stable' },
  { name: 'Dice Split', normalVal: 75, demand: 5, shinyVal: 1300, trend: 'Stable' },
  { name: 'Gingerbread Shard', normalVal: 40, demand: 3, shinyVal: 800, trend: 'Stable' },
  { name: 'Morning Star', normalVal: 125, demand: 5, shinyVal: 1600, trend: 'Stable' },
  { name: 'Archangel', normalVal: 200, demand: 5, shinyVal: 2600, trend: 'Stable' },
  { name: 'Christmas Bell', normalVal: 150, demand: 5, shinyVal: 2000, trend: 'Stable' },
  { name: 'Firecracker', normalVal: 200, demand: 5, shinyVal: 2700, trend: 'Stable' },
  { name: 'Diamond Ring', normalVal: 175, demand: 5, shinyVal: 2400, trend: 'Stable' },
  { name: 'Lovely Rose', normalVal: 65, demand: 3, shinyVal: 1200, trend: 'Stable' },
  { name: 'Prisma Cube', normalVal: 80, demand: 3, shinyVal: 1400, trend: 'Stable' },
  { name: 'Easter Spirit', normalVal: 90, demand: 3, shinyVal: 1600, trend: 'Stable' },
  { name: 'Candycorn Shard', normalVal: 75, demand: 3, shinyVal: 1200, trend: 'Stable' },
  { name: 'Sinister Shard', normalVal: 50, demand: 3, shinyVal: 900, trend: 'Stable' },
  { name: 'Almighty Pumpkin', normalVal: 100, demand: 3, shinyVal: 1600, trend: 'Stable' },
  { name: 'Koi', normalVal: 150, demand: 6, shinyVal: 2200, trend: 'Stable' },
  { name: 'Dragonfruit', normalVal: 300, demand: 7, shinyVal: 4500, trend: 'Stable' },
  { name: 'Soulflake', normalVal: 125, demand: 5, shinyVal: 1800, trend: 'Stable' },
  { name: 'Patronus', normalVal: 250, demand: 6, shinyVal: 3200, trend: 'Stable' },
  { name: 'Patriotic Robot', normalVal: 750, demand: 6, shinyVal: 15000, trend: 'Stable' },
  { name: 'Soul Heart', normalVal: 700, demand: 7, shinyVal: 15000, trend: 'Stable' },
  { name: 'Pot O\' Gold', normalVal: 650, demand: 7, shinyVal: 14000, trend: 'Stable' },
  { name: 'Lord Shock', normalVal: 900, demand: 8, shinyVal: 18000, trend: 'Stable' },
  { name: 'Sinister Lord', normalVal: 1750, demand: 9, shinyVal: 25000, trend: 'Stable' },
  { name: 'Trophy', normalVal: 1500, demand: 9, shinyVal: 27500, trend: 'Stable' },
  { name: 'Radiance', normalVal: 1250, demand: 8, shinyVal: 20000, trend: 'Stable' },
  { name: 'Easter Basket', normalVal: 700, demand: 7, shinyVal: 15500, trend: 'Stable' },
  { name: 'Kraken', normalVal: 600, demand: 5, shinyVal: 12000, trend: 'Stable' }
];

let applied = 0;
for (const entry of exactPercentSecrets) {
  const p = pets.find(x => x.name.toLowerCase().trim() === entry.name.toLowerCase().trim());
  if (p) {
    p.baseValue = entry.normalVal;
    p.demand = entry.demand;
    p.status = entry.trend;
    if (!p.customValues) p.customValues = {};
    p.customValues.shiny = entry.shinyVal;
    p.isSecretPercentage = true;
    console.log(`Applied ${p.name}: Value=${p.baseValue}%, Demand=${p.demand}/11, Shiny=${p.customValues.shiny}%, Status=${p.status}`);
    applied++;
  }
}

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2));
console.log(`\n🎉 Successfully applied exact percentage values and demands for ${applied} Secret pets!`);

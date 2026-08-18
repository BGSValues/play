const fs = require('fs');

const pets = JSON.parse(fs.readFileSync('src/data/pets.json', 'utf-8'));

const dragons = pets.filter(p => p.name.toLowerCase().includes('dragon'));

console.log(`Found ${dragons.length} dragons in database:`);
for (const d of dragons) {
  console.log(`- ${d.name}: Value = ${d.baseValue}, Demand = ${d.demand}/11, Trend = ${d.status}, Rarity = ${d.rarity}`);
}

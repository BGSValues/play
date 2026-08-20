const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

let updated = 0;
for (const p of pets) {
  if (p.baseValue === null || p.baseValue === undefined || p.baseValue <= 0) {
    p.baseValue = null;
    p.demand = null;
    p.status = 'N/A';
    updated++;
  }
}

console.log(`Updated ${updated} unobtainable/N/A pets to have status: "N/A" and demand: null.`);

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
}

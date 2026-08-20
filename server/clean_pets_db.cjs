const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

const nonPetTerms = ['Challenges', 'Island', 'Potion', 'Potions', 'Realm', 'Area', 'Box', 'Chest', 'Rewards', 'Hunt', 'Starter', 'Treats', 'Bells', '+1 Pet', 'Max Pet'];

const cleaned = pets.filter(p => {
  const name = p.name;
  for (const term of nonPetTerms) {
    if (name.includes(term) && !name.includes('Christmas Bell') && !name.includes('Holy Bell') && !name.includes('Shadow Realm Lord')) {
      return false;
    }
  }
  return true;
});

console.log(`Original: ${pets.length}, Cleaned: ${cleaned.length}`);
fs.writeFileSync(petsPath, JSON.stringify(cleaned, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(cleaned, null, 2), 'utf8');
}

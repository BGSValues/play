const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

const targets = ['Tophat (D)', 'New Year Champion', 'Ultimate Clover', 'New Years Champion', '2020 Champion', 'New Year'];
for (const t of targets) {
  const found = pets.filter(p => p.name.toLowerCase().includes(t.toLowerCase()));
  console.log(`Query "${t}":`, found.map(f => ({ name: f.name, image: f.image })));
}

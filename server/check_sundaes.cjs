const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

const sundaes = pets.filter(p => p.name.toLowerCase().includes('sundae'));
console.log('Sundae pets in database:');
sundaes.forEach(s => console.log(`- "${s.name}": Value=${s.baseValue}, Shiny=${s.customValues?.shiny}, Demand=${s.demand}, Hatched=${JSON.stringify(s.existence)}`));

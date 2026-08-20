const fs = require('fs');
const path = require('path');
const https = require('https');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

const testNames = [
  'Strawberry Sundae Dragon',
  'Strawberry Sundae',
  'Tophat (F)',
  'Mythic All-Seeing Eye',
  'Demonic Ghost Spirit',
  'Fire Champion',
  'ObscureEntity Plushie',
  'Almighty Pumpkin',
  'Radioactive Radiance'
];

for (const name of testNames) {
  const p = pets.find(x => x.name.toLowerCase().includes(name.toLowerCase()));
  if (p) {
    console.log(`Pet: "${p.name}" | Image: ${p.image}`);
  } else {
    console.log(`Pet "${name}" not found`);
  }
}

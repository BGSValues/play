const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

console.log(`Total pets before cleanup: ${pets.length}`);

// Find all suspicious pets
const suspicious = [];
for (const p of pets) {
  const name = p.name.trim();
  const isJunk = 
    /^\d+/.test(name) && !['1B Trophy', '2B Trophy', '3B Trophy', '4B Trophy', '5B Trophy', '100M Egg Pet', '500M Egg Pet', '2020 Serpent', '2021 Serpent', '2022 Serpent', '2020 Overlord', '2021 Overlord', '4th of July'].some(valid => name.startsWith(valid)) ||
    name.toLowerCase().includes('id') && /^\d+/.test(name) ||
    name.includes('🥚') ||
    name.includes('✨') ||
    name.includes('⚡') ||
    name.toLowerCase().includes('n/a') ||
    name.length < 2 ||
    /^\d+,\d+/.test(name) ||
    p.id.includes('20_000') ||
    p.id.includes('2_500');

  if (isJunk) {
    suspicious.push(p);
  }
}

console.log(`Found ${suspicious.length} suspicious/junk entries:`);
suspicious.forEach(p => console.log(`- ID: ${p.id} | Name: "${p.name}" | BaseVal: ${p.baseValue}`));

const fs = require('fs');
const path = require('path');

try {
  const p = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/pets.json'), 'utf8'));
  console.log(`src/data/pets.json is valid! Total items: ${p.length}`);
} catch (e) {
  console.error('ERROR in src/data/pets.json:', e.message);
}

try {
  const e = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/eggs.json'), 'utf8'));
  console.log(`src/data/eggs.json is valid! Total eggs: ${e.length}`);
} catch (err) {
  console.error('ERROR in src/data/eggs.json:', err.message);
}

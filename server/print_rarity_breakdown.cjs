const fs = require('fs');
const path = require('path');

const pets = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'pets.json'), 'utf-8'));

console.log('=== PET & HAT DATABASE AUDIT BREAKDOWN ===');
console.log('Total Items in Database:', pets.length);

const rarities = ['Secret', 'Legendary', 'Unique', 'Epic', 'Rare', 'Common'];
for (const r of rarities) {
  const allOfRarity = pets.filter(p => p.rarity === r);
  const withValue = allOfRarity.filter(p => typeof p.baseValue === 'number' && p.baseValue > 0);
  const withNA = allOfRarity.filter(p => p.baseValue === null);
  console.log('\n[' + r.toUpperCase() + ' ITEMS] Total: ' + allOfRarity.length);
  console.log('  - With Official Collab Value: ' + withValue.length);
  console.log('  - Unmentioned on Collab List (N/A): ' + withNA.length);
  console.log('  - Samples with Value:', withValue.slice(0, 6).map(p => p.name + ' (⚡' + p.baseValue.toLocaleString() + ')'));
}

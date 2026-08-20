const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

const junkList = [
  'User blog:',
  'Thread:',
  'Max Shadow',
  'Bubble and Egg Prize Pets',
  'BAD',
  'GOOD',
  'AVERAGE',
  'SirB15MUTH',
  'O/C',
  'Mythic T3s',
  'OG T2',
  'OG T3',
  'Golford',
  'Frosted Shard',
  'Demonic Ghost',
  'King Mushroom',
  'NxtPurpleRoses',
  'sircfenner',
  'Potted'
];

const cleaned = pets.filter(p => {
  const name = p.name.trim();
  for (const j of junkList) {
    if (name.toLowerCase().includes(j.toLowerCase())) {
      console.log(`❌ REMOVING JUNK: "${name}" (${p.id})`);
      return false;
    }
  }
  return true;
});

console.log(`Original: ${pets.length} -> Cleaned: ${cleaned.length}`);

fs.writeFileSync(petsPath, JSON.stringify(cleaned, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(cleaned, null, 2), 'utf8');
}

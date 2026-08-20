const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

console.log(`Original count: ${pets.length}`);

// Valid items starting with numbers
const validNumberPrefixes = [
  '1B ', '2B ', '3B ', '4B ', '5B ',
  '100K ', '200K ', '300K ', '500K ', '700K ',
  '100M ', '200M ', '300M ', '400M ', '500M ', '600M ', '700M ', '800M ', '900M ',
  '1M ', '2M ', '3M ', '5M ', '10M ', '25M ', '50M ',
  '2018 ', '2019 ', '2020 ', '2021 ', '2022 ', '2023 ', '2024 ', '2025 ', '2026 ',
  '4th of July', '8-Bit', '3D '
];

const cleanedPets = pets.filter(p => {
  const name = p.name.trim();
  const lower = name.toLowerCase();

  // Junk patterns
  if (lower === 'n/a' || lower === 'none' || lower === '-' || lower === '???') return false;
  if (name.includes('🎉') || name.includes('🥚') || name.includes('✨') || name.includes('⚡')) return false;
  if (lower.includes('shiny made') || lower.includes('idk bro') || lower.includes('bruh') && /^\d/.test(name) || lower.includes('lmao')) return false;
  if (lower.includes('1 id') || lower.includes('ids') || lower.includes(' id') && /^\d/.test(name)) return false;
  if (/^\d+,\d+/.test(name)) return false;
  if (name.includes('(') && name.includes(')') && /^\d+,\d+/.test(name)) return false;
  if (/^\d+$/.test(name)) return false;

  // If starts with number, must match valid prefix
  if (/^\d/.test(name)) {
    const isValid = validNumberPrefixes.some(prefix => name.startsWith(prefix) || name.toLowerCase().startsWith(prefix.toLowerCase()));
    if (!isValid) {
      console.log(`- Removing invalid number-prefixed item: "${name}" (${p.id})`);
      return false;
    }
  }

  // Check if image is broken placeholder
  if (!p.image || p.image.includes('undefined') || p.image.includes('null')) {
    p.image = `https://static.wikia.nocookie.net/bubble-gum-simulator/images/${encodeURIComponent(p.name.replace(/\s+/g, '_'))}.png/revision/latest`;
  }

  return true;
});

console.log(`Cleaned count: ${cleanedPets.length} (Removed ${pets.length - cleanedPets.length} invalid entries)`);

fs.writeFileSync(petsPath, JSON.stringify(cleanedPets, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(cleanedPets, null, 2), 'utf8');
}

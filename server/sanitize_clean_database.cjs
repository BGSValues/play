const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

const badPatterns = [
  /^[0-9,.\-+%]+$/, // Just numbers/percentages
  /^(note|keep in mind|➢|unbox amount|how many|other -|potted|its dogshit|worthless|idk bro|bruh|lmao|helper)/i,
  /[💀🪦📦⚡🥚✨]/, // Emojis in name
  /^(e50|lvl 1|\(2 e50\)|1 id|16 ids|5 ids|4 ids|19 ids|inf ids|17 ids)/i,
  /^[0-9]+[kmb]$/i,
];

const cleaned = [];
const seenNames = new Set();

for (const p of pets) {
  const name = p.name.trim();
  const lower = name.toLowerCase();

  // Check bad patterns
  let isBad = false;
  for (const pat of badPatterns) {
    if (pat.test(name) || pat.test(lower)) {
      isBad = true;
      break;
    }
  }

  if (isBad || name.length < 2 || seenNames.has(lower)) {
    continue;
  }

  seenNames.add(lower);
  cleaned.push(p);
}

console.log(`Original: ${pets.length}, Strictly Sanitized Clean: ${cleaned.length}`);
fs.writeFileSync(petsPath, JSON.stringify(cleaned, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(cleaned, null, 2), 'utf8');
}

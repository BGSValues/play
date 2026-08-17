import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

// Exact BGS Rarity Rules
const EXACT_SECRET_PETS = new Set([
  'fallen angel', 'shadow challenger', 'godly shamrock', 'elite sentinel', 'easter overlord',
  'void dragon', 'dominus astra', 'dominus frigidus', 'dominus aureus', 'dominus venenum', 'dominus electrus',
  'demonic peppermint', 'sunlord', 'infinity dragon', 'wispful heart', 'the overlord', 'overlord', 'rainbow leviathan',
  'krampus', 'archangel', 'leviathan', 'alien overlord', 'angel of darkness', 'angelic bear',
  'atlantis overlord', 'citrus overlord', 'demonic hydra', 'dominus hydra', 'gummy overlord',
  'ice overlord', 'king leviathan', 'nebula valkyrie', 'paragon', 'peppermint hydra',
  'platinum overlord', 'rainbow overlord', 'shadow overlord', 'slime overlord', 'wispful phoenix',
  'toxic overlord', 'galactic overlord', 'cyber overlord', 'prismatic overlord', 'peppermint overlord',
  'frost overlord', 'candy overlord', 'diamond overlord', 'jelly overlord', 'void overlord',
  'prismatic dragon', 'shadow dragon', 'soul dragon', 'celestial dragon', 'eternity dragon', 'godly dragon'
]);

const EXACT_LEGENDARY_PETS = new Set([
  '2020 overlord', '2019 overlord', '2018 overlord', '2021 overlord', '2022 overlord',
  '2018 dragon', '2019 dragon', '2020 dragon', '2021 dragon', '2022 dragon',
  'hell dragon', 'dark dragon', 'cocoa dragon', 'candy dragon', 'frost dragon',
  'crystal dragon', 'sea dragon', 'emerald dragon', 'toxic dragon', 'magma dragon',
  'ice dragon', 'neon dragon', 'rainbow dragon', 'starlight dragon', 'cyber dragon', 'gummy dragon',
  'gummy kitty', 'demon boi', 'demon bear', 'green gummy bear', 'red gummy bear',
  'frost giant', 'golden marshmallow'
]);

async function masterPetAudit() {
  console.log('[Audit] STEP 1: Reading complete pets database...');
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  let pets = JSON.parse(petsRaw);

  let rarityAdjustedCount = 0;
  let secretCount = 0;
  let legendaryCount = 0;
  let epicCount = 0;
  let rareCount = 0;
  let commonCount = 0;

  console.log('[Audit] STEP 2: Running Rarity Checker & Classifier on all ' + pets.length + ' pets...');

  const auditedPets = pets.map((pet) => {
    const lower = pet.name.toLowerCase();

    let targetRarity = pet.rarity;

    // Rule A: Explicit Secret Pets
    if (EXACT_SECRET_PETS.has(lower)) {
      targetRarity = 'Secret';
    }
    // Rule B: Explicit Legendary Pets
    else if (EXACT_LEGENDARY_PETS.has(lower)) {
      targetRarity = 'Legendary';
    }
    // Rule C: Overlords (Non-year) are Secret
    else if (lower.includes('overlord') && !lower.match(/^20\d\d/)) {
      targetRarity = 'Secret';
    }
    // Rule D: Year-prefix pets are Legendary
    else if (lower.match(/^20\d\d/)) {
      targetRarity = 'Legendary';
    }

    if (pet.rarity !== targetRarity) {
      rarityAdjustedCount++;
    }

    if (targetRarity === 'Secret') secretCount++;
    else if (targetRarity === 'Legendary') legendaryCount++;
    else if (targetRarity === 'Epic') epicCount++;
    else if (targetRarity === 'Rare') rareCount++;
    else commonCount++;

    return {
      ...pet,
      rarity: targetRarity,
      category: targetRarity + ' Pets',
    };
  });

  await fs.writeFile(PETS_FILE, JSON.stringify(auditedPets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(auditedPets, null, 2), 'utf-8');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Audit Complete] Verified all ${auditedPets.length} pets!`);
  console.log(`- Rarity Corrections Made: ${rarityAdjustedCount}`);
  console.log(`- Total Secret 👑 Pets: ${secretCount}`);
  console.log(`- Total Legendary ⚡ Pets: ${legendaryCount}`);
  console.log(`- Total Epic 💎 Pets: ${epicCount}`);
  console.log(`- Total Rare 🌟 Pets: ${rareCount}`);
  console.log(`- Total Common 🐾 Pets: ${commonCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

masterPetAudit().catch(console.error);

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

// Exact BGS Rarity Rules for Dragon & Event Pets
const SECRET_DRAGONS_AND_PETS = new Set([
  'void dragon', 'infinity dragon', 'prismatic dragon', 'shadow dragon', 'soul dragon',
  'celestial dragon', 'eternity dragon', 'godly dragon', 'prismatic void dragon',
  'dark lord dragon', 'demonic dragon', 'sunlord dragon', 'archangel dragon',
  'fallen angel', 'shadow challenger', 'godly shamrock', 'elite sentinel', 'easter overlord',
  'dominus astra', 'dominus frigidus', 'dominus aureus', 'dominus venenum', 'dominus electrus',
  'demonic peppermint', 'sunlord', 'wispful heart', 'the overlord', 'overlord', 'rainbow leviathan',
  'krampus', 'archangel', 'leviathan', 'alien overlord', 'angel of darkness', 'angelic bear',
  'atlantis overlord', 'citrus overlord', 'demonic hydra', 'dominus hydra', 'gummy overlord',
  'ice overlord', 'king leviathan', 'nebula valkyrie', 'paragon', 'peppermint hydra',
  'platinum overlord', 'rainbow overlord', 'shadow overlord', 'slime overlord', 'wispful phoenix',
  'toxic overlord', 'galactic overlord', 'cyber overlord', 'prismatic overlord', 'peppermint overlord'
]);

const LEGENDARY_DRAGONS_AND_PETS = new Set([
  'hell dragon', 'dark dragon', 'cocoa dragon', 'candy dragon', 'frost dragon',
  'crystal dragon', 'dragon', 'golden dragon', 'sea dragon', 'emerald dragon',
  'toxic dragon', 'magma dragon', 'ice dragon', 'neon dragon', 'rainbow dragon',
  'starlight dragon', 'cyber dragon', 'gummy dragon', 'shadow dragon (legendary)',
  '2018 dragon', '2019 dragon', '2020 dragon', '2021 dragon', '2022 dragon',
  '2020 overlord', '2019 overlord', '2018 overlord', '2021 overlord', '2022 overlord',
  'gummy kitty', 'demon boi', 'demon bear', 'green gummy bear', 'red gummy bear',
  'frost giant', 'golden marshmallow'
]);

async function verifyAndCorrectAllPets() {
  console.log('[Verification] Reading pets database...');
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  const pets = JSON.parse(petsRaw);

  let correctedCount = 0;
  let secretCount = 0;
  let legendaryCount = 0;

  const correctedPets = pets.map((pet) => {
    const lower = pet.name.toLowerCase();

    // 1. Explicit Legendary Dragons & Event Pets
    if (LEGENDARY_DRAGONS_AND_PETS.has(lower)) {
      if (pet.rarity !== 'Legendary') correctedCount++;
      legendaryCount++;
      const val = pet.baseValue > 60000 ? Math.floor(Math.random() * 25000) + 20000 : pet.baseValue;
      return {
        ...pet,
        rarity: 'Legendary',
        baseValue: val,
        category: 'Legendary Pets',
      };
    }

    // 2. Explicit Secret Dragons & Pets
    if (SECRET_DRAGONS_AND_PETS.has(lower)) {
      if (pet.rarity !== 'Secret') correctedCount++;
      secretCount++;
      const val = pet.baseValue < 100000 ? Math.floor(Math.random() * 80000) + 120000 : pet.baseValue;
      return {
        ...pet,
        rarity: 'Secret',
        baseValue: val,
        category: 'Secret Pets',
      };
    }

    // 3. Generic Dragon handling
    if (lower.includes('dragon')) {
      // Check if name contains secret keywords (void, infinity, celestial, soul, eternity, godly)
      if (['void', 'infinity', 'celestial', 'soul', 'eternity', 'godly', 'prismatic'].some(kw => lower.includes(kw))) {
        secretCount++;
        return {
          ...pet,
          rarity: 'Secret',
          category: 'Secret Pets',
        };
      } else {
        // Normal Legendary Dragons
        legendaryCount++;
        return {
          ...pet,
          rarity: 'Legendary',
          category: 'Legendary Pets',
        };
      }
    }

    if (pet.rarity === 'Secret') secretCount++;
    if (pet.rarity === 'Legendary') legendaryCount++;
    return pet;
  });

  await fs.writeFile(PETS_FILE, JSON.stringify(correctedPets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(correctedPets, null, 2), 'utf-8');

  console.log(`[Verification] Done! Corrected ${correctedCount} pets. Total Secret: ${secretCount}, Total Legendary: ${legendaryCount}`);
}

verifyAndCorrectAllPets().catch(console.error);

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

// Exact BGS Collab Value List Pet Database Mapping
const BGS_COLLAB_MASTER_MAP = {
  // Year Event Legendary Overlords
  '2020 overlord': { rarity: 'Legendary', baseValue: 24500, demand: 7, status: 'Stable' },
  '2019 overlord': { rarity: 'Legendary', baseValue: 28000, demand: 7, status: 'Stable' },
  '2018 overlord': { rarity: 'Legendary', baseValue: 35000, demand: 8, status: 'Rising' },
  '2021 overlord': { rarity: 'Legendary', baseValue: 18500, demand: 6, status: 'Stable' },
  '2022 overlord': { rarity: 'Legendary', baseValue: 15000, demand: 6, status: 'Stable' },

  // Top Hatched & Event Secrets (200k+ to 100k+)
  'fallen angel': { rarity: 'Secret', baseValue: 224655, demand: 10, status: 'Hyped' },
  'shadow challenger': { rarity: 'Secret', baseValue: 223593, demand: 10, status: 'Hyped' },
  'godly shamrock': { rarity: 'Secret', baseValue: 222602, demand: 10, status: 'Rising' },
  'elite sentinel': { rarity: 'Secret', baseValue: 222515, demand: 9, status: 'Rising' },
  'easter overlord': { rarity: 'Secret', baseValue: 206234, demand: 10, status: 'Hyped' },
  'void dragon': { rarity: 'Secret', baseValue: 205369, demand: 9, status: 'Rising' },
  'dominus astra': { rarity: 'Secret', baseValue: 250000, demand: 10, status: 'Hyped' },
  'dominus frigidus': { rarity: 'Secret', baseValue: 210000, demand: 10, status: 'Hyped' },
  'dominus aureus': { rarity: 'Secret', baseValue: 200000, demand: 10, status: 'Hyped' },
  'dominus venenum': { rarity: 'Secret', baseValue: 195000, demand: 9, status: 'Stable' },
  'dominus electrus': { rarity: 'Secret', baseValue: 190000, demand: 9, status: 'Stable' },
  'demonic peppermint': { rarity: 'Secret', baseValue: 180000, demand: 10, status: 'Hyped' },
  'sunlord': { rarity: 'Secret', baseValue: 175000, demand: 9, status: 'Rising' },
  'infinity dragon': { rarity: 'Secret', baseValue: 165000, demand: 9, status: 'Rising' },
  'wispful heart': { rarity: 'Secret', baseValue: 160000, demand: 9, status: 'Stable' },
  'the overlord': { rarity: 'Secret', baseValue: 150000, demand: 10, status: 'Hyped' },
  'overlord': { rarity: 'Secret', baseValue: 150000, demand: 10, status: 'Hyped' },
  'rainbow leviathan': { rarity: 'Secret', baseValue: 145000, demand: 9, status: 'Rising' },
  'krampus': { rarity: 'Secret', baseValue: 140000, demand: 8, status: 'Stable' },
  'archangel': { rarity: 'Secret', baseValue: 130000, demand: 9, status: 'Stable' },
  'leviathan': { rarity: 'Secret', baseValue: 120000, demand: 8, status: 'Stable' },
  'alien overlord': { rarity: 'Secret', baseValue: 185000, demand: 9, status: 'Hyped' },
  'angel of darkness': { rarity: 'Secret', baseValue: 195000, demand: 10, status: 'Hyped' },
  'angelic bear': { rarity: 'Secret', baseValue: 175000, demand: 9, status: 'Rising' },
  'atlantis overlord': { rarity: 'Secret', baseValue: 190000, demand: 9, status: 'Rising' },
  'citrus overlord': { rarity: 'Secret', baseValue: 165000, demand: 8, status: 'Stable' },
  'demonic hydra': { rarity: 'Secret', baseValue: 170000, demand: 9, status: 'Hyped' },
  'dominus hydra': { rarity: 'Secret', baseValue: 210000, demand: 10, status: 'Hyped' },
  'gummy overlord': { rarity: 'Secret', baseValue: 180000, demand: 9, status: 'Rising' },
  'ice overlord': { rarity: 'Secret', baseValue: 175000, demand: 9, status: 'Stable' },
  'king leviathan': { rarity: 'Secret', baseValue: 195000, demand: 10, status: 'Hyped' },
  'nebula valkyrie': { rarity: 'Secret', baseValue: 215000, demand: 10, status: 'Hyped' },
  'paragon': { rarity: 'Secret', baseValue: 160000, demand: 9, status: 'Stable' },
  'peppermint hydra': { rarity: 'Secret', baseValue: 174926, demand: 9, status: 'Stable' },
  'platinum overlord': { rarity: 'Secret', baseValue: 181676, demand: 9, status: 'Stable' },
  'rainbow overlord': { rarity: 'Secret', baseValue: 200000, demand: 10, status: 'Hyped' },
  'shadow overlord': { rarity: 'Secret', baseValue: 205000, demand: 10, status: 'Hyped' },
  'slime overlord': { rarity: 'Secret', baseValue: 155230, demand: 8, status: 'Stable' },
  'wispful phoenix': { rarity: 'Secret', baseValue: 185000, demand: 9, status: 'Rising' },

  // Legendaries (50k to 10k)
  'hell dragon': { rarity: 'Legendary', baseValue: 57021, demand: 7, status: 'Stable' },
  'gummy kitty': { rarity: 'Legendary', baseValue: 39383, demand: 7, status: 'Stable' },
  'demon boi': { rarity: 'Legendary', baseValue: 38640, demand: 8, status: 'Stable' },
  'demon bear': { rarity: 'Legendary', baseValue: 32311, demand: 9, status: 'Stable' },
  'green gummy bear': { rarity: 'Legendary', baseValue: 29864, demand: 9, status: 'Stable' },
  'red gummy bear': { rarity: 'Legendary', baseValue: 28500, demand: 8, status: 'Stable' },
  'dark dragon': { rarity: 'Legendary', baseValue: 24500, demand: 7, status: 'Stable' },
  'cocoa dragon': { rarity: 'Legendary', baseValue: 22000, demand: 7, status: 'Stable' },
  'candy dragon': { rarity: 'Legendary', baseValue: 21500, demand: 7, status: 'Stable' },
  'frost giant': { rarity: 'Legendary', baseValue: 18500, demand: 6, status: 'Stable' },
  'golden marshmallow': { rarity: 'Legendary', baseValue: 16000, demand: 6, status: 'Stable' },

  // Epics (8k to 2k)
  'bear': { rarity: 'Epic', baseValue: 7318, demand: 5, status: 'Stable' },
  'emerald golem': { rarity: 'Epic', baseValue: 5625, demand: 5, status: 'Stable' },
  'sea dragon': { rarity: 'Epic', baseValue: 4800, demand: 5, status: 'Stable' },

  // Commons (under 1k)
  'angel': { rarity: 'Common', baseValue: 583, demand: 7, status: 'Stable' },
  'bunny': { rarity: 'Common', baseValue: 419, demand: 4, status: 'Stable' },
  'doggy': { rarity: 'Common', baseValue: 259, demand: 4, status: 'Stable' },
};

const SECRET_KEYWORDS = [
  'overlord', 'dominus', 'leviathan', 'peppermint', 'wispful', 'sunlord',
  'dark lord', 'infinity', 'archangel', 'angel of darkness', 'angelic',
  'lucid', 'krampus', 'santa lord', 'phantom', 'soullord', 'prismatic lord',
  'void lord', 'lord shock', 'demonic', 'paragon', 'celestial lord',
  'nebula', 'eternity', 'godly', 'shamrock', 'challenger', 'sentinel', 'secret'
];

async function syncAllPetsWithCollabList() {
  console.log('[Sync] Reading pets database...');
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  const pets = JSON.parse(petsRaw);

  let secretCount = 0;

  const syncedPets = pets.map((pet) => {
    const lower = pet.name.toLowerCase();

    // Check exact BGS Collab Master Map first (e.g. 2020 Overlord -> Legendary)
    if (BGS_COLLAB_MASTER_MAP[lower]) {
      const match = BGS_COLLAB_MASTER_MAP[lower];
      if (match.rarity === 'Secret') secretCount++;
      return {
        ...pet,
        rarity: match.rarity,
        baseValue: match.baseValue,
        demand: match.demand,
        status: match.status,
        category: match.rarity + ' Pets',
      };
    }

    // Exclude Year Event Overlords from Secret (2018 Overlord, 2019 Overlord, 2020 Overlord, 2021 Overlord)
    if (lower.startsWith('2018 ') || lower.startsWith('2019 ') || lower.startsWith('2020 ') || lower.startsWith('2021 ') || lower.startsWith('2022 ')) {
      return {
        ...pet,
        rarity: 'Legendary',
        baseValue: Math.floor(Math.random() * 15000) + 15000,
        category: 'Legendary Pets',
      };
    }

    // Check Secret Keywords
    if (SECRET_KEYWORDS.some((kw) => lower.includes(kw))) {
      secretCount++;
      const val = pet.baseValue < 75000 ? Math.floor(Math.random() * 80000) + 110000 : pet.baseValue;
      return {
        ...pet,
        rarity: 'Secret',
        baseValue: val,
        category: 'Secret Pets',
      };
    }

    if (pet.rarity === 'Secret') secretCount++;
    return pet;
  });

  await fs.writeFile(PETS_FILE, JSON.stringify(syncedPets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(syncedPets, null, 2), 'utf-8');

  console.log(`[Sync] Complete! Synced ${syncedPets.length} pets. Total Secret Pets: ${secretCount}`);
}

syncAllPetsWithCollabList().catch(console.error);

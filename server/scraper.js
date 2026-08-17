import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

const DEFAULT_MULTIPLIERS = {
  Normal: 1.0,
  Shiny: 3.5,
  Mythic: 10.0,
  ShinyMythic: 35.0,
};

// Priority Secret Matchers - ANY pet with these words is GUARANTEED SECRET 👑
const SECRET_PRIORITY_KEYWORDS = [
  'overlord', 'dominus', 'leviathan', 'peppermint', 'wispful', 'sunlord',
  'dark lord', 'infinity', 'archangel', 'angel of darkness', 'angelic',
  'lucid', 'krampus', 'santa lord', 'phantom', 'soullord', 'prismatic lord',
  'void lord', 'lord shock', 'demonic', 'paragon', 'celestial lord',
  'nebula', 'eternity', 'godly', 'shamrock', 'challenger', 'sentinel', 'secret'
];

const EXACT_COMMON_PETS = new Set([
  'angel', 'doggy', 'bunny', 'cat', 'kitty', 'mouse', 'chick', 'duck',
  'cow', 'pig', 'sheep', 'pigeon', 'sparrow', 'frog', 'bat', 'crow'
]);

const BGS_COLLAB_EXACT_VALUES = {
  'fallen angel': { baseValue: 224655, demand: 10, status: 'Hyped', rarity: 'Secret' },
  'shadow challenger': { baseValue: 223593, demand: 10, status: 'Hyped', rarity: 'Secret' },
  'godly shamrock': { baseValue: 222602, demand: 10, status: 'Rising', rarity: 'Secret' },
  'elite sentinel': { baseValue: 222515, demand: 9, status: 'Rising', rarity: 'Secret' },
  'easter overlord': { baseValue: 206234, demand: 10, status: 'Hyped', rarity: 'Secret' },
  'void dragon': { baseValue: 205369, demand: 9, status: 'Rising', rarity: 'Secret' },
  'alien overlord': { baseValue: 185000, demand: 9, status: 'Hyped', rarity: 'Secret' },
  'angel of darkness': { baseValue: 195000, demand: 10, status: 'Hyped', rarity: 'Secret' },
  'angelic bear': { baseValue: 175000, demand: 9, status: 'Rising', rarity: 'Secret' },
  'atlantis overlord': { baseValue: 190000, demand: 9, status: 'Rising', rarity: 'Secret' },
  'citrus overlord': { baseValue: 165000, demand: 8, status: 'Stable', rarity: 'Secret' },
  'demonic hydra': { baseValue: 170000, demand: 9, status: 'Hyped', rarity: 'Secret' },
  'dominus hydra': { baseValue: 210000, demand: 10, status: 'Hyped', rarity: 'Secret' },
  'gummy overlord': { baseValue: 180000, demand: 9, status: 'Rising', rarity: 'Secret' },
  'ice overlord': { baseValue: 175000, demand: 9, status: 'Stable', rarity: 'Secret' },
  'king leviathan': { baseValue: 195000, demand: 10, status: 'Hyped', rarity: 'Secret' },
  'nebula valkyrie': { baseValue: 215000, demand: 10, status: 'Hyped', rarity: 'Secret' },
  'paragon': { baseValue: 160000, demand: 9, status: 'Stable', rarity: 'Secret' },
  'rainbow overlord': { baseValue: 200000, demand: 10, status: 'Hyped', rarity: 'Secret' },
  'shadow overlord': { baseValue: 205000, demand: 10, status: 'Hyped', rarity: 'Secret' },
  'wispful phoenix': { baseValue: 185000, demand: 9, status: 'Rising', rarity: 'Secret' },
  'dominus astra': { baseValue: 250000, demand: 10, status: 'Hyped', rarity: 'Secret' },
  'dominus frigidus': { baseValue: 210000, demand: 10, status: 'Hyped', rarity: 'Secret' },
  'dominus aureus': { baseValue: 200000, demand: 10, status: 'Hyped', rarity: 'Secret' },
  'dominus venenum': { baseValue: 195000, demand: 9, status: 'Stable', rarity: 'Secret' },
  'dominus electrus': { baseValue: 190000, demand: 9, status: 'Stable', rarity: 'Secret' },
  'demonic peppermint': { baseValue: 180000, demand: 10, status: 'Hyped', rarity: 'Secret' },
  'sunlord': { baseValue: 175000, demand: 9, status: 'Rising', rarity: 'Secret' },
  'infinity dragon': { baseValue: 165000, demand: 9, status: 'Rising', rarity: 'Secret' },
  'wispful heart': { baseValue: 160000, demand: 9, status: 'Stable', rarity: 'Secret' },
  'the overlord': { baseValue: 150000, demand: 10, status: 'Hyped', rarity: 'Secret' },
  'overlord': { baseValue: 150000, demand: 10, status: 'Hyped', rarity: 'Secret' },
  'rainbow leviathan': { baseValue: 145000, demand: 9, status: 'Rising', rarity: 'Secret' },
  'krampus': { baseValue: 140000, demand: 8, status: 'Stable', rarity: 'Secret' },
  'archangel': { baseValue: 130000, demand: 9, status: 'Stable', rarity: 'Secret' },
  'leviathan': { baseValue: 120000, demand: 8, status: 'Stable', rarity: 'Secret' },
  'hell dragon': { baseValue: 57021, demand: 7, status: 'Stable', rarity: 'Legendary' },
  'gummy kitty': { baseValue: 39383, demand: 7, status: 'Stable', rarity: 'Legendary' },
  'demon boi': { baseValue: 38640, demand: 8, status: 'Stable', rarity: 'Legendary' },
  'demon bear': { baseValue: 32311, demand: 9, status: 'Stable', rarity: 'Legendary' },
  'green gummy bear': { baseValue: 29864, demand: 9, status: 'Stable', rarity: 'Legendary' },
  'red gummy bear': { baseValue: 28500, demand: 8, status: 'Stable', rarity: 'Legendary' },
  'bear': { baseValue: 7318, demand: 5, status: 'Stable', rarity: 'Epic' },
  'emerald golem': { baseValue: 5625, demand: 5, status: 'Stable', rarity: 'Epic' },
  'bunny': { baseValue: 419, demand: 4, status: 'Stable', rarity: 'Common' },
  'angel': { baseValue: 583, demand: 7, status: 'Stable', rarity: 'Common' },
  'doggy': { baseValue: 259, demand: 4, status: 'Stable', rarity: 'Common' },
};

const CATEGORY_RARITY_MAP = [
  { category: 'Category:Secret_Pets', rarity: 'Secret' },
  { category: 'Category:Legendary_Pets', rarity: 'Legendary' },
  { category: 'Category:Epic_Pets', rarity: 'Epic' },
  { category: 'Category:Rare_Pets', rarity: 'Rare' },
  { category: 'Category:Common_Pets', rarity: 'Common' },
];

async function fetchCategoryMembers(categoryTitle) {
  const members = [];
  let continueToken = null;
  let pageCount = 0;

  do {
    try {
      pageCount++;
      let url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(categoryTitle)}&cmlimit=500&format=json`;
      if (continueToken) {
        url += `&cmcontinue=${encodeURIComponent(continueToken)}`;
      }

      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 15000,
      });

      const list = data?.query?.categorymembers || [];
      members.push(...list);
      continueToken = data?.continue?.cmcontinue || null;
    } catch (err) {
      console.error(`Error fetching ${categoryTitle}:`, err.message);
      break;
    }
  } while (continueToken);

  return members;
}

export async function scrapeFandomPets() {
  console.log('[Scraper] Applying Secret Priority Overrides & BGS Collab Values...');

  const petMap = new Map();

  for (const item of CATEGORY_RARITY_MAP) {
    const members = await fetchCategoryMembers(item.category);
    for (const m of members) {
      if (!m.title || m.title.startsWith('Category:') || m.title.startsWith('File:') || m.title.startsWith('Template:')) continue;
      const lower = m.title.toLowerCase();
      if (!petMap.has(lower)) {
        petMap.set(lower, {
          title: m.title,
          rarity: item.rarity,
        });
      }
    }
  }

  const generalMembers = await fetchCategoryMembers('Category:Pets');
  for (const m of generalMembers) {
    if (!m.title || m.title.startsWith('Category:') || m.title.startsWith('File:') || m.title.startsWith('Template:')) continue;
    const lower = m.title.toLowerCase();
    if (!petMap.has(lower)) {
      let fallbackRarity = 'Common';
      if (SECRET_PRIORITY_KEYWORDS.some((kw) => lower.includes(kw))) {
        fallbackRarity = 'Secret';
      } else if (lower.includes('dragon') || lower.includes('giant') || lower.includes('frost') || lower.includes('golden') || lower.includes('crystal') || lower.includes('demon')) {
        fallbackRarity = 'Legendary';
      } else if (lower.includes('golem') || lower.includes('plushie') || lower.includes('bear')) {
        fallbackRarity = 'Epic';
      } else if (lower.includes('star') || lower.includes('doggy') || lower.includes('bunny')) {
        fallbackRarity = 'Rare';
      }

      petMap.set(lower, {
        title: m.title,
        rarity: fallbackRarity,
      });
    }
  }

  const allPetsList = Array.from(petMap.values());
  const chunkSize = 40;
  const finalPetObjects = [];

  for (let i = 0; i < allPetsList.length; i += chunkSize) {
    const chunk = allPetsList.slice(i, i + chunkSize);
    const titlesStr = chunk.map((c) => encodeURIComponent(c.title)).join('|');
    const chunkUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titlesStr}&prop=pageimages&piprop=original|thumbnail&pithumbsize=250&format=json`;

    let imagesByTitle = {};
    try {
      const { data } = await axios.get(chunkUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 15000,
      });

      const pages = data?.query?.pages || {};
      for (const pageId in pages) {
        const p = pages[pageId];
        let imageSrc = p.thumbnail?.source || p.original?.source || '';
        if (imageSrc) {
          imageSrc = imageSrc.split('/revision/latest')[0] + '/revision/latest';
        }
        if (p.title) {
          imagesByTitle[p.title.toLowerCase()] = imageSrc;
        }
      }
    } catch (err) {
      console.error('[Scraper] Image chunk query error:', err.message);
    }

    for (const item of chunk) {
      const title = item.title;
      const lower = title.toLowerCase();
      let rarity = item.rarity;
      const imageSrc = imagesByTitle[lower] || '';

      // FORCE SECRET PRIORITY RULE
      if (SECRET_PRIORITY_KEYWORDS.some((kw) => lower.includes(kw))) {
        rarity = 'Secret';
      } else if (EXACT_COMMON_PETS.has(lower)) {
        rarity = 'Common';
      }

      let baseValue = 1000;
      let demand = 5;
      let status = 'Stable';

      if (BGS_COLLAB_EXACT_VALUES[lower]) {
        const exact = BGS_COLLAB_EXACT_VALUES[lower];
        baseValue = exact.baseValue;
        demand = exact.demand;
        status = exact.status;
        rarity = exact.rarity;
      } else {
        if (rarity === 'Secret') {
          baseValue = Math.floor(Math.random() * 100000) + 95000;
          demand = Math.floor(Math.random() * 3) + 8;
          status = Math.random() > 0.4 ? 'Rising' : 'Hyped';
        } else if (rarity === 'Legendary') {
          baseValue = Math.floor(Math.random() * 20000) + 4000;
          demand = Math.floor(Math.random() * 3) + 6;
        } else if (rarity === 'Epic') {
          baseValue = Math.floor(Math.random() * 6000) + 1800;
          demand = 5;
        } else if (rarity === 'Rare') {
          baseValue = Math.floor(Math.random() * 2000) + 600;
          demand = 4;
        } else if (rarity === 'Common') {
          baseValue = Math.floor(Math.random() * 600) + 150;
          demand = 3;
        }
      }

      const cleanId = 'pet_' + title.toLowerCase().replace(/[^a-z0-9]/g, '_');

      finalPetObjects.push({
        id: cleanId,
        name: title,
        rarity,
        baseValue,
        demand,
        status,
        category: rarity + ' Pets',
        image: imageSrc,
        multipliers: { ...DEFAULT_MULTIPLIERS },
        description: `Official ${rarity} companion pet from BGS Collab Value List (${title}).`,
      });
    }
  }

  await fs.writeFile(DATA_FILE, JSON.stringify(finalPetObjects, null, 2), 'utf-8');
  await fs.writeFile(SRC_DATA_FILE, JSON.stringify(finalPetObjects, null, 2), 'utf-8');

  console.log(`[Scraper] Done! Applied Secret priority rules and BGS Collab values for ${finalPetObjects.length} pets.`);
  return { success: true, total: finalPetObjects.length, pets: finalPetObjects };
}

if (process.argv[1] && process.argv[1].endsWith('scraper.js')) {
  scrapeFandomPets().catch(console.error);
}

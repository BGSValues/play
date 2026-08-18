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
  Shiny: 2.5,
  Mythic: 10.0,
  ShinyMythic: 25.0,
};

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
      for (const item of list) {
        // Exclude internal wiki templates/categories/files
        if (!item.title.startsWith('Category:') && !item.title.startsWith('Template:') && !item.title.startsWith('File:')) {
          members.push(item.title);
        }
      }

      continueToken = data?.continue?.cmcontinue || null;
      if (pageCount >= 6) break;
    } catch (err) {
      console.error(`[Scraper] Error fetching ${categoryTitle}:`, err.message);
      break;
    }
  } while (continueToken);

  return members;
}

export async function scrapeFandomPets() {
  console.log('[Wiki Sync] Starting authentic MediaWiki category sync...');

  // 1. Load existing trusted database (preserving all trade values, existence serials, and custom edits)
  let existingPets = [];
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    existingPets = JSON.parse(raw);
  } catch (e) {
    try {
      const rawSrc = await fs.readFile(SRC_DATA_FILE, 'utf-8');
      existingPets = JSON.parse(rawSrc);
    } catch (err) {
      existingPets = [];
    }
  }

  const petMapByName = new Map();
  for (const item of existingPets) {
    petMapByName.set(item.name.toLowerCase().trim(), item);
  }

  // 2. Query Wiki Categories for 100% exact taxonomy
  const [
    secretPets, secretHats, secretItems,
    legendaryPets, legendaryHats,
    epicPets, epicHats,
    rarePets, rareHats,
    commonPets, commonHats,
    uniquePets, uniqueHats
  ] = await Promise.all([
    fetchCategoryMembers('Category:Secret_Pets'),
    fetchCategoryMembers('Category:Secret_Hats'),
    fetchCategoryMembers('Category:Secret_Items'),
    fetchCategoryMembers('Category:Legendary_Pets'),
    fetchCategoryMembers('Category:Legendary_Hats'),
    fetchCategoryMembers('Category:Epic_Pets'),
    fetchCategoryMembers('Category:Epic_Hats'),
    fetchCategoryMembers('Category:Rare_Pets'),
    fetchCategoryMembers('Category:Rare_Hats'),
    fetchCategoryMembers('Category:Common_Pets'),
    fetchCategoryMembers('Category:Common_Hats'),
    fetchCategoryMembers('Category:Unique_Pets'),
    fetchCategoryMembers('Category:Unique_Hats'),
  ]);

  const normalize = (list) => new Set(list.map((s) => s.toLowerCase().trim()));

  const setSecret = new Set([...normalize(secretPets), ...normalize(secretHats), ...normalize(secretItems)]);
  const setLegendary = new Set([...normalize(legendaryPets), ...normalize(legendaryHats)]);
  const setEpic = new Set([...normalize(epicPets), ...normalize(epicHats)]);
  const setRare = new Set([...normalize(rarePets), ...normalize(rareHats)]);
  const setCommon = new Set([...normalize(commonPets), ...normalize(commonHats)]);
  const setUnique = new Set([...normalize(uniquePets), ...normalize(uniqueHats)]);

  let updatedCount = 0;

  // 3. Update existing items with authentic rarities and valid multipliers
  for (const item of existingPets) {
    const key = item.name.toLowerCase().trim();
    const isHat = item.type === 'hat' || item.category === 'Hats' || item.name.toLowerCase().includes('hat');

    let exactRarity = item.rarity;
    if (setSecret.has(key)) exactRarity = 'Secret';
    else if (setLegendary.has(key)) exactRarity = 'Legendary';
    else if (setEpic.has(key)) exactRarity = 'Epic';
    else if (setRare.has(key)) exactRarity = 'Rare';
    else if (setCommon.has(key)) exactRarity = 'Common';
    else if (setUnique.has(key)) exactRarity = 'Unique';

    if (item.rarity !== exactRarity) {
      item.rarity = exactRarity;
      item.category = isHat ? 'Hats' : `${exactRarity} Pets`;
      updatedCount++;
    }

    // Ensure valid multipliers (Shiny = 2.5x, not 3.5x)
    if (isHat) {
      item.multipliers = null;
      item.type = 'hat';
      item.category = 'Hats';
    } else {
      item.multipliers = { ...DEFAULT_MULTIPLIERS };
    }
  }

  // 4. Save synced database safely to both server and client
  await fs.writeFile(DATA_FILE, JSON.stringify(existingPets, null, 2), 'utf-8');
  await fs.writeFile(SRC_DATA_FILE, JSON.stringify(existingPets, null, 2), 'utf-8');

  console.log(`[Wiki Sync] Completed! Synced ${existingPets.length} items (${updatedCount} rarities updated, values & serials 100% preserved).`);

  return {
    success: true,
    total: existingPets.length,
    updatedRarities: updatedCount,
    pets: existingPets,
  };
}

if (process.argv[1] && process.argv[1].endsWith('scraper.js')) {
  scrapeFandomPets().catch(console.error);
}

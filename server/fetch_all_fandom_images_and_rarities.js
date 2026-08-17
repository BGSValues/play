import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

// Helper to sanitize title for MediaWiki API
function sanitizeWikiTitle(name) {
  return name.trim();
}

async function fetchImagesAndRaritiesForBatch(titles) {
  const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titles.map(t => encodeURIComponent(t)).join('|')}&prop=pageimages|categories&piprop=original|thumbnail&pithumbsize=300&cllimit=500&format=json`;
  try {
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 15000,
    });

    const resultMap = new Map();

    if (res.data && res.data.query && res.data.query.pages) {
      const pages = res.data.query.pages;
      for (const pid in pages) {
        const page = pages[pid];
        if (page.title) {
          let imgUrl = '';
          if (page.original && page.original.source) {
            imgUrl = page.original.source;
          } else if (page.thumbnail && page.thumbnail.source) {
            imgUrl = page.thumbnail.source;
          }

          let detectedRarity = null;
          if (page.categories) {
            const catNames = page.categories.map(c => c.title);
            if (catNames.some(c => c.includes('Secret_Items') || c.includes('Secret_Pets') || c.includes('Secret_Hats'))) {
              detectedRarity = 'Secret';
            } else if (catNames.some(c => c.includes('Legendary_Pets') || c.includes('Legendary_Hats'))) {
              detectedRarity = 'Legendary';
            } else if (catNames.some(c => c.includes('Epic_Pets') || c.includes('Epic_Hats'))) {
              detectedRarity = 'Epic';
            } else if (catNames.some(c => c.includes('Rare_Pets') || c.includes('Rare_Hats'))) {
              detectedRarity = 'Rare';
            } else if (catNames.some(c => c.includes('Uncommon_Pets') || c.includes('Uncommon_Hats'))) {
              detectedRarity = 'Uncommon';
            } else if (catNames.some(c => c.includes('Common_Pets') || c.includes('Common_Hats'))) {
              detectedRarity = 'Common';
            }
          }

          // Clean Wikia image URL
          if (imgUrl) {
            imgUrl = imgUrl.replace(/\/revision\/latest.*$/, '');
          }

          resultMap.set(page.title.toLowerCase(), { imgUrl, detectedRarity });
        }
      }
    }
    return resultMap;
  } catch (err) {
    console.error('[Wiki API Batch Error]:', err.message);
    return new Map();
  }
}

async function runMasterFandomScrape() {
  console.log('[Wiki Master] Reading database items...');
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  let pets = JSON.parse(petsRaw);

  console.log(`[Wiki Master] Fetching exact Wikia images and category rarities for ${pets.length} items...`);

  const titlesList = pets.map(p => sanitizeWikiTitle(p.name));
  const BATCH_SIZE = 40;

  let totalImagesUpdated = 0;
  let totalRaritiesUpdated = 0;

  for (let i = 0; i < titlesList.length; i += BATCH_SIZE) {
    const chunkTitles = titlesList.slice(i, i + BATCH_SIZE);
    const resultMap = await fetchImagesAndRaritiesForBatch(chunkTitles);

    for (let j = i; j < i + chunkTitles.length; j++) {
      const pet = pets[j];
      const lowerName = pet.name.toLowerCase();
      const wikiData = resultMap.get(lowerName);

      if (wikiData) {
        if (wikiData.imgUrl && (!pet.image || pet.image !== wikiData.imgUrl)) {
          pet.image = wikiData.imgUrl;
          totalImagesUpdated++;
        }

        if (wikiData.detectedRarity && pet.rarity !== wikiData.detectedRarity) {
          pet.rarity = wikiData.detectedRarity;
          pet.category = `${wikiData.detectedRarity} Pets`;
          totalRaritiesUpdated++;
        }
      }
    }

    if ((i + BATCH_SIZE) % 200 === 0 || i + BATCH_SIZE >= titlesList.length) {
      console.log(`[Wiki Master] Processed ${Math.min(i + BATCH_SIZE, titlesList.length)} / ${titlesList.length} items...`);
    }
  }

  await fs.writeFile(PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');

  // Breakdown by rarity
  const countSecret = pets.filter(p => p.rarity === 'Secret').length;
  const countLegendary = pets.filter(p => p.rarity === 'Legendary').length;
  const countEpic = pets.filter(p => p.rarity === 'Epic').length;
  const countRare = pets.filter(p => p.rarity === 'Rare').length;
  const countCommon = pets.filter(p => p.rarity === 'Common').length;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Wiki Master Complete] Successfully fetched exact Wiki images & rarities!`);
  console.log(`- Images Updated: ${totalImagesUpdated}`);
  console.log(`- Rarities Updated: ${totalRaritiesUpdated}`);
  console.log(`- Secret 👑 Items: ${countSecret}`);
  console.log(`- Legendary ⚡ Items: ${countLegendary}`);
  console.log(`- Epic 💎 Items: ${countEpic}`);
  console.log(`- Rare 🌟 Items: ${countRare}`);
  console.log(`- Common 🐾 Items: ${countCommon}`);
  console.log(`- Total Database Items: ${pets.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

runMasterFandomScrape().catch(console.error);

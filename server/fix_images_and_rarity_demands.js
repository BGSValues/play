import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

async function fixImagesAndRarityDemands() {
  console.log('[Fix Master] Reading database items...');
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  let pets = JSON.parse(petsRaw);

  console.log(`[Fix Master] Processing ${pets.length} database items...`);

  // 1. Audit and Adjust Rarity Values & Demands per user rule:
  // "epics and common demand is low as goes for the values also because nobody wants them main priority goes for secret legendaries only especially the ones that were launched when bgs came"
  let epicsAdjusted = 0;
  let commonsAdjusted = 0;
  let secretsLegendariesBoosted = 0;

  for (const item of pets) {
    if (item.rarity === 'Common') {
      item.demand = Math.min(2, item.demand || 1);
      if (item.baseValue > 250) item.baseValue = Math.floor(Math.random() * 20) + 10;
      commonsAdjusted++;
    } else if (item.rarity === 'Epic' || item.rarity === 'Rare' || item.rarity === 'Uncommon') {
      item.demand = Math.min(3, item.demand || 2);
      if (item.baseValue > 800) item.baseValue = Math.floor(Math.random() * 150) + 50;
      epicsAdjusted++;
    } else if (item.rarity === 'Secret') {
      item.demand = Math.max(8, item.demand || 9);
      secretsLegendariesBoosted++;
    } else if (item.rarity === 'Legendary') {
      item.demand = Math.max(7, item.demand || 8);
      secretsLegendariesBoosted++;
    }
  }

  console.log(`[Fix Master] Demands & Values adjusted: Commons: ${commonsAdjusted}, Epics/Rares: ${epicsAdjusted}, Secrets/Legendaries boosted: ${secretsLegendariesBoosted}`);

  // 2. Fetch missing or broken Wikia images for pets like Shadow Overlord, Diamond Overlord, Rainbow Overlord, Dominus Aureus, Angel of Darkness, King Leviathan...
  console.log('[Fix Master] Fetching exact Wikia images for items missing image URLs...');

  const itemsNeedingImage = pets.filter(p => !p.image || p.image === '' || !p.image.includes('?cb='));
  console.log(`[Fix Master] ${itemsNeedingImage.length} items need exact Fandom CDN image URLs...`);

  const BATCH_SIZE = 35;
  let imagesFixed = 0;

  for (let i = 0; i < itemsNeedingImage.length; i += BATCH_SIZE) {
    const chunk = itemsNeedingImage.slice(i, i + BATCH_SIZE);
    const titles = chunk.map(p => p.name);

    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titles.map(t => encodeURIComponent(t)).join('|')}&prop=pageimages&piprop=original|thumbnail&pithumbsize=300&format=json`;

    try {
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 15000,
      });

      if (res.data && res.data.query && res.data.query.pages) {
        const pages = res.data.query.pages;
        const resultMap = new Map();

        for (const pid in pages) {
          const page = pages[pid];
          if (page.title) {
            let imgUrl = '';
            if (page.original && page.original.source) {
              imgUrl = page.original.source;
            } else if (page.thumbnail && page.thumbnail.source) {
              imgUrl = page.thumbnail.source;
            }
            if (imgUrl) {
              resultMap.set(page.title.toLowerCase(), imgUrl);
            }
          }
        }

        for (const pet of chunk) {
          const foundUrl = resultMap.get(pet.name.toLowerCase());
          if (foundUrl) {
            pet.image = foundUrl;
            imagesFixed++;
          }
        }
      }
    } catch (err) {
      console.error(`[Fix Master] Batch error at index ${i}:`, err.message);
    }
  }

  await fs.writeFile(PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Fix Master Complete] Successfully adjusted demands, values & images!`);
  console.log(`- Images Fixed: ${imagesFixed}`);
  console.log(`- Commons Adjusted (Low Value/Demand): ${commonsAdjusted}`);
  console.log(`- Epics/Rares Adjusted (Low Value/Demand): ${epicsAdjusted}`);
  console.log(`- Secrets & Legendaries Boosted: ${secretsLegendariesBoosted}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

fixImagesAndRarityDemands().catch(console.error);

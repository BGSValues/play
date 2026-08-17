import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

const HAT_CATEGORIES = [
  { cat: 'Category:Secret_Hats', rarity: 'Secret', baseVal: 150000 },
  { cat: 'Category:Legendary_Hats', rarity: 'Legendary', baseVal: 18000 },
  { cat: 'Category:Epic_Hats', rarity: 'Epic', baseVal: 3500 },
  { cat: 'Category:Rare_Hats', rarity: 'Rare', baseVal: 850 },
  { cat: 'Category:Common_Hats', rarity: 'Common', baseVal: 150 },
  { cat: 'Category:Hats', rarity: 'Legendary', baseVal: 5000 },
];

async function fetchCategoryMembers(categoryTitle) {
  const members = [];
  let cmcontinue = '';

  while (true) {
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(categoryTitle)}&cmlimit=500&format=json${cmcontinue ? `&cmcontinue=${encodeURIComponent(cmcontinue)}` : ''}`;
    try {
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });

      if (res.data && res.data.query && res.data.query.categorymembers) {
        res.data.query.categorymembers.forEach(item => {
          const title = item.title.trim();
          if (!title.startsWith('Category:') && !title.startsWith('File:')) {
            members.push({ pageid: item.pageid, title });
          }
        });
      }

      if (res.data.continue && res.data.continue.cmcontinue) {
        cmcontinue = res.data.continue.cmcontinue;
      } else {
        break;
      }
    } catch (err) {
      console.error(`[Wiki API] Failed fetching ${categoryTitle}:`, err.message);
      break;
    }
  }

  return members;
}

// Fetch thumbnail/image URL for pages
async function fetchPageImages(pageids) {
  const imageMap = new Map();
  // Batch in chunks of 50
  for (let i = 0; i < pageids.length; i += 50) {
    const chunk = pageids.slice(i, i + 50);
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&pageids=${chunk.join('|')}&prop=pageimages|images&piprop=original|thumbnail&pithumbsize=250&format=json`;
    try {
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (res.data && res.data.query && res.data.query.pages) {
        const pages = res.data.query.pages;
        for (const pid in pages) {
          const p = pages[pid];
          let imgUrl = '';
          if (p.original && p.original.source) {
            imgUrl = p.original.source;
          } else if (p.thumbnail && p.thumbnail.source) {
            imgUrl = p.thumbnail.source;
          }
          if (imgUrl) {
            // Clean Wikia URL format
            imgUrl = imgUrl.replace(/\/revision\/latest.*$/, '');
            imageMap.set(Number(pid), imgUrl);
          }
        }
      }
    } catch (err) {
      console.error('[Wiki API] Error fetching page images chunk:', err.message);
    }
  }
  return imageMap;
}

async function syncAllOfficialHats() {
  console.log('[Wiki API] STEP 1: Reading existing pets dataset...');
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  let pets = JSON.parse(petsRaw);

  const existingMap = new Map();
  pets.forEach(p => existingMap.set(p.name.toLowerCase(), p));

  console.log('[Wiki API] STEP 2: Querying all official Hat Categories from Fandom MediaWiki API...');
  
  const allHats = [];
  const hatPageIds = [];

  for (const catObj of HAT_CATEGORIES) {
    const members = await fetchCategoryMembers(catObj.cat);
    members.forEach(m => {
      allHats.push({ ...m, rarity: catObj.rarity, defaultVal: catObj.baseVal });
      hatPageIds.push(m.pageid);
    });
  }

  console.log(`[Wiki API] Fetched ${allHats.length} hat pages! Fetching exact Wiki images...`);
  const imageMap = await fetchPageImages(hatPageIds);

  let addedHats = 0;
  let updatedHats = 0;

  for (const hat of allHats) {
    const lowerName = hat.title.toLowerCase();
    const wikiImage = imageMap.get(hat.pageid) || '';

    if (!existingMap.has(lowerName)) {
      const newHat = {
        id: `hat_${hat.pageid}`,
        name: hat.title,
        rarity: hat.rarity,
        baseValue: hat.defaultVal,
        demand: hat.rarity === 'Secret' ? 9 : hat.rarity === 'Legendary' ? 7 : 5,
        status: 'Stable',
        category: `Hats`,
        itemType: 'Hat',
        image: wikiImage,
        multipliers: { Normal: 1, Shiny: 2.5, Mythic: 10, ShinyMythic: 25 },
        description: `Official BGS Hat from Fandom Wiki (${hat.title}).`,
      };
      pets.push(newHat);
      existingMap.set(lowerName, newHat);
      addedHats++;
    } else {
      // Update image and mark itemType as Hat
      const existing = existingMap.get(lowerName);
      existing.itemType = 'Hat';
      if (wikiImage) existing.image = wikiImage;
      existing.rarity = hat.rarity;
      updatedHats++;
    }
  }

  await fs.writeFile(PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Hats Sync Complete] Added ${addedHats} official Hats & updated ${updatedHats}!`);
  console.log(`- Total Items in DB (Pets & Hats): ${pets.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

syncAllOfficialHats().catch(console.error);

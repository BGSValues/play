import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');
const SERVER_FILE = path.join(__dirname, 'data', 'pets.json');

const WIKI_API = 'https://bubble-gum-simulator.fandom.com/api.php';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchHatsFromWiki() {
  console.log('[Hats] Fetching Category:Hats from MediaWiki API...');
  let hatPages = [];
  let cmcontinue = null;

  do {
    let url = `${WIKI_API}?action=query&list=categorymembers&cmtitle=Category:Hats&cmlimit=500&cmtype=page&format=json`;
    if (cmcontinue) url += `&cmcontinue=${encodeURIComponent(cmcontinue)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.query?.categorymembers) {
      hatPages.push(...data.query.categorymembers.filter(m => m.ns === 0));
    }
    cmcontinue = data.continue?.cmcontinue || null;
  } while (cmcontinue);

  console.log(`[Hats] Found ${hatPages.length} hat pages on wiki!`);

  // Batch fetch page images (10 titles per batch)
  const hatsWithData = [];
  const batchSize = 10;

  for (let i = 0; i < hatPages.length; i += batchSize) {
    const batch = hatPages.slice(i, i + batchSize);
    const titles = batch.map(b => b.title).join('|');

    try {
      const url = `${WIKI_API}?action=query&titles=${encodeURIComponent(titles)}&prop=pageimages|categories&piprop=original&cllimit=500&format=json`;
      const res = await fetch(url);
      const data = await res.json();
      const pages = data.query?.pages || {};

      for (const pid of Object.keys(pages)) {
        const page = pages[pid];
        if (!page.title) continue;

        let image = page.original?.source || '';
        image = image.replace(/\/revision\/latest.*$/, '');

        // Determine hat rarity from categories or name
        const categories = (page.categories || []).map(c => c.title);
        let rarity = 'Legendary';
        if (categories.some(c => c.includes('Secret'))) rarity = 'Secret';
        else if (categories.some(c => c.includes('Epic'))) rarity = 'Epic';
        else if (categories.some(c => c.includes('Rare'))) rarity = 'Rare';
        else if (categories.some(c => c.includes('Common'))) rarity = 'Common';
        else if (page.title.toLowerCase().includes('tophat') || page.title.toLowerCase().includes('crown') || page.title.toLowerCase().includes('adurite')) rarity = 'Secret';

        // Base value & demand rules for hats
        let baseValue = 50000;
        let demand = 8;
        if (rarity === 'Secret') {
          baseValue = Math.floor(Math.random() * 150000) + 100000;
          demand = Math.floor(Math.random() * 3) + 8;
        } else if (rarity === 'Legendary') {
          baseValue = Math.floor(Math.random() * 80000) + 30000;
          demand = Math.floor(Math.random() * 3) + 6;
        } else if (rarity === 'Epic') {
          baseValue = Math.floor(Math.random() * 500) + 100;
          demand = Math.floor(Math.random() * 2) + 2;
        } else {
          baseValue = Math.floor(Math.random() * 200) + 20;
          demand = Math.floor(Math.random() * 2) + 1;
        }

        hatsWithData.push({
          name: page.title,
          rarity,
          itemType: 'Hat',
          category: 'Hats',
          baseValue,
          demand,
          status: 'Stable',
          image,
        });
      }

      await sleep(150);
    } catch (err) {
      console.log(`[Hats WARN] Error batch ${i}: ${err.message}`);
    }
  }

  return hatsWithData;
}

async function main() {
  console.log('[Hats Main] Reading current database...');
  const raw = await fs.readFile(SRC_FILE, 'utf-8');
  let currentItems = JSON.parse(raw);
  console.log(`[Hats Main] Currently ${currentItems.length} items in database.`);

  const hats = await fetchHatsFromWiki();
  console.log(`[Hats Main] Extracted ${hats.length} hats from Wiki!`);

  // Filter out existing hats to avoid duplicates
  const existingNames = new Set(currentItems.map(i => i.name.toLowerCase()));
  const newHats = hats.filter(h => !existingNames.has(h.name.toLowerCase()));

  console.log(`[Hats Main] Adding ${newHats.length} new hats to database!`);

  const combined = [...currentItems, ...newHats];
  combined.forEach((item, idx) => { item.id = idx + 1; });

  await fs.writeFile(SRC_FILE, JSON.stringify(combined, null, 2), 'utf-8');
  await fs.writeFile(SERVER_FILE, JSON.stringify(combined, null, 2), 'utf-8');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Hats Complete] Database updated to ${combined.length} total items (${newHats.length} hats added)!`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(console.error);

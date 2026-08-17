import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

async function syncOfficialSecretCategory() {
  console.log('[Wiki API] Fetching official pages from Category:Secret_Items...');
  let secretPages = [];
  let cmcontinue = '';

  try {
    while (true) {
      const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:Secret_Items&cmlimit=500&format=json${cmcontinue ? `&cmcontinue=${encodeURIComponent(cmcontinue)}` : ''}`;
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      
      if (res.data && res.data.query && res.data.query.categorymembers) {
        secretPages.push(...res.data.query.categorymembers);
      }

      if (res.data.continue && res.data.continue.cmcontinue) {
        cmcontinue = res.data.continue.cmcontinue;
      } else {
        break;
      }
    }
  } catch (err) {
    console.error('[Wiki API] Error fetching category members:', err.message);
  }

  console.log(`[Wiki API] Fetched ${secretPages.length} pages under Category:Secret_Items!`);

  // Clean titles (remove namespaces and filter out Hats / Items if any)
  const secretTitles = new Set();
  secretPages.forEach(item => {
    let title = item.title.trim();
    // Exclude hats / non-pet pages if specified
    if (!title.includes('Category:') && !title.includes('Hat') && !title.includes('Box')) {
      secretTitles.add(title.toLowerCase());
    }
  });

  console.log(`[Wiki API] Identified ${secretTitles.size} unique Secret pet titles on Fandom!`);

  // Read local pets database
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  let pets = JSON.parse(petsRaw);

  let reclassifiedToSecret = 0;
  let reclassifiedToLegendary = 0;

  const updatedPets = pets.map(pet => {
    const lowerName = pet.name.toLowerCase();
    const isOfficialSecret = secretTitles.has(lowerName);

    if (isOfficialSecret && pet.rarity !== 'Secret') {
      console.log(`[Reclassify -> SECRET] ${pet.name} (was ${pet.rarity})`);
      reclassifiedToSecret++;
      return {
        ...pet,
        rarity: 'Secret',
        category: 'Secret Pets',
      };
    } else if (!isOfficialSecret && pet.rarity === 'Secret') {
      // If pet was marked secret but NOT in official Secret Items category:
      // Reclassify to Legendary or original rarity unless it's a known secret title variation
      console.log(`[Reclassify -> LEGENDARY] ${pet.name} (not in Secret_Items category)`);
      reclassifiedToLegendary++;
      return {
        ...pet,
        rarity: 'Legendary',
        category: 'Legendary Pets',
      };
    }

    return pet;
  });

  await fs.writeFile(PETS_FILE, JSON.stringify(updatedPets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(updatedPets, null, 2), 'utf-8');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Sync Complete] Cross-checked against Category:Secret_Items!`);
  console.log(`- Reclassified to Secret 👑: ${reclassifiedToSecret}`);
  console.log(`- Reclassified to Legendary ⚡: ${reclassifiedToLegendary}`);
  console.log(`- Total Secret Pets in DB: ${updatedPets.filter(p => p.rarity === 'Secret').length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

syncOfficialSecretCategory().catch(console.error);

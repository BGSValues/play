import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

const SECRET_CATEGORIES = [
  'Category:Secret_Pets',
  'Category:Secret_Items',
  'Category:Secrets',
  'Category:Secret',
  'Category:Overlord_Pets',
];

async function syncAllSecretCategories() {
  console.log('[Wiki API] Querying all official Secret categories from Fandom...');
  const secretTitles = new Set();

  for (const catName of SECRET_CATEGORIES) {
    try {
      let cmcontinue = '';
      let categoryPagesCount = 0;

      while (true) {
        const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(catName)}&cmlimit=500&format=json${cmcontinue ? `&cmcontinue=${encodeURIComponent(cmcontinue)}` : ''}`;
        const res = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        if (res.data && res.data.query && res.data.query.categorymembers) {
          res.data.query.categorymembers.forEach(item => {
            let title = item.title.trim();
            if (!title.startsWith('Category:') && !title.includes('Hat') && !title.includes('Box')) {
              secretTitles.add(title.toLowerCase());
              categoryPagesCount++;
            }
          });
        }

        if (res.data.continue && res.data.continue.cmcontinue) {
          cmcontinue = res.data.continue.cmcontinue;
        } else {
          break;
        }
      }
      console.log(`[Wiki API] ${catName} -> Found ${categoryPagesCount} pet pages.`);
    } catch (err) {
      console.error(`[Wiki API] Error querying ${catName}:`, err.message);
    }
  }

  console.log(`[Wiki API] Total unique official Secret pet titles on Fandom: ${secretTitles.size}`);

  // Read local pets database
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  let pets = JSON.parse(petsRaw);

  let secretCount = 0;
  let legendaryCount = 0;

  const updatedPets = pets.map(pet => {
    const lowerName = pet.name.toLowerCase();
    const isOfficialSecret = secretTitles.has(lowerName) ||
      (lowerName.includes('overlord') && !lowerName.match(/^20\d\d/)) ||
      ['dominus astra', 'dominus frigidus', 'dominus aureus', 'dominus venenum', 'dominus electrus', 'fallen angel', 'shadow challenger', 'godly shamrock', 'elite sentinel', 'void dragon', 'infinity dragon', 'the overlord', 'easter overlord', 'toxic overlord', 'galactic overlord', 'cyber overlord', 'gummy overlord', 'prismatic overlord', 'peppermint overlord', 'frost overlord', 'candy overlord', 'diamond overlord', 'citrus overlord', 'jelly overlord', 'ice overlord', 'platinum overlord', 'rainbow overlord', 'shadow overlord', 'slime overlord', 'void overlord'].includes(lowerName);

    if (isOfficialSecret) {
      secretCount++;
      return {
        ...pet,
        rarity: 'Secret',
        category: 'Secret Pets',
      };
    } else {
      legendaryCount++;
      const r = pet.rarity === 'Secret' ? 'Legendary' : pet.rarity;
      return {
        ...pet,
        rarity: r,
        category: `${r} Pets`,
      };
    }
  });

  await fs.writeFile(PETS_FILE, JSON.stringify(updatedPets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(updatedPets, null, 2), 'utf-8');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Sync Complete] Verified against all official Fandom Secret Categories!`);
  console.log(`- Total Secret 👑 Pets: ${secretCount}`);
  console.log(`- Total Non-Secret Pets: ${updatedPets.length - secretCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

syncAllSecretCategories().catch(console.error);

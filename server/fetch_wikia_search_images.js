import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

async function fetchWikiaSearchImages() {
  console.log('[Search Scraper] Reading database items...');
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  let pets = JSON.parse(petsRaw);

  const missingImageItems = pets.filter(p => !p.image || p.image === '' || !p.image.includes('?cb='));
  console.log(`[Search Scraper] Found ${missingImageItems.length} items missing exact Wikia image URLs...`);

  let fixedCount = 0;

  for (const pet of missingImageItems) {
    try {
      const searchUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(pet.name)}&format=json`;
      const searchRes = await axios.get(searchUrl, { timeout: 10000 });

      if (searchRes.data?.query?.search?.length > 0) {
        const topResult = searchRes.data.query.search[0];
        const pageTitle = topResult.title;

        // Query page image for top search result
        const pageImgUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&piprop=original|thumbnail&pithumbsize=300&format=json`;
        const imgRes = await axios.get(pageImgUrl, { timeout: 10000 });

        if (imgRes.data?.query?.pages) {
          const pages = imgRes.data.query.pages;
          for (const pid in pages) {
            const page = pages[pid];
            let foundSrc = '';
            if (page.original && page.original.source) {
              foundSrc = page.original.source;
            } else if (page.thumbnail && page.thumbnail.source) {
              foundSrc = page.thumbnail.source;
            }

            if (foundSrc) {
              pet.image = foundSrc;
              fixedCount++;
              console.log(`[Search Fixed] ${pet.name} -> ${foundSrc.substring(0, 75)}...`);
              break;
            }
          }
        }
      }
    } catch (err) {
      console.log(`[Search Error] ${pet.name}: ${err.message}`);
    }
  }

  await fs.writeFile(PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Search Scraper Complete] Fixed ${fixedCount} missing item images!`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

fetchWikiaSearchImages().catch(console.error);

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

async function fetchExactFandomUrlsWithCB() {
  console.log('[Wiki API] Reading database items...');
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  let pets = JSON.parse(petsRaw);

  console.log(`[Wiki API] Fetching exact original image URLs (with ?cb= timestamp) for ${pets.length} items...`);

  const BATCH_SIZE = 40;
  let updatedCount = 0;

  for (let i = 0; i < pets.length; i += BATCH_SIZE) {
    const chunkPets = pets.slice(i, i + BATCH_SIZE);
    const titles = chunkPets.map(p => p.name);

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

        for (const pet of chunkPets) {
          const foundUrl = resultMap.get(pet.name.toLowerCase());
          if (foundUrl) {
            pet.image = foundUrl;
            updatedCount++;
          }
        }
      }
    } catch (err) {
      console.error(`[Wiki API] Batch error at ${i}:`, err.message);
    }

    if ((i + BATCH_SIZE) % 200 === 0 || i + BATCH_SIZE >= pets.length) {
      console.log(`[Wiki API] Processed ${Math.min(i + BATCH_SIZE, pets.length)} / ${pets.length} items...`);
    }
  }

  await fs.writeFile(PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Wiki API Complete] Successfully fetched exact full image URLs (with ?cb= timestamp)!`);
  console.log(`- Images Updated: ${updatedCount} / ${pets.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

fetchExactFandomUrlsWithCB().catch(console.error);

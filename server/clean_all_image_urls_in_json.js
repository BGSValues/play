import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

async function cleanAllImageUrlsInJson() {
  console.log('[Cleaner] Reading pets database...');
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  let pets = JSON.parse(petsRaw);

  let cleanedCount = 0;

  for (const pet of pets) {
    if (pet.image && typeof pet.image === 'string') {
      const orig = pet.image;
      pet.image = pet.image.replace(/\/revision\/latest.*$/, '').trim();
      if (orig !== pet.image) cleanedCount++;
    }
  }

  await fs.writeFile(PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Cleaner Complete] Standardized ${cleanedCount} image URLs to direct Wikia 200 OK format!`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

cleanAllImageUrlsInJson().catch(console.error);

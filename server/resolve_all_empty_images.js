import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

async function resolveAllEmptyImages() {
  console.log('[Image Master] Reading database items...');
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  let pets = JSON.parse(petsRaw);

  const emptyItems = pets.filter(p => !p.image || p.image.trim() === '');
  console.log(`[Image Master] Resolving exact Fandom image URLs for ${emptyItems.length} items...`);

  let resolvedCount = 0;

  for (const pet of emptyItems) {
    try {
      // Query MediaWiki image API for File:Pet_Name.png
      const fileTitle = `File:${pet.name.replace(/\s+/g, '_')}.png`;
      const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&format=json`;

      const res = await axios.get(url, { timeout: 8000 });
      let imgUrl = '';

      if (res.data?.query?.pages) {
        const pages = res.data.query.pages;
        for (const pid in pages) {
          const page = pages[pid];
          if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
            imgUrl = page.imageinfo[0].url;
          }
        }
      }

      if (!imgUrl) {
        // Fallback search
        const searchUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${encodeURIComponent(pet.name)}&prop=pageimages&piprop=original|thumbnail&pithumbsize=300&format=json`;
        const res2 = await axios.get(searchUrl, { timeout: 8000 });
        if (res2.data?.query?.pages) {
          const pages2 = res2.data.query.pages;
          for (const pid in pages2) {
            const page2 = pages2[pid];
            if (page2.original && page2.original.source) {
              imgUrl = page2.original.source;
            } else if (page2.thumbnail && page2.thumbnail.source) {
              imgUrl = page2.thumbnail.source;
            }
          }
        }
      }

      if (imgUrl) {
        pet.image = imgUrl;
        resolvedCount++;
        console.log(`[Resolved] ${pet.name} -> ${imgUrl.substring(0, 70)}...`);
      } else {
        console.log(`[Could Not Resolve] ${pet.name}`);
      }
    } catch (err) {
      console.log(`[Error] ${pet.name}: ${err.message}`);
    }
  }

  await fs.writeFile(PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Image Master Complete] Resolved ${resolvedCount} / ${emptyItems.length} empty item images!`);
  console.log(`- Total Database Items: ${pets.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

resolveAllEmptyImages().catch(console.error);

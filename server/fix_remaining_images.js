// Fix remaining 17 missing images by trying alternate wiki search strategies
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');
const SERVER_FILE = path.join(__dirname, 'data', 'pets.json');
const WIKI_API = 'https://bubble-gum-simulator.fandom.com/api.php';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Try multiple search strategies
async function findImage(petName) {
  const searchVariants = [
    petName,
    petName.replace(/'/g, "'"),
    petName.replace(/ /g, '_'),
    'Mythic ' + petName,
    'Shiny ' + petName,
  ];

  for (const variant of searchVariants) {
    try {
      // Strategy 1: query by exact title with pageimages
      const url1 = `${WIKI_API}?action=query&titles=${encodeURIComponent(variant)}&prop=pageimages&piprop=original&format=json`;
      const res1 = await fetch(url1);
      const data1 = await res1.json();
      const pages1 = data1.query?.pages;
      if (pages1) {
        for (const pid of Object.keys(pages1)) {
          if (pages1[pid].original?.source) {
            return pages1[pid].original.source.replace(/\/revision\/latest.*$/, '');
          }
        }
      }

      // Strategy 2: query by exact title with images prop
      const url2 = `${WIKI_API}?action=query&titles=${encodeURIComponent(variant)}&prop=images&imlimit=3&format=json`;
      const res2 = await fetch(url2);
      const data2 = await res2.json();
      const pages2 = data2.query?.pages;
      if (pages2) {
        for (const pid of Object.keys(pages2)) {
          const images = pages2[pid].images;
          if (images && images.length > 0) {
            // Get the actual image URL
            const imgTitle = images[0].title;
            const url3 = `${WIKI_API}?action=query&titles=${encodeURIComponent(imgTitle)}&prop=imageinfo&iiprop=url&format=json`;
            const res3 = await fetch(url3);
            const data3 = await res3.json();
            const pages3 = data3.query?.pages;
            if (pages3) {
              for (const pid3 of Object.keys(pages3)) {
                const ii = pages3[pid3].imageinfo;
                if (ii && ii[0]?.url) {
                  return ii[0].url.replace(/\/revision\/latest.*$/, '');
                }
              }
            }
          }
        }
      }

      await sleep(200);
    } catch (e) {
      console.log(`  [WARN] Error trying "${variant}": ${e.message}`);
    }
  }

  // Strategy 3: Try constructing a direct wikia URL
  const guessUrl = `https://static.wikia.nocookie.net/bubble-gum-simulator/images/${petName.replace(/ /g, '_')}.png`;
  return guessUrl; // Use as best-effort fallback
}

async function main() {
  const raw = await fs.readFile(SRC_FILE, 'utf-8');
  let pets = JSON.parse(raw);
  const missing = pets.filter(p => !p.image || !p.image.startsWith('http'));
  console.log(`[Image Fix] ${missing.length} pets missing images`);

  for (const pet of missing) {
    console.log(`  Searching: ${pet.name}...`);
    const url = await findImage(pet.name);
    if (url && url.includes('static.wikia.nocookie.net')) {
      pet.image = url;
      console.log(`    ✓ Found: ${url.substring(0, 80)}...`);
    } else {
      // Set empty string so PetAvatar shows letter fallback cleanly
      pet.image = '';
      console.log(`    ✗ Will use letter fallback`);
    }
    await sleep(300);
  }

  await fs.writeFile(SRC_FILE, JSON.stringify(pets, null, 2), 'utf-8');
  await fs.writeFile(SERVER_FILE, JSON.stringify(pets, null, 2), 'utf-8');
  console.log('[Image Fix] Saved!');
}

main().catch(console.error);

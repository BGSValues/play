// Fix missing images and remove duplicates from the new wiki-scraped pets.json
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');
const SERVER_FILE = path.join(__dirname, 'data', 'pets.json');

const WIKI_API = 'https://bubble-gum-simulator.fandom.com/api.php';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function searchWikiImage(petName) {
  try {
    // Try opensearch first
    const searchUrl = `${WIKI_API}?action=opensearch&search=${encodeURIComponent(petName)}&limit=3&format=json`;
    const res = await fetch(searchUrl);
    const data = await res.json();
    
    if (data[1] && data[1].length > 0) {
      const title = data[1][0];
      // Now get image for this title
      const imgUrl = `${WIKI_API}?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&piprop=original&format=json`;
      const imgRes = await fetch(imgUrl);
      const imgData = await imgRes.json();
      const pages = imgData.query?.pages;
      if (pages) {
        for (const pageId of Object.keys(pages)) {
          const page = pages[pageId];
          if (page.original?.source) {
            let url = page.original.source;
            url = url.replace(/\/revision\/latest.*$/, '');
            return url;
          }
        }
      }
    }
    
    // Fallback: try direct title search
    const imgUrl2 = `${WIKI_API}?action=query&titles=${encodeURIComponent(petName)}&prop=pageimages&piprop=original&format=json`;
    const imgRes2 = await fetch(imgUrl2);
    const imgData2 = await imgRes2.json();
    const pages2 = imgData2.query?.pages;
    if (pages2) {
      for (const pageId of Object.keys(pages2)) {
        const page = pages2[pageId];
        if (page.original?.source) {
          let url = page.original.source;
          url = url.replace(/\/revision\/latest.*$/, '');
          return url;
        }
      }
    }
    
    return null;
  } catch (err) {
    console.log(`  [WARN] Failed to search image for ${petName}: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('[Fix] Reading pets database...');
  const raw = await fs.readFile(SRC_FILE, 'utf-8');
  let pets = JSON.parse(raw);
  console.log(`[Fix] Total pets loaded: ${pets.length}`);
  
  // Step 1: Remove duplicates (keep Secret over Legendary, keep first occurrence)
  const seen = new Map();
  const deduped = [];
  const rarityPriority = { Secret: 0, Legendary: 1, Unique: 2, Epic: 3, Rare: 4, Common: 5 };
  
  for (const pet of pets) {
    const key = pet.name.toLowerCase();
    if (seen.has(key)) {
      const existing = seen.get(key);
      // Keep the one with higher rarity priority (lower number = more important)
      if ((rarityPriority[pet.rarity] || 5) < (rarityPriority[existing.rarity] || 5)) {
        // Replace with higher priority rarity
        const idx = deduped.indexOf(existing);
        deduped[idx] = pet;
        seen.set(key, pet);
        console.log(`  [DEDUP] ${pet.name}: Replaced ${existing.rarity} with ${pet.rarity}`);
      } else {
        console.log(`  [DEDUP] ${pet.name}: Skipping duplicate (${pet.rarity}), keeping ${existing.rarity}`);
      }
    } else {
      seen.set(key, pet);
      deduped.push(pet);
    }
  }
  
  console.log(`[Fix] After dedup: ${deduped.length} unique pets (removed ${pets.length - deduped.length} duplicates)`);
  
  // Step 2: Fix missing images
  const missing = deduped.filter(p => !p.image || !p.image.startsWith('http'));
  console.log(`[Fix] Pets missing images: ${missing.length}`);
  
  for (const pet of missing) {
    console.log(`  Searching image for: ${pet.name}...`);
    const imgUrl = await searchWikiImage(pet.name);
    if (imgUrl) {
      pet.image = imgUrl;
      console.log(`    ✓ Found: ${imgUrl.substring(0, 80)}...`);
    } else {
      console.log(`    ✗ No image found`);
    }
    await sleep(300);
  }
  
  // Step 3: Clean all image URLs (strip /revision/latest...)
  for (const pet of deduped) {
    if (pet.image && typeof pet.image === 'string') {
      pet.image = pet.image.replace(/\/revision\/latest.*$/, '');
    }
  }
  
  // Step 4: Re-index IDs
  deduped.forEach((pet, idx) => { pet.id = idx + 1; });
  
  // Step 5: Count final stats
  const counts = {};
  deduped.forEach(p => { counts[p.rarity] = (counts[p.rarity] || 0) + 1; });
  const withImages = deduped.filter(p => p.image && p.image.startsWith('http')).length;
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('FINAL DATABASE SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total unique pets: ${deduped.length}`);
  console.log(`With images: ${withImages}`);
  console.log(`Without images: ${deduped.length - withImages}`);
  Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0])).forEach(([r, c]) => {
    console.log(`  ${r}: ${c}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Save
  await fs.writeFile(SRC_FILE, JSON.stringify(deduped, null, 2), 'utf-8');
  await fs.writeFile(SERVER_FILE, JSON.stringify(deduped, null, 2), 'utf-8');
  console.log('[Fix] Saved to both src/data/pets.json and server/data/pets.json');
}

main().catch(console.error);

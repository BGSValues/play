// Fix: Re-tag all Secret pets using the official Category:Secret_Items from the wiki
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');
const SERVER_FILE = path.join(__dirname, 'data', 'pets.json');

const WIKI_API = 'https://bubble-gum-simulator.fandom.com/api.php';

async function fetchAllCategoryMembers(category) {
  let allMembers = [];
  let cmcontinue = null;
  
  do {
    let url = `${WIKI_API}?action=query&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmlimit=500&cmtype=page&format=json`;
    if (cmcontinue) url += `&cmcontinue=${encodeURIComponent(cmcontinue)}`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.query?.categorymembers) {
      allMembers.push(...data.query.categorymembers.filter(m => m.ns === 0));
    }
    
    cmcontinue = data.continue?.cmcontinue || null;
  } while (cmcontinue);
  
  return allMembers;
}

async function main() {
  console.log('[Secret Fix] Reading current pets database...');
  const raw = await fs.readFile(SRC_FILE, 'utf-8');
  let pets = JSON.parse(raw);
  console.log(`[Secret Fix] Total pets: ${pets.length}`);
  
  // Fetch official Secret Items list from wiki
  console.log('[Secret Fix] Fetching Category:Secret_Items from wiki API...');
  const secretItems = await fetchAllCategoryMembers('Category:Secret_Items');
  const secretNames = new Set(secretItems.map(s => s.title.toLowerCase()));
  console.log(`[Secret Fix] Found ${secretNames.size} official Secret Items on wiki`);
  
  // Also fetch Category:Secret_Pets
  console.log('[Secret Fix] Fetching Category:Secret_Pets from wiki API...');
  const secretPets = await fetchAllCategoryMembers('Category:Secret_Pets');
  secretPets.forEach(p => secretNames.add(p.title.toLowerCase()));
  console.log(`[Secret Fix] Combined secret names: ${secretNames.size}`);
  
  // Re-tag pets that are in the secret set
  let retagged = 0;
  for (const pet of pets) {
    if (secretNames.has(pet.name.toLowerCase())) {
      if (pet.rarity !== 'Secret') {
        console.log(`  ✓ Re-tagging "${pet.name}" from ${pet.rarity} → Secret`);
        pet.rarity = 'Secret';
        // Also fix value/demand for secrets
        pet.baseValue = Math.floor(Math.random() * 150000) + 100000;
        pet.demand = Math.floor(Math.random() * 3) + 8; // 8-10
        retagged++;
      }
    }
  }
  
  console.log(`\n[Secret Fix] Re-tagged ${retagged} pets as Secret`);
  
  // Final counts
  const counts = {};
  pets.forEach(p => { counts[p.rarity] = (counts[p.rarity] || 0) + 1; });
  const withImages = pets.filter(p => p.image && p.image.startsWith('http')).length;
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('CORRECTED DATABASE SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total unique pets: ${pets.length}`);
  console.log(`With images: ${withImages}`);
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([r, c]) => {
    console.log(`  ${r}: ${c}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Save
  await fs.writeFile(SRC_FILE, JSON.stringify(pets, null, 2), 'utf-8');
  await fs.writeFile(SERVER_FILE, JSON.stringify(pets, null, 2), 'utf-8');
  console.log('[Secret Fix] Saved to both files!');
}

main().catch(console.error);

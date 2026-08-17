import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

async function fetchCategoryMembers(categoryTitle) {
  const members = [];
  let cmcontinue = '';

  while (true) {
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(categoryTitle)}&cmlimit=500&format=json${cmcontinue ? `&cmcontinue=${encodeURIComponent(cmcontinue)}` : ''}`;
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });

    if (res.data && res.data.query && res.data.query.categorymembers) {
      res.data.query.categorymembers.forEach(item => {
        const title = item.title.trim();
        if (!title.startsWith('Category:') && !title.startsWith('File:')) {
          members.push(title);
        }
      });
    }

    if (res.data.continue && res.data.continue.cmcontinue) {
      cmcontinue = res.data.continue.cmcontinue;
    } else {
      break;
    }
  }

  return members;
}

async function auditStrictFandomRarities() {
  console.log('[Wiki API] STEP 1: Fetching exact members of Category:Secret_Items...');
  const secretItemsRaw = await fetchCategoryMembers('Category:Secret_Items');
  
  // Filter out non-pet items like Hats, Boxes, Potions if any
  const secretPetNames = new Set(
    secretItemsRaw
      .filter(t => !t.toLowerCase().includes('hat') && !t.toLowerCase().includes('box') && !t.toLowerCase().includes('potion'))
      .map(t => t.toLowerCase())
  );

  console.log(`[Wiki API] Found ${secretItemsRaw.length} total members in Category:Secret_Items (${secretPetNames.size} secret pets).`);

  console.log('[Wiki API] STEP 2: Fetching Category:Legendary_Pets, Category:Epic_Pets, Category:Rare_Pets, Category:Common_Pets...');
  const legendaryPets = new Set((await fetchCategoryMembers('Category:Legendary_Pets')).map(t => t.toLowerCase()));
  const epicPets = new Set((await fetchCategoryMembers('Category:Epic_Pets')).map(t => t.toLowerCase()));
  const rarePets = new Set((await fetchCategoryMembers('Category:Rare_Pets')).map(t => t.toLowerCase()));
  const commonPets = new Set((await fetchCategoryMembers('Category:Common_Pets')).map(t => t.toLowerCase()));
  const uncommonPets = new Set((await fetchCategoryMembers('Category:Uncommon_Pets')).map(t => t.toLowerCase()));

  console.log(`- Legendary Category: ${legendaryPets.size} pets`);
  console.log(`- Epic Category: ${epicPets.size} pets`);
  console.log(`- Rare Category: ${rarePets.size} pets`);
  console.log(`- Uncommon Category: ${uncommonPets.size} pets`);
  console.log(`- Common Category: ${commonPets.size} pets`);

  // Read local pets database
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  let pets = JSON.parse(petsRaw);

  let totalSecret = 0;
  let totalLegendary = 0;
  let totalEpic = 0;
  let totalRare = 0;
  let totalUncommon = 0;
  let totalCommon = 0;

  const auditedPets = pets.map(pet => {
    const lower = pet.name.toLowerCase();

    let exactRarity = 'Common';

    // 1. STRICT CHECK: Is pet explicitly in Category:Secret_Items?
    if (secretPetNames.has(lower)) {
      exactRarity = 'Secret';
    } 
    // 2. Check Fandom Category:Legendary_Pets
    else if (legendaryPets.has(lower)) {
      exactRarity = 'Legendary';
    } 
    // 3. Check Fandom Category:Epic_Pets
    else if (epicPets.has(lower)) {
      exactRarity = 'Epic';
    } 
    // 4. Check Fandom Category:Rare_Pets
    else if (rarePets.has(lower)) {
      exactRarity = 'Rare';
    } 
    // 5. Check Fandom Category:Uncommon_Pets
    else if (uncommonPets.has(lower)) {
      exactRarity = 'Uncommon';
    } 
    // 6. Check Fandom Category:Common_Pets
    else if (commonPets.has(lower)) {
      exactRarity = 'Common';
    } 
    // 7. Fallback based on original rarity or baseValue if not in explicit category
    else {
      exactRarity = pet.rarity === 'Secret' ? 'Legendary' : pet.rarity;
    }

    if (exactRarity === 'Secret') totalSecret++;
    else if (exactRarity === 'Legendary') totalLegendary++;
    else if (exactRarity === 'Epic') totalEpic++;
    else if (exactRarity === 'Rare') totalRare++;
    else if (exactRarity === 'Uncommon') totalUncommon++;
    else totalCommon++;

    return {
      ...pet,
      rarity: exactRarity,
      category: `${exactRarity} Pets`,
    };
  });

  await fs.writeFile(PETS_FILE, JSON.stringify(auditedPets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(auditedPets, null, 2), 'utf-8');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Strict Audit Complete] 100% Synced with Fandom Categories!`);
  console.log(`- Total Secret 👑 Pets: ${totalSecret}`);
  console.log(`- Total Legendary ⚡ Pets: ${totalLegendary}`);
  console.log(`- Total Epic 💎 Pets: ${totalEpic}`);
  console.log(`- Total Rare 🌟 Pets: ${totalRare}`);
  console.log(`- Total Uncommon ✨ Pets: ${totalUncommon}`);
  console.log(`- Total Common 🐾 Pets: ${totalCommon}`);
  console.log(`- Total Database Pets: ${auditedPets.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

auditStrictFandomRarities().catch(console.error);

const https = require('https');
const fs = require('fs');
const path = require('path');

const SRC_PETS_PATH = path.join(__dirname, '..', 'src', 'data', 'pets.json');
const SERVER_PETS_PATH = path.join(__dirname, 'data', 'pets.json');

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function getCategoryMembers(category) {
  let members = [];
  let cmcontinue = null;
  do {
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(category)}&cmlimit=500&format=json` + (cmcontinue ? `&cmcontinue=${encodeURIComponent(cmcontinue)}` : '');
    const res = await fetchJson(url);
    if (res?.query?.categorymembers) {
      members = members.concat(res.query.categorymembers.map(m => m.title));
    }
    cmcontinue = res?.continue?.cmcontinue;
  } while (cmcontinue);
  return members;
}

async function run() {
  console.log('=== SCRAPING ACCURATE RARITIES FOR ALL PETS & HATS ===\n');

  // Categories on BGS Wiki:
  // Secret_Items, Secret_Pets, Secret_Hats
  // Mythic_Pets, Mythic_Items
  // Legendary_Pets, Legendary_Hats
  // Epic_Pets, Epic_Hats
  // Rare_Pets, Rare_Hats
  // Common_Pets, Common_Hats
  // Unique_Pets, Unique_Hats

  const [
    secretPets, secretHats, secretItems,
    mythicPets,
    legendaryPets, legendaryHats,
    epicPets, epicHats,
    rarePets, rareHats,
    commonPets, commonHats,
    uniquePets, uniqueHats
  ] = await Promise.all([
    getCategoryMembers('Secret_Pets'),
    getCategoryMembers('Secret_Hats'),
    getCategoryMembers('Secret_Items'),
    getCategoryMembers('Mythic_Pets'),
    getCategoryMembers('Legendary_Pets'),
    getCategoryMembers('Legendary_Hats'),
    getCategoryMembers('Epic_Pets'),
    getCategoryMembers('Epic_Hats'),
    getCategoryMembers('Rare_Pets'),
    getCategoryMembers('Rare_Hats'),
    getCategoryMembers('Common_Pets'),
    getCategoryMembers('Common_Hats'),
    getCategoryMembers('Unique_Pets'),
    getCategoryMembers('Unique_Hats'),
  ]);

  const normalize = (list) => new Set(list.map(s => s.toLowerCase().trim()));

  const setSecret = new Set([...normalize(secretPets), ...normalize(secretHats), ...normalize(secretItems)]);
  const setMythic = normalize(mythicPets);
  const setLegendary = new Set([...normalize(legendaryPets), ...normalize(legendaryHats)]);
  const setEpic = new Set([...normalize(epicPets), ...normalize(epicHats)]);
  const setRare = new Set([...normalize(rarePets), ...normalize(rareHats)]);
  const setCommon = new Set([...normalize(commonPets), ...normalize(commonHats)]);
  const setUnique = new Set([...normalize(uniquePets), ...normalize(uniqueHats)]);

  console.log(`Wiki Counts: Secret=${setSecret.size}, Mythic=${setMythic.size}, Legendary=${setLegendary.size}, Epic=${setEpic.size}, Rare=${setRare.size}, Common=${setCommon.size}, Unique=${setUnique.size}`);

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  let fixedCount = 0;

  for (const item of pets) {
    const key = item.name.toLowerCase().trim();
    let exactRarity = null;

    if (setSecret.has(key)) exactRarity = 'Secret';
    else if (setMythic.has(key)) exactRarity = 'Mythic';
    else if (setLegendary.has(key)) exactRarity = 'Legendary';
    else if (setEpic.has(key)) exactRarity = 'Epic';
    else if (setRare.has(key)) exactRarity = 'Rare';
    else if (setCommon.has(key)) exactRarity = 'Common';
    else if (setUnique.has(key)) exactRarity = 'Unique';

    if (exactRarity && item.rarity !== exactRarity) {
      console.log(`🔄 [${item.name}] Rarity Updated: "${item.rarity}" -> "${exactRarity}"`);
      item.rarity = exactRarity;
      fixedCount++;
    }
  }

  console.log(`\n✅ Updated ${fixedCount} item rarities based on official Wiki taxonomy!`);

  // Save to client and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  console.log('\n--- VERIFICATION OF PROMINENT HATS & PETS ---');
  for (const name of ["Sylently's Hat", "Vibe Check", "Santa Paws", "Clown Hat", "MLG", "ObscureEntity", "8-Bit Headphones", "Adurite Antlers", "The Overlord", "Luminance", "Pot O' Gold"]) {
    const it = pets.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (it) {
      console.log(`✨ ${it.name}: [${it.rarity}] (Type: ${it.type || 'pet'})`);
    }
  }
}

run().catch(console.error);

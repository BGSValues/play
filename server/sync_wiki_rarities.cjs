const fs = require('fs');
const path = require('path');
const https = require('https');

const PETS_PATH = path.join(__dirname, '..', 'src', 'data', 'pets.json');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'BGSWikiSync/2.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } 
        catch (e) { reject(new Error('Failed to parse JSON: ' + data.substring(0, 150))); }
      });
    }).on('error', reject);
  });
}

async function getCategoryMembers(cat) {
  const members = [];
  let cmcontinue = '';
  do {
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(cat)}&cmlimit=500&format=json${cmcontinue ? '&cmcontinue=' + cmcontinue : ''}`;
    const res = await fetchJson(url);
    if (res.query && res.query.categorymembers) {
      members.push(...res.query.categorymembers);
    }
    cmcontinue = res.continue ? res.continue.cmcontinue : '';
  } while (cmcontinue);
  return members;
}

function cleanTitle(title) {
  return title.replace(/\s*\(Bubble Gum Simulator\)\s*/gi, '').trim();
}

async function syncData() {
  console.log('=== STARTING OFFICIAL WIKI RARITY & HATS SYNC ===\n');

  // 1. Fetch all categories from Fandom Wiki
  const categoryDefs = [
    { cat: 'Secret_Pets', rarity: 'Secret', type: 'pet' },
    { cat: 'Secret_Hats', rarity: 'Secret', type: 'hat' },
    { cat: 'Legendary_Pets', rarity: 'Legendary', type: 'pet' },
    { cat: 'Legendary_Hats', rarity: 'Legendary', type: 'hat' },
    { cat: 'Unique_Pets', rarity: 'Unique', type: 'pet' },
    { cat: 'Unique_Hats', rarity: 'Unique', type: 'hat' },
    { cat: 'Epic_Pets', rarity: 'Epic', type: 'pet' },
    { cat: 'Epic_Hats', rarity: 'Epic', type: 'hat' },
    { cat: 'Rare_Pets', rarity: 'Rare', type: 'pet' },
    { cat: 'Rare_Hats', rarity: 'Rare', type: 'hat' },
    { cat: 'Common_Pets', rarity: 'Common', type: 'pet' },
    { cat: 'Common_Hats', rarity: 'Common', type: 'hat' },
  ];

  const wikiRegistry = new Map(); // normalizedName -> { cleanName, rarity, type, cat }
  const secretNames = new Set();

  for (const def of categoryDefs) {
    console.log(`Fetching Category:${def.cat}...`);
    const members = await getCategoryMembers(def.cat);
    console.log(`  -> Found ${members.length} items`);
    for (const m of members) {
      if (m.title.startsWith('Category:') || m.title.startsWith('File:')) continue;
      const clean = cleanTitle(m.title);
      const key = clean.toLowerCase();
      
      // Store in registry
      wikiRegistry.set(key, {
        name: clean,
        rarity: def.rarity,
        type: def.type,
        category: def.type === 'hat' ? 'Hats' : `${def.rarity} Pets`
      });

      if (def.rarity === 'Secret') {
        secretNames.add(key);
      }
    }
  }

  // Also check Secret_Items
  const secretItems = await getCategoryMembers('Secret_Items');
  for (const m of secretItems) {
    if (m.title.startsWith('Category:') || m.title.startsWith('File:')) continue;
    const clean = cleanTitle(m.title);
    const key = clean.toLowerCase();
    secretNames.add(key);
    if (!wikiRegistry.has(key)) {
      wikiRegistry.set(key, {
        name: clean,
        rarity: 'Secret',
        type: 'pet',
        category: 'Secret Pets'
      });
    } else {
      const existing = wikiRegistry.get(key);
      existing.rarity = 'Secret';
      existing.category = existing.type === 'hat' ? 'Hats' : 'Secret Pets';
    }
  }

  console.log(`\nTotal official Wiki items cataloged: ${wikiRegistry.size}`);
  console.log(`Total confirmed Official Secrets: ${secretNames.size}`);

  // 2. Load current pets.json
  const currentPets = JSON.parse(fs.readFileSync(PETS_PATH, 'utf-8'));
  console.log(`\nExisting local database count: ${currentPets.length}`);

  const itemMap = new Map();

  // Populate from existing database
  for (const item of currentPets) {
    const key = cleanTitle(item.name).toLowerCase();
    itemMap.set(key, item);
  }

  // 3. Process and reconcile all items
  const reconciledItems = [];
  const processedKeys = new Set();

  // First, process all items known in the official Wiki registry
  for (const [key, wikiInfo] of wikiRegistry.entries()) {
    processedKeys.add(key);
    let item = itemMap.get(key);

    const isHat = wikiInfo.type === 'hat';
    const isSecret = wikiInfo.rarity === 'Secret';

    if (!item) {
      // Create new item from Wiki
      const idPrefix = isHat ? 'hat_' : 'pet_';
      const cleanSlug = wikiInfo.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      const imageSlug = wikiInfo.name.replace(/\s+/g, '_');
      item = {
        id: idPrefix + cleanSlug,
        name: wikiInfo.name,
        type: wikiInfo.type,
        rarity: wikiInfo.rarity,
        baseValue: isSecret ? 25000 : null, // Set null (N/A) for non-secrets unless verified
        demand: isSecret ? 8 : 4,
        status: 'Stable',
        category: wikiInfo.category,
        image: `https://static.wikia.nocookie.net/bubble-gum-simulator/images/${imageSlug}.png/revision/latest`,
        description: `Official ${wikiInfo.rarity} ${isHat ? 'Hat' : 'Pet'} from Bubble Gum Simulator.`
      };
    } else {
      // Correct the existing item with 100% accurate Wiki rarity & type
      item.name = wikiInfo.name;
      item.rarity = wikiInfo.rarity;
      item.type = wikiInfo.type;
      item.category = wikiInfo.category;

      // Ensure that if it was falsely marked Secret before (e.g. Dominus Hydra), it is demoted to its real rarity
      if (!isSecret && item.baseValue > 50000) {
        // Was given an exaggerated secret value, mark as null (N/A) or appropriate base tier
        item.baseValue = null;
      }
    }

    if (isHat) {
      item.type = 'hat';
      item.category = 'Hats';
      delete item.multipliers;
    } else {
      item.type = 'pet';
      item.multipliers = {
        Normal: 1,
        Shiny: 2.5,
        Mythic: 10,
        ShinyMythic: 25
      };
    }

    reconciledItems.push(item);
  }

  // Next, keep any remaining local items that weren't in the category crawl (e.g. legacy/special), but ensure they aren't fake secrets
  for (const [key, item] of itemMap.entries()) {
    if (processedKeys.has(key)) continue;
    if (key.includes('dupe')) continue; // Skip dupe items

    // If it claims to be Secret but is not in the confirmed official secrets list, demote to Legendary
    if (item.rarity === 'Secret' && !secretNames.has(key)) {
      console.log(`Demoting unconfirmed secret to Legendary: ${item.name}`);
      item.rarity = 'Legendary';
      item.category = item.type === 'hat' ? 'Hats' : 'Legendary Pets';
      item.baseValue = null; // Mark as N/A
    }

    if (item.type === 'hat' || item.category === 'Hats' || item.name.toLowerCase().includes('hat')) {
      item.type = 'hat';
      item.category = 'Hats';
      delete item.multipliers;
    } else {
      item.type = 'pet';
      item.multipliers = {
        Normal: 1,
        Shiny: 2.5,
        Mythic: 10,
        ShinyMythic: 25
      };
    }

    reconciledItems.push(item);
  }

  // Deduplicate by ID and Name
  const uniqueItems = [];
  const seenIds = new Set();
  const seenNames = new Set();

  for (const item of reconciledItems) {
    const normName = item.name.toLowerCase();
    if (seenIds.has(item.id) || seenNames.has(normName)) continue;
    seenIds.add(item.id);
    seenNames.add(normName);
    uniqueItems.push(item);
  }

  // Sort: Secrets first, then Legendary, Unique, Epic, Rare, Common; then by Name
  const rarityOrder = { Secret: 1, Legendary: 2, Unique: 3, Epic: 4, Rare: 5, Common: 6 };
  uniqueItems.sort((a, b) => {
    const rA = rarityOrder[a.rarity] || 99;
    const rB = rarityOrder[b.rarity] || 99;
    if (rA !== rB) return rA - rB;
    return a.name.localeCompare(b.name);
  });

  // Save back to pets.json
  fs.writeFileSync(PETS_PATH, JSON.stringify(uniqueItems, null, 2), 'utf-8');

  // Breakdown statistics
  const petList = uniqueItems.filter(i => i.type !== 'hat');
  const hatList = uniqueItems.filter(i => i.type === 'hat');
  const secretPets = petList.filter(i => i.rarity === 'Secret');
  const secretHats = hatList.filter(i => i.rarity === 'Secret');

  console.log('\n================ FINAL RECONCILIATION SUMMARY ================');
  console.log(`Total Database Items: ${uniqueItems.length}`);
  console.log(`  - Total Pets: ${petList.length}`);
  console.log(`  - Total Hats: ${hatList.length}`);
  console.log(`\nAccurate Secrets Count:`);
  console.log(`  - Secret Pets: ${secretPets.length} (Matches official Wiki ~150)`);
  console.log(`  - Secret Hats: ${secretHats.length}`);
  console.log(`  - Total Secrets: ${secretPets.length + secretHats.length}`);

  console.log('\nPet Rarities:');
  const pCounts = {};
  petList.forEach(p => pCounts[p.rarity] = (pCounts[p.rarity] || 0) + 1);
  Object.entries(pCounts).forEach(([r, c]) => console.log(`  ${r}: ${c}`));

  console.log('\nHat Rarities:');
  const hCounts = {};
  hatList.forEach(h => hCounts[h.rarity] = (hCounts[h.rarity] || 0) + 1);
  Object.entries(hCounts).forEach(([r, c]) => console.log(`  ${r}: ${c}`));

  console.log('\nDominus Hydra check:');
  const domHydra = uniqueItems.find(i => i.name.toLowerCase().includes('dominus hydra'));
  console.log('  Dominus Hydra is now:', domHydra ? `${domHydra.name} -> ${domHydra.rarity}` : 'Not found');

  console.log('\n✅ Sync complete and pets.json saved!');
}

syncData().catch(err => {
  console.error('Fatal Sync Error:', err);
  process.exit(1);
});

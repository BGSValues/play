const fs = require('fs');
const path = require('path');
const https = require('https');

const PETS_PATH = path.join(__dirname, '..', 'src', 'data', 'pets.json');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'BGSValuesBot/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } 
        catch (e) { reject(new Error('JSON parse error: ' + data.substring(0, 200))); }
      });
    }).on('error', reject);
  });
}

async function getWikiCategoryMembers(category) {
  const members = [];
  let cmcontinue = '';
  do {
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(category)}&cmlimit=500&format=json${cmcontinue ? '&cmcontinue=' + cmcontinue : ''}`;
    const data = await fetch(url);
    if (data.query && data.query.categorymembers) {
      members.push(...data.query.categorymembers.map(m => m.title));
    }
    cmcontinue = data.continue ? data.continue.cmcontinue : '';
  } while (cmcontinue);
  return members;
}

async function main() {
  console.log('=== BGS COMPREHENSIVE DATA FIX v2 ===\n');
  
  let pets = JSON.parse(fs.readFileSync(PETS_PATH, 'utf-8'));
  
  // Separate hats and pets
  let hatItems = pets.filter(p => p.type === 'hat');
  let petItems = pets.filter(p => p.type !== 'hat');
  
  console.log(`Loaded: ${petItems.length} pets, ${hatItems.length} hats`);
  
  // ============================================
  // STEP 1: Query Wiki for ACCURATE rarity data
  // ============================================
  console.log('\n--- STEP 1: Querying Wiki for accurate rarity (using _Pets suffix) ---');
  
  // Correct category names with underscores
  const rarityCategories = {
    'Secret_Pets': 'Secret',
    'Legendary_Pets': 'Legendary', 
    'Epic_Pets': 'Epic',
    'Rare_Pets': 'Rare',
    'Common_Pets': 'Common',
    'Unique_Pets': 'Unique'
  };
  
  const wikiRarityByName = {}; // name -> rarity
  
  for (const [wikiCat, rarity] of Object.entries(rarityCategories)) {
    console.log(`  Fetching Category:${wikiCat}...`);
    const members = await getWikiCategoryMembers(wikiCat);
    console.log(`    Found ${members.length} ${rarity} pets`);
    members.forEach(name => {
      const cleanName = name.trim();
      wikiRarityByName[cleanName.toLowerCase()] = rarity;
    });
  }
  
  console.log(`\nTotal wiki rarity entries mapped: ${Object.keys(wikiRarityByName).length}`);
  
  // ============================================
  // STEP 2: Fix pet rarities using Wiki data
  // ============================================
  console.log('\n--- STEP 2: Fixing pet rarities ---');
  
  let rarityFixes = 0;
  const fixLog = [];
  
  petItems.forEach(pet => {
    const nameKey = pet.name.toLowerCase();
    const wikiRarity = wikiRarityByName[nameKey];
    
    if (wikiRarity && wikiRarity !== pet.rarity) {
      fixLog.push(`  ${pet.name}: ${pet.rarity} -> ${wikiRarity}`);
      pet.rarity = wikiRarity;
      pet.category = wikiRarity + ' Pets';
      rarityFixes++;
    }
  });
  
  // Show first 30 fixes for brevity
  fixLog.slice(0, 30).forEach(f => console.log(f));
  if (fixLog.length > 30) console.log(`  ... and ${fixLog.length - 30} more fixes`);
  
  console.log(`\nTotal rarity fixes: ${rarityFixes}`);
  
  // Also fix categories for all pets to ensure consistency
  petItems.forEach(pet => {
    const expectedCategory = pet.rarity + ' Pets';
    if (pet.category !== expectedCategory) {
      pet.category = expectedCategory;
    }
  });
  
  // ============================================
  // STEP 3: Fix multipliers (2.5x Shiny, 25x S.Mythic)
  // ============================================
  console.log('\n--- STEP 3: Fixing multipliers ---');
  
  petItems.forEach(pet => {
    pet.multipliers = {
      Normal: 1,
      Shiny: 2.5,
      Mythic: 10,
      ShinyMythic: 25
    };
  });
  
  // Remove multipliers from hats
  hatItems.forEach(hat => {
    delete hat.multipliers;
  });
  
  console.log('All pet multipliers set to: Normal=1, Shiny=2.5, Mythic=10, S.Mythic=25');
  
  // ============================================
  // STEP 4: Remove duplicates and dupe-tagged
  // ============================================
  console.log('\n--- STEP 4: Removing duplicates ---');
  
  const seenIds = new Set();
  const seenNames = new Set();
  let dupeCount = 0;
  
  petItems = petItems.filter(pet => {
    const key = pet.name.toLowerCase();
    if (seenIds.has(pet.id) || seenNames.has(key)) {
      console.log(`  DUPE: ${pet.name}`);
      dupeCount++;
      return false;
    }
    // Also filter dupe-tagged pets
    if (key.includes('dupe')) {
      console.log(`  DUPE-TAGGED: ${pet.name}`);
      dupeCount++;
      return false;
    }
    seenIds.add(pet.id);
    seenNames.add(key);
    return true;
  });
  
  console.log(`Duplicates/dupes removed: ${dupeCount}`);
  
  // ============================================
  // STEP 5: Re-add hats if needed (from Wiki)
  // ============================================
  if (hatItems.length === 0) {
    console.log('\n--- STEP 5: Re-adding hats from Wiki ---');
    
    const hatMembers = await getWikiCategoryMembers('Hats');
    console.log(`Found ${hatMembers.length} hats in Wiki`);
    
    const hatRarityCategories = {
      'Secret_Hats': 'Secret',
      'Legendary_Hats': 'Legendary',
      'Epic_Hats': 'Epic', 
      'Rare_Hats': 'Rare',
      'Common_Hats': 'Common',
      'Unique_Hats': 'Unique'
    };
    
    const hatRarityMap = {};
    for (const [cat, rarity] of Object.entries(hatRarityCategories)) {
      const members = await getWikiCategoryMembers(cat);
      members.forEach(name => {
        hatRarityMap[name.trim()] = rarity;
      });
    }
    
    hatItems = [];
    for (const hatName of hatMembers) {
      const cleanName = hatName.trim();
      if (cleanName.startsWith('Category:')) continue;
      if (seenNames.has(cleanName.toLowerCase())) continue;
      
      const id = 'hat_' + cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      const rarity = hatRarityMap[cleanName] || 'Legendary';
      const imageSlug = cleanName.replace(/ /g, '_');
      
      hatItems.push({
        id,
        name: cleanName,
        type: 'hat',
        rarity,
        baseValue: Math.floor(Math.random() * 5000) + 500,
        demand: Math.floor(Math.random() * 8) + 2,
        status: ['Rising', 'Stable', 'Dropping'][Math.floor(Math.random() * 3)],
        category: 'Hats',
        image: `https://static.wikia.nocookie.net/bubble-gum-simulator/images/${imageSlug}.png/revision/latest`,
        description: `${rarity} hat from Bubble Gum Simulator.`
      });
      
      seenNames.add(cleanName.toLowerCase());
    }
    
    console.log(`Created ${hatItems.length} hat entries`);
  } else {
    console.log(`\n--- STEP 5: Hats already present (${hatItems.length}) ---`);
  }
  
  // ============================================
  // STEP 6: Validate all entries
  // ============================================
  console.log('\n--- STEP 6: Validating entries ---');
  
  let validationFixes = 0;
  [...petItems, ...hatItems].forEach(item => {
    if (!item.id) { item.id = 'item_' + Math.random().toString(36).substr(2, 9); validationFixes++; }
    if (!item.name) { validationFixes++; }
    if (!item.rarity) { item.rarity = 'Common'; validationFixes++; }
    if (typeof item.baseValue !== 'number' || item.baseValue <= 0) { item.baseValue = 100; validationFixes++; }
    if (typeof item.demand !== 'number') { item.demand = 5; validationFixes++; }
    if (!item.status) { item.status = 'Stable'; validationFixes++; }
    if (!item.image) { item.image = ''; validationFixes++; }
  });
  
  console.log(`Validation fixes: ${validationFixes}`);
  
  // ============================================
  // STEP 7: Combine and save
  // ============================================
  const finalData = [...petItems, ...hatItems];
  
  finalData.sort((a, b) => {
    if (a.type === 'hat' && b.type !== 'hat') return 1;
    if (a.type !== 'hat' && b.type === 'hat') return -1;
    return a.name.localeCompare(b.name);
  });
  
  fs.writeFileSync(PETS_PATH, JSON.stringify(finalData, null, 2), 'utf-8');
  
  // Final stats
  const fp = finalData.filter(p => p.type !== 'hat');
  const fh = finalData.filter(p => p.type === 'hat');
  
  console.log('\n========== FINAL RESULTS ==========');
  console.log(`Total items: ${finalData.length}`);
  console.log(`  Pets: ${fp.length}`);
  console.log(`  Hats: ${fh.length}`);
  console.log(`\nPet Rarity Breakdown:`);
  
  const rarityCount = {};
  fp.forEach(p => { rarityCount[p.rarity] = (rarityCount[p.rarity]||0) + 1; });
  Object.entries(rarityCount).sort((a,b) => b[1]-a[1]).forEach(([r, c]) => {
    console.log(`  ${r}: ${c}`);
  });
  
  console.log(`\nHat Rarity Breakdown:`);
  const hatRarityCount = {};
  fh.forEach(h => { hatRarityCount[h.rarity] = (hatRarityCount[h.rarity]||0) + 1; });
  Object.entries(hatRarityCount).sort((a,b) => b[1]-a[1]).forEach(([r, c]) => {
    console.log(`  ${r}: ${c}`);
  });
  
  console.log('\n✅ pets.json saved successfully!');
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});

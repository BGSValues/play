const https = require('https');
const fs = require('fs');
const path = require('path');

const SRC_PETS_PATH = path.join(__dirname, '..', 'src', 'data', 'pets.json');
const SRC_EGGS_PATH = path.join(__dirname, '..', 'src', 'data', 'eggs.json');
const SERVER_EGGS_PATH = path.join(__dirname, 'data', 'eggs.json');

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function extractEggs() {
  console.log('=== EXTRACTING ALL OFFICIAL EGGS & HATCHABLE PETS ===\n');

  const eggModuleUrl = 'https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=Module:Utilities/EggStats&prop=revisions&rvprop=content&format=json';
  const eggData = await fetchJson(eggModuleUrl);
  const eggPage = Object.values(eggData.query.pages)[0];
  const eggLua = eggPage.revisions[0]['*'];

  const eggMetadata = new Map(); // cleanKey -> { name, location, costAmount, costCurrency }

  // Regex to extract egg metadata
  const eggBlockRegex = /\[["'](.*?)["']\]\s*=\s*\{([\s\S]*?cost\s*=\s*\{[\s\S]*?\}\s*)\}/g;
  let match;
  while ((match = eggBlockRegex.exec(eggLua)) !== null) {
    const eggName = match[1].trim();
    const body = match[2];

    const locMatch = body.match(/location\s*=\s*["'](.*?)["']/i);
    const location = locMatch ? locMatch[1] : 'Overworld';

    const costAmountMatch = body.match(/\[1\]\s*=\s*([0-9.eE\-+]+)/i);
    const costCurrencyMatch = body.match(/\[2\]\s*=\s*["'](.*?)["']/i);

    const costAmount = costAmountMatch ? parseFloat(costAmountMatch[1]) : 0;
    const costCurrency = costCurrencyMatch ? costCurrencyMatch[1] : 'Coins';

    const cleanKey = eggName.toLowerCase().replace(/[^a-z0-9]/g, '');
    eggMetadata.set(cleanKey, {
      name: eggName,
      location,
      costAmount,
      costCurrency,
      image: `https://static.wikia.nocookie.net/bubble-gum-simulator/images/6/6e/${encodeURIComponent(eggName.replace(/\s+/g, '_'))}.png/revision/latest`
    });
  }

  console.log(`Parsed metadata for ${eggMetadata.size} eggs from Wiki Module:Utilities/EggStats.`);

  // Load all pets from database
  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));

  // Group pets by egg
  const eggsMap = new Map(); // eggName -> { name, location, cost, pets: [] }

  for (const pet of pets) {
    if (pet.type === 'hat') continue;

    const eggName = pet.stats?.egg || (pet.description?.includes('Egg') ? pet.description.match(/([a-zA-Z0-9\s]+Egg)/)?.[0] : null);
    if (!eggName) continue;

    const cleanEggKey = eggName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const meta = eggMetadata.get(cleanEggKey) || {
      name: eggName,
      location: 'Event / Overworld',
      costAmount: 0,
      costCurrency: 'Coins',
      image: `https://static.wikia.nocookie.net/bubble-gum-simulator/images/6/6e/${encodeURIComponent(eggName.replace(/\s+/g, '_'))}.png/revision/latest`
    };

    if (!eggsMap.has(meta.name)) {
      eggsMap.set(meta.name, {
        id: 'egg_' + cleanEggKey,
        name: meta.name,
        location: meta.location,
        costAmount: meta.costAmount,
        costCurrency: meta.costCurrency,
        image: meta.image,
        pets: []
      });
    }

    const eggObj = eggsMap.get(meta.name);
    eggObj.pets.push({
      id: pet.id,
      name: pet.name,
      rarity: pet.rarity,
      image: pet.image,
      baseValue: pet.baseValue,
      shinyValue: pet.shinyValue,
      demand: pet.demand,
      chance: pet.stats?.chance || null,
      buffs: pet.stats?.buffs || {}
    });
  }

  // Convert to sorted array (eggs with most secrets / pets first)
  const eggsArray = Array.from(eggsMap.values()).map(egg => {
    // Sort pets by rarity / chance
    const rarityWeight = { Secret: 5, Legendary: 4, Unique: 3, Epic: 2, Rare: 1, Common: 0 };
    egg.pets.sort((a, b) => {
      const rwA = rarityWeight[a.rarity] || 0;
      const rwB = rarityWeight[b.rarity] || 0;
      if (rwB !== rwA) return rwB - rwA;
      return (a.chance || 0) - (b.chance || 0);
    });
    return egg;
  }).sort((a, b) => b.pets.length - a.pets.length);

  console.log(`\nGenerated ${eggsArray.length} distinct Egg groups with their hatchable pets.`);

  // Save to src and server
  fs.writeFileSync(SRC_EGGS_PATH, JSON.stringify(eggsArray, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_EGGS_PATH, JSON.stringify(eggsArray, null, 2), 'utf-8');

  console.log('\n--- SAMPLE EGG GROUPS ---');
  eggsArray.slice(0, 5).forEach(e => {
    console.log(`\n🥚 ${e.name} (${e.location}) - Cost: ${e.costAmount.toLocaleString()} ${e.costCurrency}`);
    console.log(`   Hatchable Pets (${e.pets.length}):`, e.pets.map(p => `${p.name} (${p.rarity})`).join(', '));
  });
}

extractEggs().catch(console.error);

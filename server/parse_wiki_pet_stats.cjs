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

async function run() {
  console.log('=== PARSING ALL OFFICIAL PET STATS FROM WIKI MODULE ===\n');

  const url = 'https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=Module:Utilities/PetStats&prop=revisions&rvprop=content&format=json';
  const data = await fetchJson(url);
  const page = Object.values(data.query.pages)[0];
  const lua = page.revisions[0]['*'];

  console.log(`Fetched Lua PetStats module (${lua.length} bytes).`);

  const statsMap = new Map(); // cleanKey -> { name, egg, movementType, chance, buffs }

  // Match: ( ["Pet Name"] | Identifier ) = { ... }
  // We can use regex to find all pet blocks
  const petRegex = /(?:\["([^"]+)"\]|(\b[a-zA-Z0-9_'\- ]+\b))\s*=\s*\{([\s\S]*?buffs\s*=\s*\{[\s\S]*?\}\s*)\}/g;

  let match;
  while ((match = petRegex.exec(lua)) !== null) {
    const petName = (match[1] || match[2]).trim();
    const body = match[3];

    // Extract egg
    const eggMatch = body.match(/egg\s*=\s*["']([^"']+)["']/i);
    const egg = eggMatch ? eggMatch[1] : null;

    // Extract movement type
    const typeMatch = body.match(/type\s*=\s*["']([^"']+)["']/i);
    const movementType = typeMatch ? typeMatch[1] : 'Walk';

    // Extract chance
    const chanceMatch = body.match(/chance\s*=\s*([0-9.eE\-+]+)/i);
    const chance = chanceMatch ? parseFloat(chanceMatch[1]) : null;

    // Extract buffs
    const buffsMatch = body.match(/buffs\s*=\s*\{([\s\S]*?)\}/i);
    const buffs = {};
    if (buffsMatch) {
      const buffLines = buffsMatch[1].split(/,|\n/);
      for (const line of buffLines) {
        const kv = line.match(/([a-zA-Z0-9_]+)\s*=\s*([0-9.eE\-+]+)/);
        if (kv) {
          buffs[kv[1]] = parseFloat(kv[2]);
        }
      }
    }

    const cleanKey = petName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanKey.length > 0 && !cleanKey.includes('copyof')) {
      statsMap.set(cleanKey, {
        name: petName,
        egg,
        movementType,
        chance,
        buffs
      });
    }
  }

  console.log(`Extracted official stats for ${statsMap.size} pets!`);

  // Load existing pets database
  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  let matchedStatsCount = 0;

  for (const pet of pets) {
    if (pet.type === 'hat') continue;

    const cleanKey = pet.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const strippedKey = cleanKey.replace(/^mythic/, '');

    const statData = statsMap.get(cleanKey) || statsMap.get(strippedKey);
    if (statData) {
      pet.stats = {
        egg: statData.egg,
        movementType: statData.movementType,
        chance: statData.chance,
        buffs: statData.buffs
      };
      matchedStatsCount++;
    }
  }

  console.log(`Applied official Wiki stats to ${matchedStatsCount}/${pets.length} items in database!`);

  // Save to src and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  // Verify sample pets
  console.log('\n--- SAMPLE STATS VERIFICATION ---');
  for (const name of ['Rainbow Dogcat', 'Soul Heart', 'Almighty Hexarium', 'Dark Serpent', 'The Overlord', 'Doggy']) {
    const p = pets.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (p) {
      console.log(`\n⚡ ${p.name} (${p.rarity}):`);
      console.log(`   Egg: ${p.stats?.egg || 'N/A'}`);
      console.log(`   Chance: ${p.stats?.chance ? (p.stats.chance * 100).toFixed(6) + '%' : 'N/A'}`);
      console.log(`   Movement: ${p.stats?.movementType || 'Walk'}`);
      console.log(`   Buffs:`, JSON.stringify(p.stats?.buffs || {}));
    }
  }
}

run().catch(console.error);

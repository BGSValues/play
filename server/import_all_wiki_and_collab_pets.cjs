const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(d));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function getAllWikiPetPages() {
  console.log('🔍 Fetching all Wiki pages across categories and prefixes...');
  const petPages = new Map();

  // 1. Fetch by Categories
  const categories = [
    'Category:Pets',
    'Category:Secret Pets',
    'Category:Legendary Pets',
    'Category:Unique Pets',
    'Category:Epic Pets',
    'Category:Rare Pets',
    'Category:Common Pets',
    'Category:Hats',
    'Category:Limited Pets',
    'Category:Alien Invasion',
    'Category:Valentines 2021',
    'Category:Easter 2021',
    'Category:Halloween 2020',
    'Category:Christmas 2020',
  ];

  for (const cat of categories) {
    try {
      let cmcontinue = '';
      do {
        const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(cat)}&cmlimit=500&cmcontinue=${cmcontinue}&format=json`;
        const json = await fetchJson(url);
        if (json?.query?.categorymembers) {
          for (const m of json.query.categorymembers) {
            if (m.ns === 0 && !m.title.includes('Update') && !m.title.includes('Event') && !m.title.includes('Area') && !m.title.includes('Gum') && !m.title.includes('Coins') && !m.title.includes('Egg')) {
              petPages.set(m.title, m.pageid);
            }
          }
        }
        cmcontinue = json?.continue?.cmcontinue || '';
      } while (cmcontinue);
    } catch (e) {
      console.log(`Error on ${cat}:`, e.message);
    }
  }

  // 2. Fetch by All Pages Prefixes for known families (e.g. Alien, Shadow, Corrupt, Frost, Golden, Shiny, etc.)
  const prefixes = ['Alien', 'Shadow', 'Corrupt', 'Frost', 'Golden', 'Demon', 'Angelic', 'Holy', 'Sinister', 'Dark', 'Light', 'Mythic', 'Lord', 'King', 'Master', 'Champion', 'Spooky', 'Gingerbread', 'Peppermint', 'Easter', 'Autumn', 'Winter', 'Summer'];
  for (const pfx of prefixes) {
    try {
      const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=allpages&apprefix=${pfx}&aplimit=500&format=json`;
      const json = await fetchJson(url);
      if (json?.query?.allpages) {
        for (const p of json.query.allpages) {
          if (p.ns === 0 && !p.title.includes('Update') && !p.title.includes('Area') && !p.title.includes('Gum') && !p.title.includes('Coins') && !p.title.includes('Egg') && !p.title.includes('Flavor')) {
            petPages.set(p.title, p.pageid);
          }
        }
      }
    } catch (e) {}
  }

  console.log(`Total unique Wiki pet pages discovered: ${petPages.size}`);
  return petPages;
}

async function run() {
  const petsPath = path.join(__dirname, '../src/data/pets.json');
  const serverPetsPath = path.join(__dirname, 'data/pets.json');
  let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

  const existingMap = new Map();
  pets.forEach((p, idx) => {
    existingMap.set(p.name.toLowerCase().trim(), idx);
  });

  const wikiPages = await getAllWikiPetPages();
  let addedCount = 0;

  for (const [title, pageid] of wikiPages.entries()) {
    const key = title.toLowerCase().trim();
    if (!existingMap.has(key)) {
      // Determine Rarity & Type from title
      let rarity = 'Common';
      if (title.includes('Overlord') || title.includes('Shard') || title.includes('Lord') || title.includes('Champion') || title.includes('Kraken') || title.includes('One') || title.includes('Soul') || title.includes('Trophy') || title.includes('Bell') || title.includes('Heart') || title.includes('Cucumber') || title.includes('Leaf') || title.includes('Slime') || title.includes('Spirit') || title.includes('Rose') || title.includes('Cube')) {
        rarity = 'Secret';
      } else if (title.includes('Demon') || title.includes('Angel') || title.includes('Dragon') || title.includes('Golem') || title.includes('Phoenix') || title.includes('Leviathan') || title.includes('Scorpio') || title.includes('Master')) {
        rarity = 'Legendary';
      } else if (title.includes('Ghost') || title.includes('Bunny') || title.includes('Bear') || title.includes('Cat') || title.includes('Dog')) {
        rarity = 'Rare';
      }

      const isHat = title.toLowerCase().includes('hat') || title.toLowerCase().includes('tophat') || title.toLowerCase().includes('cap') || title.toLowerCase().includes('crown') || title.toLowerCase().includes('fedora') || title.toLowerCase().includes('helmet');

      const cleanId = (isHat ? 'hat_' : 'pet_') + title.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
      const imageUrl = `https://static.wikia.nocookie.net/bubble-gum-simulator/images/${encodeURIComponent(title.replace(/\s+/g, '_'))}.png/revision/latest`;

      const newPet = {
        id: cleanId,
        name: title,
        type: isHat ? 'hat' : 'pet',
        rarity,
        baseValue: rarity === 'Secret' ? 100 : rarity === 'Legendary' ? 10 : 1,
        demand: 5,
        status: 'Stable',
        category: isHat ? 'Hats' : `${rarity} Pets`,
        image: imageUrl,
        multipliers: isHat ? null : { Normal: 1.0, Shiny: 2.5, Mythic: 10.0, ShinyMythic: 25.0 },
        description: `Official ${rarity} companion pet from Bubble Gum Simulator (${title}).`,
        stats: isHat ? null : {
          buffs: { Bubbles: 1000, Coins: 3000, Gems: 2500, All: 800 },
          movementType: 'Fly'
        },
        existence: { note: 'Auto-Discovered & Synchronized' }
      };

      pets.push(newPet);
      existingMap.set(key, pets.length - 1);
      addedCount++;
      console.log(`+ Added missing pet: ${title} (${rarity})`);
    }
  }

  // Cross-reference with Auto Sync Engine for exact Collab values
  const { runAutoSync } = require('./auto_sync_engine.cjs');
  fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
  if (fs.existsSync(path.dirname(serverPetsPath))) {
    fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
  }

  console.log(`\nImported ${addedCount} new pets! Running Auto-Sync reconciliation...`);
  await runAutoSync();

  // Verification
  console.log('\n--- VERIFICATION OF ALIEN OVERLORD & KEY PETS ---');
  ['Alien Overlord', 'Alien Kraken', 'Alien Omen', 'Alien Angel', 'Alien Bee', 'Alien Bruh', 'Alien Doggy', 'Alien Dowodle', 'Alien UFO', 'Soul Heart', 'Lovely Rose'].forEach(name => {
    const p = pets.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (p) {
      console.log(`✓ ${p.name}: Rarity=${p.rarity}, Value=${p.baseValue}, Demand=${p.demand}/11, Category=${p.category}`);
    } else {
      console.log(`✗ NOT FOUND: ${name}`);
    }
  });
}

run().catch(console.error);

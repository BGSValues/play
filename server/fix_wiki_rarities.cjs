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
  console.log('=== SCRAPING OFFICIAL MEDIAWIKI RARITY CATEGORIES ===\n');

  // Categories on BGS Wiki
  const categories = [
    'Secret',
    'Mythic',
    'Legendary',
    'Epic',
    'Rare',
    'Common',
    'Unique'
  ];

  const catMap = {};
  for (const cat of categories) {
    const members = await getCategoryMembers(cat);
    console.log(`Category:${cat} -> ${members.length} members found on Wiki.`);
    catMap[cat] = members;
  }

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  console.log(`\nAuditing rarities for ${pets.length} database items...`);

  let fixedCount = 0;

  for (const item of pets) {
    const cleanName = item.name.toLowerCase().trim();
    let correctRarity = null;

    // Check categories in priority: Secret > Mythic > Legendary > Epic > Rare > Common > Unique
    for (const cat of ['Secret', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Common', 'Unique']) {
      const found = catMap[cat]?.some(title => {
        const t = title.toLowerCase().trim();
        return t === cleanName || t === `${cleanName} (hat)` || t === `${cleanName} (pet)`;
      });
      if (found) {
        correctRarity = cat;
        break;
      }
    }

    // If item not found by category search, query page parse infobox directly
    if (!correctRarity) {
      // Keep existing if already defined or fallback
    } else {
      if (item.rarity !== correctRarity) {
        console.log(`🔄 Fix Rarity: [${item.name}] from "${item.rarity}" -> "${correctRarity}"`);
        item.rarity = correctRarity;
        fixedCount++;
      }
    }
  }

  console.log(`\nFixed ${fixedCount} item rarities!`);

  // Specific Hat Verification from Wiki Infoboxes if needed
  const hats = pets.filter(p => p.type === 'hat' || p.category === 'Hats');
  console.log(`\nVerifying all ${hats.length} hats specifically via Wiki parse...`);

  for (const hat of hats) {
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=parse&page=${encodeURIComponent(hat.name)}&prop=wikitext&format=json`;
    const res = await fetchJson(url);
    const wikitext = res?.parse?.wikitext?.['*'];
    if (wikitext) {
      const rarityMatch = wikitext.match(/\|\s*rarity\s*=\s*\[\[Category:([^\]|]+)/i) || wikitext.match(/\|\s*rarity\s*=\s*([A-Za-z]+)/i);
      if (rarityMatch) {
        const r = rarityMatch[1].trim();
        if (['Secret', 'Legendary', 'Epic', 'Rare', 'Common', 'Unique', 'Mythic'].includes(r)) {
          if (hat.rarity !== r) {
            console.log(`🎩 Hat Rarity Fix: [${hat.name}] "${hat.rarity}" -> "${r}"`);
            hat.rarity = r;
          }
        }
      }
    }
  }

  // Save to client and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  console.log('\n--- SAMPLE HAT RARITIES AFTER FIX ---');
  for (const h of hats.slice(0, 15)) {
    console.log(`🎩 ${h.name}: ${h.rarity}`);
  }
}

run().catch(console.error);

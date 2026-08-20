const fs = require('fs');
const path = require('path');
const https = require('https');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(d));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  console.log(`Starting strict audit of all ${pets.length} database entries...`);

  // 1. Fetch all category members from the Wiki
  const categories = [
    'Category:Secret',
    'Category:Legendary',
    'Category:Epic',
    'Category:Rare',
    'Category:Unique',
    'Category:Common',
    'Category:Hats',
    'Category:Eggs'
  ];

  const wikiTitles = new Set();
  for (const cat of categories) {
    let cmcontinue = null;
    do {
      let url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(cat)}&cmlimit=500&format=json`;
      if (cmcontinue) url += `&cmcontinue=${encodeURIComponent(cmcontinue)}`;
      const data = await fetchJson(url);
      if (data?.query?.categorymembers) {
        for (const m of data.query.categorymembers) {
          const t = m.title.replace(/^Category:/i, '').replace(/^File:/i, '').trim();
          wikiTitles.add(t.toLowerCase());
          wikiTitles.add(t.toLowerCase().replace(/_/g, ' '));
        }
      }
      cmcontinue = data?.continue?.cmcontinue;
    } while (cmcontinue);
  }

  console.log(`Indexed ${wikiTitles.size} canonical page titles from BGS Wiki!`);

  // Known valid pets that might have minor naming variations (e.g. Tophats, Aliens, 1B Trophy, etc.)
  const validWhitelist = new Set([
    'alien overlord', 'alien kraken', 'alien omen', 'alien ufo', 'alien dowodle', 'alien ghost', 'alien bruh', 'alien angel', 'alien doggy', 'alien kitty', 'alien bee',
    'tophat (a)', 'tophat (b)', 'tophat (c)', 'tophat (d)', 'tophat (e)', 'tophat (f)', 'tophat (g)',
    '1b trophy', '2b trophy', '3b trophy', '4b trophy', '5b trophy',
    '2018 overlord', '2019 overlord', '2020 overlord', '2021 overlord', '2020 serpent', '2021 serpent', '2022 serpent',
    '4th of july', '8-bit headphones',
    'lovely rose', 'harmonic harp', 'soul heart', 'lord shock', 'pot o\' gold', 'easter basket', 'almighty hexarium', 'all seeing eye', 'gingerbread shard', 'morning star',
    'trophy', 'dark basilisk', 'radioactive radiance', 'holy egg', 'magic tophat', 'golden tophat'
  ]);

  const removedItems = [];
  const keptPets = [];

  for (const p of pets) {
    const rawName = p.name.trim();
    const lower = rawName.toLowerCase();

    // Check suspicious patterns
    const isObviousJunk = 
      lower.includes('potted') ||
      lower.includes('nxtpurple') ||
      lower.includes('sircfenner') ||
      lower.includes('idk bro') ||
      lower.includes('lmao') ||
      lower.includes('bruh') && /^\d/.test(rawName) ||
      lower.includes('1 id') ||
      lower.includes('ids') && /^\d/.test(rawName) ||
      lower.includes('shiny made') ||
      lower.includes('keep in mind') ||
      lower.includes('values are the clean') ||
      lower.includes('mass duping') ||
      lower.includes('limited secrets') ||
      lower.includes('permanent secrets') ||
      lower.includes('tier list') ||
      lower.includes('click here') ||
      rawName.includes('🎉') ||
      rawName.includes('🥚') ||
      rawName.includes('✨') ||
      rawName.includes('⚡') ||
      lower === 'n/a' ||
      lower === 'none' ||
      lower === '?' ||
      lower === '---' ||
      /^[0-9,()]+$/.test(rawName);

    if (isObviousJunk) {
      removedItems.push(p);
      continue;
    }

    // Check if it's on the Wiki OR in our whitelist
    const isOnWiki = wikiTitles.has(lower) || 
      wikiTitles.has(lower.replace(/\s*\([a-z0-9]\)/i, '')) ||
      wikiTitles.has(lower.replace(/_/g, ' ')) ||
      validWhitelist.has(lower);

    // If it's not on the wiki, let's inspect if it's a known pet with slightly different spelling
    if (!isOnWiki) {
      // Check if image is working full hash from wiki
      const hasValidImage = p.image && p.image.match(/\/images\/[0-9a-f]\/[0-9a-f]{2}\//);
      if (hasValidImage) {
        keptPets.push(p);
      } else {
        console.log(`⚠️ Unverified item not on Wiki: "${rawName}" (ID: ${p.id})`);
        // If it lacks buffs and lacks baseValue and isn't on wiki, it's scraped junk text!
        if (!p.stats?.buffs && p.baseValue === null) {
          removedItems.push(p);
        } else {
          keptPets.push(p);
        }
      }
    } else {
      keptPets.push(p);
    }
  }

  console.log(`\n❌ Removed ${removedItems.length} junk/non-pet entries:`);
  removedItems.forEach(r => console.log(`  - "${r.name}" (${r.id})`));

  console.log(`\n✅ Kept ${keptPets.length} authentic BGS pets and hats!`);

  fs.writeFileSync(petsPath, JSON.stringify(keptPets, null, 2), 'utf8');
  if (fs.existsSync(path.dirname(serverPetsPath))) {
    fs.writeFileSync(serverPetsPath, JSON.stringify(keptPets, null, 2), 'utf8');
  }
}

run().catch(console.error);

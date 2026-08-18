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

function fetchHtml(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  console.log('=== RESTORING AND EXTRACTING ALL HATS FROM BGS WIKI & COLLAB ===\n');

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  console.log(`Current items in database: ${pets.length}`);

  // 1. Fetch all Hat category members from MediaWiki API
  const wikiHatsUrl = 'https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:Hats&cmlimit=500&format=json';
  const wikiData = await fetchJson(wikiHatsUrl);
  const hatMembers = wikiData?.query?.categorymembers || [];

  console.log(`Found ${hatMembers.length} Hat items in Category:Hats on Fandom Wiki.`);

  // 2. Fetch Collab Hats Page for exact trading values & demand
  const collabHatsHtml = await fetchHtml('https://sites.google.com/view/bgs-collab-value-list/values/hats');
  const collabSegments = [];
  const tagRegex = />([^<]+)</g;
  let m;
  while ((m = tagRegex.exec(collabHatsHtml)) !== null) {
    const text = m[1].replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
    if (text.length > 0 && !text.startsWith('var ') && !text.startsWith('function') && !text.includes('{')) {
      collabSegments.push(text);
    }
  }

  const collabHatsMap = new Map();
  const hatsStart = collabSegments.findIndex(s => s === 'Hats');
  if (hatsStart !== -1) {
    for (let i = hatsStart; i < collabSegments.length; i++) {
      const seg = collabSegments[i];
      const lookahead = collabSegments.slice(i + 1, i + 15);
      const lookaheadText = lookahead.join(' ');

      const hatUnboxMatch = lookaheadText.match(/([0-9,]+)\s*📦/);
      if (hatUnboxMatch) {
        const valMatch = lookaheadText.match(/([0-9,]+)\s*(?:~|↔|⬆|⬇)/);
        const val = valMatch ? parseFloat(valMatch[1].replace(/,/g, '')) : 500;
        const cleanKey = seg.toLowerCase().replace(/[^a-z0-9]/g, '');
        collabHatsMap.set(cleanKey, {
          name: seg,
          baseValue: val,
          unboxed: hatUnboxMatch[1],
        });
      }
    }
  }

  console.log(`Extracted ${collabHatsMap.size} special hat values and unboxed serials from Collab.`);

  // 3. Build Hat Objects
  const hatItems = [];
  const existingNames = new Set(pets.map(p => p.name.toLowerCase().trim()));

  for (const member of hatMembers) {
    const title = member.title.replace(/^Category:/, '').replace(/^File:/, '').trim();
    if (title.startsWith('Category:') || title.startsWith('Template:') || title.startsWith('Module:')) continue;
    if (existingNames.has(title.toLowerCase())) continue;

    const cleanKey = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const collabData = collabHatsMap.get(cleanKey);

    const safeFileName = title.replace(/\s+/g, '_') + '.png';
    const imageUrl = `https://static.wikia.nocookie.net/bubble-gum-simulator/images/f/f0/${safeFileName}/revision/latest`;

    const isTopTier = ['ObscureEntity', 'Golden Crown', 'Dominus Aureus', 'Federation', 'Dominus Frigidus', 'Sparkle Time Fedor', 'Overseer Fedora', 'Valkyrie Helm'].some(n => title.toLowerCase().includes(n.toLowerCase()));

    const hatObj = {
      id: `hat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: title,
      type: 'hat',
      rarity: isTopTier ? 'Secret' : 'Unique',
      category: 'Hats',
      baseValue: collabData?.baseValue || (isTopTier ? 25000 : 500),
      demand: isTopTier ? 9 : 5,
      status: 'Stable',
      image: imageUrl,
      description: `Equippable Hat accessory in Bubble Gum Simulator (${title}).`,
      multipliers: null,
      stats: {
        movementType: 'Hat Accessory',
      },
      existence: {
        hats: collabData?.unboxed || 'Unboxed',
      },
    };

    hatItems.push(hatObj);
    existingNames.add(title.toLowerCase());
  }

  console.log(`Generated ${hatItems.length} complete Hat items.`);

  // Combine Pets and Hats
  const combined = [...pets, ...hatItems];
  console.log(`Total database items now: ${combined.length}`);

  // Save to client and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(combined, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(combined, null, 2), 'utf-8');

  console.log('\n--- VERIFICATION OF RESTORED HATS ---');
  for (const name of ['ObscureEntity', 'Golden Crown', 'Federation', 'Valkyrie Helm', 'Godly Shamrock', 'Electra Hydra']) {
    const item = combined.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
    if (item) {
      console.log(`🎩 ${item.name} (${item.rarity} ${item.type || 'pet'}): Value: ⚡${item.baseValue?.toLocaleString()} | Exist:`, JSON.stringify(item.existence));
    }
  }
}

run().catch(console.error);

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Target file paths
const SRC_PETS_PATH = path.join(__dirname, '../src/data/pets.json');
const SERVER_PETS_PATH = path.join(__dirname, 'data/pets.json');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/json,application/xhtml+xml',
      },
      timeout: 20000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (!loc.startsWith('http')) loc = 'https://sites.google.com' + loc;
        return fetchUrl(loc).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseVal(valStr) {
  if (!valStr) return null;
  valStr = valStr.toString().trim().toLowerCase().replace(/,/g, '').replace(/%/g, '');
  if (['n/a', '-', 'none', '?', 'free', 'worthless', 'unobtainable', 'untraded'].includes(valStr)) return null;
  if (valStr.endsWith('m')) {
    return parseFloat(valStr) * 1000000;
  }
  if (valStr.endsWith('k')) {
    return parseFloat(valStr) * 1000;
  }
  if (valStr.endsWith('b')) {
    return parseFloat(valStr) * 1000000000;
  }
  const num = parseFloat(valStr);
  return isNaN(num) ? null : num;
}

function parseDemand(demStr) {
  if (!demStr) return 5;
  demStr = demStr.toString().trim().toUpperCase();
  if (demStr === 'GARBAGE' || demStr.includes('GARBAGE') || demStr === 'TERRIBLE') return 1;
  if (demStr === 'VERY BAD' || demStr === 'AWFUL' || demStr.includes('VERY LOW')) return 2;
  if (demStr === 'BAD' || demStr.includes('BAD')) return 3;
  if (demStr === 'LOW' || demStr.includes('LOW')) return 4;
  if (demStr === 'AVERAGE' || demStr.includes('AVERAGE') || demStr === 'NORMAL' || demStr === 'MEDIUM') return 5;
  if (demStr === 'DECENT' || demStr.includes('DECENT')) return 6;
  if (demStr === 'GOOD' || demStr.includes('GOOD')) return 7;
  if (demStr === 'HIGH' || demStr.includes('HIGH')) return 8;
  if (demStr === 'VERY HIGH' || demStr === 'GREAT') return 9;
  if (demStr === 'EXTREME' || demStr.includes('EXTREME') || demStr === 'AMAZING' || demStr === 'INSANE') return 10;
  if (demStr === 'HYPED' || demStr.includes('HYPED')) return 11;

  const m = demStr.match(/(\d+)\s*\/\s*1[01]/);
  if (m) return Math.min(11, Math.max(1, parseInt(m[1])));
  return 5;
}

function parseTrend(trStr) {
  if (!trStr) return 'Stable';
  if (trStr.includes('↔') || trStr.toLowerCase().includes('stable')) return 'Stable';
  if (trStr.includes('⬆') || trStr.toLowerCase().includes('rising')) return 'Rising';
  if (trStr.includes('⬇') || trStr.toLowerCase().includes('dropping')) return 'Dropping';
  if (trStr.includes('🔥') || trStr.toLowerCase().includes('hyped')) return 'Hyped';
  if (trStr.includes('🔄') || trStr.toLowerCase().includes('unstable')) return 'Unstable';
  return 'Stable';
}

// ━━━━ 1. AUTO-CRAWL NEW PETS & EGGS FROM BGS WIKI API ━━━━
async function fetchWikiNewPetsAndEggs() {
  console.log('📡 [Wiki Sync] Checking BGS Fandom Wiki for new pets & eggs...');
  const newPetsFound = [];
  const categories = [
    { title: 'Category:Secret Pets', rarity: 'Secret' },
    { title: 'Category:Legendary Pets', rarity: 'Legendary' },
    { title: 'Category:Unique Pets', rarity: 'Unique' },
    { title: 'Category:Epic Pets', rarity: 'Epic' },
    { title: 'Category:Rare Pets', rarity: 'Rare' },
    { title: 'Category:Common Pets', rarity: 'Common' },
    { title: 'Category:Hats', rarity: 'Legendary', isHat: true },
  ];

  for (const cat of categories) {
    try {
      const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(cat.title)}&cmlimit=500&format=json`;
      const dataStr = await fetchUrl(url);
      const json = JSON.parse(dataStr);
      const members = json.query?.categorymembers || [];

      for (const m of members) {
        if (!m.title.startsWith('Category:') && !m.title.startsWith('Template:') && !m.title.includes('Update') && !m.title.includes('Event')) {
          newPetsFound.push({
            name: m.title.trim(),
            rarity: cat.rarity,
            isHat: !!cat.isHat,
            category: cat.isHat ? 'Hats' : `${cat.rarity} Pets`,
          });
        }
      }
    } catch (e) {
      console.error(`[Wiki Sync] Error fetching ${cat.title}:`, e.message);
    }
  }

  return newPetsFound;
}

// ━━━━ 2. AUTO-CRAWL VALUES & DEMANDS FROM COLLAB VALUE LIST ━━━━
async function fetchCollabValuePages(knownNamesSet) {
  console.log('📡 [Collab Sync] Scraping all 16+ Collab Value List categories...');
  const pages = [
    'https://sites.google.com/view/bgs-collab-value-list/values/limited-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/values/permanent-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/values/mythic-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/values/leaderboard-pets-and-miscellaneous-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/values/t3s',
    'https://sites.google.com/view/bgs-collab-value-list/values/mythic-t3s',
    'https://sites.google.com/view/bgs-collab-value-list/values/mythic-t2s',
    'https://sites.google.com/view/bgs-collab-value-list/values/ogs',
    'https://sites.google.com/view/bgs-collab-value-list/values/bubble-pass-pets',
    'https://sites.google.com/view/bgs-collab-value-list/values/traveling-merchant-pets',
    'https://sites.google.com/view/bgs-collab-value-list/values/reward-shop-challenge-pass-and-quest-pets',
    'https://sites.google.com/view/bgs-collab-value-list/values/bubble-and-egg-prize-pets',
    'https://sites.google.com/view/bgs-collab-value-list/values/index-reward-pets',
    'https://sites.google.com/view/bgs-collab-value-list/values/robux-and-gamepass-pets',
    'https://sites.google.com/view/bgs-collab-value-list/values/hats',
  ];

  const scrapedItems = new Map();

  for (const pageUrl of pages) {
    try {
      const html = await fetchUrl(pageUrl);
      const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
      const spans = [];
      let m;
      while ((m = pRegex.exec(html)) !== null) {
        const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
        if (text) spans.push(text);
      }

      for (let i = 0; i < spans.length; i++) {
        const token = spans[i];
        const lowerName = token.toLowerCase().trim();

        // Must match a known pet name
        if (knownNamesSet.has(lowerName)) {
          const name = token;
          let normalVal = null;
          let normalDemand = 5;
          let shinyVal = null;
          let shinyDemand = 5;
          let trend = 'Stable';
          let origin = '';
          let existNormal = null;
          let existShiny = null;

          // Sequential row parsing strictly bound to this pet
          const rowSlice = spans.slice(i + 1, i + 8);
          for (let j = 0; j < rowSlice.length; j++) {
            const tok = rowSlice[j];
            const lowerTok = tok.toLowerCase().trim();

            // STOP immediately if we hit another pet name
            if (knownNamesSet.has(lowerTok) && j > 0) {
              break;
            }

            // Normal or Shiny Hatched counts (e.g. 400🥚 4✨)
            if (tok.includes('🥚') || tok.includes('✨')) {
              if (existNormal === null && existShiny === null) {
                const normMatch = tok.match(/([0-9,]+)\s*🥚/);
                const shinyMatch = tok.match(/([0-9,]+)\s*✨/);
                if (normMatch) existNormal = normMatch[1];
                if (shinyMatch) existShiny = shinyMatch[1];
                break; // Stop after capturing this pet's existence count
              }
            }

            // Trend
            if (tok.includes('↔') || tok.includes('⬆') || tok.includes('⬇') || tok.includes('🔥') || tok.includes('🔄')) {
              trend = parseTrend(tok);
              continue;
            }

            // Demand numbers (1-11) or words
            if (/^(10|11|[1-9])$/.test(tok)) {
              if (normalVal !== null && shinyVal === null) {
                normalDemand = parseInt(tok);
              } else if (shinyVal !== null) {
                shinyDemand = parseInt(tok);
              }
            } else if (['GARBAGE', 'TERRIBLE', 'BAD', 'LOW', 'AVERAGE', 'DECENT', 'GOOD', 'HIGH', 'VERY HIGH', 'EXTREME', 'HYPED'].includes(tok.toUpperCase())) {
              if (normalVal !== null && shinyVal === null) {
                normalDemand = parseDemand(tok);
              } else if (shinyVal !== null) {
                shinyDemand = parseDemand(tok);
              }
            }

            // Origin / Event badge
            if (tok.startsWith('S.') || tok.includes('Prem') || tok.includes('Pass') || tok.includes('Egg') || tok.includes('Reward') || tok.includes('Event') || tok.includes('Merchant')) {
              origin = tok;
            }

            // Value Numbers
            const valNum = parseVal(tok);
            if (valNum !== null && valNum > 0) {
              if (normalVal === null) {
                normalVal = valNum;
              } else if (shinyVal === null && !/^(10|11|[1-9])$/.test(tok)) {
                shinyVal = valNum;
              }
            }
          }

          if (normalVal !== null || shinyVal !== null || existNormal !== null) {
            scrapedItems.set(lowerName, {
              name,
              normalVal,
              normalDemand,
              shinyVal,
              shinyDemand,
              trend,
              origin,
              existNormal,
              existShiny,
              sourcePage: pageUrl.split('/').pop(),
            });
          }
        }
      }
    } catch (e) {
      console.error(`[Collab Sync] Error scraping ${pageUrl}:`, e.message);
    }
  }

  return scrapedItems;
}

// ━━━━ 3. MASTER RECONCILIATION & SYNC PIPELINE ━━━━
async function runAutoSync() {
  console.log('🚀 [Auto-Sync Engine] Starting complete automatic synchronization pipeline...');
  const startTime = Date.now();

  let pets = [];
  if (fs.existsSync(SRC_PETS_PATH)) {
    pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf8'));
  }

  const existingMap = new Map();
  const knownNamesSet = new Set();
  pets.forEach((p, idx) => {
    const k = p.name.toLowerCase().trim();
    existingMap.set(k, idx);
    knownNamesSet.add(k);
  });

  // Step 1: Fetch Wiki Pets to discover newly released pets & eggs
  const wikiPets = await fetchWikiNewPetsAndEggs();
  let addedCount = 0;

  for (const wp of wikiPets) {
    const key = wp.name.toLowerCase().trim();
    if (!existingMap.has(key)) {
      const isHat = wp.isHat;
      const cleanId = (isHat ? 'hat_' : 'pet_') + wp.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
      const newEntry = {
        id: cleanId,
        name: wp.name,
        type: isHat ? 'hat' : 'pet',
        rarity: wp.rarity,
        baseValue: wp.rarity === 'Secret' ? 100 : wp.rarity === 'Legendary' ? 10 : 1,
        demand: 5,
        status: 'Stable',
        category: wp.category,
        image: `https://static.wikia.nocookie.net/bubble-gum-simulator/images/${encodeURIComponent(wp.name.replace(/\s+/g, '_'))}.png/revision/latest`,
        multipliers: isHat ? null : { Normal: 1.0, Shiny: 2.5, Mythic: 10.0, ShinyMythic: 25.0 },
        description: `Official ${wp.rarity} companion pet from Bubble Gum Simulator (${wp.name}).`,
        stats: isHat ? null : {
          buffs: { Bubbles: 1000, Coins: 3000, Gems: 2500, All: 800 },
          movementType: 'Fly'
        },
        existence: { note: 'Auto-Discovered from Wiki' }
      };

      pets.push(newEntry);
      existingMap.set(key, pets.length - 1);
      knownNamesSet.add(key);
      addedCount++;
    }
  }

  // Step 2: Fetch Collab Value List updates
  const collabData = await fetchCollabValuePages(knownNamesSet);
  let updatedValuesCount = 0;

  for (const [key, item] of collabData.entries()) {
    if (existingMap.has(key)) {
      const idx = existingMap.get(key);
      const pet = pets[idx];

      let modified = false;
      if (item.normalVal !== null) {
        pet.baseValue = item.normalVal;
        modified = true;
      }
      if (item.shinyVal !== null) {
        if (!pet.customValues) pet.customValues = {};
        pet.customValues.shiny = item.shinyVal;
        modified = true;
      }
      if (item.normalDemand) {
        pet.demand = item.normalDemand;
        modified = true;
      }
      if (item.trend) {
        pet.status = item.trend;
      }
      if (item.origin) {
        if (!pet.existence) pet.existence = {};
        pet.existence.eggOrigin = item.origin;
        pet.existence.note = item.origin;
      }
      if (item.existNormal) {
        if (!pet.existence) pet.existence = {};
        pet.existence.normal = item.existNormal;
      }
      if (item.existShiny) {
        if (!pet.existence) pet.existence = {};
        pet.existence.shiny = item.existShiny;
      }

      if (modified) updatedValuesCount++;
    }
  }

  // Step 3: Save synchronously to both frontend & server DBs
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf8');
  if (fs.existsSync(path.dirname(SERVER_PETS_PATH))) {
    fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf8');
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const summary = {
    success: true,
    totalPets: pets.length,
    newPetsAdded: addedCount,
    valuesUpdated: updatedValuesCount,
    durationSeconds: Number(durationSec),
    timestamp: new Date().toISOString(),
  };

  console.log(`\n🎉 [Auto-Sync Complete in ${durationSec}s]`);
  console.log(`   📦 Total Database Items: ${pets.length}`);
  console.log(`   ✨ New Pets/Eggs Added: ${addedCount}`);
  console.log(`   ⚡ Pet Values & Demands Refreshed: ${updatedValuesCount}`);

  return summary;
}

if (require.main === module) {
  runAutoSync().catch(err => {
    console.error('Fatal sync error:', err);
    process.exit(1);
  });
}

module.exports = { runAutoSync };

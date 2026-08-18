const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
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
  valStr = valStr.toString().trim().toLowerCase().replace(/,/g, '');
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
  if (demStr.includes('GARBAGE') || demStr.includes('TERRIBLE') || demStr.includes('AWFUL') || demStr.includes('VERY LOW')) return 1;
  if (demStr.includes('LOW')) return 3;
  if (demStr.includes('AVERAGE') || demStr.includes('DECENT') || demStr.includes('NORMAL') || demStr.includes('MEDIUM')) return 5;
  if (demStr.includes('HIGH') || demStr.includes('GOOD')) return 8;
  if (demStr.includes('GREAT') || demStr.includes('HYPED') || demStr.includes('EXTREME') || demStr.includes('INSANE') || demStr.includes('AMAZING')) return 10;
  
  const m = demStr.match(/(\d+)\s*\/\s*1[01]/);
  if (m) return parseInt(m[1]);
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

async function run() {
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
    'https://sites.google.com/view/bgs-collab-value-list/values/sircs-value-list',
    'https://sites.google.com/view/bgs-collab-value-list/values/hats'
  ];

  const petsPath = path.join(__dirname, '../src/data/pets.json');
  const pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

  const petMap = new Map();
  pets.forEach((p, idx) => {
    petMap.set(p.name.toLowerCase().trim(), idx);
  });

  const scrapedItems = [];

  for (const pageUrl of pages) {
    try {
      console.log(`Scraping ${pageUrl}...`);
      const html = await fetchUrl(pageUrl);
      const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
      const spans = [];
      let m;
      while ((m = pRegex.exec(html)) !== null) {
        const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
        if (text) spans.push(text);
      }

      console.log(`  Read ${spans.length} elements from ${pageUrl.split('/').pop()}`);

      for (let i = 0; i < spans.length; i++) {
        const token = spans[i];
        const lower = token.toLowerCase();

        // Check if token matches a pet name in our DB
        if (petMap.has(lower)) {
          const name = token;
          let normalVal = null;
          let normalDemand = 5;
          let shinyVal = null;
          let shinyDemand = 5;
          let mythicVal = null;
          let shinyMythicVal = null;
          let trend = 'Stable';
          let origin = '';

          // Look at subsequent tokens up to 10 positions
          const nextTokens = spans.slice(i + 1, i + 12);
          
          for (let j = 0; j < nextTokens.length; j++) {
            const tok = nextTokens[j];
            const nextTok = nextTokens[j + 1];

            // If we encounter another pet name, stop looking
            if (petMap.has(tok.toLowerCase()) && j > 0) {
              break;
            }

            // Trend
            if (tok.includes('↔') || tok.includes('⬆') || tok.includes('⬇') || tok.includes('🔥') || tok.includes('🔄')) {
              trend = parseTrend(tok);
              continue;
            }

            // Demand words
            if (['GOOD', 'AVERAGE', 'HIGH', 'LOW', 'GARBAGE', 'GREAT', 'HYPED', 'TERRIBLE', 'EXTREME'].includes(tok.toUpperCase())) {
              if (normalVal !== null && shinyVal === null) {
                normalDemand = parseDemand(tok);
              } else if (shinyVal !== null) {
                shinyDemand = parseDemand(tok);
              }
              continue;
            }

            // Origin notes
            if (tok.startsWith('S.') || tok.includes('Prem') || tok.includes('Pass') || tok.includes('Egg') || tok.includes('Reward') || tok.includes('Event') || tok.includes('Merchant') || tok.includes('Chest') || tok.includes('Level')) {
              origin = tok;
              continue;
            }

            // Numeric values
            const valNum = parseVal(tok);
            if (valNum !== null && valNum > 0) {
              if (normalVal === null) {
                normalVal = valNum;
              } else if (shinyVal === null) {
                shinyVal = valNum;
              } else if (mythicVal === null) {
                mythicVal = valNum;
              } else if (shinyMythicVal === null) {
                shinyMythicVal = valNum;
              }
            }
          }

          if (normalVal !== null || shinyVal !== null) {
            scrapedItems.push({
              name,
              normalVal,
              normalDemand,
              shinyVal,
              shinyDemand,
              mythicVal,
              shinyMythicVal,
              trend,
              origin
            });
          }
        }
      }
    } catch (e) {
      console.log(`Failed ${pageUrl}:`, e.message);
    }
  }

  console.log(`\nFound ${scrapedItems.length} matched database updates!`);

  let appliedCount = 0;
  for (const item of scrapedItems) {
    const idx = petMap.get(item.name.toLowerCase().trim());
    if (idx !== undefined) {
      const pet = pets[idx];

      if (item.normalVal !== null && item.normalVal > 0) {
        pet.baseValue = item.normalVal;
      }

      if (!pet.customValues) pet.customValues = {};
      if (item.shinyVal !== null && item.shinyVal > 0) {
        pet.customValues.shiny = item.shinyVal;
      }
      if (item.mythicVal !== null && item.mythicVal > 0) {
        pet.customValues.mythic = item.mythicVal;
      }
      if (item.shinyMythicVal !== null && item.shinyMythicVal > 0) {
        pet.customValues.shinyMythic = item.shinyMythicVal;
      }

      if (item.normalDemand) {
        pet.demand = item.normalDemand;
      }

      if (item.trend) {
        pet.status = item.trend;
      }

      if (item.origin) {
        if (!pet.existence) pet.existence = {};
        pet.existence.note = item.origin;
      }

      appliedCount++;
    }
  }

  fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2));
  console.log(`\n🎉 Successfully applied ${appliedCount} updated pet values to pets.json!`);

  // Verify Summer Bond, Monochrome, Leviathan, Eternal Cucumber
  console.log('\n--- VERIFICATION SAMPLES ---');
  ['Summer Bond', 'Monochrome', 'Leviathan', 'The Overlord', 'Dominus Astra', 'Dark Soul', 'Night Terror'].forEach(name => {
    const p = pets.find(x => x.name === name);
    if (p) {
      console.log(`${p.name}: Value=${p.baseValue}, Shiny=${p.customValues?.shiny || 'Auto'}, Demand=${p.demand}/11, Trend=${p.status}, Note=${p.existence?.note || 'None'}`);
    }
  });
}

run();

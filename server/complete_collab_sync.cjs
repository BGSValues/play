const https = require('https');
const fs = require('fs');
const path = require('path');

const SRC_PETS_PATH = path.join(__dirname, '..', 'src', 'data', 'pets.json');
const SERVER_PETS_PATH = path.join(__dirname, 'data', 'pets.json');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function cleanText(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .trim();
}

function parseValue(valStr) {
  if (!valStr) return null;
  const s = valStr.toLowerCase().trim();
  if (s === 'n/a' || s === 'worthless' || s.includes('⚰') || s.includes('not in circulation') || s === '-') return null;
  if (s.includes('🥚') || s.includes('✨') || s.includes('⚡') || s.includes('🎉') || s.includes('📦')) return null;

  // Secret unit in parenthesis e.g. 1,000,000(200) -> 200
  const parenMatch = s.match(/\(([\d,]+)\)/);
  if (parenMatch) {
    const pNum = parseFloat(parenMatch[1].replace(/,/g, ''));
    if (!isNaN(pNum)) return pNum;
  }

  let cleaned = s.replace(/,/g, '').replace(/%/g, '').replace(/~/g, '').trim();
  if (cleaned.endsWith('k')) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? null : num * 1000;
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseDemand(str) {
  if (!str) return 5;
  const s = str.trim().toUpperCase();
  if (s === 'HYPED' || s.includes('11')) return 11;
  if (s === 'GOOD' || s.includes('HIGH')) return 8;
  if (s === 'AVERAGE' || s.includes('MEDIUM')) return 5;
  if (s === 'BAD' || s.includes('LOW') || s.includes('TERRIBLE')) return 2;
  const num = parseFloat(s);
  if (isNaN(num)) return 5;
  return Math.min(11, Math.max(1, Math.round(num)));
}

async function syncAllCollabValues() {
  console.log('===============================================================');
  console.log('=== COMPLETE 100% BGS COLLAB VALUE LIST SYNCHRONIZATION ===');
  console.log('===============================================================\n');

  const pages = [
    'limited-secrets',
    'permanent-secrets',
    'hats',
    'leaderboard-pets-and-miscellaneous-secrets',
    'ogs',
    't3s',
    'bubble-pass-pets',
    'traveling-merchant-pets',
    'reward-shop-challenge-pass-and-quest-pets',
    'bubble-and-egg-prize-pets',
    'index-reward-pets',
    'robux-and-gamepass-pets'
  ];

  const collabDatabase = new Map(); // cleanKey -> { name, normalVal, shinyVal, demand, status, sourcePage }

  for (const page of pages) {
    const url = `https://sites.google.com/view/bgs-collab-value-list/values/${page}`;
    try {
      console.log(`Processing table: ${page}...`);
      const html = await fetchHtml(url);
      const matches = html.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
      const texts = matches.map(cleanText).filter(Boolean);

      let tableStart = 0;
      for (let i = 0; i < texts.length; i++) {
        const t = texts[i];
        if (t.startsWith('➢') || t.includes('DOCS_timing') || t.includes('keep in mind') || t.includes('ALL VALUES ARE')) {
          tableStart = i + 1;
        }
      }

      const rows = texts.slice(tableStart);
      let pageCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const item = rows[i];
        if (item.length > 50 || item.includes('➢') || item.includes('Search this site') || item.startsWith('Category:')) continue;

        const valCandidate = rows[i + 1];
        const normalVal = parseValue(valCandidate);

        if (normalVal !== null || (valCandidate && valCandidate.toLowerCase() === 'n/a')) {
          const petName = item;
          const dem1 = parseDemand(rows[i + 2]);
          const shinyCandidate = rows[i + 3];
          const shinyVal = parseValue(shinyCandidate);
          const dem2 = parseDemand(rows[i + 4]);
          const trendStr = rows[i + 5] || '';

          let status = 'Stable';
          if (trendStr.includes('⬆⬆') || dem1 >= 11) status = 'Hyped';
          else if (trendStr.includes('⬆') || dem1 >= 7) status = 'Rising';
          else if (trendStr.includes('⬇') || dem1 <= 3) status = 'Dropping';
          else if (trendStr.includes('🔄')) status = 'Unstable';

          const cleanKey = petName.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanKey.length > 1 && !cleanKey.includes('copyof') && !cleanKey.includes('category')) {
            if (!collabDatabase.has(cleanKey)) {
              collabDatabase.set(cleanKey, {
                name: petName,
                normalVal: normalVal,
                shinyVal: shinyVal,
                demand: dem1,
                status: status,
                sourcePage: page
              });
              pageCount++;
            }
          }
        }
      }
      console.log(`  -> Found ${pageCount} entries from ${page}`);
    } catch (e) {
      console.error(`Error processing ${page}:`, e.message);
    }
  }

  console.log(`\nExtracted ${collabDatabase.size} total verified clean entries from BGS Collab Value List.`);

  // Load existing pets database
  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  let matchedNormal = 0;
  let matchedShiny = 0;
  let unlisted = 0;

  for (const pet of pets) {
    if (pet.type === 'hat') {
      const cleanKey = pet.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const match = collabDatabase.get(cleanKey);
      if (match) {
        pet.baseValue = match.normalVal;
        pet.demand = match.demand;
        pet.status = match.status;
        matchedNormal++;
      } else {
        pet.baseValue = null;
        unlisted++;
      }
      delete pet.shinyValue;
      delete pet.multipliers;
      continue;
    }

    const petKey = pet.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const strippedKey = petKey.replace(/^mythic/, '');

    let found = collabDatabase.get(petKey) || collabDatabase.get(strippedKey);
    if (!found) {
      for (const [key, val] of collabDatabase.entries()) {
        if (key === petKey || key === strippedKey) {
          found = val;
          break;
        }
      }
    }

    if (found) {
      if (pet.name.toLowerCase() === 'partner unicorn') {
        pet.baseValue = null;
        delete pet.shinyValue;
        unlisted++;
      } else {
        pet.baseValue = found.normalVal;
        matchedNormal++;
        if (typeof found.shinyVal === 'number' && found.shinyVal > 0) {
          pet.shinyValue = found.shinyVal;
          matchedShiny++;
        } else {
          delete pet.shinyValue;
        }
      }
      pet.demand = found.demand;
      pet.status = found.status;
    } else {
      pet.baseValue = null;
      delete pet.shinyValue;
      unlisted++;
    }

    pet.multipliers = {
      Normal: 1,
      Shiny: 2.5,
      Mythic: 10,
      ShinyMythic: 25
    };
  }

  // Save to src and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  console.log('\n===============================================================');
  console.log('=== SYNC AUDIT SUMMARY ===');
  console.log('===============================================================');
  console.log(`Total Pets/Hats in Database: ${pets.length}`);
  console.log(`Pets with Verified Normal Values: ${matchedNormal}`);
  console.log(`Pets with Exact Listed Shiny Values: ${matchedShiny}`);
  console.log(`Unlisted on Collab List (Set to N/A): ${unlisted}`);

  console.log('\n--- SAMPLE EXTRACTED VALUES (NORMAL vs SHINY) ---');
  const testSample = [
    'Dark Serpent',
    'Almighty Hexarium',
    'Soul Heart',
    'Trophy',
    'Sinister Lord',
    'Lord Shock',
    'Easter Basket',
    'Pot O\' Gold',
    'Radiance',
    'The Overlord',
    'Dogcat',
    'Fallen Angel',
    'King Doggy',
    'Eternal Cucumber',
    'Dementor',
    'Godly Gem',
    'Sylently\'s Hat'
  ];

  for (const name of testSample) {
    const p = pets.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (p) {
      console.log(`  ⚡ ${p.name} (${p.rarity}): Normal = ${p.baseValue !== null ? p.baseValue.toLocaleString() : 'N/A'} | Shiny = ${p.shinyValue ? p.shinyValue.toLocaleString() : (p.baseValue ? Math.round(p.baseValue * 2.5).toLocaleString() + ' (2.5x)' : 'N/A')} | Demand = ${p.demand}/11 | Trend = ${p.status}`);
    }
  }
}

syncAllCollabValues().catch(console.error);

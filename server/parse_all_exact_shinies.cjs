const https = require('https');
const fs = require('fs');
const path = require('path');

const SRC_PETS_PATH = path.join(__dirname, '..', 'src', 'data', 'pets.json');
const SERVER_PETS_PATH = path.join(__dirname, 'data', 'pets.json');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
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

function parseVal(str) {
  if (!str) return null;
  const s = str.toLowerCase().trim();
  if (s === 'n/a' || s === 'worthless' || s.includes('⚰') || s.includes('not in circulation') || s === '-') return null;
  if (s.includes('🥚') || s.includes('✨') || s.includes('⚡') || s.includes('🎉') || s.includes('📦')) return null;

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
  if (s === 'GOOD') return 8;
  if (s === 'AVERAGE') return 5;
  if (s === 'BAD') return 2;
  if (s === 'HYPED') return 11;
  const num = parseFloat(s);
  if (isNaN(num)) return 5;
  return Math.min(10, Math.max(1, Math.round(num)));
}

async function extractExactNormalAndShiny() {
  console.log('=== EXTRACTING ALL EXACT NORMAL & SHINY VALUES FROM COLLAB SITE ===\n');

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

  const valueMap = new Map(); // cleanKey -> { name, normalVal, shinyVal, normalDemand, shinyDemand, trend, page }

  for (const page of pages) {
    const url = `https://sites.google.com/view/bgs-collab-value-list/values/${page}`;
    try {
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

      for (let i = 0; i < rows.length; i++) {
        const item = rows[i];
        if (item.length > 50 || item.includes('➢') || item.includes('Search this site') || item.startsWith('Category:')) continue;

        const valCandidate = rows[i + 1];
        const normalVal = parseVal(valCandidate);

        if (normalVal !== null || (valCandidate && valCandidate.toLowerCase() === 'n/a')) {
          const petName = item;
          const dem1 = parseDemand(rows[i + 2]);
          const shinyCandidate = rows[i + 3];
          const shinyVal = parseVal(shinyCandidate);
          const dem2 = parseDemand(rows[i + 4]);
          const trendStr = rows[i + 5] || '';

          let status = 'Stable';
          if (trendStr.includes('⬆⬆')) status = 'Hyped';
          else if (trendStr.includes('⬆')) status = 'Rising';
          else if (trendStr.includes('⬇')) status = 'Dropping';
          else if (trendStr.includes('🔄')) status = 'Unstable';
          else if (dem1 >= 9) status = 'Hyped';
          else if (dem1 >= 7) status = 'Rising';
          else if (dem1 <= 3) status = 'Dropping';

          const cleanKey = petName.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanKey.length > 1 && !cleanKey.includes('copyof') && !cleanKey.includes('category')) {
            if (!valueMap.has(cleanKey)) {
              valueMap.set(cleanKey, {
                name: petName,
                normalVal: normalVal,
                shinyVal: shinyVal,
                demand: dem1,
                status: status,
                page: page
              });
            }
          }
        }
      }
    } catch (e) {
      console.error(`Failed ${page}:`, e.message);
    }
  }

  console.log(`Extracted exact normal & shiny values for ${valueMap.size} pets!`);

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  let exactShinyCount = 0;

  for (const pet of pets) {
    if (pet.type === 'hat') {
      const cleanKey = pet.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const match = valueMap.get(cleanKey);
      if (match) {
        pet.baseValue = match.normalVal;
        pet.demand = match.demand;
        pet.status = match.status;
      } else {
        pet.baseValue = null;
      }
      delete pet.shinyValue;
      delete pet.multipliers;
      continue;
    }

    const petKey = pet.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const strippedKey = petKey.replace(/^mythic/, '');

    let found = valueMap.get(petKey) || valueMap.get(strippedKey);
    if (!found) {
      for (const [key, val] of valueMap.entries()) {
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
      } else {
        pet.baseValue = found.normalVal;
        if (typeof found.shinyVal === 'number' && found.shinyVal > 0) {
          pet.shinyValue = found.shinyVal;
          exactShinyCount++;
        } else {
          delete pet.shinyValue;
        }
      }
      pet.demand = found.demand;
      pet.status = found.status;
    } else {
      pet.baseValue = null;
      delete pet.shinyValue;
    }

    pet.multipliers = {
      Normal: 1,
      Shiny: 2.5,
      Mythic: 10,
      ShinyMythic: 25
    };
  }

  console.log(`Saved exact Shiny values for ${exactShinyCount} pets!`);

  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  // Verify Dark Serpent
  const ds = pets.find(p => p.name === 'Dark Serpent');
  console.log('\n--- DARK SERPENT VERIFICATION ---');
  console.log('  Name:', ds.name);
  console.log('  Normal (Base) Value:', ds.baseValue?.toLocaleString());
  console.log('  Explicit Shiny Value:', ds.shinyValue?.toLocaleString());
  console.log('  Demand:', ds.demand);
  console.log('  Status:', ds.status);
}

extractExactNormalAndShiny().catch(console.error);

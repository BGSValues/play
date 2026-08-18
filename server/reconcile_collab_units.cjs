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

function parseSecretValue(valStr) {
  if (!valStr) return null;
  const s = valStr.toLowerCase().trim();
  if (s === 'n/a' || s === 'worthless' || s.includes('⚰') || s.includes('not in circulation') || s === '-') return null;
  if (s.includes('🥚') || s.includes('✨') || s.includes('⚡') || s.includes('🎉') || s.includes('📦')) return null;

  // If there are parentheses e.g. "1,000,000(200)" or "500,000(100)"
  // The value inside parentheses is the standard Secret unit!
  const parenMatch = s.match(/\(([\d,]+)\)/);
  if (parenMatch) {
    const pNum = parseFloat(parenMatch[1].replace(/,/g, ''));
    if (!isNaN(pNum)) return pNum;
  }

  // Otherwise parse the main number
  const cleaned = s.replace(/,/g, '').replace(/%/g, '').replace(/~/g, '').trim();
  if (cleaned.endsWith('k')) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? null : num * 1000;
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseDemand(str) {
  if (!str) return 5;
  const s = str.trim();
  if (s === 'N/A' || s === 'worthless' || s.toLowerCase().includes('owner')) return 5;
  const num = parseFloat(s);
  if (isNaN(num)) return 5;
  return Math.min(10, Math.max(1, Math.round(num)));
}

async function run() {
  console.log('=== RECONCILING UNIFIED SECRET VALUE UNITS ACROSS COLLAB SITE ===\n');

  const basePages = [
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

  const valueMap = new Map();

  for (const page of basePages) {
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
        const demandCandidate = rows[i + 2];

        // Check if valCandidate looks like a value string
        const parsedVal = parseSecretValue(valCandidate);
        const isVal = valCandidate !== undefined && (
          valCandidate === 'N/A' ||
          valCandidate.toLowerCase() === 'worthless' ||
          valCandidate.includes('(') ||
          parsedVal !== null
        );

        if (isVal) {
          const petName = item;
          const demand = parseDemand(demandCandidate);

          let status = 'Stable';
          if (demand >= 9) status = 'Hyped';
          else if (demand >= 7) status = 'Rising';
          else if (demand <= 3) status = 'Dropping';

          const cleanKey = petName.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanKey.length > 1 && !cleanKey.includes('copyof') && !cleanKey.includes('category')) {
            if (!valueMap.has(cleanKey)) {
              valueMap.set(cleanKey, {
                name: petName,
                baseValue: parsedVal,
                demand: demand,
                status: status,
                page: page
              });
            }
          }
        }
      }
    } catch (e) {
      console.error(`Error on ${page}:`, e.message);
    }
  }

  console.log(`Extracted unified values for ${valueMap.size} items.`);

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));

  for (const pet of pets) {
    if (pet.type === 'hat') {
      const cleanKey = pet.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const match = valueMap.get(cleanKey);
      if (match) {
        pet.baseValue = match.baseValue;
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
      // If the pet was Partner Unicorn (which is not in circulation and not a standard traded pet), set to N/A
      if (pet.name.toLowerCase() === 'partner unicorn') {
        pet.baseValue = null;
      } else {
        pet.baseValue = found.baseValue;
      }
      pet.demand = found.demand;
      pet.status = found.status;
    } else {
      pet.baseValue = null;
    }

    delete pet.shinyValue;
    pet.multipliers = {
      Normal: 1,
      Shiny: 2.5,
      Mythic: 10,
      ShinyMythic: 25
    };
  }

  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  console.log('\n✅ Successfully reconciled all pet values to official clean units!');

  console.log('\n--- VERIFICATION OF SUSPECT PETS ---');
  for (const name of ['Eternal Cucumber', 'Partner Unicorn', 'Godly Gem', 'Dementor', 'Almighty Hexarium', 'Soul Heart', 'Trophy']) {
    const p = pets.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (p) {
      console.log(`  ⚡ ${p.name} (${p.rarity}): Base = ${p.baseValue ? p.baseValue.toLocaleString() : 'N/A'} | Demand = ${p.demand}/10 | Trend = ${p.status}`);
    }
  }
}

run().catch(console.error);

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

function parseValueNumber(str) {
  if (!str) return null;
  const s = str.toLowerCase().trim();
  if (s === 'n/a' || s === 'worthless' || s.includes('⚰') || s === '-') return null;
  const cleaned = s.replace(/,/g, '').replace(/%/g, '').replace(/~/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseDemand(str) {
  if (!str) return 5;
  const s = str.trim();
  if (s === 'N/A' || s === 'worthless') return 5;
  const num = parseFloat(s);
  if (isNaN(num)) return 5;
  return Math.min(10, Math.max(1, Math.round(num)));
}

async function run() {
  console.log('=== PARSING EXACT SHINY & NORMAL VALUES FROM COLLAB SITE ===\n');

  const cleanPages = [
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

  const collabMap = new Map(); // cleanKey -> { name, normalVal, shinyVal, demand, status }

  for (const page of cleanPages) {
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
        const shinyValCandidate = rows[i + 3];

        const isValPattern = valCandidate !== undefined && (
          valCandidate === 'N/A' ||
          valCandidate.toLowerCase() === 'worthless' ||
          valCandidate.includes('⚰') ||
          /^[\d,]+(\.\d+)?%?$/.test(valCandidate.replace(/~/g, ''))
        );

        if (isValPattern) {
          const petName = item;
          const normalVal = parseValueNumber(valCandidate);
          const demand = parseDemand(demandCandidate);
          const shinyVal = parseValueNumber(shinyValCandidate);

          let status = 'Stable';
          if (demand >= 9) status = 'Hyped';
          else if (demand >= 7) status = 'Rising';
          else if (demand <= 3) status = 'Dropping';

          const cleanKey = petName.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanKey.length > 1 && !cleanKey.includes('copyof') && !cleanKey.includes('category')) {
            if (!collabMap.has(cleanKey)) {
              collabMap.set(cleanKey, {
                name: petName,
                baseValue: normalVal,
                shinyValue: shinyVal,
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

  console.log(`Extracted data for ${collabMap.size} items from Collab site.`);

  // Update pets
  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  let exactShiniesCount = 0;

  for (const pet of pets) {
    if (pet.type === 'hat') continue;

    const petKey = pet.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const strippedKey = petKey.replace(/^mythic/, '');

    let match = collabMap.get(petKey) || collabMap.get(strippedKey);
    if (!match) {
      for (const [key, val] of collabMap.entries()) {
        if (key === petKey || key === strippedKey) {
          match = val;
          break;
        }
      }
    }

    if (match) {
      pet.baseValue = match.baseValue;
      if (typeof match.shinyValue === 'number' && match.shinyValue > 0) {
        pet.shinyValue = match.shinyValue;
        exactShiniesCount++;
      } else {
        delete pet.shinyValue;
      }
      pet.demand = match.demand;
      pet.status = match.status;
    } else {
      pet.baseValue = null;
      delete pet.shinyValue;
    }
  }

  console.log(`Saved exact Shiny values for ${exactShiniesCount} pets from the Collab site!`);

  // Write files
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  console.log('\n--- VERIFIED SHINY VS NORMAL VALUES ---');
  const checkList = ['Almighty Hexarium', 'Soul Heart', 'Trophy', 'Pot O\' Gold', 'Easter Basket', 'Lord Shock', 'Sinister Lord', 'Radiance', 'The Overlord', 'Dogcat'];
  for (const name of checkList) {
    const p = pets.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (p) {
      console.log(`  ⚡ ${p.name}: Normal = ${p.baseValue?.toLocaleString() || 'N/A'} | Explicit Shiny = ${p.shinyValue?.toLocaleString() || 'Calculated'}`);
    }
  }
}

run().catch(console.error);

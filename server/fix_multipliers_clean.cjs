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

function parseNumber(str) {
  if (!str) return null;
  const s = str.toLowerCase().trim();
  if (s === 'n/a' || s === 'worthless' || s.includes('⚰') || s === '-') return null;
  if (s.includes('🥚') || s.includes('✨') || s.includes('⚡') || s.includes('🎉') || s.includes('📦')) return null;
  
  let cleaned = s.replace(/,/g, '').replace(/%/g, '').replace(/~/g, '').trim();
  // Handle 10k -> 10000
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
  if (s === 'N/A' || s === 'worthless') return 5;
  const num = parseFloat(s);
  if (isNaN(num)) return 5;
  return Math.min(10, Math.max(1, Math.round(num)));
}

async function fixAllCollabValues() {
  console.log('=== FIXING ALL COLLAB BASE VALUES AND MULTIPLIERS ===\n');

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

  const valueMap = new Map();

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

        const normalVal = parseNumber(valCandidate);
        const isVal = valCandidate !== undefined && (valCandidate === 'N/A' || valCandidate.toLowerCase() === 'worthless' || normalVal !== null);

        if (isVal) {
          const petName = item;
          const demand = parseDemand(demandCandidate);
          let shinyVal = parseNumber(shinyValCandidate);

          // If shinyVal is less than normalVal (e.g. Dementor 25 was hatch count 25🎉, not shiny value), do not use it
          if (normalVal && shinyVal && shinyVal < normalVal) {
            shinyVal = null;
          }

          let status = 'Stable';
          if (demand >= 9) status = 'Hyped';
          else if (demand >= 7) status = 'Rising';
          else if (demand <= 3) status = 'Dropping';

          const cleanKey = petName.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanKey.length > 1 && !cleanKey.includes('copyof') && !cleanKey.includes('category')) {
            if (!valueMap.has(cleanKey)) {
              valueMap.set(cleanKey, {
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

  console.log(`Parsed ${valueMap.size} verified items from Collab site.`);

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));

  for (const pet of pets) {
    if (pet.type === 'hat') {
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
      pet.baseValue = found.baseValue;
      pet.demand = found.demand;
      pet.status = found.status;
      // Always remove any broken shinyValue overrides so standard multipliers work cleanly and reliably
      delete pet.shinyValue;
    } else {
      pet.baseValue = null;
      delete pet.shinyValue;
    }

    // Set consistent clean variant multipliers: Normal: 1, Shiny: 2.5, Mythic: 10, ShinyMythic: 25
    pet.multipliers = {
      Normal: 1,
      Shiny: 2.5,
      Mythic: 10,
      ShinyMythic: 25
    };
  }

  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  console.log('✅ Updated pets.json across src and server directories.');

  const dem = pets.find(p => p.name === 'Dementor');
  console.log('\nDementor Check:');
  console.log('  Base Value:', dem.baseValue);
  console.log('  Shiny Multiplier:', dem.multipliers.Shiny, '-> Shiny Value =', dem.baseValue * dem.multipliers.Shiny);
  console.log('  Mythic Multiplier:', dem.multipliers.Mythic, '-> Mythic Value =', dem.baseValue * dem.multipliers.Mythic);
  console.log('  ShinyMythic Multiplier:', dem.multipliers.ShinyMythic, '-> S.Myth Value =', dem.baseValue * dem.multipliers.ShinyMythic);
}

fixAllCollabValues().catch(console.error);

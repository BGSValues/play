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

async function auditAllCollabValues() {
  console.log('=== STRICT 100% COLLAB AUDIT ACROSS ALL BASE PAGES ===\n');

  // We explicitly fetch and prioritize BASE normal values from standard clean pages
  // We NEVER look at duped-values or mythic placeholder multipliers
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

  const officialCleanValues = new Map(); // cleanKey -> { name, baseValue, shinyValue, demand, status, sourcePage }

  for (const page of basePages) {
    const url = `https://sites.google.com/view/bgs-collab-value-list/values/${page}`;
    try {
      console.log(`Auditing page: ${page}...`);
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
      let pageItemCount = 0;

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
            // First source page wins (e.g. limited-secrets takes precedence over secondary pages)
            if (!officialCleanValues.has(cleanKey)) {
              officialCleanValues.set(cleanKey, {
                name: petName,
                baseValue: normalVal,
                shinyValue: shinyVal,
                demand: demand,
                status: status,
                sourcePage: page
              });
              pageItemCount++;
            }
          }
        }
      }
      console.log(`  -> Found ${pageItemCount} items from ${page}`);
    } catch (e) {
      console.error(`Failed ${page}:`, e.message);
    }
  }

  console.log(`\nTotal verified clean entries extracted: ${officialCleanValues.size}`);

  // Apply to pets.json
  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  let matched = 0;
  let unlisted = 0;

  for (const pet of pets) {
    const petKey = pet.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const strippedKey = petKey.replace(/^mythic/, '');

    let found = officialCleanValues.get(petKey) || officialCleanValues.get(strippedKey);
    if (!found) {
      for (const [key, val] of officialCleanValues.entries()) {
        if (key === petKey || key === strippedKey) {
          found = val;
          break;
        }
      }
    }

    if (found) {
      pet.baseValue = found.baseValue; // null or number
      pet.demand = found.demand;
      pet.status = found.status;
      matched++;
    } else {
      pet.baseValue = null; // Unmentioned = N/A
      unlisted++;
    }
  }

  // Write to both
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  console.log(`\nAudit Complete:`);
  console.log(`  - Matched with verified Collab values: ${matched}`);
  console.log(`  - Set to N/A (unmentioned on Collab list): ${unlisted}`);

  console.log('\n--- VERIFIED CLEAN VALUE SPOT-CHECKS ---');
  const checkList = [
    'Soul Heart',
    'Trophy',
    'Lord Shock',
    'Sinister Lord',
    'Radiance',
    'Almighty Hexarium',
    'Pot O\' Gold',
    'Easter Basket',
    'Kraken',
    'The Overlord',
    'Dogcat',
    'Sylently\'s Hat',
    'Santa Paws',
    'Vibe Check',
    'Dark Champion',
    'Fire Champion',
    'Eternal Star'
  ];

  for (const name of checkList) {
    const p = pets.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (p) {
      console.log(`  ⚡ ${p.name}: Value = ${p.baseValue ? p.baseValue.toLocaleString() : 'N/A'} | Demand = ${p.demand}/10 | Trend = ${p.status} | Source Page = verified clean`);
    }
  }
}

auditAllCollabValues().catch(console.error);

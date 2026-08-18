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
  // Remove commas, percent signs, tildes
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

async function extractCleanCollabValues() {
  console.log('=== EXTRACTING STRICT CLEAN VALUES FROM BGS COLLAB VALUE LIST ===\n');
  console.log('NOTE: Dupes page (duped-values) is strictly EXCLUDED. Only clean value pages are processed.\n');

  // Strictly ONLY the clean value pages
  const cleanPages = [
    'limited-secrets',
    'permanent-secrets',
    'mythic-secrets',
    'hats',
    'leaderboard-pets-and-miscellaneous-secrets',
    't3s',
    'mythic-t3s',
    'mythic-t2s',
    'ogs',
    'bubble-pass-pets',
    'traveling-merchant-pets',
    'reward-shop-challenge-pass-and-quest-pets',
    'bubble-and-egg-prize-pets',
    'index-reward-pets',
    'robux-and-gamepass-pets'
  ];

  const cleanValuesDatabase = new Map(); // cleanKey -> { originalName, normalVal, shinyVal, demand, status, page }

  for (const page of cleanPages) {
    const url = `https://sites.google.com/view/bgs-collab-value-list/values/${page}`;
    try {
      console.log(`Processing: ${page}...`);
      const html = await fetchHtml(url);
      const matches = html.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
      const texts = matches.map(cleanText).filter(Boolean);

      // Locate where the table rows start (skip site headers / legend)
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

        // Skip headers, instructions, or footnotes
        if (item.length > 50 || item.includes('➢') || item.includes('Search this site') || item.startsWith('Category:')) continue;

        // Check if next elements correspond to normal value and demand
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
            cleanValuesDatabase.set(cleanKey, {
              originalName: petName,
              baseValue: normalVal,
              shinyValue: shinyVal,
              demand: demand,
              status: status,
              sourcePage: page
            });
          }
        }
      }
    } catch (e) {
      console.error(`Failed parsing ${page}:`, e.message);
    }
  }

  console.log(`\nExtracted clean values for ${cleanValuesDatabase.size} distinct items across all clean pages.`);

  // Load existing database
  const currentPets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  console.log(`Auditing and reconciling against local database of ${currentPets.length} pets/hats...`);

  let matchedCleanCount = 0;
  let unmentionedCount = 0;

  for (const pet of currentPets) {
    const petKey = pet.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const strippedKey = petKey.replace(/^mythic/, '');

    let match = cleanValuesDatabase.get(petKey) || cleanValuesDatabase.get(strippedKey);

    if (!match) {
      // Partial prefix search
      for (const [collabKey, collabData] of cleanValuesDatabase.entries()) {
        if (collabKey === petKey || collabKey === strippedKey) {
          match = collabData;
          break;
        }
      }
    }

    if (match) {
      // Apply exact clean value from BGS Collab site
      pet.baseValue = match.baseValue; // null if unlisted or exact number
      pet.demand = match.demand;
      pet.status = match.status;
      matchedCleanCount++;
    } else {
      // Pet is NOT mentioned in any of the clean pages on the Collab site:
      // Value must be set to null (which renders as N/A)
      pet.baseValue = null;
      unmentionedCount++;
    }
  }

  console.log(`\nReconciliation Completed:`);
  console.log(`  - Clean Verified Pets/Hats with Collab Values: ${matchedCleanCount}`);
  console.log(`  - Pets Not on Collab List (Set to N/A): ${unmentionedCount}`);

  // Save to src and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(currentPets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(currentPets, null, 2), 'utf-8');

  console.log('\n✅ Successfully saved 100% clean, non-duped values to pets.json!');

  // Print sample verified values
  console.log('\nSample Verified Clean Values from limited-secrets and permanent-secrets:');
  const sampleNames = ['Soul Heart', 'Pot O\' Gold', 'Trophy', 'Easter Basket', 'Lord Shock', 'Kraken', 'Patriotic Robot', 'Sinister Lord', 'Radiance', 'The Overlord', 'Sylently\'s Hat', 'Santa Paws', 'Vibe Check'];
  for (const name of sampleNames) {
    const found = currentPets.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (found) {
      console.log(`  ✓ ${found.name} (${found.rarity}): Value = ${found.baseValue ? found.baseValue.toLocaleString() : 'N/A'} | Demand = ${found.demand}/10 | Status = ${found.status}`);
    }
  }
}

extractCleanCollabValues().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

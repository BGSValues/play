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

function parseNumber(valStr) {
  if (!valStr || valStr === 'N/A' || valStr.toLowerCase() === 'worthless') return null;
  const cleaned = valStr.replace(/,/g, '').replace(/%/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

async function scrapeAllCollabPages() {
  console.log('=== SCRAPING ALL BGS COLLAB VALUE LIST PAGES ===\n');

  const pages = [
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

  const valueMap = new Map(); // normalizedName -> { baseValue, shinyValue, demand, status, page }

  for (const page of pages) {
    const url = `https://sites.google.com/view/bgs-collab-value-list/values/${page}`;
    try {
      console.log(`Fetching https://sites.google.com/view/bgs-collab-value-list/values/${page}...`);
      const html = await fetchHtml(url);
      const matches = html.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
      const texts = matches.map(cleanText).filter(Boolean);

      // Find the start of the data table (after introductory bullet points / header)
      let startIdx = 0;
      for (let i = 0; i < texts.length; i++) {
        if (texts[i].includes('➢') || texts[i].includes('keep in mind') || texts[i].includes('Search this site')) {
          startIdx = i + 1;
        }
      }

      const rows = texts.slice(startIdx);
      console.log(`  -> Processing ${rows.length} text entries for ${page}`);

      let i = 0;
      while (i < rows.length) {
        const text = rows[i];
        
        // Skip obvious section headers or notes
        if (text.includes('ALL VALUES') || text.includes('➢') || text.length > 50 || text.includes('DOCS_timing')) {
          i++;
          continue;
        }

        // Check if next item looks like a value (e.g. "7,000", "50", "N/A", "worthless")
        const next1 = rows[i + 1];
        const next2 = rows[i + 2];
        const next3 = rows[i + 3];

        if (next1 !== undefined && (next1 === 'N/A' || next1 === 'worthless' || /^[\d,]+(\.\d+)?%?$/.test(next1))) {
          const petName = text;
          const normalVal = parseNumber(next1);
          let demand = 5;
          let shinyVal = null;
          let step = 2;

          // Check if next2 is demand (single digit/decimal e.g. 8, 7.5, 10)
          if (next2 !== undefined && /^(\d+(\.\d+)?|N\/A)$/.test(next2)) {
            demand = next2 === 'N/A' ? 5 : Math.min(10, Math.max(1, Math.round(parseFloat(next2))));
            step = 3;
            // Check if next3 is shiny value
            if (next3 !== undefined && (next3 === 'N/A' || /^[\d,]+(\.\d+)?%?$/.test(next3))) {
              shinyVal = parseNumber(next3);
              step = 4;
            }
          }

          const normKey = petName.toLowerCase().trim();
          if (normKey.length > 1 && !normKey.startsWith('category:') && !normKey.includes('copy of')) {
            valueMap.set(normKey, {
              originalName: petName,
              baseValue: normalVal,
              shinyValue: shinyVal,
              demand: demand,
              status: demand >= 9 ? 'Hyped' : demand >= 7 ? 'Rising' : demand <= 3 ? 'Dropping' : 'Stable',
              sourcePage: page
            });
          }

          i += step;
        } else {
          i++;
        }
      }
    } catch (err) {
      console.error(`Error fetching page ${page}:`, err.message);
    }
  }

  console.log(`\nExtracted ${valueMap.size} exact pet/hat values from the BGS Collab Value List!`);

  // Load existing pets
  const currentPets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  console.log(`Applying values to local database of ${currentPets.length} items...`);

  let matchedCount = 0;
  let unmentionedCount = 0;

  for (const pet of currentPets) {
    const key = pet.name.toLowerCase().trim();
    // Also try stripping "Mythic " or extra punctuation for matching
    const strippedKey = key.replace(/^mythic\s+/i, '').replace(/[^a-z0-9]/g, '');

    let foundCollab = valueMap.get(key);
    if (!foundCollab) {
      // Fuzzy lookup
      for (const [collabKey, collabData] of valueMap.entries()) {
        const cleanCollabKey = collabKey.replace(/[^a-z0-9]/g, '');
        if (cleanCollabKey === strippedKey || collabKey === key) {
          foundCollab = collabData;
          break;
        }
      }
    }

    if (foundCollab) {
      pet.baseValue = foundCollab.baseValue; // null if unlisted/worthless or exact number
      pet.demand = foundCollab.demand || pet.demand || 5;
      pet.status = foundCollab.status || pet.status || 'Stable';
      matchedCount++;
    } else {
      // Pet is NOT mentioned on the BGS Collab Value List:
      // Per user explicit instruction: "if there are pets that are not mentioned then give the value as n/a"
      pet.baseValue = null; // Will display as N/A in the UI
      unmentionedCount++;
    }
  }

  console.log(`\nReconciliation Summary:`);
  console.log(`  - Matched with BGS Collab List: ${matchedCount} items`);
  console.log(`  - Not mentioned on list (set to N/A): ${unmentionedCount} items`);

  // Save back to both src and server files
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(currentPets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(currentPets, null, 2), 'utf-8');

  console.log('\n✅ Successfully saved exact BGS Collab values to src/data/pets.json and server/data/pets.json!');

  // Print sample matched items
  console.log('\nSample items from database:');
  currentPets.filter(p => p.baseValue !== null).slice(0, 15).forEach(p => {
    console.log(`  ⚡ ${p.name} (${p.rarity}): Value = ${p.baseValue.toLocaleString()} | Demand = ${p.demand}/10 | Status = ${p.status}`);
  });

  console.log('\nSample unmentioned items (Value: N/A):');
  currentPets.filter(p => p.baseValue === null).slice(0, 5).forEach(p => {
    console.log(`  ❓ ${p.name} (${p.rarity}): Value = N/A`);
  });
}

scrapeAllCollabPages().catch(err => {
  console.error('Fatal scraping error:', err);
  process.exit(1);
});

const https = require('https');
const fs = require('fs');
const path = require('path');

const SRC_PETS_PATH = path.join(__dirname, '..', 'src', 'data', 'pets.json');
const SERVER_PETS_PATH = path.join(__dirname, 'data', 'pets.json');

function fetchHtml(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

function cleanText(text) {
  return text.replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

async function run() {
  console.log('=== STRICT COLLAB SYNCHRONIZATION WITH PARENTHETICAL SECRET VALUES ===\n');

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));

  // 1. Reset ALL pet values and demands to null (N/A)
  for (const pet of pets) {
    pet.baseValue = null;
    pet.demand = null;
    pet.customValues = null;
  }

  const petMap = new Map();
  pets.forEach(p => {
    const cleanKey = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    petMap.set(cleanKey, p);
  });

  const collabPages = [
    'limited-secrets',
    'permanent-secrets',
    'legendary',
    't3s',
    'ogs',
    'leaderboard-pets',
    'hats',
    'bubble-pass-pets',
    'traveling-merchant-pets',
    'reward-shop-challenge-pass',
    'bubble-and-egg-prize-pets',
    'index-reward-pets',
    'robux-and-gamepass-pets'
  ];

  let matchedCount = 0;

  for (const pageName of collabPages) {
    const url = `https://sites.google.com/view/bgs-collab-value-list/values/${pageName}`;
    const html = await fetchHtml(url);
    if (!html) continue;

    const segments = [];
    const tagRegex = />([^<]+)</g;
    let m;
    while ((m = tagRegex.exec(html)) !== null) {
      const text = cleanText(m[1]);
      if (text.length > 0 && !text.startsWith('var ') && !text.startsWith('function') && !text.includes('{') && !text.includes('DOCS_timing')) {
        segments.push(text);
      }
    }

    console.log(`Scanning Collab Page: ${pageName} (${segments.length} segments)...`);

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const cleanKey = seg.toLowerCase().replace(/[^a-z0-9]/g, '');
      const pet = petMap.get(cleanKey);

      if (pet && seg.length > 2 && !['pets', 'hats', 'values', 'secrets', 'legendary', 'common', 'rare', 'epic'].includes(cleanKey)) {
        const window = segments.slice(i + 1, i + 18);
        const windowText = window.join(' ');

        let eggCount = null;
        let shinyCount = null;

        const eggMatch = windowText.match(/([0-9,]+)\s*(?:🥚|egg)/i);
        if (eggMatch) eggCount = eggMatch[1];

        const shinyMatch = windowText.match(/([0-9,]+)\s*(?:✨|shiny)/i);
        if (shinyMatch) shinyCount = shinyMatch[1];

        // Check if there is a parenthetical Secret value like (200) or (50)
        let parenSecretVal = null;
        const parenMatch = windowText.match(/\(\s*([0-9,]+)\s*\)/);
        if (parenMatch) {
          parenSecretVal = parseFloat(parenMatch[1].replace(/,/g, ''));
        }

        // Parse numbers in window
        const numItems = [];
        for (const item of window) {
          if (item === 'N/A' || item === 'worthless' || item.includes('⚰️')) {
            numItems.push({ val: 0, str: item });
          } else {
            const cleanStr = item.replace(/[()]/g, '');
            const cleanNum = parseFloat(cleanStr.replace(/,/g, ''));
            if (!isNaN(cleanNum) && !item.includes('🥚') && !item.includes('✨') && !item.includes('⚡') && !item.includes('📦')) {
              numItems.push({ val: cleanNum, str: item, isParen: item.includes('(') });
            }
          }
        }

        if (numItems.length >= 2) {
          let normalVal = parenSecretVal !== null ? parenSecretVal : numItems[0].val;
          // If the first item was a huge limited value like 1,000,000 and the second item is in parens (200), demand is the 3rd item
          let normalDemand = numItems[1].isParen && numItems.length >= 3 ? numItems[2].val : numItems[1].val;
          let shinyVal = null;

          if (numItems.length >= 4) {
            shinyVal = numItems[2].isParen && numItems.length >= 4 ? numItems[3].val : numItems[2].val;
          }

          if (normalVal !== null && !isNaN(normalVal) && normalVal >= 0) {
            pet.baseValue = normalVal;
          }

          if (normalDemand !== null && !isNaN(normalDemand) && normalDemand >= 0 && normalDemand <= 11) {
            pet.demand = Math.round(normalDemand);
          }

          if (shinyVal !== null && !isNaN(shinyVal) && shinyVal > 0) {
            if (!pet.customValues) pet.customValues = {};
            pet.customValues.shiny = shinyVal;
          }

          if (eggCount || shinyCount) {
            if (!pet.existence) pet.existence = {};
            if (eggCount) pet.existence.normal = eggCount;
            if (shinyCount) pet.existence.shiny = shinyCount;
          }

          matchedCount++;
        }
      }
    }
  }

  // Next, parse Mythic Secrets page for Mythic custom values
  const mythicHtml = await fetchHtml('https://sites.google.com/view/bgs-collab-value-list/values/mythic-secrets');
  if (mythicHtml) {
    const segments = [];
    const tagRegex = />([^<]+)</g;
    let m;
    while ((m = tagRegex.exec(mythicHtml)) !== null) {
      const text = cleanText(m[1]);
      if (text.length > 0 && !text.startsWith('var ') && !text.startsWith('function') && !text.includes('{') && !text.includes('DOCS_timing')) {
        segments.push(text);
      }
    }

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const cleanKey = seg.toLowerCase().replace(/[^a-z0-9]/g, '');
      const pet = petMap.get(cleanKey);

      if (pet && seg.length > 2 && !['pets', 'hats', 'values', 'secrets', 'legendary'].includes(cleanKey)) {
        const window = segments.slice(i + 1, i + 16);
        const mythicHatchMatch = window.join(' ').match(/([0-9,]+)\s*⚡/);
        const shinyMythicHatchMatch = window.join(' ').match(/([0-9,]+)\s*✨/);

        if (!pet.existence) pet.existence = {};
        if (mythicHatchMatch) pet.existence.mythic = mythicHatchMatch[1];
        if (shinyMythicHatchMatch) pet.existence.shinyMythic = shinyMythicHatchMatch[1];

        const numItems = [];
        for (const item of window) {
          if (item !== 'N/A' && !item.includes('🥚') && !item.includes('✨') && !item.includes('⚡') && !item.includes('📦')) {
            const cleanNum = parseFloat(item.replace(/[(),]/g, ''));
            if (!isNaN(cleanNum)) numItems.push(cleanNum);
          }
        }

        if (numItems.length >= 1 && numItems[0] > 0) {
          if (!pet.customValues) pet.customValues = {};
          pet.customValues.mythic = numItems[0];
          if (numItems.length >= 3 && numItems[2] > 0) {
            pet.customValues.shinyMythic = numItems[2];
          }
        }
      }
    }
  }

  // Count items with values vs N/A
  const withValues = pets.filter(p => p.baseValue !== null);
  const withoutValues = pets.filter(p => p.baseValue === null);

  console.log(`\n===========================================`);
  console.log(`✅ Items with Exact Collab Values: ${withValues.length}`);
  console.log(`⚪ Items Unlisted in Collab (Set to N/A): ${withoutValues.length}`);
  console.log(`===========================================`);

  // Save to client and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  // Verify Sample Prominent Items
  console.log('\n--- VERIFICATION OF STRICT COLLAB VALUES ---');
  for (const name of ['Eternal Cucumber', 'The Overlord', 'Luminance', 'Soul Heart', 'Trophy', 'Angelic Spirit', 'BGS Plaque', 'Pot O\' Gold', 'Rainbow Dogcat', 'Shadow Challenger', 'Easter Overlord', 'Void Dragon', 'Dominus Hydra', 'Elite Sentinel']) {
    const p = pets.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (p) {
      console.log(`⚡ ${p.name}: Value: ${p.baseValue !== null ? `⚡${p.baseValue.toLocaleString()}` : 'N/A'} | Demand: ${p.demand !== null ? `${p.demand}/11` : 'N/A'} | Hatched: ${JSON.stringify(p.existence)}`);
    }
  }
}

run().catch(console.error);

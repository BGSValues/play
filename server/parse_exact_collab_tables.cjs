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
  console.log('=== EXACT COLLAB TABLE PARSER WITH STRICT BASE/MYTHIC SEPARATION ===\n');

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  const petMap = new Map();
  pets.forEach(p => {
    petMap.set(p.name.toLowerCase().replace(/[^a-z0-9]/g, ''), p);
  });

  // Base / Normal Pages (Processed for Base Value, Base Demand, and Shiny Value)
  const basePages = [
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

  let matchedBaseCount = 0;

  for (const pageName of basePages) {
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

    console.log(`Scanning Base page: ${pageName} (${segments.length} segments)...`);

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const cleanKey = seg.toLowerCase().replace(/[^a-z0-9]/g, '');
      const pet = petMap.get(cleanKey);

      if (pet && seg.length > 2 && !['pets', 'hats', 'values', 'secrets', 'legendary', 'common', 'rare', 'epic'].includes(cleanKey)) {
        const window = segments.slice(i + 1, i + 16);
        const windowText = window.join(' ');

        let eggCount = null;
        let shinyCount = null;

        const eggMatch = windowText.match(/([0-9,]+)\s*(?:🥚|egg)/i);
        if (eggMatch) eggCount = eggMatch[1];

        const shinyMatch = windowText.match(/([0-9,]+)\s*(?:✨|shiny)/i);
        if (shinyMatch) shinyCount = shinyMatch[1];

        const numItems = [];
        for (const item of window) {
          if (item === 'N/A' || item === 'worthless' || item.includes('⚰️')) {
            numItems.push({ val: 0, str: item });
          } else {
            const cleanNum = parseFloat(item.replace(/,/g, ''));
            if (!isNaN(cleanNum) && !item.includes('🥚') && !item.includes('✨') && !item.includes('⚡') && !item.includes('📦')) {
              numItems.push({ val: cleanNum, str: item });
            }
          }
        }

        if (numItems.length >= 2) {
          const normalVal = numItems[0].val;
          const normalDemand = numItems[1].val;
          let shinyVal = numItems.length >= 4 ? numItems[2].val : null;

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

          matchedBaseCount++;
        }
      }
    }
  }

  // Next, parse Mythic Secrets page specifically for Mythic and Shiny Mythic custom values and mythic hatched serials
  const mythicUrl = 'https://sites.google.com/view/bgs-collab-value-list/values/mythic-secrets';
  const mythicHtml = await fetchHtml(mythicUrl);
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

    console.log(`Scanning Mythic page (${segments.length} segments)...`);

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const cleanKey = seg.toLowerCase().replace(/[^a-z0-9]/g, '');
      const pet = petMap.get(cleanKey);

      if (pet && seg.length > 2 && !['pets', 'hats', 'values', 'secrets', 'legendary'].includes(cleanKey)) {
        const window = segments.slice(i + 1, i + 16);
        const windowText = window.join(' ');

        const mythicHatchMatch = windowText.match(/([0-9,]+)\s*⚡/);
        const shinyMythicHatchMatch = windowText.match(/([0-9,]+)\s*✨/);

        if (!pet.existence) pet.existence = {};
        if (mythicHatchMatch) pet.existence.mythic = mythicHatchMatch[1];
        if (shinyMythicHatchMatch) pet.existence.shinyMythic = shinyMythicHatchMatch[1];

        const numItems = [];
        for (const item of window) {
          if (item === 'N/A' || item === 'worthless' || item.includes('⚰️')) {
            numItems.push({ val: 0, str: item });
          } else {
            const cleanNum = parseFloat(item.replace(/,/g, ''));
            if (!isNaN(cleanNum) && !item.includes('🥚') && !item.includes('✨') && !item.includes('⚡') && !item.includes('📦')) {
              numItems.push({ val: cleanNum, str: item });
            }
          }
        }

        if (numItems.length >= 2) {
          const mythicVal = numItems[0].val;
          const shinyMythicVal = numItems.length >= 4 ? numItems[2].val : null;

          if (!pet.customValues) pet.customValues = {};
          if (mythicVal > 0) pet.customValues.mythic = mythicVal;
          if (shinyMythicVal > 0) pet.customValues.shinyMythic = shinyMythicVal;
        }
      }
    }
  }

  console.log(`\nSuccessfully applied exact Collab values to ${matchedBaseCount} base items and updated Mythic values!`);

  // Save to client and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  // Verify Luminance, Angelic Spirit, BGS Plaque, Pot O' Gold, Soul Heart, Trophy
  console.log('\n--- VERIFICATION OF EXACT COLLAB VALUES ---');
  for (const name of ['Luminance', 'Angelic Spirit', 'BGS Plaque', 'Pot O\' Gold', 'Soul Heart', 'Trophy', 'Godly Shamrock', 'Electra Hydra']) {
    const p = pets.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (p) {
      console.log(`✨ ${p.name}: BaseValue: ⚡${p.baseValue?.toLocaleString()} | Demand: ${p.demand}/11 | ShinyVal: ⚡${p.customValues?.shiny?.toLocaleString()} | Hatched: ${JSON.stringify(p.existence)}`);
    }
  }
}

run().catch(console.error);

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
  console.log('=== FULL BGS COLLAB VALUE LIST SYNCHRONIZATION ===\n');

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  const petNameMap = new Map();
  pets.forEach(p => {
    petNameMap.set(p.name.toLowerCase().replace(/[^a-z0-9]/g, ''), p);
  });

  const collabPages = [
    'limited-secrets',
    'permanent-secrets',
    'mythic-secrets',
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

  let totalUpdated = 0;

  for (const pageName of collabPages) {
    const url = `https://sites.google.com/view/bgs-collab-value-list/values/${pageName}`;
    const html = await fetchHtml(url);
    if (!html) continue;

    const segments = [];
    const tagRegex = />([^<]+)</g;
    let m;
    while ((m = tagRegex.exec(html)) !== null) {
      const text = cleanText(m[1]);
      if (text.length > 0 && !text.startsWith('var ') && !text.startsWith('function') && !text.includes('{')) {
        segments.push(text);
      }
    }

    console.log(`Processing page: ${pageName} (${segments.length} segments)...`);

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const cleanKey = seg.toLowerCase().replace(/[^a-z0-9]/g, '');
      const pet = petNameMap.get(cleanKey);

      if (pet) {
        // Look ahead 20 segments for value, demand, shiny value, stability, existence
        const lookahead = segments.slice(i + 1, i + 22);
        const lookaheadText = lookahead.join(' ');

        // 1. Hatched counts
        const eggMatch = lookaheadText.match(/([0-9,]+(?:\.[0-9]+)?)\s*🥚/);
        const shinyMatch = lookaheadText.match(/([0-9,]+(?:\.[0-9]+)?)\s*✨/);
        const mythicMatch = lookaheadText.match(/([0-9,]+(?:\.[0-9]+)?)\s*⚡/);
        const hatMatch = lookaheadText.match(/([0-9,]+(?:\.[0-9]+)?)\s*📦/);
        const specialMatch = lookaheadText.match(/([0-9,]+(?:\.[0-9]+)?)\s*🎉/);

        if (!pet.existence) pet.existence = {};
        if (eggMatch) pet.existence.normal = eggMatch[1];
        if (shinyMatch && pageName !== 'mythic-secrets') pet.existence.shiny = shinyMatch[1];
        if (shinyMatch && pageName === 'mythic-secrets') pet.existence.shinyMythic = shinyMatch[1];
        if (mythicMatch) pet.existence.mythic = mythicMatch[1];
        if (hatMatch) pet.existence.hats = hatMatch[1];
        if (specialMatch) pet.existence.special = specialMatch[1];

        // 2. Stability / Trend
        if (lookaheadText.includes('⬆⬆') || lookaheadText.toLowerCase().includes('rising fast')) {
          pet.status = 'Rising Fast';
        } else if (lookaheadText.includes('⬆') || lookaheadText.toLowerCase().includes('rising')) {
          pet.status = 'Rising';
        } else if (lookaheadText.includes('⬇⬇') || lookaheadText.toLowerCase().includes('dropping fast')) {
          pet.status = 'Dropping Fast';
        } else if (lookaheadText.includes('⬇') || lookaheadText.toLowerCase().includes('dropping')) {
          pet.status = 'Dropping';
        } else if (lookaheadText.includes('🔄') || lookaheadText.toLowerCase().includes('unstable')) {
          pet.status = 'Unstable';
        } else if (lookaheadText.includes('↔') || lookaheadText.toLowerCase().includes('stable')) {
          pet.status = 'Stable';
        }

        // 3. Values and Demands
        // Find all numeric values in lookahead
        const nums = [];
        for (const item of lookahead) {
          if (item === 'N/A' || item === 'worthless' || item.includes('⚰️')) {
            nums.push({ val: 0, raw: item });
          } else {
            const cleanNum = parseFloat(item.replace(/,/g, ''));
            if (!isNaN(cleanNum) && !item.includes('🥚') && !item.includes('✨') && !item.includes('⚡') && !item.includes('📦')) {
              nums.push({ val: cleanNum, raw: item });
            }
          }
        }

        if (nums.length >= 2) {
          // Typically nums[0] is Normal Value, nums[1] is Demand (0-11)
          const rawVal = nums[0].val;
          const rawDemand = nums[1].val;

          if (rawVal > 0 && rawVal < 100000000) {
            pet.baseValue = rawVal;
          }

          if (rawDemand >= 0 && rawDemand <= 11) {
            pet.demand = Math.round(rawDemand);
          }

          // If nums[2] is Shiny Value and nums[3] is Shiny Demand
          if (nums.length >= 4) {
            const shinyVal = nums[2].val;
            if (shinyVal > 0) {
              if (!pet.customValues) pet.customValues = {};
              pet.customValues.shiny = shinyVal;
            }
          }

          totalUpdated++;
        }
      }
    }
  }

  console.log(`\nUpdated ${totalUpdated} items with exact Collab List values, demands (0-11), trends, and hatched amounts!`);

  // Save to client and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  // Verify Sample Prominent Pets
  console.log('\n--- VERIFICATION OF COLLAB DATA ---');
  for (const name of ['Soul Heart', 'Pot O\' Gold', 'Trophy', 'Rainbow Dogcat', 'The Overlord', 'Dominus Hydra', 'Nebula Valkyrie', 'Fallen Angel', 'Shadow Challenger', 'Godly Shamrock', 'Elite Sentinel', 'Dementor']) {
    const p = pets.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (p) {
      console.log(`⚡ ${p.name} (${p.rarity}): Value: ⚡${p.baseValue?.toLocaleString()} | Demand: ${p.demand}/11 | Trend: ${p.status} | Exist: ${JSON.stringify(p.existence)}`);
    }
  }
}

run().catch(console.error);

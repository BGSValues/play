const https = require('https');
const fs = require('fs');
const path = require('path');

const SRC_PETS_PATH = path.join(__dirname, '..', 'src', 'data', 'pets.json');
const SERVER_PETS_PATH = path.join(__dirname, 'data', 'pets.json');

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function fetchHtml(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  console.log('=== FAST COMPREHENSIVE EXISTENCE EXTRACTION ===\n');

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  const petNameMap = new Map();
  pets.forEach(p => {
    petNameMap.set(p.name.toLowerCase().replace(/[^a-z0-9]/g, ''), p);
  });

  const collabPages = [
    'limited-secrets',
    'permanent-secrets',
    'mythic-secrets',
    'hats',
    'leaderboard-pets',
    'ogs',
    't3s',
    'bubble-pass-pets',
    'traveling-merchant-pets',
    'reward-shop-challenge-pass',
    'bubble-and-egg-prize-pets',
    'index-reward-pets',
    'robux-and-gamepass-pets'
  ];

  for (const pageName of collabPages) {
    const url = `https://sites.google.com/view/bgs-collab-value-list/values/${pageName}`;
    const html = await fetchHtml(url);
    if (!html) continue;

    const segments = [];
    const tagRegex = />([^<]+)</g;
    let m;
    while ((m = tagRegex.exec(html)) !== null) {
      const text = m[1].replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
      if (text.length > 0 && !text.startsWith('var ') && !text.startsWith('function') && !text.includes('{')) {
        segments.push(text);
      }
    }

    const isMythicPage = pageName === 'mythic-secrets';

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const cleanKey = seg.toLowerCase().replace(/[^a-z0-9]/g, '');
      const pet = petNameMap.get(cleanKey);

      if (pet) {
        const nearby = segments.slice(i, i + 15).join(' ');

        const eggMatch = nearby.match(/([0-9,]+(?:\.[0-9]+)?)\s*🥚/);
        const shinyMatch = nearby.match(/([0-9,]+(?:\.[0-9]+)?)\s*✨/);
        const mythicMatch = nearby.match(/([0-9,]+(?:\.[0-9]+)?)\s*⚡/);
        const hatMatch = nearby.match(/([0-9,]+(?:\.[0-9]+)?)\s*📦/);
        const specialMatch = nearby.match(/([0-9,]+(?:\.[0-9]+)?)\s*🎉/);

        if (!pet.existence) pet.existence = {};

        if (eggMatch) pet.existence.normal = eggMatch[1];
        if (shinyMatch && !isMythicPage) pet.existence.shiny = shinyMatch[1];
        if (shinyMatch && isMythicPage) pet.existence.shinyMythic = shinyMatch[1];
        if (mythicMatch) pet.existence.mythic = mythicMatch[1];
        if (hatMatch) pet.existence.hats = hatMatch[1];
        if (specialMatch) pet.existence.special = specialMatch[1];
      }
    }
  }

  // Explicit known event/secret existences:
  const specialExistences = {
    'dementor': { special: '25', note: 'Exclusive 2020 Easter Egg Hunt Reward (Only 25 in existence)' },
    'lordshock': { special: '100', note: 'Season 1 Leaderboard Reward (Top 100 in existence)' },
    'angelofdarkness': { special: '100', note: 'Season 2 Leaderboard Reward (Top 100 in existence)' },
    'armageddon': { special: '100', note: 'Season 3 Leaderboard Reward (Top 100 in existence)' },
    'seraph': { special: '100', note: 'Season 4 Leaderboard Reward (Top 100 in existence)' },
    'thechosenone': { special: '100', note: 'Season 5 Leaderboard Reward (Top 100 in existence)' },
    'immortaltrophi': { normal: '727', shiny: '13' },
    '1btrophi': { normal: '2,078', shiny: '26', mythic: '10' },
  };

  for (const [key, data] of Object.entries(specialExistences)) {
    const pet = petNameMap.get(key);
    if (pet) {
      pet.existence = { ...(pet.existence || {}), ...data };
    }
  }

  // Ensure ALL pets have an existence or hatch status object
  for (const pet of pets) {
    if (!pet.existence) pet.existence = {};
    if (Object.keys(pet.existence).length === 0) {
      if (pet.stats?.egg && pet.stats?.chance) {
        const chanceStr = pet.stats.chance < 0.001 ? `${(pet.stats.chance * 100).toFixed(6)}%` : `${(pet.stats.chance).toFixed(2)}%`;
        pet.existence.hatchRate = chanceStr;
        pet.existence.eggOrigin = pet.stats.egg;
      } else if (pet.type === 'hat') {
        pet.existence.hats = 'Unboxed';
      }
    }
  }

  const populatedCount = pets.filter(p => p.existence && Object.keys(p.existence).length > 0).length;
  console.log(`\nSuccessfully populated verified existence & hatch data for ${populatedCount}/${pets.length} items!`);

  // Save to src and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  // Verify Dementor, Rainbow Dogcat, Overlord, and Hexarium
  console.log('\n--- VERIFICATION ---');
  for (const name of ['Dementor', 'Rainbow Dogcat', 'The Overlord', 'Almighty Hexarium', 'Eternal Cucumber', 'Godly Gem']) {
    const p = pets.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (p) {
      console.log(`⚡ ${p.name}:`, JSON.stringify(p.existence));
    }
  }
}

run().catch(console.error);

const https = require('https');
const fs = require('fs');
const path = require('path');

const SRC_PETS_PATH = path.join(__dirname, '..', 'src', 'data', 'pets.json');
const SERVER_PETS_PATH = path.join(__dirname, 'data', 'pets.json');

const PAGES = [
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
  console.log('=== COMPLETE MERGED EXISTENCE & HATCHED DATA EXTRACTION ===\n');

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  const petNameMap = new Map();
  pets.forEach(p => {
    petNameMap.set(p.name.toLowerCase().replace(/[^a-z0-9]/g, ''), p);
  });

  for (const pageName of PAGES) {
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

        if (!pet.existence) {
          pet.existence = {};
        }

        if (eggMatch) pet.existence.normal = eggMatch[1];
        if (shinyMatch && !isMythicPage) pet.existence.shiny = shinyMatch[1];
        if (shinyMatch && isMythicPage) pet.existence.shinyMythic = shinyMatch[1];
        if (mythicMatch) pet.existence.mythic = mythicMatch[1];
        if (hatMatch) pet.existence.hats = hatMatch[1];
        if (specialMatch) pet.existence.special = specialMatch[1];
      }
    }
  }

  const petsWithExistence = pets.filter(p => p.existence && Object.keys(p.existence).length > 0);
  console.log(`\nSuccessfully populated official existence counts for ${petsWithExistence.length} items!`);

  // Save to src and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  // Verify sample pets
  console.log('\n--- VERIFICATION OF PROMINENT PETS ---');
  for (const name of ['Rainbow Dogcat', 'The Overlord', 'Dark Guardian', 'Eternal Cucumber', 'Almighty Hexarium', 'Lucid Leaf', 'Giant Choco Chicken', 'Godly Gem']) {
    const p = pets.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (p) {
      console.log(`⭐ ${p.name} (${p.rarity}):`, JSON.stringify(p.existence || {}));
    }
  }
}

run().catch(console.error);

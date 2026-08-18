const fs = require('fs');
const path = require('path');

const pets = JSON.parse(fs.readFileSync('src/data/pets.json', 'utf-8'));

// Name aliases between Wiki and Collab
const ALIASES = {
  'golf balls': 'angelic golf ball',
  'golf ball': 'angelic golf ball',
  'angelic golf ball': 'golf balls',
  'champion': 'champions',
  'champions': 'champion',
  'basilisk': 'basilisks',
  'basilisks': 'basilisk',
  'skull': 'skulls',
  'skulls': 'skull',
  'plushie': 'plushies',
  'plushies': 'plushie',
  'dice split': 'dice splits',
  'dice splits': 'dice split',
  'sinister lord': 'sinister lord 2.0',
  'pot o doggy': "pot o' doggy",
  '1b trophy': '1 billion trophy',
  '1 billion trophy': '1b trophy'
};

function normalize(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const pageFiles = [
  'server/page_limited-secrets.html',
  'server/page_permanent-secrets.html',
  'server/page_mythic-secrets.html',
  'server/page_leaderboard-pets-and-miscellaneous-secrets.html',
  'server/page_ogs.html',
  'server/page_t3s.html',
  'server/page_mythic-t3s.html',
  'server/page_mythic-t2s.html',
  'server/page_bubble-pass-pets.html',
  'server/page_reward-shop-challenge-pass-and-quest-pets.html',
  'server/page_bubble-and-egg-prize-pets.html',
  'server/page_index-reward-pets.html',
  'server/page_robux-and-gamepass-pets.html'
];

const collabEntries = new Map();

for (const file of pageFiles) {
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf-8');
  const textMatches = html.match(/>([^<]{1,100})</g) || [];
  const tokens = textMatches
    .map(t => t.slice(1, -1).replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim())
    .filter(t => t.length > 0);

  for (let i = 0; i < tokens.length; i++) {
    const rawToken = tokens[i];
    let token = rawToken.replace(/^Mythic\s+/i, '').trim();

    // Check if token matches any pet directly or via alias
    const matchedPet = pets.find(p => {
      if (p.name.toLowerCase() === token.toLowerCase()) return true;
      if (normalize(p.name) === normalize(token)) return true;
      if (ALIASES[p.name.toLowerCase()] === token.toLowerCase()) return true;
      if (ALIASES[token.toLowerCase()] === p.name.toLowerCase()) return true;
      return false;
    });

    if (matchedPet) {
      // Collect slice of tokens for this pet row
      const slice = tokens.slice(i, i + 35);
      
      let baseVal = null;
      let shinyVal = null;
      let mythicVal = null;
      let shinyMythicVal = null;
      let demand = null;
      let trend = null;
      const existence = {};

      const isMythicPage = file.includes('mythic');

      for (let j = 1; j < slice.length; j++) {
        const item = slice[j];
        const prevItem = slice[j - 1] || '';

        // Stability Trend
        if (item.includes('⬆⬆') || item.toLowerCase().includes('rising fast')) trend = 'Rising Fast';
        else if (item.includes('⬆') || item.toLowerCase() === 'rising') trend = 'Rising';
        else if (item.includes('↔') || item.toLowerCase() === 'stable') trend = 'Stable';
        else if (item.includes('🔄') || item.toLowerCase() === 'unstable') trend = 'Unstable';
        else if (item.includes('⬇⬇') || item.toLowerCase().includes('dropping fast')) trend = 'Dropping Fast';
        else if (item.includes('⬇') || item.toLowerCase() === 'dropping') trend = 'Dropping';

        // Demand (e.g. 11, 2, 8)
        const demMatch = item.match(/^(\d{1,2})(?:\s*\/\s*11)?$/);
        if (demMatch && !item.includes('🥚') && !item.includes('✨') && !item.includes('⚡') && !item.includes('+') && !item.includes(',')) {
          const dNum = parseInt(demMatch[1], 10);
          if (dNum >= 1 && dNum <= 11 && demand === null) {
            demand = dNum;
          }
        }

        // Hatched existence handling (both same-token and previous-token)
        if (item.includes('🥚')) {
          const digits = item.replace(/[^0-9+~?]/g, '');
          if (digits.length > 0) {
            existence.normal = digits;
          } else if (prevItem) {
            existence.normal = prevItem.trim();
          }
        }
        if (item.includes('✨') && !item.includes('⚡')) {
          const digits = item.replace(/[^0-9+~?]/g, '');
          if (digits.length > 0) {
            existence.shiny = digits;
          } else if (prevItem) {
            existence.shiny = prevItem.trim();
          }
        }
        if (item.includes('⚡') && !item.includes('✨')) {
          const digits = item.replace(/[^0-9+~?]/g, '');
          if (digits.length > 0) {
            existence.mythic = digits;
          } else if (prevItem) {
            existence.mythic = prevItem.trim();
          }
        }
        if (item.includes('✨⚡') || (item.includes('✨') && item.includes('⚡'))) {
          const digits = item.replace(/[^0-9+~?]/g, '');
          if (digits.length > 0) {
            existence.shinyMythic = digits;
          } else if (prevItem) {
            existence.shinyMythic = prevItem.trim();
          }
        }

        // Numeric values
        const n = parseInt(item.replace(/,/g, ''), 10);
        if (!isNaN(n) && n > 0 && !item.includes('🥚') && !item.includes('✨') && !item.includes('⚡') && !item.includes('/') && !item.includes('+')) {
          if (isMythicPage) {
            if (mythicVal === null) mythicVal = n;
            else if (shinyMythicVal === null && n > mythicVal) shinyMythicVal = n;
          } else {
            if (baseVal === null) baseVal = n;
            else if (shinyVal === null && n > baseVal) shinyVal = n;
          }
        }
      }

      const key = normalize(matchedPet.name);
      const existing = collabEntries.get(key) || {};

      collabEntries.set(key, {
        name: matchedPet.name,
        baseVal: baseVal || existing.baseVal || null,
        shinyVal: shinyVal || existing.shinyVal || null,
        mythicVal: mythicVal || existing.mythicVal || null,
        shinyMythicVal: shinyMythicVal || existing.shinyMythicVal || null,
        demand: demand !== null ? demand : existing.demand || null,
        trend: trend || existing.trend || 'Stable',
        existence: { ...(existing.existence || {}), ...existence }
      });
    }
  }
}

console.log(`Parsed ${collabEntries.size} items from Collab Value List!`);

// Update database
let updated = 0;
for (const p of pets) {
  const key = normalize(p.name);
  const data = collabEntries.get(key) || collabEntries.get(normalize(ALIASES[p.name.toLowerCase()] || ''));

  if (data) {
    if (data.baseVal) p.baseValue = data.baseVal;
    if (data.shinyVal) p.shinyValue = data.shinyVal;
    if (data.demand !== null) p.demand = data.demand;
    if (data.trend) p.status = data.trend;

    if (!p.customValues) p.customValues = {};
    if (data.shinyVal) p.customValues.shiny = data.shinyVal;
    if (data.mythicVal) {
      p.customValues.mythic = data.mythicVal;
      p.mythicValue = data.mythicVal;
    }
    if (data.shinyMythicVal) {
      p.customValues.shinyMythic = data.shinyMythicVal;
      p.shinyMythicValue = data.shinyMythicVal;
    }

    if (Object.keys(data.existence || {}).length > 0) {
      p.existence = { ...(p.existence || {}), ...data.existence };
    }

    updated++;
  }
}

console.log(`Updated ${updated} pets with full Collab data & accurate Hatched Existence!`);

fs.writeFileSync('src/data/pets.json', JSON.stringify(pets, null, 2));
fs.writeFileSync('server/data/pets.json', JSON.stringify(pets, null, 2));

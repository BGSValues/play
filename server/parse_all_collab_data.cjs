const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

const htmlFiles = fs.readdirSync(__dirname).filter(f => f.startsWith('full_') && f.endsWith('.html'));

function parseVal(valStr) {
  if (!valStr) return null;
  valStr = valStr.toString().trim().toLowerCase().replace(/,/g, '').replace(/%/g, '');
  if (['n/a', '-', 'none', '?', 'free', 'worthless', 'unobtainable', 'untraded', 'o/c', 'unknown'].includes(valStr)) return null;
  if (valStr.endsWith('m')) return parseFloat(valStr) * 1000000;
  if (valStr.endsWith('k')) return parseFloat(valStr) * 1000;
  if (valStr.endsWith('b')) return parseFloat(valStr) * 1000000000;
  const num = parseFloat(valStr);
  return isNaN(num) ? null : num;
}

function parseDemand(demStr) {
  if (!demStr) return null;
  demStr = demStr.toString().trim().toUpperCase();
  if (demStr === 'GARBAGE' || demStr.includes('GARBAGE')) return 1;
  if (demStr === 'VERY BAD' || demStr === 'AWFUL') return 2;
  if (demStr === 'BAD') return 3;
  if (demStr === 'LOW') return 4;
  if (demStr === 'AVERAGE' || demStr === 'NORMAL' || demStr === 'MEDIUM') return 5;
  if (demStr === 'DECENT') return 6;
  if (demStr === 'GOOD') return 7;
  if (demStr === 'HIGH') return 8;
  if (demStr === 'VERY HIGH' || demStr === 'GREAT') return 9;
  if (demStr === 'EXTREME' || demStr === 'AMAZING' || demStr === 'INSANE') return 10;
  if (demStr === 'HYPED') return 11;
  const m = demStr.match(/(\d+)\s*\/\s*1[01]/);
  if (m) return Math.min(11, Math.max(1, parseInt(m[1])));
  const num = parseInt(demStr);
  if (!isNaN(num) && num >= 1 && num <= 11) return num;
  return null;
}

function parseTrend(text) {
  if (!text) return 'Stable';
  text = text.toString().trim();
  if (text.includes('↑↑') || text.includes('▲▲') || text.toLowerCase().includes('hyped')) return 'Rising Fast';
  if (text.includes('↑') || text.includes('▲') || text.toLowerCase().includes('rising')) return 'Rising';
  if (text.includes('↓↓') || text.toLowerCase().includes('plummet')) return 'Dropping Fast';
  if (text.includes('↓') || text.includes('▼') || text.toLowerCase().includes('dropping')) return 'Dropping';
  if (text.includes('🔄') || text.includes('?') || text.toLowerCase().includes('unstable')) return 'Unstable';
  return 'Stable';
}

const fileTierMap = {
  'full_mythic-t3s.html': 'Mythic T3',
  'full_mythic-t2s.html': 'Mythic T2',
  'full_t3s.html': 'Tier 3 Secret (T3)',
  'full_ogs.html': 'OG Secret',
  'full_limited-secrets.html': 'Limited Secret',
  'full_limited_secrets.html': 'Limited Secret',
  'full_secrets.html': 'Secret',
  'full_bubble-pass-pets.html': 'Bubble Pass',
  'full_robux-and-gamepass-pets.html': 'Robux & Gamepass',
  'full_tier-1-and-2-secrets.html': 'Tier 1 / 2 Secret',
  'full_legendary.html': 'Legendary',
  'full_bubble-and-egg-prize-pets.html': 'Prize Secret',
  'full_index-reward-pets.html': 'Index Reward',
  'full_traveling-merchant-pets.html': 'Merchant Pet',
};

const fullExtracted = new Map();

for (const file of htmlFiles) {
  const tier = fileTierMap[file] || 'Secret';
  const html = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
  const spans = [];
  let m;
  while ((m = pRegex.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
    if (text) spans.push(text);
  }

  for (let i = 0; i < spans.length; i++) {
    const nameCandidate = spans[i];
    // Check if next spans look like values/demands
    const v1 = parseVal(spans[i + 1]);
    const d1 = parseDemand(spans[i + 2]);
    const v2 = parseVal(spans[i + 3]);
    const d2 = parseDemand(spans[i + 4]);
    const trendCandidate = spans[i + 5];

    if ((v1 !== null || d1 !== null) && nameCandidate.length > 2 && nameCandidate.length < 40 && !nameCandidate.includes('$')) {
      const isMythicRow = nameCandidate.toLowerCase().startsWith('mythic ');
      const cleanName = nameCandidate.replace(/^Mythic\s+/i, '').toLowerCase().trim();
      const trend = parseTrend(trendCandidate);

      if (!fullExtracted.has(cleanName)) {
        fullExtracted.set(cleanName, {
          name: nameCandidate.replace(/^Mythic\s+/i, '').trim(),
          isMythicRow,
          normalVal: isMythicRow ? null : v1,
          normalDemand: isMythicRow ? null : d1,
          shinyVal: isMythicRow ? null : v2,
          shinyDemand: isMythicRow ? null : d2,
          mythicVal: isMythicRow ? v1 : null,
          mythicDemand: isMythicRow ? d1 : null,
          shinyMythicVal: isMythicRow ? v2 : null,
          shinyMythicDemand: isMythicRow ? d2 : null,
          trend: trend,
          tier: tier
        });
      } else {
        const existing = fullExtracted.get(cleanName);
        if (isMythicRow) {
          existing.mythicVal = v1;
          existing.mythicDemand = d1;
          existing.shinyMythicVal = v2;
          existing.shinyMythicDemand = d2;
          if (trend !== 'Stable') existing.trend = trend;
        } else {
          existing.normalVal = v1;
          existing.normalDemand = d1;
          existing.shinyVal = v2;
          existing.shinyDemand = d2;
          if (trend !== 'Stable') existing.trend = trend;
        }
      }
    }
  }
}

console.log(`Parsed ${fullExtracted.size} total items with full data from Collab list.`);

let updatedCount = 0;
for (const pet of pets) {
  const lower = pet.name.toLowerCase().trim();
  if (fullExtracted.has(lower)) {
    const data = fullExtracted.get(lower);
    if (data.normalVal !== null && data.normalVal !== undefined) {
      pet.baseValue = data.normalVal;
    }
    if (data.normalDemand !== null && data.normalDemand !== undefined) {
      pet.demand = data.normalDemand;
    }
    if (data.trend) {
      pet.status = data.trend;
    }
    if (data.tier) {
      pet.tierTag = data.tier;
    }
    if (!pet.customValues) pet.customValues = {};
    if (data.mythicVal !== null && data.mythicVal !== undefined) {
      pet.customValues.mythic = data.mythicVal;
      pet.customValues.mythicDemand = data.mythicDemand || 5;
    }
    if (data.shinyMythicVal !== null && data.shinyMythicVal !== undefined) {
      pet.customValues.shinyMythic = data.shinyMythicVal;
      pet.customValues.shinyMythicDemand = data.shinyMythicDemand || 5;
    }
    updatedCount++;
  }
}

console.log(`Successfully mapped Collab values, demands, trends & tiers to ${updatedCount} canonical pets!`);

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
}

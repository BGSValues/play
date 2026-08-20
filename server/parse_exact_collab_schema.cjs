const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

// Build lookup map by lowercase trimmed name
const petMap = new Map();
pets.forEach((p, idx) => {
  petMap.set(p.name.toLowerCase().trim(), idx);
});

function getSpans(filename) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) return [];
  const html = fs.readFileSync(filePath, 'utf8');
  const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
  const spans = [];
  let m;
  while ((m = pRegex.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
    if (text) spans.push(text);
  }
  return spans;
}

function parseVal(valStr) {
  if (!valStr) return null;
  valStr = valStr.toString().trim().toLowerCase().replace(/,/g, '').replace(/%/g, '');
  if (['n/a', '-', 'none', '?', 'free', 'worthless', 'unobtainable', 'untraded', 'o/c', 'its dogshit'].includes(valStr)) return null;
  if (valStr.endsWith('m')) return parseFloat(valStr) * 1000000;
  if (valStr.endsWith('k')) return parseFloat(valStr) * 1000;
  if (valStr.endsWith('b')) return parseFloat(valStr) * 1000000000;
  const num = parseFloat(valStr);
  return isNaN(num) ? null : num;
}

function parseDemand(demStr) {
  if (!demStr) return 5;
  demStr = demStr.toString().trim().toUpperCase();
  if (demStr === 'GARBAGE' || demStr.includes('GARBAGE') || demStr === 'TERRIBLE') return 1;
  if (demStr === 'VERY BAD' || demStr === 'AWFUL' || demStr.includes('VERY LOW')) return 2;
  if (demStr === 'BAD' || demStr.includes('BAD')) return 3;
  if (demStr === 'LOW' || demStr.includes('LOW')) return 4;
  if (demStr === 'AVERAGE' || demStr.includes('AVERAGE') || demStr === 'NORMAL' || demStr === 'MEDIUM') return 5;
  if (demStr === 'DECENT' || demStr.includes('DECENT')) return 6;
  if (demStr === 'GOOD' || demStr.includes('GOOD')) return 7;
  if (demStr === 'HIGH' || demStr.includes('HIGH')) return 8;
  if (demStr === 'VERY HIGH' || demStr === 'GREAT') return 9;
  if (demStr === 'EXTREME' || demStr.includes('EXTREME') || demStr === 'AMAZING' || demStr === 'INSANE') return 10;
  if (demStr === 'HYPED' || demStr.includes('HYPED')) return 11;
  const m = demStr.match(/(\d+)\s*\/\s*1[01]/);
  if (m) return Math.min(11, Math.max(1, parseInt(m[1])));
  return 5;
}

// ━━━━ 1. PROCESS LIMITED SECRETS & PERMANENT SECRETS ━━━━
const secretFiles = ['full_limited-secrets.html', 'copy-of-copy-of-limited-secrets.html', 'copy-of-limited-secrets.html', 'full_permanent-secrets.html', 'copy-of-permanent-secrets.html'];

for (const file of secretFiles) {
  const spans = getSpans(file);
  for (let i = 0; i < spans.length; i++) {
    const name = spans[i];
    const key = name.toLowerCase().trim();
    if (petMap.has(key)) {
      const idx = petMap.get(key);
      const pet = pets[idx];

      // Normal value is next span
      const normalValStr = spans[i + 1];
      const normalDemandStr = spans[i + 2];
      const shinyValStr = spans[i + 3];
      const shinyDemandStr = spans[i + 4];
      const existStr = spans[i + 5];

      if (normalValStr && (parseVal(normalValStr) !== null || normalValStr === 'N/A')) {
        const val = parseVal(normalValStr);
        if (val !== null) pet.baseValue = val;

        if (normalDemandStr) {
          pet.demand = parseDemand(normalDemandStr);
        }

        if (shinyValStr && parseVal(shinyValStr) !== null) {
          if (!pet.customValues) pet.customValues = {};
          pet.customValues.shiny = parseVal(shinyValStr);
        }

        if (existStr && (existStr.includes('🥚') || existStr.includes('✨'))) {
          if (!pet.existence) pet.existence = {};
          const normMatch = existStr.match(/([0-9,]+)\s*🥚/);
          const shinyMatch = existStr.match(/([0-9,]+)\s*✨/);
          if (normMatch) pet.existence.normal = normMatch[1];
          if (shinyMatch) pet.existence.shiny = shinyMatch[1];
        }
      }
    }
  }
}

// ━━━━ 2. PROCESS MYTHIC SECRETS ━━━━
const mythicFiles = ['full_mythic-secrets.html', 'copy-of-copy-of-mythic-secrets.html', 'copy-of-mythic-secrets.html'];

for (const file of mythicFiles) {
  const spans = getSpans(file);
  for (let i = 0; i < spans.length; i++) {
    const name = spans[i];
    const key = name.toLowerCase().trim();
    if (petMap.has(key)) {
      const idx = petMap.get(key);
      const pet = pets[idx];

      const mythicValStr = spans[i + 1];
      const mythicExistStr = spans[i + 2];
      const shinyMythicValStr = spans[i + 3];
      const shinyMythicExistStr = spans[i + 4];

      if (mythicValStr && (parseVal(mythicValStr) !== null || mythicValStr.includes('%') || mythicValStr === 'N/A')) {
        if (!pet.customValues) pet.customValues = {};
        if (!pet.existence) pet.existence = {};

        const mVal = parseVal(mythicValStr);
        if (mVal !== null) {
          pet.customValues.mythic = mVal;
        }

        if (mythicExistStr && (mythicExistStr.includes('⚡') || mythicExistStr.includes('✨⚡'))) {
          const mMatch = mythicExistStr.match(/([0-9,]+)\s*⚡/);
          if (mMatch) pet.existence.mythic = mMatch[1];
        }

        if (shinyMythicValStr && parseVal(shinyMythicValStr) !== null) {
          pet.customValues.shinyMythic = parseVal(shinyMythicValStr);
        }

        if (shinyMythicExistStr && (shinyMythicExistStr.includes('⚡') || shinyMythicExistStr.includes('✨⚡'))) {
          const smMatch = shinyMythicExistStr.match(/([0-9,]+)\s*(?:✨⚡|⚡)/);
          if (smMatch) pet.existence.shinyMythic = smMatch[1];
        }
      }
    }
  }
}

// ━━━━ 3. PROCESS BUBBLE PASS & T3 & OG PETS ━━━━
const otherFiles = ['full_bubble-pass-pets.html', 'full_t3s.html', 'full_ogs.html', 'full_traveling-merchant-pets.html', 'full_robux-and-gamepass-pets.html', 'full_hats.html'];

for (const file of otherFiles) {
  const spans = getSpans(file);
  for (let i = 0; i < spans.length; i++) {
    const name = spans[i];
    const key = name.toLowerCase().trim();
    if (petMap.has(key)) {
      const idx = petMap.get(key);
      const pet = pets[idx];

      const val1 = spans[i + 1];
      const dem1 = spans[i + 2];
      const val2 = spans[i + 3];
      const dem2 = spans[i + 4];

      if (val1 && parseVal(val1) !== null) {
        pet.baseValue = parseVal(val1);
        if (dem1) pet.demand = parseDemand(dem1);
        if (val2 && parseVal(val2) !== null) {
          if (!pet.customValues) pet.customValues = {};
          pet.customValues.shiny = parseVal(val2);
        }
      }
    }
  }
}

// ━━━━ 4. AUTO-COMPUTE ANY MISSING VARIANT VALUES VIA MULTIPLIERS ━━━━
for (const pet of pets) {
  if (pet.type === 'pet' && pet.baseValue !== null) {
    if (!pet.customValues) pet.customValues = {};
    if (!pet.customValues.shiny || pet.customValues.shiny <= pet.baseValue) {
      pet.customValues.shiny = Math.round(pet.baseValue * 2.5);
    }
    if (!pet.customValues.mythic || pet.customValues.mythic <= pet.baseValue) {
      pet.customValues.mythic = Math.round(pet.baseValue * 10);
    }
    if (!pet.customValues.shinyMythic || pet.customValues.shinyMythic <= pet.customValues.mythic) {
      pet.customValues.shinyMythic = Math.round(pet.baseValue * 25);
    }
  }
}

// Save clean database
fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
}

console.log('--- VERIFICATION OF HARMONIC HARP & KEY PETS ---');
const harp = pets.find(p => p.name === 'Harmonic Harp');
console.log('Harmonic Harp:', {
  normalVal: harp.baseValue,
  demand: harp.demand + '/11',
  shinyVal: harp.customValues?.shiny,
  mythicVal: harp.customValues?.mythic,
  shinyMythicVal: harp.customValues?.shinyMythic,
  existence: harp.existence
});

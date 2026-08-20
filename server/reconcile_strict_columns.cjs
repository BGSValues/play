const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

const petMap = new Map();
pets.forEach((p, idx) => {
  p.customValues = null;
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
  if (!demStr) return null;
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
  const num = parseInt(demStr);
  if (!isNaN(num) && num >= 1 && num <= 11) return num;
  return null;
}

// 1. Limited & Permanent Secrets
const secretFiles = ['full_limited-secrets.html', 'full_permanent-secrets.html'];
for (const file of secretFiles) {
  const spans = getSpans(file);
  for (let i = 0; i < spans.length; i++) {
    const name = spans[i];
    const key = name.toLowerCase().trim();
    if (petMap.has(key)) {
      const pet = pets[petMap.get(key)];
      const rawVal1 = spans[i + 1];
      const rawDem1 = spans[i + 2];
      const rawVal2 = spans[i + 3];
      const rawDem2 = spans[i + 4];
      const exist = spans[i + 5];

      // Exact Column 1: Normal Value
      const pV1 = parseVal(rawVal1);
      pet.baseValue = pV1; // if rawVal1 is 'N/A' or 'worthless', pV1 is null!

      // Exact Column 2: Demand
      if (pV1 !== null) {
        pet.demand = parseDemand(rawDem1) || 5;
        pet.status = 'Stable';
      } else {
        pet.demand = null;
        pet.status = 'N/A';
      }

      // Exact Column 3: Shiny Value
      const pV2 = parseVal(rawVal2);
      if (pV2 !== null) {
        if (!pet.customValues) pet.customValues = {};
        pet.customValues.shiny = pV2;
      }

      // Exact Column 5: Existence
      if (exist && (exist.includes('🥚') || exist.includes('✨'))) {
        if (!pet.existence) pet.existence = {};
        const nMatch = exist.match(/([0-9,]+)\s*🥚/);
        const sMatch = exist.match(/([0-9,]+)\s*✨(?!⚡)/);
        if (nMatch) pet.existence.normal = nMatch[1];
        if (sMatch) pet.existence.shiny = sMatch[1];
      }
    }
  }
}

// 2. Mythic Secrets
const mythicFiles = ['full_mythic-secrets.html'];
for (const file of mythicFiles) {
  const spans = getSpans(file);
  for (let i = 0; i < spans.length; i++) {
    const name = spans[i];
    const key = name.toLowerCase().trim();
    if (petMap.has(key)) {
      const pet = pets[petMap.get(key)];
      const mValStr = spans[i + 1];
      const smValStr = spans[i + 2];
      const existStr = spans[i + 3];

      const mVal = parseVal(mValStr);
      const smVal = parseVal(smValStr);

      if (mVal !== null || smVal !== null) {
        if (!pet.customValues) pet.customValues = {};
        if (mVal !== null) pet.customValues.mythic = mVal;
        if (smVal !== null) pet.customValues.shinyMythic = smVal;
      }

      if (existStr && (existStr.includes('⚡') || existStr.includes('✨⚡'))) {
        if (!pet.existence) pet.existence = {};
        const mMatch = existStr.match(/([0-9,]+)\s*⚡(?!✨)/);
        const smMatch = existStr.match(/([0-9,]+)\s*(?:✨⚡|✨\s*⚡)/);
        if (mMatch) pet.existence.mythic = mMatch[1];
        if (smMatch) pet.existence.shinyMythic = smMatch[1];
      }
    }
  }
}

// 3. Ensure Tophat pets are Secret companion pets
for (const p of pets) {
  if (p.name.startsWith('Tophat (') || p.name.startsWith('Tophat(') || p.name === 'Magic Tophat' || p.name === 'Golden Tophat') {
    p.type = 'pet';
    p.rarity = 'Secret';
    p.category = 'Secret Pets';
    p.multipliers = { Normal: 1, Shiny: 2.5, Mythic: 10, ShinyMythic: 25 };
  }
}

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
}

console.log('--- LEVIATHAN VERIFICATION ---');
const lev = pets.find(p => p.name === 'Leviathan');
console.log(JSON.stringify(lev, null, 2));

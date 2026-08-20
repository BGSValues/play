const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

// Build lookup map by lowercase trimmed name
const petMap = new Map();
pets.forEach((p, idx) => {
  delete p.shinyValue;
  delete p.mythicValue;
  delete p.shinyMythicValue;
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

// 1. Process Limited Secrets & Permanent Secrets (Sets baseValue, normal demand, shiny value, normal/shiny existence)
const secretFiles = ['full_limited-secrets.html', 'full_permanent-secrets.html'];
for (const file of secretFiles) {
  const spans = getSpans(file);
  for (let i = 0; i < spans.length; i++) {
    const name = spans[i];
    const key = name.toLowerCase().trim();
    if (petMap.has(key)) {
      const pet = pets[petMap.get(key)];
      const val1 = spans[i + 1];
      const dem1 = spans[i + 2];
      const val2 = spans[i + 3];
      const dem2 = spans[i + 4];
      const exist = spans[i + 5];

      if (val1 && (parseVal(val1) !== null || val1 === 'N/A')) {
        const parsedV1 = parseVal(val1);
        if (parsedV1 !== null) pet.baseValue = parsedV1;
        if (dem1) pet.demand = parseDemand(dem1);

        const parsedV2 = parseVal(val2);
        if (parsedV2 !== null) {
          if (!pet.customValues) pet.customValues = {};
          pet.customValues.shiny = parsedV2;
        }

        if (exist && (exist.includes('🥚') || exist.includes('✨'))) {
          if (!pet.existence) pet.existence = {};
          const nMatch = exist.match(/([0-9,]+)\s*🥚/);
          const sMatch = exist.match(/([0-9,]+)\s*✨/);
          if (nMatch) pet.existence.normal = nMatch[1];
          if (sMatch) pet.existence.shiny = sMatch[1];
        }
      }
    }
  }
}

// 2. Process Mythic Secrets (ONLY touches customValues.mythic and customValues.shinyMythic and ⚡ existence)
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
        const mMatch = existStr.match(/([0-9,]+)\s*⚡/);
        const smMatch = existStr.match(/([0-9,]+)\s*✨⚡/);
        if (mMatch) pet.existence.mythic = mMatch[1];
        if (smMatch) pet.existence.shinyMythic = smMatch[1];
      }
    }
  }
}

// 3. Process Bubble Pass, T3s, OGs, Traveling Merchant
const otherFiles = ['full_bubble-pass-pets.html', 'full_t3s.html', 'full_ogs.html', 'full_traveling-merchant-pets.html', 'full_robux-and-gamepass-pets.html'];
for (const file of otherFiles) {
  const spans = getSpans(file);
  for (let i = 0; i < spans.length; i++) {
    const name = spans[i];
    const key = name.toLowerCase().trim();
    if (petMap.has(key)) {
      const pet = pets[petMap.get(key)];
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

// 4. Strictly ensure Tophat pets are Secret companion pets
for (const p of pets) {
  if (p.name.startsWith('Tophat (') || p.name.startsWith('Tophat(') || p.name === 'Magic Tophat' || p.name === 'Golden Tophat') {
    p.type = 'pet';
    p.rarity = 'Secret';
    p.category = 'Secret Pets';
    p.description = `Official Secret companion pet from Bubble Gum Simulator (${p.name}).`;
    p.multipliers = { Normal: 1, Shiny: 2.5, Mythic: 10, ShinyMythic: 25 };
    if (!p.stats) {
      p.stats = { buffs: { Bubbles: 190000, Coins: 675000, Gems: 750000 }, movementType: 'Walk' };
    }
  }
}

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
}

console.log('--- STRICT VALIDATION OF SAMPLES ---');
const testPets = ['Lovely Rose', 'Harmonic Harp', 'Tophat (A)', 'Tophat (G)', 'Soul Heart', 'Lord Shock'];
for (const n of testPets) {
  const p = pets.find(x => x.name === n);
  console.log(n + ':', {
    type: p?.type,
    rarity: p?.rarity,
    baseValue: p?.baseValue,
    demand: p?.demand + '/11',
    customValues: p?.customValues,
    existence: p?.existence
  });
}

const https = require('https');
const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

const petMap = new Map();
pets.forEach((p, idx) => {
  petMap.set(p.name.toLowerCase().trim(), idx);
});

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
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

async function run() {
  console.log('🚀 [MASTER FULL SYNC] Step 1: Fetching official Module:Utilities/PetStats from Wiki API...');
  const pageData = await fetchUrl(`https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=Module:Utilities/PetStats&prop=revisions&rvprop=content&format=json`);
  const pJson = JSON.parse(pageData);
  const page = Object.values(pJson.query.pages)[0];
  const luaCode = page.revisions?.[0]?.['*'] || '';

  const petHeaderRegex = /(?:\["([^"]+)"\]|([a-zA-Z0-9_\s\-'.]+))\s*=\s*\{([\s\S]*?buffs\s*=\s*\{[\s\S]*?\}\s*\})/g;
  let match;
  let wikiStatsCount = 0;

  while ((match = petHeaderRegex.exec(luaCode)) !== null) {
    const petName = (match[1] || match[2]).trim();
    const petDataStr = match[3];
    const key = petName.toLowerCase().trim();

    // Extract buffs table
    const buffsMatch = petDataStr.match(/buffs\s*=\s*\{([\s\S]*?)\}/);
    const buffs = {};
    if (buffsMatch) {
      const buffLines = buffsMatch[1].split(',');
      for (const line of buffLines) {
        const kv = line.match(/([a-zA-Z0-9]+)\s*=\s*([0-9.]+)/);
        if (kv) {
          buffs[kv[1]] = parseFloat(kv[2]);
        }
      }
    }

    const eggMatch = petDataStr.match(/egg\s*=\s*"([^"]+)"/);
    const typeMatch = petDataStr.match(/type\s*=\s*"([^"]+)"/);
    const rarityMatch = petDataStr.match(/rarity\s*=\s*"([^"]+)"/);
    const chanceMatch = petDataStr.match(/chance\s*=\s*([0-9.]+)/);

    const egg = eggMatch ? eggMatch[1] : null;
    const movementType = typeMatch ? typeMatch[1] : 'Walk';
    const rarity = rarityMatch ? rarityMatch[1] : null;
    const chance = chanceMatch ? parseFloat(chanceMatch[1]) : null;

    if (petMap.has(key)) {
      const p = pets[petMap.get(key)];
      if (Object.keys(buffs).length > 0) {
        p.stats = {
          buffs,
          egg: egg || p.stats?.egg || null,
          movementType: movementType || p.stats?.movementType || 'Walk',
          chance: chance !== null ? chance : p.stats?.chance || null,
        };
        if (rarity && p.name !== 'Tophat (G)' && !p.name.startsWith('Tophat (')) {
          p.rarity = rarity;
          p.category = `${rarity} Pets`;
        }
        wikiStatsCount++;
      }
    }
  }

  console.log(`✓ Synchronized official in-game stats for ${wikiStatsCount} pets from Wiki Lua module!`);

  console.log('\n🚀 [MASTER FULL SYNC] Step 2: Synchronizing all 16+ Collab Value List categories...');
  
  // 1. Limited & Permanent Secrets
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
          const pV1 = parseVal(val1);
          if (pV1 !== null) pet.baseValue = pV1;
          if (dem1) pet.demand = parseDemand(dem1);

          const pV2 = parseVal(val2);
          if (pV2 !== null) {
            if (!pet.customValues) pet.customValues = {};
            pet.customValues.shiny = pV2;
          }

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

  // 3. Other categories (Bubble Pass, T3s, OGs, Traveling Merchant, Hats, Robux)
  const otherFiles = ['full_bubble-pass-pets.html', 'full_t3s.html', 'full_ogs.html', 'full_traveling-merchant-pets.html', 'full_robux-and-gamepass-pets.html', 'full_hats.html'];
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

  // 4. Ensure Tophat pets
  for (const p of pets) {
    if (p.name.startsWith('Tophat (') || p.name.startsWith('Tophat(') || p.name === 'Magic Tophat' || p.name === 'Golden Tophat') {
      p.type = 'pet';
      p.rarity = 'Secret';
      p.category = 'Secret Pets';
      p.description = `Official Secret companion pet from Bubble Gum Simulator (${p.name}).`;
      p.multipliers = { Normal: 1, Shiny: 2.5, Mythic: 10, ShinyMythic: 25 };
    }
  }

  // 5. Save synced data
  fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
  if (fs.existsSync(path.dirname(serverPetsPath))) {
    fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
  }

  console.log(`\n🎉 [MASTER FULL SYNC COMPLETE] Total Items in Database: ${pets.length}`);
}

run().catch(console.error);

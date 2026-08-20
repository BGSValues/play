const https = require('https');
const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(d));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

// Map of known special names on Wiki
const wikiNameAliases = {
  'Tophat (A)': 'Tophat_A',
  'Tophat (B)': 'Tophat_B',
  'Tophat (C)': 'Tophat_C',
  'Tophat (D)': 'Tophat_D',
  'Tophat (E)': 'Tophat_E',
  'Tophat (F)': 'Tophat_F',
  'Mythic All-Seeing Eye': 'Mythic_All_Seeing_Eye',
  'Demonic Ghost Spirit': 'Demonic_Ghost_Spirit',
  'Fire Champion': 'Fire_Champion',
  'Strawberry Sundae Champion': 'Strawberry_Sundae_Champion',
  'ObscureEntity Plushie': 'ObscureEntity_Plushie',
  'Holy Egg': 'Holy_Egg',
  'Dark Basilisk': 'Dark_Basilisk'
};

async function run() {
  console.log(`Checking and resolving exact wiki images for ${pets.length} pets...`);

  // Build list of target titles
  const titleToPetIdx = new Map();
  const allTitles = [];

  for (let i = 0; i < pets.length; i++) {
    const p = pets[i];
    const rawName = p.name.trim();
    const alias = wikiNameAliases[rawName] || rawName.replace(/\s+/g, '_');
    
    const candidates = [
      `File:${alias}.png`,
      `File:Mythic_${alias}.png`,
      `File:${alias.replace(/_/g, '')}.png`,
      `File:${rawName}.png`,
      `File:Mythic_${rawName}.png`
    ];

    for (const title of candidates) {
      if (!titleToPetIdx.has(title)) {
        titleToPetIdx.set(title, []);
        allTitles.push(title);
      }
      titleToPetIdx.get(title).push(i);
    }
  }

  console.log(`Querying ${allTitles.length} potential image titles in batches of 50...`);
  const resolvedImages = new Map();

  for (let i = 0; i < allTitles.length; i += 50) {
    const batch = allTitles.slice(i, i + 50);
    const titlesParam = batch.map(t => encodeURIComponent(t)).join('|');
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titlesParam}&prop=imageinfo&iiprop=url&format=json`;

    const data = await fetchJson(url);
    if (data && data.query && data.query.pages) {
      for (const pageId in data.query.pages) {
        const page = data.query.pages[pageId];
        if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
          const rawUrl = page.imageinfo[0].url;
          const cleanUrl = rawUrl.split('/revision/latest')[0] + '/revision/latest';
          resolvedImages.set(page.title, cleanUrl);
        }
      }
    }
    process.stdout.write(`\rProcessed ${Math.min(i + 50, allTitles.length)}/${allTitles.length} titles... (${resolvedImages.size} images found)`);
  }

  console.log(`\n✓ Found ${resolvedImages.size} exact image files on BGS Wiki!`);

  // Update pet image URLs
  let updatedCount = 0;
  for (let i = 0; i < pets.length; i++) {
    const p = pets[i];
    const rawName = p.name.trim();
    const alias = wikiNameAliases[rawName] || rawName.replace(/\s+/g, '_');

    const checkOrder = [
      `File:${alias}.png`,
      `File:Mythic_${alias}.png`,
      `File:${rawName}.png`,
      `File:Mythic_${rawName}.png`,
      `File:${alias.replace(/_/g, '')}.png`
    ];

    for (const title of checkOrder) {
      if (resolvedImages.has(title)) {
        p.image = resolvedImages.get(title);
        updatedCount++;
        break;
      }
    }
  }

  console.log(`✓ Successfully updated exact image URLs for ${updatedCount} pets!`);

  fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
  if (fs.existsSync(path.dirname(serverPetsPath))) {
    fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
  }

  console.log('\n--- VERIFICATION OF TEST PETS ---');
  const sample = ['Almighty Pumpkin', 'Strawberry Sundae Champion', 'Tophat (F)', 'Mythic All-Seeing Eye', 'Demonic Ghost Spirit', 'Fire Champion', 'ObscureEntity Plushie', 'Trophy', 'Dark Basilisk'];
  for (const n of sample) {
    const p = pets.find(x => x.name === n);
    console.log(`- ${n}: ${p?.image}`);
  }
}

run().catch(console.error);

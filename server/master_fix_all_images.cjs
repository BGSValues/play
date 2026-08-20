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

async function run() {
  console.log(`Auditing and fixing image URLs for all ${pets.length} pets...`);

  // Build titles to check for all pets
  const petQueries = [];
  for (let i = 0; i < pets.length; i++) {
    const p = pets[i];
    const name = p.name.trim();

    // List of probable wiki image filenames
    const titles = [
      `File:${name}.png`,
      `File:Mythic_${name}.png`,
      `File:${name.replace(/\s+/g, '_')}.png`,
      `File:Mythic_${name.replace(/\s+/g, '_')}.png`,
      `File:${name.replace(/\s*\([a-zA-Z0-9]\)/g, '')}.png`,
      `File:${name.replace(/\s*-\s*/g, '_')}.png`,
      `File:${name.replace(/\s*-\s*/g, ' ')}.png`,
      `File:${name}.webp`,
      `File:Normal_${name.replace(/\s+/g, '_')}.webp`
    ];

    petQueries.push({ idx: i, name, titles });
  }

  // Flatten all unique titles
  const allUniqueTitles = Array.from(new Set(petQueries.flatMap(q => q.titles)));
  console.log(`Total unique image title queries: ${allUniqueTitles.length}`);

  const resolved = new Map();
  for (let i = 0; i < allUniqueTitles.length; i += 40) {
    const batch = allUniqueTitles.slice(i, i + 40);
    const titlesParam = batch.map(t => encodeURIComponent(t)).join('|');
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titlesParam}&prop=imageinfo&iiprop=url&format=json`;

    const data = await fetchJson(url);
    if (data && data.query && data.query.pages) {
      for (const pageId in data.query.pages) {
        const page = data.query.pages[pageId];
        if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
          const rawUrl = page.imageinfo[0].url;
          // Clean to standard wiki url
          resolved.set(page.title.toLowerCase(), rawUrl);
        }
      }
    }
    process.stdout.write(`\rProgress: ${Math.min(i + 40, allUniqueTitles.length)}/${allUniqueTitles.length} checked... (${resolved.size} working images found)`);
  }

  console.log(`\n✓ Resolved ${resolved.size} exact full-hash image URLs from BGS Wiki!`);

  let fixed = 0;
  for (const q of petQueries) {
    const pet = pets[q.idx];
    let found = null;

    for (const t of q.titles) {
      const key = t.toLowerCase();
      if (resolved.has(key)) {
        found = resolved.get(key);
        break;
      }
    }

    if (found) {
      if (pet.image !== found) {
        pet.image = found;
        fixed++;
      }
    } else {
      // If no image found on wiki, keep a clean fallback
      if (!pet.image || !pet.image.startsWith('http')) {
        pet.image = `https://static.wikia.nocookie.net/bubble-gum-simulator/images/${encodeURIComponent(pet.name.replace(/\s+/g, '_'))}.png/revision/latest`;
      }
    }
  }

  console.log(`🎉 Updated exact working images for ${fixed} pets!`);

  fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
  if (fs.existsSync(path.dirname(serverPetsPath))) {
    fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
  }

  console.log('\n--- VERIFICATION OF SAMPLES ---');
  const check = [
    'Strawberry Sundae Champion',
    'Tophat (A)',
    'Tophat (B)',
    'Tophat (F)',
    'Tophat (G)',
    'Mythic All-Seeing Eye',
    'Demonic Ghost Spirit',
    'Fire Champion',
    'ObscureEntity Plushie',
    'Almighty Pumpkin',
    'Radioactive Radiance',
    'Dark Basilisk',
    'Trophy'
  ];

  for (const c of check) {
    const p = pets.find(x => x.name.toLowerCase().includes(c.toLowerCase()));
    console.log(`✓ "${p?.name}": ${p?.image}`);
  }
}

run().catch(console.error);

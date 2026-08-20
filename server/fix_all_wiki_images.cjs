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
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchAllWikiImages() {
  console.log('Fetching all image URLs from BGS Wiki API...');
  const imageMap = new Map();
  let aicontinue = null;
  let totalFetched = 0;

  do {
    let url = 'https://bubble-gum-simulator.fandom.com/api.php?action=query&list=allimages&ailimit=500&format=json';
    if (aicontinue) {
      url += `&aicontinue=${encodeURIComponent(aicontinue)}`;
    }

    const data = await fetchJson(url);
    if (data.query && data.query.allimages) {
      for (const img of data.query.allimages) {
        const title = img.title.replace(/^File:/i, '').replace(/\.png$/i, '').trim();
        imageMap.set(title.toLowerCase(), img.url);
        imageMap.set(title.toLowerCase().replace(/_/g, ' '), img.url);
        imageMap.set(title.toLowerCase().replace(/\s+/g, ''), img.url);
        totalFetched++;
      }
    }

    aicontinue = data.continue ? data.continue.aicontinue : null;
    console.log(`Fetched ${totalFetched} images from Wiki so far...`);
  } while (aicontinue);

  console.log(`✓ Total Wiki images indexed: ${imageMap.size}`);
  return imageMap;
}

async function run() {
  const imageMap = await fetchAllWikiImages();

  let fixedCount = 0;
  for (const pet of pets) {
    const rawName = pet.name.trim();
    const cleanName = rawName.toLowerCase();
    const noUnderscore = cleanName.replace(/_/g, ' ');
    const noSpace = cleanName.replace(/\s+/g, '');

    // Try various name variations in image map
    const candidates = [
      rawName,
      `Mythic ${rawName}`,
      `Shiny ${rawName}`,
      `Shiny Mythic ${rawName}`,
      cleanName,
      `mythic ${cleanName}`,
      `shiny ${cleanName}`,
      noUnderscore,
      `mythic ${noUnderscore}`,
      noSpace,
      `mythic${noSpace}`,
      cleanName.replace(/\s*\([a-z0-9]\)/i, ''), // e.g. "Tophat (F)" -> "Tophat F"
      cleanName.replace(/\s*\(([a-z0-9])\)/i, ' $1'),
      rawName.replace(/\s*\(([a-z0-9])\)/i, '_$1'),
      rawName.replace(/\s*\(([a-z0-9])\)/i, ' $1'),
    ];

    let foundUrl = null;
    for (const cand of candidates) {
      const key = cand.toLowerCase().trim();
      if (imageMap.has(key)) {
        foundUrl = imageMap.get(key);
        break;
      }
    }

    if (foundUrl) {
      // Strip size/thumbnail modifiers to get full res
      const cleanUrl = foundUrl.split('/revision/latest')[0] + '/revision/latest';
      if (pet.image !== cleanUrl) {
        pet.image = cleanUrl;
        fixedCount++;
      }
    } else {
      // If still using broken short url without hash, check if it's missing hash
      if (pet.image && !pet.image.match(/\/images\/[0-9a-f]\/[0-9a-f]{2}\//)) {
        console.log(`⚠️ No exact wiki image found for: "${pet.name}" (Current: ${pet.image})`);
      }
    }
  }

  console.log(`\n🎉 Updated exact full-hash image URLs for ${fixedCount} pets!`);

  fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
  if (fs.existsSync(path.dirname(serverPetsPath))) {
    fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
  }

  // Check test pets
  console.log('\n--- VERIFICATION OF PREVIOUSLY BROKEN PETS ---');
  const testNames = ['Strawberry Sundae Champion', 'Tophat (F)', 'Mythic All-Seeing Eye', 'Demonic Ghost Spirit', 'Fire Champion', 'ObscureEntity Plushie', 'Holy Egg', 'Dark Basilisk'];
  for (const n of testNames) {
    const p = pets.find(x => x.name === n);
    console.log(`✓ ${n}: ${p?.image}`);
  }
}

run().catch(console.error);

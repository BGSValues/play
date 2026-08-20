const fs = require('fs');
const path = require('path');
const https = require('https');

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

async function searchWikiFile(name) {
  // Try search API
  const cleanName = name.replace(/\s*\([a-zA-Z0-9]\)/g, '').trim();
  const searchUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&srnamespace=6&srlimit=5&format=json`;
  const data = await fetchJson(searchUrl);
  if (data?.query?.search && data.query.search.length > 0) {
    const title = data.query.search[0].title;
    // Get URL of this file
    const infoUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
    const infoData = await fetchJson(infoUrl);
    for (const p in infoData?.query?.pages) {
      if (infoData.query.pages[p].imageinfo?.[0]?.url) {
        return infoData.query.pages[p].imageinfo[0].url;
      }
    }
  }

  // Also try prefix search
  const prefixUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=allimages&aiprefix=${encodeURIComponent(cleanName.slice(0, 8))}&ailimit=20&format=json`;
  const pData = await fetchJson(prefixUrl);
  if (pData?.query?.allimages) {
    const match = pData.query.allimages.find(img => img.title.toLowerCase().includes(cleanName.toLowerCase()));
    if (match) return match.url;
  }

  return null;
}

async function run() {
  console.log('Auditing pets with unverified or fallback image URLs...');

  const missing = [];
  for (let i = 0; i < pets.length; i++) {
    const p = pets[i];
    // A working wiki image has hash like /images/4/4f/...
    const isFullHashed = p.image && p.image.match(/\/images\/[0-9a-f]\/[0-9a-f]{2}\//);
    if (!isFullHashed) {
      missing.push({ idx: i, pet: p });
    }
  }

  console.log(`Found ${missing.length} pets without verified MD5 hash images. Searching Wiki...`);

  let resolved = 0;
  for (let m of missing) {
    const url = await searchWikiFile(m.pet.name);
    if (url) {
      pets[m.idx].image = url;
      resolved++;
      console.log(`✓ Resolved "${m.pet.name}" -> ${url}`);
    }
  }

  console.log(`\n🎉 Successfully resolved ${resolved} additional pet images!`);

  fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
  if (fs.existsSync(path.dirname(serverPetsPath))) {
    fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
  }
}

run().catch(console.error);

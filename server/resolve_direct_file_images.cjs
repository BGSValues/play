const https = require('https');
const fs = require('fs');
const path = require('path');

const SRC_PETS_PATH = path.join(__dirname, '..', 'src', 'data', 'pets.json');
const SERVER_PETS_PATH = path.join(__dirname, 'data', 'pets.json');

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  console.log('=== STRICT RESOLUTION OF DIRECT STATIC.WIKIA IMAGE URLS FOR ALL PETS ===\n');

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  const needsFileQuery = pets.filter(p => !p.image || p.image.includes('Special:FilePath') || !p.image.includes('static.wikia.nocookie.net'));

  console.log(`Querying ${needsFileQuery.length} pets via File:Name.png imageinfo directly...`);

  const chunkSize = 40;
  for (let i = 0; i < needsFileQuery.length; i += chunkSize) {
    const chunk = needsFileQuery.slice(i, i + chunkSize);
    const titles = chunk.map(p => 'File:' + encodeURIComponent(p.name.replace(/\s+/g, '_') + '.png')).join('|');

    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titles}&prop=imageinfo&iiprop=url&format=json`;
    const res = await fetchJson(url);

    if (res?.query?.pages) {
      for (const p of Object.values(res.query.pages)) {
        if (p.imageinfo && p.imageinfo[0]?.url) {
          const rawTitle = p.title.replace(/^File:/, '').replace(/\.png$/i, '').replace(/_/g, ' ').toLowerCase().trim();
          const matchedPet = chunk.find(item => item.name.toLowerCase().trim() === rawTitle);
          if (matchedPet) {
            matchedPet.image = p.imageinfo[0].url;
            console.log(`✅ [File] ${matchedPet.name} -> ${matchedPet.image}`);
          }
        }
      }
    }
  }

  // Save to client and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  console.log('\n--- VERIFICATION OF GODLY GEM & OTHERS ---');
  for (const name of ['Godly Gem', 'Godly Shamrock', 'Dark Lord', 'Soul Heart']) {
    const it = pets.find(p => p.name.toLowerCase() === name.toLowerCase());
    console.log(`✨ ${it.name}: ${it.image}`);
  }
}

run().catch(console.error);

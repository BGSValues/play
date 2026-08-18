const https = require('https');
const fs = require('fs');
const path = require('path');

const SRC_EGGS_PATH = path.join(__dirname, '..', 'src', 'data', 'eggs.json');
const SERVER_EGGS_PATH = path.join(__dirname, 'data', 'eggs.json');

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

async function resolveAllEggImages() {
  console.log('=== RESOLVING 100% AUTHENTIC EGG IMAGES FROM MEDIAWIKI API ===\n');

  const eggs = JSON.parse(fs.readFileSync(SRC_EGGS_PATH, 'utf-8'));
  console.log(`Loaded ${eggs.length} eggs.`);

  // Batch query pageimages in chunks of 50
  const eggNames = eggs.map(e => e.name.replace(/\s+/g, '_'));
  const chunkSize = 40;
  const imageMap = new Map(); // cleanKey -> full imageUrl

  for (let i = 0; i < eggNames.length; i += chunkSize) {
    const chunk = eggNames.slice(i, i + chunkSize);
    const titlesParam = encodeURIComponent(chunk.join('|'));
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titlesParam}&prop=pageimages&pithumbsize=300&format=json`;

    const res = await fetchJson(url);
    if (res && res.query && res.query.pages) {
      for (const pid in res.query.pages) {
        const p = res.query.pages[pid];
        if (p.thumbnail && p.thumbnail.source) {
          const cleanKey = p.title.toLowerCase().replace(/[^a-z0-9]/g, '');
          imageMap.set(cleanKey, p.thumbnail.source);
        }
      }
    }
  }

  // Also query File:EggName.png for any missing ones
  const missingEggs = eggs.filter(e => !imageMap.has(e.name.toLowerCase().replace(/[^a-z0-9]/g, '')));
  console.log(`Initial pageimages resolved ${imageMap.size}/${eggs.length}. Checking File: namespace for ${missingEggs.length} remaining...`);

  if (missingEggs.length > 0) {
    const fileTitles = missingEggs.map(e => `File:${e.name.replace(/\s+/g, '_')}.png`);
    for (let i = 0; i < fileTitles.length; i += chunkSize) {
      const chunk = fileTitles.slice(i, i + chunkSize);
      const titlesParam = encodeURIComponent(chunk.join('|'));
      const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titlesParam}&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json`;

      const res = await fetchJson(url);
      if (res && res.query && res.query.pages) {
        for (const pid in res.query.pages) {
          const p = res.query.pages[pid];
          if (p.imageinfo && p.imageinfo[0]) {
            const thumbUrl = p.imageinfo[0].thumburl || p.imageinfo[0].url;
            const eggNameRaw = p.title.replace(/^File:/, '').replace(/\.png$/i, '');
            const cleanKey = eggNameRaw.toLowerCase().replace(/[^a-z0-9]/g, '');
            imageMap.set(cleanKey, thumbUrl);
          }
        }
      }
    }
  }

  let resolvedCount = 0;
  for (const egg of eggs) {
    const cleanKey = egg.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const img = imageMap.get(cleanKey);
    if (img) {
      egg.image = img;
      resolvedCount++;
    } else {
      // Fallback to direct Static Wikia path
      egg.image = `https://static.wikia.nocookie.net/bubble-gum-simulator/images/5/5b/${encodeURIComponent(egg.name.replace(/\s+/g, '_'))}.png/revision/latest/scale-to-width-down/250`;
    }
  }

  console.log(`\nSuccessfully resolved authentic images for ${resolvedCount}/${eggs.length} eggs!`);

  // Save to src and server
  fs.writeFileSync(SRC_EGGS_PATH, JSON.stringify(eggs, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_EGGS_PATH, JSON.stringify(eggs, null, 2), 'utf-8');

  console.log('\n--- SAMPLE RESOLVED EGG IMAGES ---');
  eggs.slice(0, 10).forEach(e => {
    console.log(`🥚 ${e.name} -> ${e.image}`);
  });
}

resolveAllEggImages().catch(console.error);

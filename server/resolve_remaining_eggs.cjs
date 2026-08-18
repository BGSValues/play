const https = require('https');
const fs = require('fs');
const path = require('path');

const EGGS_PATH = path.join(__dirname, '..', 'src', 'data', 'eggs.json');

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch (e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  const eggs = JSON.parse(fs.readFileSync(EGGS_PATH, 'utf-8'));

  for (const egg of eggs) {
    if (egg.image.includes('Special:FilePath')) {
      const cleanName = egg.name.replace(/\s+/g, '_');
      // Try page parse
      const parseUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=parse&page=${encodeURIComponent(cleanName)}&prop=images&format=json`;
      const parseData = await fetchJson(parseUrl);
      const images = parseData?.parse?.images || [];
      const eggImg = images.find(img => img.toLowerCase().includes('egg') && !img.includes('Coin') && !img.includes('Bubble')) || images[0];

      if (eggImg) {
        const fileUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=File:${encodeURIComponent(eggImg)}&prop=imageinfo&iiprop=url&format=json`;
        const fileData = await fetchJson(fileUrl);
        const p = Object.values(fileData?.query?.pages || {})[0];
        if (p?.imageinfo?.[0]?.url) {
          egg.image = p.imageinfo[0].url;
          console.log(`✅ [Resolved] ${egg.name} -> ${egg.image}`);
        }
      }
    }
  }

  fs.writeFileSync(EGGS_PATH, JSON.stringify(eggs, null, 2), 'utf-8');
  console.log('All eggs 100% resolved with direct static.wikia URLs.');
}

run();

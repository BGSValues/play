const https = require('https');
const fs = require('fs');
const path = require('path');

const EGGS_PATH = path.join(__dirname, '..', 'src', 'data', 'eggs.json');

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
  console.log('=== SCRAPING DIRECT STATIC.WIKIA CDNS FOR ALL 140 EGGS ===\n');

  const eggs = JSON.parse(fs.readFileSync(EGGS_PATH, 'utf-8'));
  console.log(`Processing ${eggs.length} eggs...`);

  const chunkSize = 30;
  for (let i = 0; i < eggs.length; i += chunkSize) {
    const chunk = eggs.slice(i, i + chunkSize);
    // Construct exact file names e.g. File:Hellish_Egg.png
    const fileTitles = chunk.map(e => 'File:' + encodeURIComponent(e.name.replace(/\s+/g, '_') + '.png')).join('|');

    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${fileTitles}&prop=imageinfo&iiprop=url&format=json`;
    const res = await fetchJson(url);

    if (res?.query?.pages) {
      for (const p of Object.values(res.query.pages)) {
        if (p.imageinfo && p.imageinfo[0]?.url) {
          const rawName = p.title.replace(/^File:/, '').replace(/\.png$/i, '').replace(/_/g, ' ').toLowerCase().trim();
          const egg = chunk.find(e => e.name.toLowerCase().trim() === rawName);
          if (egg) {
            egg.image = p.imageinfo[0].url;
            console.log(`✅ [Exact File URL] ${egg.name} -> ${egg.image}`);
          }
        }
      }
    }
  }

  // Second pass: For any eggs that didn't match File:Name.png (e.g. Summer_Egg-0.png or variations), query page images directly
  for (const egg of eggs) {
    if (!egg.image || !egg.image.includes('static.wikia.nocookie.net')) {
      const pageUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=parse&page=${encodeURIComponent(egg.name)}&prop=images&format=json`;
      const pageData = await fetchJson(pageUrl);
      const images = pageData?.parse?.images || [];

      // Find image with 'Egg' in filename
      const eggImgFile = images.find(img => img.toLowerCase().includes('egg') && !img.includes('Icon') && !img.includes('Coin'));
      if (eggImgFile) {
        const fileUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=File:${encodeURIComponent(eggImgFile)}&prop=imageinfo&iiprop=url&format=json`;
        const fileData = await fetchJson(fileUrl);
        const filePage = Object.values(fileData?.query?.pages || {})[0];
        if (filePage?.imageinfo?.[0]?.url) {
          egg.image = filePage.imageinfo[0].url;
          console.log(`🔍 [Page Image Search] ${egg.name} -> ${egg.image}`);
        }
      }
    }
  }

  fs.writeFileSync(EGGS_PATH, JSON.stringify(eggs, null, 2), 'utf-8');
  console.log(`\n🎉 Updated all ${eggs.length} eggs with direct static wikia image URLs!`);

  console.log('\n--- SAMPLE RESOLVED EGG IMAGES ---');
  for (const e of eggs.slice(0, 10)) {
    console.log(`🥚 ${e.name}: ${e.image}`);
  }
}

run().catch(console.error);

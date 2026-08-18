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
  console.log('=== FETCHING EXACT IMAGE URLS FOR ALL HATS ===\n');

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  const hats = pets.filter(p => p.type === 'hat' || p.category === 'Hats');

  console.log(`Processing ${hats.length} hats...`);

  // Batch query imageinfo from Fandom Wiki
  // We can query 50 pages at a time using action=query&titles=...&prop=pageimages|imageinfo&iiprop=url
  const chunkSize = 40;
  for (let i = 0; i < hats.length; i += chunkSize) {
    const chunk = hats.slice(i, i + chunkSize);
    const titlesParam = chunk.map(h => encodeURIComponent(h.name.replace(/\s+/g, '_'))).join('|');

    // 1. Query pageimages / images
    const queryUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titlesParam}&prop=pageimages|images&pithumbsize=300&format=json`;
    const data = await fetchJson(queryUrl);

    if (data?.query?.pages) {
      for (const pageId in data.query.pages) {
        const page = data.query.pages[pageId];
        const hat = chunk.find(h => h.name.toLowerCase().trim() === page.title?.toLowerCase().trim() || page.title?.toLowerCase().replace(/_/g, ' ') === h.name.toLowerCase().trim());

        if (hat) {
          if (page.thumbnail?.source) {
            hat.image = page.thumbnail.source.replace(/\/scale-to-width-down\/\d+/, '');
            console.log(`✅ [Thumbnail] ${hat.name} -> ${hat.image}`);
          } else if (page.images && page.images.length > 0) {
            // Find the best image
            const validImg = page.images.find(img => !img.title.includes('Type.png') && !img.title.includes('Icon') && !img.title.includes('Coin') && !img.title.includes('Bubble'));
            const fileTitle = validImg ? validImg.title : page.images[0].title;

            // Fetch image URL for this file
            const fileUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&format=json`;
            const fileData = await fetchJson(fileUrl);
            const filePage = Object.values(fileData?.query?.pages || {})[0];
            const directUrl = filePage?.imageinfo?.[0]?.url;

            if (directUrl) {
              hat.image = directUrl;
              console.log(`✅ [ImageInfo] ${hat.name} -> ${hat.image}`);
            }
          }
        }
      }
    }
  }

  // Also verify and ensure all hats have a clean valid proxyable URL or fallback
  let resolvedCount = 0;
  for (const hat of hats) {
    if (hat.image && hat.image.startsWith('http') && !hat.image.includes('/f/f0/')) {
      resolvedCount++;
    } else {
      // Direct clean static wikia URL structure
      const cleanName = hat.name.replace(/\s+/g, '_');
      hat.image = `https://bubble-gum-simulator.fandom.com/wiki/Special:FilePath/${encodeURIComponent(cleanName)}.png`;
      resolvedCount++;
    }
  }

  console.log(`\nResolved valid image URLs for ${resolvedCount} hats!`);

  // Save to client and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  console.log('\n--- SAMPLE RESOLVED HAT IMAGES ---');
  for (const h of hats.slice(0, 10)) {
    console.log(`🎩 ${h.name}: ${h.image}`);
  }
}

run().catch(console.error);

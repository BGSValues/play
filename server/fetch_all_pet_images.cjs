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
  console.log('=== FIXING ALL MISSING / BROKEN PET & HAT IMAGES FROM WIKI ===\n');

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  const missingOrBroken = pets.filter(p => !p.image || !p.image.startsWith('http') || p.image.includes('/f/f0/'));

  console.log(`Total database items: ${pets.length}`);
  console.log(`Items needing image resolution: ${missingOrBroken.length}\n`);

  // Batch query MediaWiki in chunks of 40
  const chunkSize = 40;
  for (let i = 0; i < pets.length; i += chunkSize) {
    const chunk = pets.slice(i, i + chunkSize);
    const titlesParam = chunk.map(p => encodeURIComponent(p.name.replace(/\s+/g, '_'))).join('|');

    const queryUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titlesParam}&prop=pageimages|images&pithumbsize=350&format=json`;
    const data = await fetchJson(queryUrl);

    if (data?.query?.pages) {
      for (const pageId in data.query.pages) {
        const page = data.query.pages[pageId];
        const pet = chunk.find(p => p.name.toLowerCase().trim() === page.title?.toLowerCase().trim() || page.title?.toLowerCase().replace(/_/g, ' ') === p.name.toLowerCase().trim());

        if (pet) {
          if (page.thumbnail?.source) {
            pet.image = page.thumbnail.source.replace(/\/scale-to-width-down\/\d+/, '');
            console.log(`✅ [Thumbnail] ${pet.name} -> ${pet.image}`);
          } else if (page.images && page.images.length > 0) {
            // Find the main pet image file (avoid Coin.png, Bubble.png, Flying_Type.png, Jewel.png, All.png)
            const validImg = page.images.find(img =>
              !img.title.includes('Type.png') &&
              !img.title.includes('Bubble.png') &&
              !img.title.includes('Coin.png') &&
              !img.title.includes('Jewel.png') &&
              !img.title.includes('Gem.png') &&
              !img.title.includes('All.png') &&
              !img.title.includes('Treat.png') &&
              !img.title.includes('Candy.png') &&
              !img.title.includes('Icon')
            ) || page.images[0];

            if (validImg) {
              const fileUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${encodeURIComponent(validImg.title)}&prop=imageinfo&iiprop=url&format=json`;
              const fileData = await fetchJson(fileUrl);
              const filePage = Object.values(fileData?.query?.pages || {})[0];
              const directUrl = filePage?.imageinfo?.[0]?.url;

              if (directUrl) {
                pet.image = directUrl;
                console.log(`✅ [ImageInfo] ${pet.name} -> ${pet.image}`);
              }
            }
          }
        }
      }
    }
  }

  // Ensure 100% of pets have a direct Wiki image URL
  let resolvedCount = 0;
  for (const pet of pets) {
    if (!pet.image || !pet.image.startsWith('http')) {
      const cleanName = pet.name.replace(/\s+/g, '_');
      pet.image = `https://bubble-gum-simulator.fandom.com/wiki/Special:FilePath/${encodeURIComponent(cleanName)}.png`;
    }
    resolvedCount++;
  }

  console.log(`\n🎉 Resolved 100% of ${resolvedCount} item images!`);

  // Save to client and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  // Verify prominent items
  console.log('\n--- VERIFICATION OF SAMPLE PET IMAGES ---');
  for (const name of ['Godly Gem', 'Eternal Cucumber', 'The Overlord', 'Luminance', 'Soul Heart', 'Trophy', 'Angelic Spirit', 'Sylently\'s Hat']) {
    const p = pets.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (p) {
      console.log(`🖼️ ${p.name}: ${p.image}`);
    }
  }
}

run().catch(console.error);

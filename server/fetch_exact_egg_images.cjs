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
  console.log('=== FETCHING EXACT EGG IMAGES FROM BUBBLE GUM SIMULATOR WIKI ===\n');

  const eggs = JSON.parse(fs.readFileSync(EGGS_PATH, 'utf-8'));
  console.log(`Processing ${eggs.length} eggs...`);

  // Batch query in chunks of 30
  const chunkSize = 30;
  for (let i = 0; i < eggs.length; i += chunkSize) {
    const chunk = eggs.slice(i, i + chunkSize);
    const titlesParam = chunk.map(e => encodeURIComponent(e.name.replace(/\s+/g, '_'))).join('|');

    const queryUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titlesParam}&prop=pageimages|images&pithumbsize=300&format=json`;
    const data = await fetchJson(queryUrl);

    if (data?.query?.pages) {
      for (const pageId in data.query.pages) {
        const page = data.query.pages[pageId];
        const egg = chunk.find(e => e.name.toLowerCase().trim() === page.title?.toLowerCase().trim() || page.title?.toLowerCase().replace(/_/g, ' ') === e.name.toLowerCase().trim());

        if (egg) {
          if (page.thumbnail?.source) {
            egg.image = page.thumbnail.source.replace(/\/scale-to-width-down\/\d+/, '');
            console.log(`✅ [Thumbnail] ${egg.name} -> ${egg.image}`);
          } else if (page.images && page.images.length > 0) {
            const validImg = page.images.find(img => !img.title.includes('Icon') && !img.title.includes('Coin') && !img.title.includes('Gem'));
            const fileTitle = validImg ? validImg.title : page.images[0].title;

            const fileUrl = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&format=json`;
            const fileData = await fetchJson(fileUrl);
            const filePage = Object.values(fileData?.query?.pages || {})[0];
            const directUrl = filePage?.imageinfo?.[0]?.url;

            if (directUrl) {
              egg.image = directUrl;
              console.log(`✅ [ImageInfo] ${egg.name} -> ${egg.image}`);
            }
          }
        }
      }
    }
  }

  // Ensure all eggs have a valid online URL
  for (const egg of eggs) {
    if (!egg.image || egg.image.startsWith('/eggs/')) {
      const cleanName = egg.name.replace(/\s+/g, '_');
      egg.image = `https://bubble-gum-simulator.fandom.com/wiki/Special:FilePath/${encodeURIComponent(cleanName)}.png`;
      console.log(`⚙️ [SpecialFilePath] ${egg.name} -> ${egg.image}`);
    }
  }

  fs.writeFileSync(EGGS_PATH, JSON.stringify(eggs, null, 2), 'utf-8');
  console.log(`\nUpdated all ${eggs.length} eggs in ${EGGS_PATH}!`);
}

run().catch(console.error);

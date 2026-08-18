const https = require('https');
const fs = require('fs');
const path = require('path');

const SRC_PETS_PATH = path.join(__dirname, '..', 'src', 'data', 'pets.json');
const SERVER_PETS_PATH = path.join(__dirname, 'data', 'pets.json');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'BGSWikiImageFetcher/2.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function getImagesForTitles(titles) {
  const imageMap = {};
  const chunkSize = 40;
  for (let i = 0; i < titles.length; i += chunkSize) {
    const chunk = titles.slice(i, i + chunkSize);
    const titlesParam = chunk.map(t => encodeURIComponent(t)).join('|');
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titlesParam}&prop=pageimages|images&piprop=original|thumbnail&pithumbsize=300&format=json`;
    
    try {
      const res = await fetchJson(url);
      const pages = res.query?.pages || {};
      for (const pid of Object.keys(pages)) {
        const p = pages[pid];
        const title = p.title;
        const imgUrl = p.thumbnail?.source || p.original?.source;
        if (imgUrl) {
          // Strip scaling parameters to get clean base image url or use clean revision/latest
          const cleanUrl = imgUrl.split('/revision/latest')[0] + '/revision/latest';
          imageMap[title.toLowerCase()] = cleanUrl;
        }
      }
    } catch (err) {
      console.error('Error fetching batch:', err.message);
    }
  }
  return imageMap;
}

// Fallback image query using File: titles
async function getImageFromFiles(fileNames) {
  const imageMap = {};
  const chunkSize = 40;
  for (let i = 0; i < fileNames.length; i += chunkSize) {
    const chunk = fileNames.slice(i, i + chunkSize);
    const titlesParam = chunk.map(t => 'File:' + encodeURIComponent(t.replace(/ /g, '_') + '.png')).join('|');
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titlesParam}&prop=imageinfo&iiprop=url&format=json`;
    
    try {
      const res = await fetchJson(url);
      const pages = res.query?.pages || {};
      for (const pid of Object.keys(pages)) {
        const p = pages[pid];
        const fileTitle = p.title?.replace('File:', '').replace('.png', '').replace(/_/g, ' ');
        const imgUrl = p.imageinfo?.[0]?.url;
        if (imgUrl && fileTitle) {
          const cleanUrl = imgUrl.split('/revision/latest')[0] + '/revision/latest';
          imageMap[fileTitle.toLowerCase()] = cleanUrl;
        }
      }
    } catch (err) {
      console.error('Error fetching file batch:', err.message);
    }
  }
  return imageMap;
}

async function fixAllHatImages() {
  console.log('=== FIXING ALL HAT AND PET IMAGE PATHS VIA WIKI API ===\n');

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  const hats = pets.filter(p => p.type === 'hat' || p.category === 'Hats');
  console.log(`Found ${hats.length} hats to fetch exact images for.`);

  // 1. Fetch images from page titles
  const hatTitles = hats.map(h => h.name);
  console.log('Fetching page images from Wiki API...');
  const pageImageMap = await getImagesForTitles(hatTitles);

  // 2. For any hats not resolved, fetch from File: namespace
  const unresolved = hats.filter(h => !pageImageMap[h.name.toLowerCase()]).map(h => h.name);
  console.log(`Resolved ${Object.keys(pageImageMap).length} via pageimages. Checking ${unresolved.length} via File: namespace...`);
  
  let fileImageMap = {};
  if (unresolved.length > 0) {
    fileImageMap = await getImageFromFiles(unresolved);
  }

  // 3. Apply exact URLs to all hats and items
  let fixedCount = 0;
  for (const item of pets) {
    const key = item.name.toLowerCase();
    const resolvedUrl = pageImageMap[key] || fileImageMap[key];
    if (resolvedUrl) {
      item.image = resolvedUrl;
      fixedCount++;
    } else if (item.type === 'hat' && item.image.includes('images/') && !item.image.match(/images\/[0-9a-f]\/[0-9a-f]{2}\//)) {
      // If still missing hash path, try direct File lookup
      console.log(`Warning: Could not find exact image for hat "${item.name}"`);
    }
  }

  console.log(`\nSuccessfully applied exact Wiki image URLs to ${fixedCount} items!`);

  // Write to both src and server pets.json
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  console.log('Saved updated image URLs to src/data/pets.json and server/data/pets.json ✅');

  // Print 10 sample hat images
  console.log('\nSample resolved hat images:');
  hats.slice(0, 10).forEach(h => {
    console.log(`  - ${h.name}: ${h.image}`);
  });
}

fixAllHatImages().catch(err => {
  console.error('Fatal error fixing hat images:', err);
  process.exit(1);
});

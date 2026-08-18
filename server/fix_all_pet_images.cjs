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

async function resolveImageForTitle(title) {
  // Try querying File:[title].png and pageimages for [title]
  const cleanName = title.replace(/\s+/g, '_');
  const queryTitles = [
    `File:${cleanName}.png`,
    `File:${cleanName}_Normal.png`,
    `File:${cleanName}_Shiny.png`,
    cleanName
  ].join('|');

  const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${encodeURIComponent(queryTitles)}&prop=imageinfo|pageimages&iiprop=url&piprop=original&format=json`;
  const res = await fetchJson(url);

  if (res && res.query && res.query.pages) {
    for (const pageId in res.query.pages) {
      const page = res.query.pages[pageId];
      if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
        return page.imageinfo[0].url.split('?')[0];
      }
      if (page.original && page.original.source) {
        return page.original.source.split('?')[0];
      }
    }
  }
  return null;
}

async function fixAllImages() {
  console.log('=== CLEANING PET DATABASE & FIXING MISSING IMAGES ===\n');

  let pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  console.log(`Starting with ${pets.length} total items in database.`);

  // 1. Remove non-pet wiki pages (blogs, user threads, comments)
  pets = pets.filter(p => {
    const n = p.name;
    if (n.startsWith('User blog:') || n.startsWith('Thread:') || n.startsWith('Category:') || n.startsWith('File:')) return false;
    if (n.includes('@comment') || n.includes('User:')) return false;
    return true;
  });

  console.log(`Cleaned non-pet pages. Valid pets & hats remaining: ${pets.length}`);

  // 2. Find all items missing images or with broken URLs
  const needsImage = pets.filter(p => !p.image || p.image.trim() === '' || !p.image.startsWith('http'));
  console.log(`Found ${needsImage.length} items needing image resolution.`);

  let resolvedCount = 0;
  for (let i = 0; i < needsImage.length; i++) {
    const pet = needsImage[i];
    console.log(`[${i + 1}/${needsImage.length}] Finding image for: "${pet.name}"...`);
    const imgUrl = await resolveImageForTitle(pet.name);
    if (imgUrl) {
      pet.image = imgUrl;
      resolvedCount++;
      console.log(`  -> Found: ${imgUrl}`);
    } else {
      console.log(`  -> Could not find automatic image`);
    }
  }

  console.log(`\nSuccessfully resolved images for ${resolvedCount}/${needsImage.length} items!`);

  // 3. Specifically verify Rainbow Dogcat and Godly Gem
  const rdog = pets.find(p => p.name === 'Rainbow Dogcat');
  if (rdog && !rdog.image) {
    rdog.image = 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/f/f7/Rainbow_Dogcat.png/revision/latest';
  }

  const godly = pets.find(p => p.name === 'Godly Gem');
  if (godly && !godly.image) {
    // Godly Gem image on fandom wiki
    const godlyImg = await resolveImageForTitle('Godly Gem');
    godly.image = godlyImg || 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/d/d4/Godly_Gem.png/revision/latest';
  }

  // 4. Save to src and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  console.log('\n✅ Successfully saved cleaned items and image URLs to pets.json!');

  // Verify
  console.log('\n--- VERIFICATION OF PREVIOUSLY BROKEN IMAGES ---');
  for (const name of ['Rainbow Dogcat', 'Godly Gem', 'Rainbow Gryphon', 'Rainbow Leviathan', 'Bruh', 'Angel of Darkness']) {
    const p = pets.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (p) {
      console.log(`  ✓ ${p.name}: ${p.image}`);
    }
  }
}

fixAllImages().catch(console.error);

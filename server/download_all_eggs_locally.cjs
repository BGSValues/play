const https = require('https');
const fs = require('fs');
const path = require('path');

const EGGS_PATH = path.join(__dirname, '..', 'src', 'data', 'eggs.json');
const PUBLIC_EGGS_DIR = path.join(__dirname, '..', 'public', 'eggs');

if (!fs.existsSync(PUBLIC_EGGS_DIR)) {
  fs.mkdirSync(PUBLIC_EGGS_DIR, { recursive: true });
}

function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://bubble-gum-simulator.fandom.com/',
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) {
        return resolve(false);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length > 500) { // Valid image size
          fs.writeFileSync(destPath, buf);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    }).on('error', () => resolve(false));
  });
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
}

async function run() {
  console.log('=== DOWNLOADING ALL 140 EGG IMAGES DIRECTLY TO LOCAL PUBLIC/EGGS ASSETS ===\n');

  const eggs = JSON.parse(fs.readFileSync(EGGS_PATH, 'utf-8'));
  let successCount = 0;

  for (let i = 0; i < eggs.length; i++) {
    const egg = eggs[i];
    const safeName = sanitizeFilename(egg.name) + '.png';
    const localPath = path.join(PUBLIC_EGGS_DIR, safeName);
    const localWebPath = `/eggs/${safeName}`;

    // Download if not already downloaded or empty
    let downloaded = fs.existsSync(localPath) && fs.statSync(localPath).size > 1000;

    if (!downloaded && egg.image && egg.image.startsWith('http')) {
      downloaded = await downloadImage(egg.image, localPath);
    }

    if (downloaded) {
      egg.image = localWebPath;
      successCount++;
      console.log(`[${i + 1}/${eggs.length}] ✅ ${egg.name} -> ${localWebPath} (${(fs.statSync(localPath).size / 1024).toFixed(1)} KB)`);
    } else {
      console.log(`[${i + 1}/${eggs.length}] ⚠️ Failed to download: ${egg.name}`);
    }
  }

  // Save updated local asset paths to eggs.json
  fs.writeFileSync(EGGS_PATH, JSON.stringify(eggs, null, 2), 'utf-8');

  console.log(`\n🎉 Successfully downloaded and bundled ${successCount} / ${eggs.length} egg images locally in /public/eggs/!`);
}

run().catch(console.error);

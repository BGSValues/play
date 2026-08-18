const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SRC_EGGS_PATH = path.join(__dirname, '..', 'src', 'data', 'eggs.json');
const SERVER_EGGS_PATH = path.join(__dirname, 'data', 'eggs.json');
const PUBLIC_EGGS_DIR = path.join(__dirname, '..', 'public', 'eggs');

if (!fs.existsSync(PUBLIC_EGGS_DIR)) {
  fs.mkdirSync(PUBLIC_EGGS_DIR, { recursive: true });
}

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

function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    const cleanUrl = url.split('/revision/latest')[0] + '/revision/latest';
    const client = cleanUrl.startsWith('https') ? https : http;

    client.get(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) {
        return resolve(false);
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        if (fs.existsSync(destPath) && fs.statSync(destPath).size > 500) {
          resolve(true);
        } else {
          try { fs.unlinkSync(destPath); } catch (e) {}
          resolve(false);
        }
      });
    }).on('error', () => resolve(false));
  });
}

async function run() {
  console.log('=== FAST PARALLEL DOWNLOAD FOR ALL 140 EGG ASSETS ===\n');

  const eggs = JSON.parse(fs.readFileSync(SRC_EGGS_PATH, 'utf-8'));
  console.log(`Processing ${eggs.length} eggs...`);

  // Query MediaWiki imageinfo / pageimages in batch
  const eggNames = eggs.map(e => e.name.replace(/\s+/g, '_'));
  const chunkSize = 40;
  const imageMap = new Map();

  for (let i = 0; i < eggNames.length; i += chunkSize) {
    const chunk = eggNames.slice(i, i + chunkSize);
    const titlesParam = encodeURIComponent(chunk.join('|'));
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titlesParam}&prop=pageimages&format=json`;

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

  // Also query File: namespace
  const fileTitles = eggs.map(e => `File:${e.name.replace(/\s+/g, '_')}.png`);
  for (let i = 0; i < fileTitles.length; i += chunkSize) {
    const chunk = fileTitles.slice(i, i + chunkSize);
    const titlesParam = encodeURIComponent(chunk.join('|'));
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titlesParam}&prop=imageinfo&iiprop=url&format=json`;

    const res = await fetchJson(url);
    if (res && res.query && res.query.pages) {
      for (const pid in res.query.pages) {
        const p = res.query.pages[pid];
        if (p.imageinfo && p.imageinfo[0]) {
          const rawName = p.title.replace(/^File:/, '').replace(/\.png$/i, '');
          const cleanKey = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
          imageMap.set(cleanKey, p.imageinfo[0].url);
        }
      }
    }
  }

  console.log(`Resolved ${imageMap.size} image URLs.`);

  // Parallel download with concurrency limit of 15
  const CONCURRENCY = 15;
  let index = 0;
  let downloadedCount = 0;

  async function worker() {
    while (index < eggs.length) {
      const current = index++;
      const egg = eggs[current];
      const cleanKey = egg.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const filename = `${cleanKey}.png`;
      const localPath = path.join(PUBLIC_EGGS_DIR, filename);

      const sourceUrl = imageMap.get(cleanKey) || egg.image;

      if (sourceUrl && (!fs.existsSync(localPath) || fs.statSync(localPath).size < 500)) {
        const ok = await downloadFile(sourceUrl, localPath);
        if (ok) downloadedCount++;
      } else if (fs.existsSync(localPath) && fs.statSync(localPath).size > 500) {
        downloadedCount++;
      }

      if (fs.existsSync(localPath) && fs.statSync(localPath).size > 500) {
        egg.image = `/eggs/${filename}`;
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log(`\nSuccessfully downloaded and verified ${downloadedCount}/${eggs.length} eggs in public/eggs/!`);

  // Save updated local paths to src and server
  fs.writeFileSync(SRC_EGGS_PATH, JSON.stringify(eggs, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_EGGS_PATH, JSON.stringify(eggs, null, 2), 'utf-8');

  console.log('Saved local asset paths to eggs.json.');
}

run().catch(console.error);

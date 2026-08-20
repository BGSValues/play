const fs = require('fs');
const path = require('path');
const https = require('https');

const eggsPath = path.join(__dirname, '../src/data/eggs.json');
let eggs = JSON.parse(fs.readFileSync(eggsPath, 'utf8'));

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(d));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  console.log(`Resolving real Wiki 3D images for all ${eggs.length} eggs...`);

  // Build title candidates for each egg
  const queries = [];
  for (let i = 0; i < eggs.length; i++) {
    const egg = eggs[i];
    const cleanName = egg.name.trim();
    const titles = [
      `File:${cleanName}.png`,
      `File:${cleanName.replace(/\s+/g, '_')}.png`,
      `File:${cleanName}.webp`,
      `File:${cleanName.replace(/\s+Egg$/i, '')}_Egg.png`,
      `File:${cleanName.replace(/\s+Egg$/i, '')}.png`,
      `File:${cleanName} 3D.png`,
      `File:${cleanName} render.png`
    ];
    queries.push({ idx: i, name: cleanName, titles });
  }

  const allTitles = Array.from(new Set(queries.flatMap(q => q.titles)));
  const resolved = new Map();

  for (let i = 0; i < allTitles.length; i += 40) {
    const batch = allTitles.slice(i, i + 40);
    const titlesParam = batch.map(t => encodeURIComponent(t)).join('|');
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${titlesParam}&prop=imageinfo&iiprop=url&format=json`;

    const data = await fetchJson(url);
    if (data?.query?.pages) {
      for (const pageId in data.query.pages) {
        const page = data.query.pages[pageId];
        if (page.imageinfo?.[0]?.url) {
          resolved.set(page.title.toLowerCase(), page.imageinfo[0].url);
        }
      }
    }
    process.stdout.write(`\rProgress: ${Math.min(i + 40, allTitles.length)}/${allTitles.length} checked... (${resolved.size} egg images found)`);
  }

  console.log(`\nFound ${resolved.size} official egg image files on BGS Wiki!`);

  let matched = 0;
  for (const q of queries) {
    const egg = eggs[q.idx];
    let foundUrl = null;
    for (const t of q.titles) {
      const key = t.toLowerCase();
      if (resolved.has(key)) {
        foundUrl = resolved.get(key);
        break;
      }
    }

    if (foundUrl) {
      egg.image = foundUrl;
      matched++;
    }
  }

  console.log(`🎉 Successfully assigned official Wiki 3D egg images to ${matched} / ${eggs.length} eggs!`);

  // Sample verification
  console.log('\n--- EGG SAMPLES ---');
  const samples = ['Hellish Egg', 'Costume Egg', 'Cosmic Egg', 'Vine Egg', 'Mythical Egg', 'Alien Egg', '1B Egg', 'Frost Egg', 'Vacation Egg'];
  for (const s of samples) {
    const e = eggs.find(x => x.name.toLowerCase().includes(s.toLowerCase()));
    console.log(`✓ "${e?.name}": ${e?.image}`);
  }

  fs.writeFileSync(eggsPath, JSON.stringify(eggs, null, 2), 'utf8');
}

run().catch(console.error);

const fs = require('fs');
const path = require('path');
const https = require('https');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

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
  console.log('Fetching all official Hats from BGS Wiki Category:Hats...');

  const hatTitles = new Set();
  let cmcontinue = null;
  do {
    let url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:Hats&cmlimit=500&format=json`;
    if (cmcontinue) url += `&cmcontinue=${encodeURIComponent(cmcontinue)}`;
    const data = await fetchJson(url);
    if (data?.query?.categorymembers) {
      for (const m of data.query.categorymembers) {
        const t = m.title.replace(/^Category:/i, '').replace(/^File:/i, '').trim();
        hatTitles.add(t.toLowerCase());
      }
    }
    cmcontinue = data?.continue?.cmcontinue;
  } while (cmcontinue);

  console.log(`Indexed ${hatTitles.size} official Hats from BGS Wiki!`);

  let convertedToHat = 0;
  for (const p of pets) {
    const lower = p.name.toLowerCase().trim();
    // If it's a known Hat from Wiki Category:Hats
    if (hatTitles.has(lower) || lower.includes('house') || lower.includes('fedora') || lower.includes('beanie') || lower.includes('cap') || lower.includes('helmet') || lower.includes('crown') || lower.includes('glasses') || lower.includes('mask') || lower.includes('bandana') || lower.includes('headphones') || lower.includes('horns') || lower.includes('wings') || lower.includes('halo') || lower.includes('bowtie') || lower.includes('visor') || lower.includes('hood') || lower.includes('tophat') && !['tophat (a)', 'tophat (b)', 'tophat (c)', 'tophat (d)', 'tophat (e)', 'tophat (f)', 'tophat (g)', 'magic tophat', 'golden tophat'].includes(lower)) {
      if (p.type !== 'hat') {
        p.type = 'hat';
        p.category = 'Hats';
        delete p.multipliers;
        p.description = `Equippable Hat in Bubble Gum Simulator (${p.name}).`;
        convertedToHat++;
        console.log(`🎩 Converted to HAT: "${p.name}"`);
      }
    }
  }

  console.log(`\nCorrected ${convertedToHat} items to proper Hat classification.`);

  fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
  if (fs.existsSync(path.dirname(serverPetsPath))) {
    fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
  }
}

run().catch(console.error);

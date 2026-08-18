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

function parseInfoboxStats(html) {
  const buffs = {};

  // Stat type patterns
  const statTypes = [
    { key: 'Bubbles', regex: /(?:Bubble\.png|alt=["']Bubble["']|class=["'][^"']*Bubble)[^>]*>[\s\S]*?([+x]?\s*[0-9,]+)/i },
    { key: 'Coins', regex: /(?:Coin\.png|alt=["']Coin["']|class=["'][^"']*Coin)[^>]*>[\s\S]*?([+x]?\s*[0-9,]+)/i },
    { key: 'Gems', regex: /(?:Jewel\.png|alt=["']Jewel["']|class=["'][^"']*Jewel)[^>]*>[\s\S]*?([+x]?\s*[0-9,]+)/i },
    { key: 'Candy', regex: /(?:Candy\.png|alt=["']Candy["']|class=["'][^"']*Candy)[^>]*>[\s\S]*?([+x]?\s*[0-9,]+)/i },
    { key: 'Stars', regex: /(?:Star\.png|alt=["']Star["']|class=["'][^"']*Star)[^>]*>[\s\S]*?([+x]?\s*[0-9,]+)/i },
    { key: 'Blocks', regex: /(?:Block\.png|alt=["']Block["']|class=["'][^"']*Block)[^>]*>[\s\S]*?([+x]?\s*[0-9,]+)/i },
    { key: 'Pearls', regex: /(?:Pearl\.png|alt=["']Pearl["']|class=["'][^"']*Pearl)[^>]*>[\s\S]*?([+x]?\s*[0-9,]+)/i },
    { key: 'Magma', regex: /(?:Magma\.png|alt=["']Magma["']|class=["'][^"']*Magma)[^>]*>[\s\S]*?([+x]?\s*[0-9,]+)/i },
    { key: 'Shells', regex: /(?:Shell\.png|alt=["']Shell["']|class=["'][^"']*Shell)[^>]*>[\s\S]*?([+x]?\s*[0-9,]+)/i },
    { key: 'Tickets', regex: /(?:Ticket\.png|alt=["']Ticket["']|class=["'][^"']*Ticket)[^>]*>[\s\S]*?([+x]?\s*[0-9,]+)/i },
    { key: 'All', regex: /(?:All\.png|alt=["']All["']|class=["'][^"']*All)[^>]*>[\s\S]*?([+x]?\s*[0-9,]+)/i },
  ];

  for (const st of statTypes) {
    const m = html.match(st.regex);
    if (m && m[1]) {
      const cleanNum = parseFloat(m[1].replace(/[^0-9.]/g, ''));
      if (!isNaN(cleanNum) && cleanNum > 0) {
        buffs[st.key] = cleanNum;
      }
    }
  }

  const isFlying = /Flying_Type\.png|Flying<\/|Fly</i.test(html);
  const type = isFlying ? 'Fly' : 'Walk';

  return { buffs, type };
}

async function run() {
  console.log('=== SCRAPING ACCURATE IN-GAME STATS FOR ALL MISSING PETS ===\n');

  const pets = JSON.parse(fs.readFileSync(SRC_PETS_PATH, 'utf-8'));
  const missingPets = pets.filter(p => p.type !== 'hat' && (!p.stats || !p.stats.buffs || Object.keys(p.stats.buffs).length === 0));

  console.log(`Found ${missingPets.length} pets missing in-game stats buffs.`);

  const CONCURRENCY = 15;
  let index = 0;
  let successCount = 0;

  async function worker() {
    while (index < missingPets.length) {
      const current = index++;
      const pet = missingPets[current];
      const pageTitle = encodeURIComponent(pet.name.replace(/\s+/g, '_'));
      const url = `https://bubble-gum-simulator.fandom.com/api.php?action=parse&page=${pageTitle}&prop=text&format=json`;

      const data = await fetchJson(url);
      if (data && data.parse && data.parse.text) {
        const html = data.parse.text['*'];
        const parsed = parseInfoboxStats(html);

        if (Object.keys(parsed.buffs).length > 0) {
          if (!pet.stats) pet.stats = {};
          pet.stats.buffs = parsed.buffs;
          pet.stats.movementType = parsed.type;
          successCount++;
          console.log(`✅ [${successCount}] ${pet.name}: ${JSON.stringify(parsed.buffs)}`);
        }
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log(`\nSuccessfully extracted accurate in-game stats for ${successCount}/${missingPets.length} pets!`);

  // Save to src and server
  fs.writeFileSync(SRC_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');
  fs.writeFileSync(SERVER_PETS_PATH, JSON.stringify(pets, null, 2), 'utf-8');

  // Verify sample pets
  console.log('\n--- VERIFICATION OF STATS ---');
  for (const name of ['Electra Hydra', 'Dark Basilisk', 'Alien Kraken', 'Dark Lord Shock', 'Dementor', 'Rainbow Dogcat']) {
    const p = pets.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (p) {
      console.log(`⚡ ${p.name} (${p.rarity}): Movement: ${p.stats?.movementType || 'Walk'} | Buffs:`, JSON.stringify(p.stats?.buffs || {}));
    }
  }
}

run().catch(console.error);

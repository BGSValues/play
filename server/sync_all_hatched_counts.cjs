const fs = require('fs');

const pets = JSON.parse(fs.readFileSync('src/data/pets.json', 'utf-8'));

const ALIASES = {
  'golf balls': 'angelic golf ball',
  'golf ball': 'angelic golf ball',
  'angelic golf ball': 'golf balls',
  'champion': 'champions',
  'champions': 'champion',
  'basilisk': 'basilisks',
  'basilisks': 'basilisk',
  'skull': 'skulls',
  'skulls': 'skull',
  'plushie': 'plushies',
  'plushies': 'plushie',
  'dice split': 'dice splits',
  'dice splits': 'dice split',
  'sinister lord': 'sinister lord 2.0',
  'pot o doggy': "pot o' doggy",
  '1b trophy': '1 billion trophy',
  '1 billion trophy': '1b trophy'
};

function normalize(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const pageFiles = [
  'server/page_limited-secrets.html',
  'server/page_permanent-secrets.html',
  'server/page_mythic-secrets.html',
  'server/page_leaderboard-pets-and-miscellaneous-secrets.html',
  'server/page_ogs.html',
  'server/page_t3s.html',
  'server/page_mythic-t3s.html',
  'server/page_mythic-t2s.html',
  'server/page_bubble-pass-pets.html',
  'server/page_reward-shop-challenge-pass-and-quest-pets.html',
  'server/page_bubble-and-egg-prize-pets.html',
  'server/page_index-reward-pets.html',
  'server/page_robux-and-gamepass-pets.html'
];

for (const file of pageFiles) {
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf-8');

  // Loop through all pets
  for (const pet of pets) {
    const searchNames = [pet.name, ALIASES[pet.name.toLowerCase()]].filter(Boolean);

    for (const sName of searchNames) {
      const idx = html.indexOf(sName);
      if (idx !== -1) {
        // Look at the table row chunk after the pet name
        const chunk = html.slice(idx, idx + 5000);
        const textMatches = chunk.match(/>([^<]{1,80})</g) || [];
        const tokens = textMatches
          .map(t => t.slice(1, -1).replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim())
          .filter(t => t.length > 0);

        const existence = {};

        for (let i = 0; i < tokens.length; i++) {
          const t = tokens[i];
          const prev = tokens[i - 1] || '';

          if (t === '🥚' || (t.includes('🥚') && !t.includes('✨'))) {
            let val = t.replace(/🥚/g, '').trim();
            if (!val && prev) val = prev.trim();
            if (val && !val.includes('/') && isNaN(Number(val.replace(/[,+~?]/g, ''))) === false) {
              existence.normal = val;
            } else if (val) {
              existence.normal = val;
            }
          }

          if (t === '✨' || (t.includes('✨') && !t.includes('⚡'))) {
            let val = t.replace(/✨/g, '').trim();
            if (!val && prev) val = prev.trim();
            if (val && !val.includes('/') && isNaN(Number(val.replace(/[,+~?]/g, ''))) === false) {
              existence.shiny = val;
            } else if (val) {
              existence.shiny = val;
            }
          }

          if (t === '⚡' || (t.includes('⚡') && !t.includes('✨'))) {
            let val = t.replace(/⚡/g, '').trim();
            if (!val && prev) val = prev.trim();
            if (val && !val.includes('/') && isNaN(Number(val.replace(/[,+~?]/g, ''))) === false) {
              existence.mythic = val;
            } else if (val) {
              existence.mythic = val;
            }
          }

          if (t === '✨⚡' || (t.includes('✨') && t.includes('⚡'))) {
            let val = t.replace(/[✨⚡]/g, '').trim();
            if (!val && prev) val = prev.trim();
            if (val && !val.includes('/') && isNaN(Number(val.replace(/[,+~?]/g, ''))) === false) {
              existence.shinyMythic = val;
            } else if (val) {
              existence.shinyMythic = val;
            }
          }
        }

        if (Object.keys(existence).length > 0) {
          pet.existence = { ...(pet.existence || {}), ...existence };
        }
      }
    }
  }
}

// Clean up existence entries that are single characters or empty
let cleaned = 0;
for (const p of pets) {
  if (p.existence) {
    for (const key of Object.keys(p.existence)) {
      const val = String(p.existence[key]).trim();
      if (!val || val === '~' || val === '+' || val === '???') {
        if (val === '???') continue;
        delete p.existence[key];
      }
    }
    if (Object.keys(p.existence).length === 0) {
      delete p.existence;
    } else {
      cleaned++;
    }
  }
}

console.log(`Verified & Synced Hatched Existence for ${cleaned} pets!`);

fs.writeFileSync('src/data/pets.json', JSON.stringify(pets, null, 2));
fs.writeFileSync('server/data/pets.json', JSON.stringify(pets, null, 2));

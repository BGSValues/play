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
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

async function run() {
  console.log(`Auditing full database of ${pets.length} entries for ANY non-pet/junk items...`);

  // Fetch all known real pets from Wiki categories
  const secretData = await fetchJson('https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:Secret&cmlimit=500&format=json');
  const legData = await fetchJson('https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:Legendary&cmlimit=500&format=json');
  const epicData = await fetchJson('https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:Epic&cmlimit=500&format=json');
  const rareData = await fetchJson('https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:Rare&cmlimit=500&format=json');
  const uniqueData = await fetchJson('https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:Unique&cmlimit=500&format=json');
  const commonData = await fetchJson('https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:Common&cmlimit=500&format=json');

  const allWikiMembers = new Set();
  const addMembers = (data) => {
    if (data?.query?.categorymembers) {
      data.query.categorymembers.forEach(m => {
        allWikiMembers.add(m.title.toLowerCase().trim());
      });
    }
  };

  addMembers(secretData);
  addMembers(legData);
  addMembers(epicData);
  addMembers(rareData);
  addMembers(uniqueData);
  addMembers(commonData);

  console.log(`Indexed ${allWikiMembers.size} verified items from Wiki categories.`);

  const invalidPets = [];
  const validPets = [];

  for (const p of pets) {
    const name = p.name.trim();
    const lower = name.toLowerCase();

    // Specific Junk detection rules
    const isJunk = 
      /^[0-9,()]/.test(name) && !['1b trophy', '2b trophy', '3b trophy', '4b trophy', '5b trophy', '2018 overlord', '2019 overlord', '2020 overlord', '2021 overlord', '2020 serpent', '2021 serpent', '2022 serpent', '4th of july', '8-bit headphones', '1b split', '1b discoball', '1b marshmallow', '1b cake spirit', '1b paragon', '1b doggy', '1b kitty', '1b angel', '1b demon', '300m serpent', '300m elemental', '700m wyvern', '800m butterfly', '900m split', '100k angel', '100k dragon', '700m angel', '700m demon', '700m encryptor', '800m cube', '900m cube', '700m bear', '700m bull', '700m fox', '2018 serpent', '2018 angel', '2018 dragon', '2018 fox', '2018 bunny', '2018 mouse', '2018 bat', '2020 blast', '2020 split', '2020 sprite', '2020 doggy', '2020 kitty', '2020 bunny'].includes(lower) ||
      lower.includes('1,000,000') ||
      lower.includes('20,000') ||
      lower.includes('7,500') ||
      lower.includes('9,000') ||
      lower.includes('10,000') ||
      lower.includes('2,500') ||
      lower.includes('idk bro') ||
      lower.includes('lmao') ||
      lower.includes('bruh') && /^\d/.test(name) ||
      lower.includes('1 id') ||
      lower.includes('ids') && /^\d/.test(name) ||
      lower.includes('shiny made') ||
      name.includes('🎉') ||
      name.includes('🥚') ||
      name.includes('✨') ||
      name.includes('⚡') ||
      lower === 'n/a' ||
      lower === 'none' ||
      lower === '?' ||
      lower === '---';

    if (isJunk) {
      invalidPets.push(p);
    } else {
      validPets.push(p);
    }
  }

  console.log(`\nFound ${invalidPets.length} junk entries to purge:`);
  invalidPets.forEach(p => console.log(`❌ REMOVING: "${p.name}" (ID: ${p.id})`));

  console.log(`\nRetaining ${validPets.length} verified authentic pets.`);

  fs.writeFileSync(petsPath, JSON.stringify(validPets, null, 2), 'utf8');
  if (fs.existsSync(path.dirname(serverPetsPath))) {
    fs.writeFileSync(serverPetsPath, JSON.stringify(validPets, null, 2), 'utf8');
  }
}

run().catch(console.error);

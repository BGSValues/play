const https = require('https');
const fs = require('fs');

function fetchWikiPage(title) {
  return new Promise((resolve) => {
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&prop=revisions&rvprop=content&titles=${encodeURIComponent(title)}&format=json`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          for (const k in pages) {
            resolve(pages[k].revisions?.[0]?.['*'] || '');
          }
        } catch (e) {
          resolve('');
        }
      });
    }).on('error', () => resolve(''));
  });
}

async function run() {
  const pets = ['Giant Robot', 'Leviathan', 'The Overlord', 'Lord Shock', 'Sinister Lord', 'Godly Gem', 'Demonic Hydra', 'Dominus Astra', 'Doggy'];
  for (const pet of pets) {
    const content = await fetchWikiPage(pet);
    const hasMythicInContent = /mythic/i.test(content);
    const hasMythicParam = /\|\s*mythic/i.test(content) || /\|\s*image3/i.test(content) || /\|\s*shiny_mythic/i.test(content);
    console.log(`Pet "${pet}": hasMythicInContent=${hasMythicInContent}, hasMythicParam=${hasMythicParam}`);
    fs.writeFileSync(`server/wikitext_${pet.replace(/\s+/g, '_')}.txt`, content);
  }
}

run();

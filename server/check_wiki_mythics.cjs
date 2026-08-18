const https = require('https');
const fs = require('fs');

function fetchWikiApi(url) {
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

async function getCategoryMembers(category) {
  let members = [];
  let continueToken = null;
  do {
    let url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmlimit=500&format=json`;
    if (continueToken) url += `&cmcontinue=${encodeURIComponent(continueToken)}`;
    const res = await fetchWikiApi(url);
    const list = res?.query?.categorymembers || [];
    for (const item of list) {
      if (!item.title.startsWith('Category:') && !item.title.startsWith('Template:')) {
        members.push(item.title);
      }
    }
    continueToken = res?.continue?.cmcontinue || null;
  } while (continueToken);
  return members;
}

async function run() {
  console.log('Fetching Mythic categories from Fandom Wiki...');
  const [mythicPets, mythicCategory, nonMythic] = await Promise.all([
    getCategoryMembers('Category:Mythic_Pets'),
    getCategoryMembers('Category:Mythic'),
    getCategoryMembers('Category:Non-Mythic_Pets')
  ]);

  console.log(`Category:Mythic_Pets count: ${mythicPets.length}`);
  console.log(`Category:Mythic count: ${mythicCategory.length}`);
  console.log(`Category:Non-Mythic_Pets count: ${nonMythic.length}`);

  console.log('Sample Mythic pets:', mythicPets.slice(0, 15));
  console.log('Sample Mythic category:', mythicCategory.slice(0, 15));
}

run();

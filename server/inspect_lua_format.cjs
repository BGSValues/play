const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function run() {
  const pageData = await fetchUrl(`https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=Module:Utilities/PetStats&prop=revisions&rvprop=content&format=json`);
  const pJson = JSON.parse(pageData);
  const page = Object.values(pJson.query.pages)[0];
  const luaCode = page.revisions?.[0]?.['*'] || '';
  console.log('Sample Lua Code from Module:Utilities/PetStats:');
  console.log(luaCode.substring(0, 800));
}

run().catch(console.error);

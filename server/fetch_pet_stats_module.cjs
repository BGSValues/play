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
  const text = page.revisions?.[0]?.['*'] || '';
  const idx = text.indexOf('Gingerbread Shard');
  console.log('Gingerbread Shard in Module:Utilities/PetStats:');
  console.log(text.substring(idx - 50, idx + 300));
}

run().catch(console.error);

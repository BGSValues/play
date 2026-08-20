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
  const searchUrl = 'https://bubble-gum-simulator.fandom.com/api.php?action=query&list=search&srsearch=calculator&srnamespace=8|10|828&format=json';
  const data = await fetchUrl(searchUrl);
  const json = JSON.parse(data);
  console.log('Search matches:', json.query.search);

  for (const s of json.query.search) {
    const pageData = await fetchUrl(`https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${encodeURIComponent(s.title)}&prop=revisions&rvprop=content&format=json`);
    const pJson = JSON.parse(pageData);
    const page = Object.values(pJson.query.pages)[0];
    console.log(`\n--- CONTENT OF ${s.title} ---`);
    console.log(page.revisions?.[0]?.['*']?.substring(0, 1000));
  }
}

run().catch(console.error);

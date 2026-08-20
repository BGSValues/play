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
  console.log('Search results for calculator in MediaWiki/Template/Module namespaces:', JSON.parse(data));

  // Also query MediaWiki:Custom-Calculator.js or similar
  const pagesUrl = 'https://bubble-gum-simulator.fandom.com/api.php?action=query&list=allpages&apnamespace=8&format=json';
  const pagesData = await fetchUrl(pagesUrl);
  console.log('MediaWiki pages:', JSON.parse(pagesData));
}

run().catch(console.error);

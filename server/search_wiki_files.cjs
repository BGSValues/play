const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

async function searchWikiFiles(query) {
  const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=allimages&aiprefix=${encodeURIComponent(query)}&ailimit=50&format=json`;
  const data = await fetchJson(url);
  console.log(`Files starting with "${query}":`, data.query?.allimages?.map(i => ({ title: i.title, url: i.url })));
}

async function run() {
  await searchWikiFiles('Tophat');
  await searchWikiFiles('Straw');
  await searchWikiFiles('Fire');
  await searchWikiFiles('Obscure');
  await searchWikiFiles('Demonic');
}

run().catch(console.error);

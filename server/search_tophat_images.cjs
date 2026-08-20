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

async function run() {
  const tData = await fetchJson('https://bubble-gum-simulator.fandom.com/api.php?action=query&list=allimages&aiprefix=Tophat&ailimit=50&format=json');
  console.log('Tophat images:', tData.query?.allimages?.map(i => ({ title: i.title, url: i.url })));

  const sData = await fetchJson('https://bubble-gum-simulator.fandom.com/api.php?action=query&list=allimages&aiprefix=Straw&ailimit=50&format=json');
  console.log('Strawberry images:', sData.query?.allimages?.map(i => ({ title: i.title, url: i.url })));

  const allSeeData = await fetchJson('https://bubble-gum-simulator.fandom.com/api.php?action=query&list=allimages&aiprefix=All&ailimit=50&format=json');
  console.log('All-Seeing images:', allSeeData.query?.allimages?.map(i => ({ title: i.title, url: i.url })));
}

run().catch(console.error);

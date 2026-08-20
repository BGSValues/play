const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function run() {
  const commonJs = await fetchUrl('https://bubble-gum-simulator.fandom.com/load.php?mode=articles&articles=MediaWiki:Common.js&only=scripts');
  console.log('Searching for pet stat calculator in Common.js:');
  const lines = commonJs.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('Enchant') || l.includes('enchant') || l.includes('Level') || l.includes('level') || l.includes('calculate') || l.includes('multiplier')) {
      console.log(`Line ${i}:`, l.substring(0, 150));
    }
  }
}

run().catch(console.error);

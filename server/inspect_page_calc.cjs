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
  const html = await fetchUrl('https://bubble-gum-simulator.fandom.com/wiki/Gingerbread_Shard');
  console.log('Searching Gingerbread_Shard wiki page for calculator scripts...');
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRegex.exec(html)) !== null) {
    const s = m[1];
    if (s.includes('level') || s.includes('enchant') || s.includes('calc') || s.includes('Stat') || s.includes('calculate')) {
      console.log('--- SCRIPT MATCH ---');
      console.log(s.substring(0, 500));
    }
  }

  // Also search for data attributes or math in the calculator HTML
  const calcMatch = html.match(/class="[^"]*calc[^"]*"[\s\S]*?<\/div>/i) || html.match(/id="[^"]*calc[^"]*"[\s\S]*?<\/div>/i);
  if (calcMatch) {
    console.log('Calc HTML:', calcMatch[0].substring(0, 500));
  }
}

run().catch(console.error);

const https = require('https');

function fetchHtml(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  const html = await fetchHtml('https://sites.google.com/view/bgs-collab-value-list/values/hats');
  // Match google sheets or docs urls
  const sheetMatches = html.match(/https:\/\/(?:docs|drive)\.google\.com\/[^\s\"\'<>]+/g) || [];
  console.log('Google Docs / Sheets on Hats page:', sheetMatches);
}
run();

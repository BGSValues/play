const https = require('https');
const fs = require('fs');

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
  const segments = [];
  const tagRegex = />([^<]+)</g;
  let m;
  while ((m = tagRegex.exec(html)) !== null) {
    const text = m[1].replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
    if (text.length > 0 && !text.startsWith('var ') && !text.startsWith('function') && !text.includes('{') && !text.includes('DOCS_timing')) {
      segments.push(text);
    }
  }

  console.log(`Extracted ${segments.length} segments from Collab Hats page:`);
  for (let i = 0; i < Math.min(segments.length, 120); i++) {
    console.log(`[${i}]`, segments[i]);
  }
}
run();

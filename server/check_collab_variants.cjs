const https = require('https');
const fs = require('fs');

const pages = [
  'https://sites.google.com/view/bgs-collab-value-list/values/limited-secrets',
  'https://sites.google.com/view/bgs-collab-value-list/values/secrets',
  'https://sites.google.com/view/bgs-collab-value-list/values/legendary',
  'https://sites.google.com/view/bgs-collab-value-list/values/epic',
  'https://sites.google.com/view/bgs-collab-value-list/values/rare-common',
  'https://sites.google.com/view/bgs-collab-value-list/values/limited-legendary',
  'https://sites.google.com/view/bgs-collab-value-list/home'
];

function fetchPage(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  for (const page of pages) {
    const html = await fetchPage(page);
    console.log(`Page ${page} length: ${html.length}`);
    // Check for texts mentioning Mythic or Shiny Mythic or variants
    // Save sample HTML to inspect structure
    const pName = page.split('/').pop();
    fs.writeFileSync(`server/sample_${pName}.html`, html);
  }
}

run();

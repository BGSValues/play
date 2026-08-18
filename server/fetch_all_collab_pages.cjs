const https = require('https');
const fs = require('fs');

const pages = [
  'https://sites.google.com/view/bgs-collab-value-list/values/limited-secrets',
  'https://sites.google.com/view/bgs-collab-value-list/values/permanent-secrets',
  'https://sites.google.com/view/bgs-collab-value-list/values/mythic-secrets',
  'https://sites.google.com/view/bgs-collab-value-list/values/leaderboard-pets-and-miscellaneous-secrets',
  'https://sites.google.com/view/bgs-collab-value-list/values/ogs',
  'https://sites.google.com/view/bgs-collab-value-list/values/t3s',
  'https://sites.google.com/view/bgs-collab-value-list/values/mythic-t3s',
  'https://sites.google.com/view/bgs-collab-value-list/values/mythic-t2s',
  'https://sites.google.com/view/bgs-collab-value-list/values/bubble-pass-pets',
  'https://sites.google.com/view/bgs-collab-value-list/values/reward-shop-challenge-pass-and-quest-pets',
  'https://sites.google.com/view/bgs-collab-value-list/values/bubble-and-egg-prize-pets',
  'https://sites.google.com/view/bgs-collab-value-list/values/index-reward-pets',
  'https://sites.google.com/view/bgs-collab-value-list/values/robux-and-gamepass-pets'
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
  const result = {};
  for (const page of pages) {
    const pageKey = page.split('/').pop();
    const html = await fetchPage(page);
    console.log(`Fetched ${pageKey} (${html.length} bytes)`);
    fs.writeFileSync(`server/page_${pageKey}.html`, html);
  }
}

run();

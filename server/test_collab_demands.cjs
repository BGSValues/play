const https = require('https');
const fs = require('fs');

function fetchHtml(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function checkCollab() {
  const pages = [
    'limited-secrets',
    'permanent-secrets',
    'mythic-secrets',
    'legendary',
    't3s',
    'ogs',
    'leaderboard-pets',
    'hats',
    'bubble-pass-pets',
    'traveling-merchant-pets'
  ];

  for (const pageName of pages) {
    const url = 'https://sites.google.com/view/bgs-collab-value-list/values/' + pageName;
    const html = await fetchHtml(url);

    const segments = [];
    const tagRegex = />([^<]+)</g;
    let m;
    while ((m = tagRegex.exec(html)) !== null) {
      const text = m[1].replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
      if (text.length > 0 && !text.startsWith('var ') && !text.startsWith('function') && !text.includes('{')) {
        segments.push(text);
      }
    }

    console.log(`\n=== PAGE: ${pageName} (Segments: ${segments.length}) ===`);
    // Find sections where demand is listed
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].toLowerCase().includes('demand')) {
        console.log('Nearby around demand:', segments.slice(Math.max(0, i - 2), Math.min(segments.length, i + 6)).join(' | '));
      }
    }
  }
}

checkCollab().catch(console.error);

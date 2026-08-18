const https = require('https');
const fs = require('fs');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function cleanText(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .trim();
}

async function run() {
  const pages = [
    'limited-secrets',
    'permanent-secrets',
    'hats',
    'leaderboard-pets-and-miscellaneous-secrets',
    'ogs',
    't3s'
  ];

  for (const page of pages) {
    const html = await fetchHtml('https://sites.google.com/view/bgs-collab-value-list/values/' + page);
    const matches = html.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
    const texts = matches.map(cleanText).filter(Boolean);

    for (let i = 0; i < texts.length; i++) {
      const t = texts[i];
      if (t.includes('Eternal Cucumber') || t.includes('Partner Unicorn') || t.includes('Godly Gem') || t.includes('Dementor')) {
        console.log(`\nFound "${t}" on ${page}:`);
        for (let j = Math.max(0, i - 1); j <= Math.min(texts.length - 1, i + 6); j++) {
          console.log(`  [${j}] ${texts[j]}`);
        }
      }
    }
  }
}

run();

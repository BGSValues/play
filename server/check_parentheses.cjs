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

async function checkParentheses() {
  const pages = [
    'limited-secrets',
    'permanent-secrets',
    'hats',
    'leaderboard-pets-and-miscellaneous-secrets',
    'ogs',
    't3s',
    'bubble-pass-pets',
    'traveling-merchant-pets',
    'reward-shop-challenge-pass-and-quest-pets',
    'bubble-and-egg-prize-pets',
    'index-reward-pets',
    'robux-and-gamepass-pets'
  ];

  for (const page of pages) {
    const html = await fetchHtml('https://sites.google.com/view/bgs-collab-value-list/values/' + page);
    const matches = html.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
    const texts = matches.map(cleanText).filter(Boolean);

    for (let i = 0; i < texts.length; i++) {
      if (texts[i].includes('(') && texts[i].includes(')')) {
        console.log(`[${page}] [${i}] ${texts[i - 1]} -> ${texts[i]}`);
      }
    }
  }
}

checkParentheses();

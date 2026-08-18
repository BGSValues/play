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

async function inspect() {
  const html = await fetchHtml('https://sites.google.com/view/bgs-collab-value-list/values/limited-secrets');
  const segments = [];
  const tagRegex = />([^<]+)</g;
  let m;
  while ((m = tagRegex.exec(html)) !== null) {
    const text = m[1].replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
    if (text.length > 0 && !text.startsWith('var ') && !text.startsWith('function') && !text.includes('{')) {
      segments.push(text);
    }
  }

  const startIdx = segments.findIndex(s => s === 'Limited Secrets');
  console.log('Start index of Limited Secrets items:', startIdx);
  for (let i = startIdx; i < Math.min(segments.length, startIdx + 120); i++) {
    console.log(`[${i}]`, segments[i]);
  }
}

inspect().catch(console.error);

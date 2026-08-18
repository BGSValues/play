const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (!loc.startsWith('http')) loc = 'https://sites.google.com' + loc;
        return fetchUrl(loc).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseVal(valStr) {
  if (!valStr) return null;
  valStr = valStr.toString().trim().toLowerCase().replace(/,/g, '');
  if (valStr === 'n/a' || valStr === '-' || valStr === 'none' || valStr === '?') return null;
  if (valStr.endsWith('m')) {
    return parseFloat(valStr) * 1000000;
  }
  if (valStr.endsWith('k')) {
    return parseFloat(valStr) * 1000;
  }
  if (valStr.endsWith('b')) {
    return parseFloat(valStr) * 1000000000;
  }
  const num = parseFloat(valStr);
  return isNaN(num) ? null : num;
}

function parseDemand(demStr) {
  if (!demStr) return 5;
  demStr = demStr.toString().trim().toUpperCase();
  if (demStr.includes('GARBAGE') || demStr.includes('TERRIBLE') || demStr.includes('AWFUL')) return 1;
  if (demStr.includes('VERY LOW') || demStr.includes('LOW')) return 3;
  if (demStr.includes('AVERAGE') || demStr.includes('DECENT') || demStr.includes('NORMAL') || demStr.includes('MEDIUM')) return 5;
  if (demStr.includes('HIGH') || demStr.includes('GOOD')) return 8;
  if (demStr.includes('GREAT') || demStr.includes('HYPED') || demStr.includes('EXTREME') || demStr.includes('INSANE') || demStr.includes('AMAZING')) return 10;
  
  const m = demStr.match(/(\d+)\s*\/\s*1[01]/);
  if (m) return parseInt(m[1]);
  return 5;
}

function parseTrend(trStr) {
  if (!trStr) return 'Stable';
  if (trStr.includes('↔') || trStr.toLowerCase().includes('stable')) return 'Stable';
  if (trStr.includes('⬆') || trStr.toLowerCase().includes('rising')) return 'Rising';
  if (trStr.includes('⬇') || trStr.toLowerCase().includes('dropping')) return 'Dropping';
  if (trStr.includes('🔥') || trStr.toLowerCase().includes('hyped')) return 'Hyped';
  if (trStr.includes('🔄') || trStr.toLowerCase().includes('unstable')) return 'Unstable';
  return 'Stable';
}

async function scrapeAll() {
  const urlsToScrape = [
    'https://sites.google.com/view/bgs-collab-value-list/values/limited-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/values/secrets',
    'https://sites.google.com/view/bgs-collab-value-list/values/legendary',
    'https://sites.google.com/view/bgs-collab-value-list/values/tier-1-3',
    'https://sites.google.com/view/bgs-collab-value-list/values/tier-3',
    'https://sites.google.com/view/bgs-collab-value-list/values/tier-1-2',
    'https://sites.google.com/view/bgs-collab-value-list/values/unique',
    'https://sites.google.com/view/bgs-collab-value-list/values/season-pass',
    'https://sites.google.com/view/bgs-collab-value-list/values/premium-pass',
    'https://sites.google.com/view/bgs-collab-value-list/values/pass-pets',
    'https://sites.google.com/view/bgs-collab-value-list/hats/limited-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/hats/secrets',
    'https://sites.google.com/view/bgs-collab-value-list/hats/legendary',
    'https://sites.google.com/view/bgs-collab-value-list/hats/unique',
    'https://sites.google.com/view/bgs-collab-value-list/hats/tier-1-3',
    'https://sites.google.com/view/bgs-collab-value-list/home'
  ];

  console.log(`Starting crawl across ${urlsToScrape.length} known value list pages...`);
  const allExtracted = [];

  for (const u of urlsToScrape) {
    try {
      console.log(`Fetching ${u}...`);
      const html = await fetchUrl(u);
      
      // Save HTML to inspect if needed
      const cleanName = u.split('/').pop();
      fs.writeFileSync(path.join(__dirname, `page_${cleanName}.html`), html);

      // Check for tables or text lines in HTML
      // Google Sites renders content in paragraphs / divs
      // Let's parse text content
    } catch (e) {
      console.log(`Error on ${u}:`, e.message);
    }
  }
}

scrapeAll();

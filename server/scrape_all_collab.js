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

async function discoverPages() {
  const root = 'https://sites.google.com/view/bgs-collab-value-list/home';
  const html = await fetchUrl(root);
  const regex = /href="(\/view\/bgs-collab-value-list\/[^"#?]+)"/g;
  const set = new Set();
  let match;
  while ((match = regex.exec(html)) !== null) {
    set.add('https://sites.google.com' + match[1]);
  }
  
  // Also add standard known routes
  const known = [
    'https://sites.google.com/view/bgs-collab-value-list/values/limited-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/values/secrets',
    'https://sites.google.com/view/bgs-collab-value-list/values/legendary',
    'https://sites.google.com/view/bgs-collab-value-list/values/tier-1-3',
    'https://sites.google.com/view/bgs-collab-value-list/values/tier-3',
    'https://sites.google.com/view/bgs-collab-value-list/values/tier-1-2',
    'https://sites.google.com/view/bgs-collab-value-list/values/pass-pets',
    'https://sites.google.com/view/bgs-collab-value-list/values/season-pass',
    'https://sites.google.com/view/bgs-collab-value-list/values/premium-pass',
    'https://sites.google.com/view/bgs-collab-value-list/values/unique',
    'https://sites.google.com/view/bgs-collab-value-list/hats/limited-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/hats/secrets',
    'https://sites.google.com/view/bgs-collab-value-list/hats/legendary',
    'https://sites.google.com/view/bgs-collab-value-list/hats/unique',
    'https://sites.google.com/view/bgs-collab-value-list/hats/tier-1-3',
  ];
  known.forEach(k => set.add(k));

  return Array.from(set);
}

async function main() {
  const pages = await discoverPages();
  console.log(`Found ${pages.length} pages to explore:`, pages);

  for (const pageUrl of pages) {
    try {
      const pageHtml = await fetchUrl(pageUrl);
      const subRegex = /href="(\/view\/bgs-collab-value-list\/[^"#?]+)"/g;
      let m;
      while ((m = subRegex.exec(pageHtml)) !== null) {
        const full = 'https://sites.google.com' + m[1];
        if (!pages.includes(full)) pages.push(full);
      }
    } catch (e) {
      console.log('Error crawling page:', pageUrl, e.message);
    }
  }

  console.log(`Total discovered pages: ${pages.length}`);
  fs.writeFileSync(path.join(__dirname, 'all_collab_pages.json'), JSON.stringify(pages, null, 2));
}

main();

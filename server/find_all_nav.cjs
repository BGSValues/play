const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function discoverAllNavLinks() {
  const html = await fetchUrl('https://sites.google.com/view/bgs-collab-value-list/home');
  const regex = /href="(\/view\/bgs-collab-value-list\/[^"#?]+)"/g;
  const links = new Set();
  let m;
  while ((m = regex.exec(html)) !== null) {
    links.add(m[1]);
  }

  // Also check other pages
  for (const link of Array.from(links)) {
    const pageHtml = await fetchUrl('https://sites.google.com' + link);
    let m2;
    while ((m2 = regex.exec(pageHtml)) !== null) {
      links.add(m2[1]);
    }
  }

  console.log('All Navigation Links on Site:', Array.from(links));
  fs.writeFileSync('./server/site_nav_links.json', JSON.stringify(Array.from(links), null, 2));
}

discoverAllNavLinks();

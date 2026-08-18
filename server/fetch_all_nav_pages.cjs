const https = require('https');
const fs = require('fs');

function fetchComplete(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fetchAllPages() {
  const links = JSON.parse(fs.readFileSync('./server/site_nav_links.json', 'utf8'));
  for (const link of links) {
    const filename = './server/full_' + link.split('/').pop() + '.html';
    const url = 'https://sites.google.com' + link;
    console.log('Fetching', url, '...');
    const html = await fetchComplete(url);
    fs.writeFileSync(filename, html);
    if (html.includes('%') && (html.includes('Lucid Leaf') || html.includes('King Slime') || html.includes('Lovely Rose'))) {
      console.log('  🎯 FOUND PERCENTAGE TABLE IN:', filename);
    }
  }
}

fetchAllPages();

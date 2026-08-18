const https = require('https');
const fs = require('fs');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'BGSWikiImageFetcher/1.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function test() {
  const hatNames = ['Interstellar Wings', 'Pirate Captain', 'Leaf Glasses', 'Sea King', "Sylently's Hat", 'Sun Fedora'];
  for (const name of hatNames) {
    const url = 'https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=' + encodeURIComponent(name) + '&prop=images|pageimages&piprop=original|thumbnail&pithumbsize=300&format=json';
    const res = await fetchJson(url);
    console.log(`\n=== Page for "${name}" ===`);
    const pages = res.query?.pages || {};
    for (const pid of Object.keys(pages)) {
      const p = pages[pid];
      console.log('Title:', p.title);
      console.log('Thumbnail:', p.thumbnail?.source);
      console.log('Original:', p.original?.source);
      console.log('Images listed on page:', p.images?.map(img => img.title));
    }
  }
}

test();

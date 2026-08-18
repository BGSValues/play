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

async function getFullLimited() {
  const html = await fetchComplete('https://sites.google.com/view/bgs-collab-value-list/values/limited-secrets');
  fs.writeFileSync('./server/full_limited_secrets.html', html);
  console.log('Saved full limited secrets, length:', html.length);
  console.log('Has Lovely Rose:', html.includes('Lovely Rose'));
  console.log('Has Prisma Cube:', html.includes('Prisma Cube'));
}

getFullLimited();

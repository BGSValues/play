const fs = require('fs');
const html = fs.readFileSync('./server/full_limited_secrets.html', 'utf8');

const idx = html.indexOf('Demonic Ghost Spirit');
console.log(html.slice(Math.max(0, idx - 200), idx + 800));

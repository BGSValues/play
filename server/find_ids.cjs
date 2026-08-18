const fs = require('fs');
const html = fs.readFileSync(__dirname + '/page_bubble-pass-pets.html', 'utf8');

// Look for data-embed, drive IDs, sheets, or json blobs
const regexes = [
  /https:\/\/[^"'\s<>]+/g,
  /data-[a-z0-9-]+="([^"]+)"/g,
  /"(https:\/\/docs\.google\.com\/[^"]+)"/g,
  /key=([a-zA-Z0-9_-]{20,})/g,
  /id=([a-zA-Z0-9_-]{20,})/g,
];

for (const r of regexes) {
  const m = html.match(r);
  if (m) console.log('Match count:', m.length, m.slice(0, 5));
}

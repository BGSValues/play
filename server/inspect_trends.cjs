const fs = require('fs');
const path = require('path');
const htmlFiles = fs.readdirSync(__dirname).filter(f => f.startsWith('full_') && f.endsWith('.html'));

for (const f of htmlFiles) {
  const html = fs.readFileSync(path.join(__dirname, f), 'utf8');
  // Check for any special characters or images used for arrows
  const arrowChars = html.match(/(↑|↓|↔|▲|▼|🔄|\?|&uarr;|&darr;|&harr;|green|red)/gi);
  console.log(`${f}: arrow matches count =`, arrowChars ? arrowChars.length : 0);
  // Find where table rows are
  const rows = html.match(/<tr\b[^>]*>.*?<\/tr>/gis) || [];
  if (rows.length > 0) {
    console.log(`  Found ${rows.length} <tr> rows in ${f}`);
  }
}

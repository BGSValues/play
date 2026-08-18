const fs = require('fs');
const files = fs.readdirSync(__dirname).filter(f => f.startsWith('page_') && f.endsWith('.html'));

for (const file of files) {
  const content = fs.readFileSync(__dirname + '/' + file, 'utf8');
  const matches = content.match(/https:\/\/(docs|drive|spreadsheets)\.google\.com\/[^\s"<>'\\]+/g);
  if (matches) {
    console.log(file, '->', matches);
  }
}

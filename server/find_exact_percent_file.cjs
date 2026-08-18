const fs = require('fs');
const files = fs.readdirSync('./server').filter(f => f.endsWith('.html'));

for (const f of files) {
  const content = fs.readFileSync('./server/' + f, 'utf8');
  if (content.includes('2,500%') || (content.includes('Lucid Leaf') && content.includes('100%')) || (content.includes('Lovely Rose') && content.includes('65%'))) {
    console.log('EXACT MATCH IN FILE:', f);
  }
}

const fs = require('fs');
const html = fs.readFileSync('./server/full_copy-of-limited-secrets.html', 'utf8');

const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
const spans = [];
let m;
while ((m = pRegex.exec(html)) !== null) {
  const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
  if (text) spans.push(text);
}

const list = ['Eternal Cucumber', 'Lucid Leaf', 'King Slime', 'BGS Plaque', 'Angelic Ghost Spirit', 'Demonic Ghost Spirit', 'Dice Split', 'Gingerbread Shard', 'Morning Star', 'Archangel', 'Christmas Bell', 'Firecracker', 'Diamond Ring', 'Lovely Rose', 'Prisma Cube', 'Easter Spirit'];

for (const name of list) {
  const idx = spans.indexOf(name);
  if (idx !== -1) {
    console.log(name, '->', spans.slice(idx, idx + 6));
  } else {
    console.log('NOT FOUND:', name);
  }
}

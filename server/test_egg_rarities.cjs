const fs = require('fs');
const path = require('path');

const eggs = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/eggs.json'), 'utf8'));

let badCount = 0;
eggs.forEach((e, ei) => {
  if (!e.pets || !Array.isArray(e.pets)) {
    console.log(`Egg ${e.name} has no pets array!`);
    badCount++;
  } else {
    e.pets.forEach((p, pi) => {
      if (!p.rarity) {
        console.log(`Egg "${e.name}" pet "${p.name}" has no rarity!`);
        badCount++;
      }
    });
  }
});

console.log(`Total bad pets in eggs: ${badCount}`);

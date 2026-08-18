const fs = require('fs');

const eggs = JSON.parse(fs.readFileSync('src/data/eggs.json', 'utf-8'));
const availableFiles = fs.readdirSync('public/eggs');

console.log(`Auditing ${eggs.length} eggs against ${availableFiles.length} local egg image assets...`);

function clean(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

let fixedCount = 0;

for (const egg of eggs) {
  const eggCleanName = clean(egg.name);
  
  // Try to find matching file in public/eggs
  const match = availableFiles.find(f => {
    const fClean = clean(f.replace('.png', ''));
    if (fClean === eggCleanName) return true;
    if (fClean === eggCleanName + 'egg') return true;
    if (eggCleanName.endsWith('egg') && fClean === eggCleanName) return true;
    return false;
  });

  if (match) {
    const newPath = `/eggs/${match}`;
    if (egg.image !== newPath) {
      console.log(`Fixing ${egg.name}: "${egg.image}" -> "${newPath}"`);
      egg.image = newPath;
      fixedCount++;
    }
  } else {
    // Partial substring match
    const partial = availableFiles.find(f => clean(f).includes(eggCleanName.replace('egg', '')));
    if (partial) {
      const newPath = `/eggs/${partial}`;
      if (egg.image !== newPath) {
        console.log(`Partial match for ${egg.name}: "${egg.image}" -> "${newPath}"`);
        egg.image = newPath;
        fixedCount++;
      }
    } else {
      console.warn(`⚠️ No local image match found for: ${egg.name}`);
    }
  }
}

console.log(`Successfully fixed ${fixedCount} egg image paths!`);

fs.writeFileSync('src/data/eggs.json', JSON.stringify(eggs, null, 2));

// Verify that all 140 eggs now point to existing local files
const missing = [];
for (const e of eggs) {
  let p = e.image;
  if (p.startsWith('/')) p = 'public' + p;
  if (!fs.existsSync(p)) {
    missing.push({ name: e.name, path: e.image });
  }
}
console.log('Final missing egg count:', missing.length);
if (missing.length > 0) {
  console.log('Still missing:', missing);
}

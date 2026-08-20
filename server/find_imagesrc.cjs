const fs = require('fs');
const path = require('path');

function search(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      search(full);
    } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('imageSrc')) {
        console.log(`File: ${f}`);
        const lines = content.split('\n');
        lines.forEach((l, i) => {
          if (l.includes('imageSrc')) console.log(`  L${i+1}: ${l}`);
        });
      }
    }
  }
}

search(path.join(__dirname, '../src'));

const fs = require('fs');
const path = require('path');

const pets = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/pets.json'), 'utf8'));
const existingNames = new Set(pets.map(p => p.name.toLowerCase().trim()));

// Let's inspect all html files in server to find any pet names that are NOT in existingNames
const files = fs.readdirSync(__dirname).filter(f => f.startsWith('full_') && f.endsWith('.html'));

const missingCandidates = new Map();

for (const file of files) {
  const html = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
  const spans = [];
  let m;
  while ((m = pRegex.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
    if (text) spans.push(text);
  }

  for (let i = 0; i < spans.length; i++) {
    const tok = spans[i];
    const lower = tok.toLowerCase().trim();

    // Check if next item is a number/percentage/demand
    const next = spans[i + 1];
    if (next && (/^[0-9,]+%?$/.test(next) || next === 'N/A' || next === '-')) {
      // Exclude generic header strings
      if (!['pet name', 'hat name', 'normal', 'shiny', 'mythic', 'demand', 'trend', 'origin', 'values', 'value', 'shiny mythic'].includes(lower)) {
        if (!existingNames.has(lower) && !lower.includes('🥚') && !lower.includes('✨') && !lower.includes('ids') && tok.length > 2) {
          if (!missingCandidates.has(tok)) {
            missingCandidates.set(tok, {
              name: tok,
              file: file.replace('full_', '').replace('.html', ''),
              sampleValues: spans.slice(i + 1, i + 6)
            });
          }
        }
      }
    }
  }
}

console.log(`Found ${missingCandidates.size} missing items from Collab pages:`);
for (const [name, info] of missingCandidates.entries()) {
  console.log(`- ${name} (from ${info.file}):`, info.sampleValues);
}

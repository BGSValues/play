const https = require('https');
const fs = require('fs');

const pets = JSON.parse(fs.readFileSync('src/data/pets.json', 'utf-8'));

function fetchWikitextChunk(titles) {
  return new Promise((resolve) => {
    const titlesParam = titles.map(t => encodeURIComponent(t)).join('|');
    const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&prop=revisions&rvprop=content&titles=${titlesParam}&format=json`;

    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query?.pages || {};
          const result = {};
          for (const k in pages) {
            const page = pages[k];
            if (page.title) {
              const content = page.revisions?.[0]?.['*'] || '';
              result[page.title.toLowerCase()] = content;
            }
          }
          resolve(result);
        } catch (e) {
          resolve({});
        }
      });
    }).on('error', () => resolve({}));
  });
}

// Load Collab Mythic Secrets page as well
const collabMythicSecretsHtml = fs.readFileSync('server/page_mythic-secrets.html', 'utf-8');
const collabMythicT3Html = fs.readFileSync('server/page_mythic-t3s.html', 'utf-8');
const collabMythicT2Html = fs.readFileSync('server/page_mythic-t2s.html', 'utf-8');

async function run() {
  console.log(`Auditing variants for ${pets.length} items from Fandom Wiki...`);

  const chunkSize = 40;
  const petTitles = pets.map(p => p.name);

  const wikiData = {};

  for (let i = 0; i < petTitles.length; i += chunkSize) {
    const chunk = petTitles.slice(i, i + chunkSize);
    console.log(`Fetching chunk ${i / chunkSize + 1}/${Math.ceil(petTitles.length / chunkSize)}...`);
    const res = await fetchWikitextChunk(chunk);
    Object.assign(wikiData, res);
    await new Promise(r => setTimeout(r, 200));
  }

  let onlyNormalShinyCount = 0;
  let onlyNormalCount = 0;
  let fullMythicCount = 0;
  let hatCount = 0;

  for (const pet of pets) {
    const nameLower = pet.name.toLowerCase().trim();
    const isHat = pet.type === 'hat' || pet.category === 'Hats' || nameLower.includes('hat');

    if (isHat) {
      pet.type = 'hat';
      pet.category = 'Hats';
      pet.multipliers = null;
      pet.variants = ['Normal'];
      hatCount++;
      continue;
    }

    const content = wikiData[nameLower] || '';
    
    // Check infobox parameters
    const hasImage3 = /image3\s*=/i.test(content) || /image_mythic\s*=/i.test(content);
    const hasMythicKeyword = /Mythic\s+[A-Za-z0-9\s]+\.png/i.test(content) ||
                             collabMythicSecretsHtml.toLowerCase().includes(`>${nameLower}<`) ||
                             collabMythicT3Html.toLowerCase().includes(`>${nameLower}<`) ||
                             collabMythicT2Html.toLowerCase().includes(`>${nameLower}<`);

    const hasMythic = hasImage3 || hasMythicKeyword;

    // Check if it only has image1 (no image2 / shiny)
    const hasImage2 = /image2\s*=/i.test(content) || /Shiny\s+[A-Za-z0-9\s]+\.png/i.test(content);
    
    if (hasMythic) {
      pet.variants = ['Normal', 'Shiny', 'Mythic', 'ShinyMythic'];
      pet.multipliers = {
        Normal: 1.0,
        Shiny: 2.5,
        Mythic: 10.0,
        ShinyMythic: 25.0
      };
      fullMythicCount++;
    } else {
      // Non-mythic pet: only Normal and Shiny!
      pet.variants = ['Normal', 'Shiny'];
      pet.multipliers = {
        Normal: 1.0,
        Shiny: 2.5
      };
      onlyNormalShinyCount++;
    }
  }

  console.log('--- VARIANT AUDIT COMPLETE ---');
  console.log(`Hats (Normal only): ${hatCount}`);
  console.log(`Pets with Normal + Shiny ONLY (NO Mythic/ShinyMythic): ${onlyNormalShinyCount}`);
  console.log(`Pets with Full Variants (Normal, Shiny, Mythic, ShinyMythic): ${fullMythicCount}`);

  // Save to both database locations
  fs.writeFileSync('src/data/pets.json', JSON.stringify(pets, null, 2));
  fs.writeFileSync('server/data/pets.json', JSON.stringify(pets, null, 2));

  console.log('Saved to src/data/pets.json and server/data/pets.json!');
}

run();

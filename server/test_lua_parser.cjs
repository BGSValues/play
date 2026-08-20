const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function run() {
  const pageData = await fetchUrl(`https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=Module:Utilities/PetStats&prop=revisions&rvprop=content&format=json`);
  const pJson = JSON.parse(pageData);
  const page = Object.values(pJson.query.pages)[0];
  const luaCode = page.revisions?.[0]?.['*'] || '';

  const petsFound = [];
  // Split on pet declarations
  const chunks = luaCode.split(/\n\s*(?:\["([^"]+)"\]|([a-zA-Z0-9_\s\-'.]+))\s*=\s*\{/);
  console.log(`Split into ${chunks.length} chunks.`);

  // Regex for each pet block:
  const petHeaderRegex = /(?:\["([^"]+)"\]|([a-zA-Z0-9_\s\-'.]+))\s*=\s*\{([\s\S]*?buffs\s*=\s*\{[\s\S]*?\}\s*\})/g;
  let m;
  while ((m = petHeaderRegex.exec(luaCode)) !== null) {
    const name = m[1] || m[2];
    petsFound.push(name.trim());
  }

  console.log(`Found ${petsFound.length} pets with buffs! First 10:`, petsFound.slice(0, 10));
}

run().catch(console.error);

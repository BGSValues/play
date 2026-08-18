const fs = require('fs');

const pets = JSON.parse(fs.readFileSync('src/data/pets.json', 'utf-8'));

// Extract pet lists from each page
function extractPetNamesFromHtml(html) {
  // Extract text nodes
  const textMatches = html.match(/>([^<]{2,60})</g) || [];
  const list = textMatches.map(t => t.slice(1, -1).replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim());
  return list;
}

const mythicSecretsHtml = fs.readFileSync('server/page_mythic-secrets.html', 'utf-8');
const limitedSecretsHtml = fs.readFileSync('server/page_limited-secrets.html', 'utf-8');
const ogsHtml = fs.readFileSync('server/page_ogs.html', 'utf-8');
const leaderboardHtml = fs.readFileSync('server/page_leaderboard-pets-and-miscellaneous-secrets.html', 'utf-8');
const mythicT3Html = fs.readFileSync('server/page_mythic-t3s.html', 'utf-8');
const mythicT2Html = fs.readFileSync('server/page_mythic-t2s.html', 'utf-8');

console.log('Sample analysis starting...');

// Check which pets have mythic hatch amount (⚡) in limited-secrets vs mythic-secrets
// In limited-secrets, some pets have ⚡ or ✨⚡ indicating mythic hatch
// In mythic-secrets, all pets have mythic versions
// In OGs and leaderboard pets, NONE have mythic

const mythicSecretNames = new Set();
const nonMythicSecretNames = new Set();

// Let's parse all pet names in database and check
const petsWithMythic = [];
const petsWithoutMythic = [];

for (const p of pets) {
  const name = p.name.toLowerCase().trim();
  const isHat = p.type === 'hat' || p.category === 'Hats';

  if (isHat) {
    p.hasMythic = false;
    p.hasShiny = false;
    p.variants = ['Normal'];
    continue;
  }

  // Check if mentioned in mythic-secrets, mythic-t3s, mythic-t2s
  const inMythicPages = mythicSecretsHtml.toLowerCase().includes(`>${name}<`) ||
                        mythicT3Html.toLowerCase().includes(`>${name}<`) ||
                        mythicT2Html.toLowerCase().includes(`>${name}<`);

  // Check if in limited-secrets with ⚡ symbol
  // Search for the pet in limited-secrets and look nearby for ⚡
  let hasMythicInLimited = false;
  const pos = limitedSecretsHtml.toLowerCase().indexOf(`>${name}<`);
  if (pos !== -1) {
    const chunk = limitedSecretsHtml.slice(pos, pos + 1500);
    if (chunk.includes('⚡') || chunk.includes('Mythic') || chunk.includes('mythic')) {
      hasMythicInLimited = true;
    }
  }

  // Check if OGs, leaderboard, or reward
  const inOGs = ogsHtml.toLowerCase().includes(`>${name}<`);
  const inLeaderboard = leaderboardHtml.toLowerCase().includes(`>${name}<`);

  // General rule in BGS:
  // Secrets released before Update 36 (OGs) or specific non-mythic limiteds have NO Mythic.
  // Pets in Mythic Secrets or hatched after update 36 with mythic chance have Mythic.
  if (inOGs || inLeaderboard || (!inMythicPages && !hasMythicInLimited && p.rarity === 'Secret' && (pos !== -1 || inOGs))) {
    p.hasMythic = false;
    p.hasShiny = true;
    p.variants = ['Normal', 'Shiny'];
    petsWithoutMythic.push(p.name);
  } else if (inMythicPages || hasMythicInLimited) {
    p.hasMythic = true;
    p.hasShiny = true;
    p.variants = ['Normal', 'Shiny', 'Mythic', 'ShinyMythic'];
    petsWithMythic.push(p.name);
  } else {
    // Default based on category
    if (p.rarity === 'Secret') {
      // If not confirmed mythic, default to Normal + Shiny
      p.hasMythic = false;
      p.hasShiny = true;
      p.variants = ['Normal', 'Shiny'];
      petsWithoutMythic.push(p.name);
    } else {
      p.hasMythic = true;
      p.hasShiny = true;
      p.variants = ['Normal', 'Shiny', 'Mythic', 'ShinyMythic'];
      petsWithMythic.push(p.name);
    }
  }
}

console.log(`Pets with Mythic: ${petsWithMythic.length}`);
console.log(`Pets WITHOUT Mythic (Normal & Shiny only): ${petsWithoutMythic.length}`);
console.log('Sample pets without mythic:', petsWithoutMythic.slice(0, 25));

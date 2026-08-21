const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

// 1. Collect and map tier categories from Collab HTML files
const tierFiles = [
  { file: 'full_mythic-t3s.html', tier: 'Mythic T3' },
  { file: 'full_mythic-t2s.html', tier: 'Mythic T2' },
  { file: 'full_t3s.html', tier: 'Tier 3 Secret (T3)' },
  { file: 'full_ogs.html', tier: 'OG Secret' },
  { file: 'full_limited-secrets.html', tier: 'Limited Secret' },
  { file: 'full_secrets.html', tier: 'Secret' },
  { file: 'full_bubble-pass-pets.html', tier: 'Bubble Pass' },
  { file: 'full_robux-and-gamepass-pets.html', tier: 'Robux & Gamepass' },
  { file: 'full_tier-1-and-2-secrets.html', tier: 'Tier 1 / 2 Secret' },
  { file: 'full_legendary.html', tier: 'Legendary' },
];

const petTierMap = new Map();

for (const { file, tier } of tierFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  const html = fs.readFileSync(filePath, 'utf8');
  const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
  let m;
  while ((m = pRegex.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
    if (text && text.length > 2 && text.length < 40 && !text.includes('$') && !text.includes('Value') && !text.includes('Demand') && !text.includes('List')) {
      const clean = text.replace(/^Mythic\s+/i, '').toLowerCase().trim();
      if (!petTierMap.has(clean)) {
        petTierMap.set(clean, tier);
      }
    }
  }
}

console.log(`Mapped ${petTierMap.size} pets to official Collab Tiers (T3, Mythic T3, Mythic T2, OGs, etc.)`);

// 2. Find and Merge Standalone 'Mythic ...' pets into base pet
const standaloneMythics = pets.filter(p => p.name.startsWith('Mythic '));
console.log(`Processing ${standaloneMythics.length} standalone Mythic items to merge...`);

for (const mPet of standaloneMythics) {
  const baseName = mPet.name.replace(/^Mythic\s+/i, '').trim();
  const basePet = pets.find(p => p.name.toLowerCase() === baseName.toLowerCase() && !p.name.startsWith('Mythic '));

  if (basePet) {
    if (!basePet.customValues) basePet.customValues = {};
    if (mPet.baseValue) basePet.customValues.mythic = mPet.baseValue;
    if (mPet.demand) basePet.customValues.mythicDemand = mPet.demand;
    if (mPet.shinyValue) basePet.customValues.shinyMythic = mPet.shinyValue;
    if (mPet.image && !basePet.customValues.mythicImage) {
      basePet.customValues.mythicImage = mPet.image;
    }
    console.log(`✓ Merged "${mPet.name}" into canonical "${basePet.name}" (Mythic Val: ${basePet.customValues.mythic}, S.Myth: ${basePet.customValues.shinyMythic})`);
  }
}

// Filter out all standalone "Mythic ..." pets so there are NO duplicates
pets = pets.filter(p => !p.name.startsWith('Mythic '));

// 3. Attach Collab Tiers and ensure strict unpriced values
let taggedCount = 0;
for (const pet of pets) {
  const lower = pet.name.toLowerCase().trim();
  if (petTierMap.has(lower)) {
    pet.tierTag = petTierMap.get(lower);
    taggedCount++;
  }

  // Ensure unvalued pets have null demand
  if (pet.baseValue === null || pet.baseValue === undefined || pet.baseValue <= 0) {
    pet.baseValue = null;
    pet.demand = null;
    pet.status = 'N/A';
  }
}

console.log(`\n🎉 Tagged ${taggedCount} pets with official Collab Tiers!`);
console.log(`Remaining clean canonical pets count: ${pets.length}`);

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
}

console.log('\n--- VERIFICATION: Cursed Scorpio ---');
const scorpio = pets.find(p => p.name.toLowerCase() === 'cursed scorpio');
console.log(JSON.stringify(scorpio, null, 2));

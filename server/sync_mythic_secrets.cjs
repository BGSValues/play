const fs = require('fs');

const pets = JSON.parse(fs.readFileSync('src/data/pets.json', 'utf-8'));
const html = fs.readFileSync('server/page_mythic-secrets.html', 'utf-8');

// Parse mythic secrets page
const textMatches = html.match(/>([^<]{1,80})</g) || [];
const tokens = textMatches
  .map(t => t.slice(1, -1).replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim())
  .filter(t => t.length > 0);

console.log('Total tokens in Mythic Secrets page:', tokens.length);

let updatedMythics = 0;

for (let i = 0; i < tokens.length; i++) {
  const token = tokens[i];
  
  // Look for "Mythic <PetName>" or "<PetName>"
  let petName = token;
  if (petName.toLowerCase().startsWith('mythic ')) {
    petName = petName.slice(7).trim();
  }

  const matchingPet = pets.find(p => p.name.toLowerCase() === petName.toLowerCase());
  if (matchingPet) {
    const slice = tokens.slice(i, i + 12);
    const nums = [];
    for (let j = 1; j < slice.length; j++) {
      const item = slice[j];
      const n = parseInt(item.replace(/,/g, ''), 10);
      if (!isNaN(n) && n > 0 && !item.includes('/') && !item.includes('🥚') && !item.includes('✨') && !item.includes('⚡')) {
        nums.push(n);
      }
    }

    if (nums.length >= 1) {
      const mythicVal = nums[0];
      const shinyMythicVal = nums.length >= 2 ? nums[1] : Math.round(mythicVal * 2.5);

      if (!matchingPet.customValues) matchingPet.customValues = {};
      matchingPet.customValues.mythic = mythicVal;
      matchingPet.customValues.shinyMythic = shinyMythicVal;
      matchingPet.mythicValue = mythicVal;
      matchingPet.shinyMythicValue = shinyMythicVal;

      // Ensure variants include Mythic and ShinyMythic
      if (!matchingPet.variants.includes('Mythic')) matchingPet.variants.push('Mythic');
      if (!matchingPet.variants.includes('ShinyMythic')) matchingPet.variants.push('ShinyMythic');

      updatedMythics++;
      console.log(`Synced ${matchingPet.name} Mythic: ${mythicVal}, ShinyMythic: ${shinyMythicVal}`);
    }
  }
}

console.log(`Successfully synced ${updatedMythics} explicit Mythic Secrets directly from Collab!`);

fs.writeFileSync('src/data/pets.json', JSON.stringify(pets, null, 2));
fs.writeFileSync('server/data/pets.json', JSON.stringify(pets, null, 2));

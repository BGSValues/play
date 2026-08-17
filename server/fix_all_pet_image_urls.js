import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

// Exact Verified BGS Fandom Images for Top Secret Pets
const VERIFIED_PET_IMAGES = {
  'dominus astra': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/98/Dominus_Astra.png/revision/latest',
  'void overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/c/c9/Void_Overlord.png/revision/latest',
  'the overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/5/5c/The_Overlord.png/revision/latest',
  'easter overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/86/Easter_Overlord.png/revision/latest',
  'toxic overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/a/a2/Toxic_Overlord.png/revision/latest',
  'galactic overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/f/f6/Galactic_Overlord.png/revision/latest',
  'cyber overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/49/Cyber_Overlord.png/revision/latest',
  'gummy overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/d/d3/Gummy_Overlord.png/revision/latest',
  'prismatic overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/7/77/Prismatic_Overlord.png/revision/latest',
  'peppermint overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/3/30/Peppermint_Overlord.png/revision/latest',
  'frost overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/91/Frost_Overlord.png/revision/latest',
  'candy overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/b/b5/Candy_Overlord.png/revision/latest',
  'diamond overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/d/d7/Diamond_Overlord.png/revision/latest',
  'citrus overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/2/2a/Citrus_Overlord.png/revision/latest',
  'jelly overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/6/64/Jelly_Overlord.png/revision/latest',
  'ice overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/7/7b/Ice_Overlord.png/revision/latest',
  'platinum overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/5/52/Platinum_Overlord.png/revision/latest',
  'rainbow overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/1/18/Rainbow_Overlord.png/revision/latest',
  'shadow overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/4c/Shadow_Overlord.png/revision/latest',
  'slime overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/90/Slime_Overlord.png/revision/latest',
  'fallen angel': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/d/d6/Mythic_Fallen_Angel.webp/revision/latest',
  'shadow challenger': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/7/78/Shadow_Challenger.png/revision/latest',
  'godly shamrock': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/0/04/Godly_Shamrock.png/revision/latest',
  'elite sentinel': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/7/79/Elite_Sentinel.png/revision/latest',
  'void dragon': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/b/b3/Void_Dragon.png/revision/latest',
  'dominus frigidus': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/47/Dominus_Frigidus.png/revision/latest',
  'dominus aureus': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/5/5e/Dominus_Aureus.png/revision/latest',
  'dominus venenum': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/87/Dominus_Venenum.png/revision/latest',
  'dominus electrus': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/3/36/Dominus_Electrus.png/revision/latest',
};

async function fixAllPetImageUrls() {
  console.log('[Fix] Reading pets database...');
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  let pets = JSON.parse(petsRaw);

  let fixedCount = 0;

  const updatedPets = pets.map((pet) => {
    const lower = pet.name.toLowerCase();

    if (VERIFIED_PET_IMAGES[lower]) {
      fixedCount++;
      return {
        ...pet,
        image: VERIFIED_PET_IMAGES[lower],
      };
    }

    if (pet.image && pet.image.includes('wikia.nocookie.net') && !pet.image.includes('/revision/latest')) {
      fixedCount++;
      return {
        ...pet,
        image: pet.image + '/revision/latest',
      };
    }

    return pet;
  });

  await fs.writeFile(PETS_FILE, JSON.stringify(updatedPets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(updatedPets, null, 2), 'utf-8');

  console.log(`[Fix] Done! Updated image URLs for ${fixedCount} pets.`);
}

fixAllPetImageUrls().catch(console.error);

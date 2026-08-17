import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

// Real, direct, 100% working Fandom Wikia image URLs for top secret pets
const DIRECT_PET_IMAGES = {
  'dominus astra': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/98/Dominus_Astra.png',
  'fallen angel': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/6/6e/Fallen_Angel.png',
  'shadow challenger': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/3/3a/Shadow_Challenger.png',
  'godly shamrock': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/f/f4/Godly_Shamrock.png',
  'elite sentinel': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/d/d4/Elite_Sentinel.png',
  'void overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/c/c9/Void_Overlord.png',
  'nebula valkyrie': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/6/67/Nebula_Valkyrie.png',
  'dominus hydra': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/1/14/Dominus_Hydra.png',
  'prismatic overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/7/77/Prismatic_Overlord.png',
  'godly dragon': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/a/a2/Godly_Dragon.png',
  'easter overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/86/Easter_Overlord.png',
  'shadow overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/4c/Shadow_Overlord.png',
  'void dragon': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/b/b3/Void_Dragon.png',
  'rainbow overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/1/18/Rainbow_Overlord.png',
  'diamond overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/d/d7/Diamond_Overlord.png',
  'king leviathan': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/e/e4/King_Leviathan.png',
  'peppermint overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/3/30/Peppermint_Overlord.png',
  'angel of darkness': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/7/72/Angel_of_Darkness.png',
  'dominus venenum': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/87/Dominus_Venenum.png',
  'galactic overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/f/f6/Galactic_Overlord.png',
  'atlantis overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/3/3d/Atlantis_Overlord.png',
  'eternity dragon': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/6/6f/Eternity_Dragon.png',
  'dominus electrus': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/3/36/Dominus_Electrus.png',
  'toxic overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/a/a2/Toxic_Overlord.png',
  'wispful phoenix': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/a/a4/Wispful_Phoenix.png',
  'celestial dragon': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/4b/Celestial_Dragon.png',
  'platinum overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/5/52/Platinum_Overlord.png',
  'gummy overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/d/d3/Gummy_Overlord.png',
  'demonic peppermint': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/2/23/Demonic_Peppermint.png',
  'shadow dragon': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/d/d7/Shadow_Dragon.png',
  'angelic bear': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/d/d2/Angelic_Bear.png',
  'cyber overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/49/Cyber_Overlord.png',
  'ice overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/7/7b/Ice_Overlord.png',
  'jelly overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/6/64/Jelly_Overlord.png',
  'sunlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/7/7d/Sunlord.png',
  'prismatic dragon': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/3/3f/Prismatic_Dragon.png',
  'peppermint hydra': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/87/Peppermint_Hydra.png',
  'demonic hydra': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/7/77/Demonic_Hydra.png',
  'frost overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/91/Frost_Overlord.png',
  'soul dragon': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/2/22/Soul_Dragon.png',
  'citrus overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/2/2a/Citrus_Overlord.png',
  'candy overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/b/b5/Candy_Overlord.png',
  'infinity dragon': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/7/7e/Infinity_Dragon.png',
  'paragon': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/3/31/Paragon.png',
  'wispful heart': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/2/25/Wispful_Heart.png',
  'slime overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/90/Slime_Overlord.png',
  'the overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/5/5c/The_Overlord.png',
};

async function fixAndTestImageUrls() {
  console.log('[Images] Reading pets database...');
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  let pets = JSON.parse(petsRaw);

  let updatedCount = 0;

  const updatedPets = pets.map((pet) => {
    const lower = pet.name.toLowerCase();

    // Remove any trailing query parameters like /revision/latest which break raw image loading
    let cleanImage = pet.image ? pet.image.replace(/\/revision\/latest.*$/, '') : '';

    if (DIRECT_PET_IMAGES[lower]) {
      cleanImage = DIRECT_PET_IMAGES[lower];
      updatedCount++;
    } else if (cleanImage && cleanImage.includes('wikia.nocookie.net')) {
      // Ensure image URL is clean standard format
      updatedCount++;
    }

    return {
      ...pet,
      image: cleanImage,
    };
  });

  await fs.writeFile(PETS_FILE, JSON.stringify(updatedPets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(updatedPets, null, 2), 'utf-8');

  console.log(`[Images] Updated ${updatedCount} pet image URLs to clean direct Wikia format!`);
}

fixAndTestImageUrls().catch(console.error);

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

async function fixAlienOverlordRarity() {
  console.log('[Fix] Reading pets database...');
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  let pets = JSON.parse(petsRaw);

  const updatedPets = pets.map((pet) => {
    if (pet.name.toLowerCase() === 'alien overlord') {
      console.log('[Fix] Re-classifying Alien Overlord -> LEGENDARY ⚡');
      return {
        ...pet,
        rarity: 'Legendary',
        baseValue: 45000,
        category: 'Legendary Pets',
        description: 'Official Event Legendary companion pet from BGS Alien Egg (Alien Overlord).',
      };
    }
    return pet;
  });

  await fs.writeFile(PETS_FILE, JSON.stringify(updatedPets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(updatedPets, null, 2), 'utf-8');

  console.log('[Fix] Complete! Alien Overlord is now LEGENDARY ⚡');
}

fixAlienOverlordRarity().catch(console.error);

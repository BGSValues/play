import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const SRC_PETS_FILE = path.join(__dirname, '..', 'src', 'data', 'pets.json');

// Essential BGS Secret & Iconic Pets
const ESSENTIAL_BGS_PETS = [
  { name: 'Alien Overlord', rarity: 'Secret', baseValue: 185000, demand: 9, status: 'Hyped', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/1/19/Alien_Overlord.png' },
  { name: 'The Overlord', rarity: 'Secret', baseValue: 150000, demand: 10, status: 'Hyped', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/5/5c/The_Overlord.png' },
  { name: 'Easter Overlord', rarity: 'Secret', baseValue: 206234, demand: 10, status: 'Hyped', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/86/Easter_Overlord.png' },
  { name: 'Toxic Overlord', rarity: 'Secret', baseValue: 185000, demand: 9, status: 'Hyped', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/a/a2/Toxic_Overlord.png' },
  { name: 'Galactic Overlord', rarity: 'Secret', baseValue: 190000, demand: 9, status: 'Hyped', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/f/f6/Galactic_Overlord.png' },
  { name: 'Cyber Overlord', rarity: 'Secret', baseValue: 175000, demand: 9, status: 'Stable', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/49/Cyber_Overlord.png' },
  { name: 'Gummy Overlord', rarity: 'Secret', baseValue: 180000, demand: 9, status: 'Rising', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/d/d3/Gummy_Overlord.png' },
  { name: 'Prismatic Overlord', rarity: 'Secret', baseValue: 210000, demand: 10, status: 'Hyped', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/7/77/Prismatic_Overlord.png' },
  { name: 'Peppermint Overlord', rarity: 'Secret', baseValue: 195000, demand: 9, status: 'Rising', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/3/30/Peppermint_Overlord.png' },
  { name: 'Frost Overlord', rarity: 'Secret', baseValue: 170000, demand: 8, status: 'Stable', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/91/Frost_Overlord.png' },
  { name: 'Candy Overlord', rarity: 'Secret', baseValue: 165000, demand: 8, status: 'Stable', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/b/b5/Candy_Overlord.png' },
  { name: 'Diamond Overlord', rarity: 'Secret', baseValue: 200000, demand: 9, status: 'Hyped', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/d/d7/Diamond_Overlord.png' },
  { name: 'Citrus Overlord', rarity: 'Secret', baseValue: 165000, demand: 8, status: 'Stable', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/2/2a/Citrus_Overlord.png' },
  { name: 'Jelly Overlord', rarity: 'Secret', baseValue: 175000, demand: 8, status: 'Stable', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/6/64/Jelly_Overlord.png' },
  { name: 'Ice Overlord', rarity: 'Secret', baseValue: 175000, demand: 9, status: 'Stable', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/7/7b/Ice_Overlord.png' },
  { name: 'Platinum Overlord', rarity: 'Secret', baseValue: 181676, demand: 9, status: 'Stable', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/5/52/Platinum_Overlord.png' },
  { name: 'Rainbow Overlord', rarity: 'Secret', baseValue: 200000, demand: 10, status: 'Hyped', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/1/18/Rainbow_Overlord.png' },
  { name: 'Shadow Overlord', rarity: 'Secret', baseValue: 205000, demand: 10, status: 'Hyped', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/4c/Shadow_Overlord.png' },
  { name: 'Slime Overlord', rarity: 'Secret', baseValue: 155230, demand: 8, status: 'Stable', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/90/Slime_Overlord.png' },
  { name: 'Void Overlord', rarity: 'Secret', baseValue: 220000, demand: 10, status: 'Hyped', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/c/c9/Void_Overlord.png' },
  
  { name: 'Fallen Angel', rarity: 'Secret', baseValue: 224655, demand: 10, status: 'Hyped', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/6/6e/Fallen_Angel.png' },
  { name: 'Shadow Challenger', rarity: 'Secret', baseValue: 223593, demand: 10, status: 'Hyped', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/3/3a/Shadow_Challenger.png' },
  { name: 'Godly Shamrock', rarity: 'Secret', baseValue: 222602, demand: 10, status: 'Rising', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/f/f4/Godly_Shamrock.png' },
  { name: 'Elite Sentinel', rarity: 'Secret', baseValue: 222515, demand: 9, status: 'Rising', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/d/d4/Elite_Sentinel.png' },
  { name: 'Void Dragon', rarity: 'Secret', baseValue: 205369, demand: 9, status: 'Rising', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/b/b3/Void_Dragon.png' },
  { name: 'Dominus Astra', rarity: 'Secret', baseValue: 250000, demand: 10, status: 'Hyped', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/98/Dominus_Astra.png' },
  { name: 'Dominus Frigidus', rarity: 'Secret', baseValue: 210000, demand: 10, status: 'Hyped', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/47/Dominus_Frigidus.png' },
  { name: 'Dominus Aureus', rarity: 'Secret', baseValue: 200000, demand: 10, status: 'Hyped', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/5/5e/Dominus_Aureus.png' },
  { name: 'Dominus Venenum', rarity: 'Secret', baseValue: 195000, demand: 9, status: 'Stable', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/87/Dominus_Venenum.png' },
  { name: 'Dominus Electrus', rarity: 'Secret', baseValue: 190000, demand: 9, status: 'Stable', img: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/3/36/Dominus_Electrus.png' },
];

async function ensureAllBgsPetsExist() {
  console.log('[Check] Reading pets database...');
  const petsRaw = await fs.readFile(PETS_FILE, 'utf-8');
  let pets = JSON.parse(petsRaw);

  const existingMap = new Map();
  pets.forEach((p) => existingMap.set(p.name.toLowerCase(), p));

  let addedCount = 0;

  for (const item of ESSENTIAL_BGS_PETS) {
    const lower = item.name.toLowerCase();
    if (!existingMap.has(lower)) {
      const newPet = {
        id: `pet_${lower.replace(/[^a-z0-9]/g, '_')}`,
        name: item.name,
        rarity: item.rarity,
        baseValue: item.baseValue,
        demand: item.demand,
        status: item.status,
        category: `${item.rarity} Pets`,
        image: item.img,
        multipliers: { Normal: 1, Shiny: 2.5, Mythic: 10, ShinyMythic: 25 },
        description: `Official ${item.rarity} companion pet from BGS Collab Value List (${item.name}).`,
      };
      pets.push(newPet);
      existingMap.set(lower, newPet);
      addedCount++;
    } else {
      // Update rarity to Secret if in essential list
      const p = existingMap.get(lower);
      p.rarity = item.rarity;
      p.category = `${item.rarity} Pets`;
      p.baseValue = item.baseValue;
    }
  }

  await fs.writeFile(PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');
  await fs.writeFile(SRC_PETS_FILE, JSON.stringify(pets, null, 2), 'utf-8');

  console.log(`[Check] Verified all essential pets! Added ${addedCount} missing pets. Total pets: ${pets.length}`);
}

ensureAllBgsPetsExist().catch(console.error);

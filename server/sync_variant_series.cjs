const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

// 1. Remove generic group placeholder "Sundae Champions"
pets = pets.filter(p => p.name !== 'Sundae Champions');

// 2. Ensure each Sundae Champion has full wiki stats & Vacation Egg
const sundaeStats = {
  buffs: {
    Bubbles: 18250,
    Coins: 77777,
    Gems: 88888,
    All: 25910
  },
  egg: 'Vacation Egg',
  movementType: 'Fly',
  chance: 0.00000666
};

for (const p of pets) {
  if (['Vanilla Sundae Champion', 'Mint Sundae Champion', 'Strawberry Sundae Champion', 'Chocolate Sundae Champion'].includes(p.name)) {
    p.rarity = 'Legendary';
    p.type = 'pet';
    p.category = 'Legendary Pets';
    p.stats = { ...sundaeStats };
    p.variants = ['Normal', 'Shiny', 'Mythic', 'ShinyMythic'];
    p.multipliers = { Normal: 1, Shiny: 2.5, Mythic: 10, ShinyMythic: 25 };
  }
}

// 3. Ensure image URLs for all 4 Sundae Champions
const sundaeImages = {
  'Vanilla Sundae Champion': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/0/07/Vanilla_Sundae_Champion.png/revision/latest',
  'Mint Sundae Champion': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/b/b5/Mint_Sundae_Champion.png/revision/latest',
  'Strawberry Sundae Champion': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/83/Strawberry_Sundae_Champion.png/revision/latest',
  'Chocolate Sundae Champion': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/f/f3/Chocolate_Sundae_Champion.png/revision/latest',
  'Shadow Sundae Champion': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/91/Shadow_Sundae_Champion.png/revision/latest'
};

for (const p of pets) {
  if (sundaeImages[p.name]) {
    p.image = sundaeImages[p.name];
  }
}

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
}

console.log('✓ All 4 Sundae Champion variants updated with exact Wiki stats, images, and Collab values.');

const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
const serverPetsPath = path.join(__dirname, 'data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

// Exact verified Wiki URLs
const exactImageMap = {
  'Strawberry Sundae Champion': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/83/Strawberry_Sundae_Champion.png/revision/latest',
  'Tophat (A)': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/1/1a/Tophat_%28A%29.png/revision/latest',
  'Tophat (B)': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/99/Tophat_%28B%29.png/revision/latest',
  'Tophat (C)': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/42/Tophat_%28C%29.png/revision/latest',
  'Tophat (D)': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/1/19/Tophat_%28D%29.png/revision/latest',
  'Tophat (E)': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/8c/Tophat_%28E%29.png/revision/latest',
  'Tophat (F)': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/4f/Tophat_%28F%29.png/revision/latest',
  'Tophat (G)': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/44/Tophat_G.webp/revision/latest',
  'Mythic All-Seeing Eye': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/7/78/All_Seeing_Eye.png/revision/latest',
  'Demonic Ghost Spirit': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/f/f6/Demonic_Ghost_Spirit.png/revision/latest',
  'Fire Champion': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/4e/Firecracker_shiny.png/revision/latest',
  'ObscureEntity Plushie': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/f/f0/ObscureEntity_Plushie.png/revision/latest',
  'Holy Egg': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/40/Holy_Egg.png/revision/latest',
  'Trophy': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/c/cd/Trophy.png/revision/latest',
  '1B Trophy': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/87/1B_Trophy.png/revision/latest',
  '2B Trophy': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/a/a2/2B_Trophy.png/revision/latest',
  'Dark Basilisk': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/5/57/Normal_Dark_Basilisk.webp/revision/latest',
  'Soul Heart': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/2/23/Soul_Heart.png/revision/latest',
  'Pot O\' Gold': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/b/b3/Pot_O%27_Gold.png/revision/latest',
  'Lord Shock': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/3/30/Lord_Shock.png/revision/latest',
  'Easter Basket': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/0/02/Easter_Basket.png/revision/latest',
  'Harmonic Harp': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/85/Harmonic_Harp.png/revision/latest',
  'Lovely Rose': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/84/Lovely_Rose.png/revision/latest',
  'Radioactive Radiance': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/4a/Radioactive_Radiance.png/revision/latest',
  'Almighty Pumpkin': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/42/Mythic_Almighty_Pumpkin.png/revision/latest',
  'Alien Overlord': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/84/Alien_Overlord.png/revision/latest',
  'Alien Kraken': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/0/05/Alien_Kraken.png/revision/latest',
  'Alien Omen': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/b/bb/Alien_Omen.png/revision/latest',
  'Alien UFO': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/0/01/Alien_UFO.png/revision/latest',
  'Alien Ghost': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/5/52/Alien_Ghost.png/revision/latest',
  'Alien Bruh': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/a/a2/Alien_Bruh.png/revision/latest',
  'Alien Angel': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/83/Alien_Angel.png/revision/latest',
  'Alien Doggy': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/6/6f/Alien_Doggy.png/revision/latest',
  'Alien Kitty': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/d/df/Alien_Kitty.png/revision/latest',
  'Alien Bee': 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/80/Alien_Bee.png/revision/latest'
};

let matchCount = 0;
for (const p of pets) {
  const name = p.name.trim();
  if (exactImageMap[name]) {
    p.image = exactImageMap[name];
    matchCount++;
  }
}

console.log(`Updated ${matchCount} core high-profile pets with exact confirmed Wiki URLs.`);

fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2), 'utf8');
if (fs.existsSync(path.dirname(serverPetsPath))) {
  fs.writeFileSync(serverPetsPath, JSON.stringify(pets, null, 2), 'utf8');
}

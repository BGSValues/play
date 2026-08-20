const pets = require('../src/data/pets.json');
const aliens = pets.filter(p => p.name.toLowerCase().includes('alien'));
console.log('All Alien Pets in DB:');
aliens.forEach(a => console.log(`- ${a.name} (${a.rarity}, Category: ${a.category})`));

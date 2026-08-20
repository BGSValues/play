const pets = require('../src/data/pets.json');
const sampleNames = ['Soul Heart', "Pot O' Gold", 'Trophy', 'Lord Shock', 'Easter Basket', 'Summer Bond', 'Monochrome', 'Lovely Rose', 'Prisma Cube', 'Dark Soul', 'Night Terror', 'The Overlord', 'Light Demon', 'Pufferfish'];

for (const name of sampleNames) {
  const p = pets.find(x => x.name.toLowerCase() === name.toLowerCase());
  if (p) {
    console.log(p.name, '->', {
      rarity: p.rarity,
      value: p.baseValue,
      demand: p.demand + '/11',
      shiny: p.customValues?.shiny,
      normalHatched: p.existence?.normal,
      shinyHatched: p.existence?.shiny,
      note: p.existence?.note || p.existence?.eggOrigin
    });
  }
}

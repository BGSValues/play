const pets = require('../src/data/pets.json');

function getVal(item, variant) {
  if (!item || typeof item.baseValue !== 'number' || isNaN(item.baseValue) || item.baseValue <= 0) {
    return null;
  }
  const isHat = item.type === 'hat' || item.category === 'Hats';
  if (isHat) return item.baseValue;

  switch (variant) {
    case 'Shiny':
      return item.customValues?.shiny || item.shinyValue || Math.round(item.baseValue * 2.5);
    case 'Mythic':
      return item.customValues?.mythic || item.mythicValue || Math.round(item.baseValue * 10);
    case 'ShinyMythic':
    case 'S.Myth':
      return item.customValues?.shinyMythic || item.shinyMythicValue || Math.round((item.customValues?.shiny || item.baseValue * 2.5) * 10);
    case 'Normal':
    default:
      return item.baseValue;
  }
}

const checkList = ['Harmonic Harp', 'Soul Heart', 'Lovely Rose', '1B Trophy', 'All Seeing Eye', 'Almighty Hexarium', 'Lord Shock', 'Pot O\' Gold', 'Easter Basket', 'Summer Bond'];

console.log('--- VARIANT VALUES VERIFICATION TABLE ---');
for (const name of checkList) {
  const p = pets.find(x => x.name.toLowerCase() === name.toLowerCase());
  if (p) {
    console.log(p.name + ':');
    console.log(`  Normal:       ⚡ ${getVal(p, 'Normal')?.toLocaleString()}`);
    console.log(`  Shiny:        ⚡ ${getVal(p, 'Shiny')?.toLocaleString()}`);
    console.log(`  Mythic:       ⚡ ${getVal(p, 'Mythic')?.toLocaleString()}`);
    console.log(`  Shiny Mythic: ⚡ ${getVal(p, 'ShinyMythic')?.toLocaleString()}`);
    console.log(`  Existence:   `, p.existence);
  }
}

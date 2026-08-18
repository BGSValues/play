const fs = require('fs');
const path = require('path');

const pets = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/pets.json'), 'utf8'));
const scraped = JSON.parse(fs.readFileSync(path.join(__dirname, 'collab_parsed_all.json'), 'utf8'));

console.log('Total pets in pets.json:', pets.length);
console.log('Total scraped items:', scraped.length);

let updatedCount = 0;
const petNameMap = new Map();
pets.forEach((p, idx) => {
  petNameMap.set(p.name.toLowerCase().trim(), idx);
});

// Let's test matching
for (const item of scraped) {
  if (!item.name || typeof item.name !== 'string') continue;
  const cleanName = item.name.toLowerCase().trim();
  if (petNameMap.has(cleanName)) {
    const idx = petNameMap.get(cleanName);
    const pet = pets[idx];
    
    // Check if scraped values are valid
    let valUpdated = false;
    if (typeof item.normalValue === 'number' && !isNaN(item.normalValue) && item.normalValue > 0) {
      pet.baseValue = item.normalValue;
      valUpdated = true;
    }
    if (typeof item.shinyValue === 'number' && !isNaN(item.shinyValue) && item.shinyValue > 0) {
      if (!pet.customValues) pet.customValues = {};
      pet.customValues.shiny = item.shinyValue;
      valUpdated = true;
    }
    if (item.normalDemand && typeof item.normalDemand === 'number') {
      pet.demand = item.normalDemand;
    }
    if (item.trend && typeof item.trend === 'string') {
      pet.status = item.trend;
    }
    if (item.origin) {
      if (!pet.existence) pet.existence = {};
      pet.existence.note = item.origin;
    }

    if (valUpdated) {
      updatedCount++;
    }
  }
}

console.log(`Matched and updated ${updatedCount} pets!`);

// Let's check Summer Bond and Monochrome specifically:
const sb = pets.find(p => p.name === 'Summer Bond');
console.log('Summer Bond in DB:', sb);
const mc = pets.find(p => p.name === 'Monochrome');
console.log('Monochrome in DB:', mc);

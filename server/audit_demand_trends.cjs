const fs = require('fs');

const pets = JSON.parse(fs.readFileSync('src/data/pets.json', 'utf-8'));

let fixedCount = 0;

for (const pet of pets) {
  const demand = pet.demand;
  const oldStatus = pet.status;

  if (demand === null || demand === undefined) {
    if (pet.status === 'Hyped' || pet.status === 'Rising') {
      pet.status = 'Stable';
      fixedCount++;
    }
    continue;
  }

  // Strict BGS Collab Consistency Rules:
  // Demand 1 (Garbage), 2 (Terrible), 3 (Bad) -> CANNOT be Rising or Hyped!
  if (demand <= 2) {
    if (pet.status === 'Rising' || pet.status === 'Hyped') {
      pet.status = 'Dropping';
      fixedCount++;
    }
  } else if (demand === 3) {
    if (pet.status === 'Rising' || pet.status === 'Hyped') {
      pet.status = 'Stable';
      fixedCount++;
    }
  } else if (demand >= 4 && demand <= 6) {
    if (pet.status === 'Hyped') {
      pet.status = 'Stable';
      fixedCount++;
    }
  } else if (demand >= 9) {
    // High demand items should not be dropping unless marked unstable
    if (pet.status === 'Dropping') {
      pet.status = 'Rising';
      fixedCount++;
    }
  }
}

console.log(`Audited all pets! Fixed ${fixedCount} conflicting trend/demand statuses.`);

fs.writeFileSync('src/data/pets.json', JSON.stringify(pets, null, 2));
fs.writeFileSync('server/data/pets.json', JSON.stringify(pets, null, 2));

console.log('Saved corrected data to src/data/pets.json and server/data/pets.json!');

const fs = require('fs');
const path = require('path');

const pets = JSON.parse(fs.readFileSync('src/data/pets.json', 'utf-8'));

// Demand table lookup
const DEMAND_LABELS = {
  1: 'Garbage',
  2: 'Terrible',
  3: 'Bad',
  4: 'Low',
  5: 'Average',
  6: 'Decent',
  7: 'Good',
  8: 'High',
  9: 'Very High',
  10: 'Extreme',
  11: 'Hyped',
};

// Demand color lookup matching Collab chart exactly
const DEMAND_COLORS = {
  1: '#a855f7', // 1 = Garbage (Purple)
  2: '#2563eb', // 2 = Terrible (Dark Blue)
  3: '#38bdf8', // 3 = Bad (Light Blue)
  4: '#06b6d4', // 4 = Low (Cyan)
  5: '#22c55e', // 5 = Average (Green)
  6: '#eab308', // 6 = Decent (Yellow)
  7: '#f97316', // 7 = Good (Orange)
  8: '#ef4444', // 8 = High (Red)
  9: '#b91c1c', // 9 = Very High (Dark Red)
  10: '#ec4899', // 10 = Extreme (Magenta)
  11: '#ffffff', // 11 = Hyped (White)
};

// Files to parse
const pageFiles = [
  'server/page_limited-secrets.html',
  'server/page_permanent-secrets.html',
  'server/page_mythic-secrets.html',
  'server/page_leaderboard-pets-and-miscellaneous-secrets.html',
  'server/page_ogs.html',
  'server/page_t3s.html',
  'server/page_mythic-t3s.html',
  'server/page_mythic-t2s.html',
  'server/page_bubble-pass-pets.html',
  'server/page_reward-shop-challenge-pass-and-quest-pets.html',
  'server/page_bubble-and-egg-prize-pets.html',
  'server/page_index-reward-pets.html',
  'server/page_robux-and-gamepass-pets.html'
];

// Helper to normalize names
function norm(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const collabDb = new Map();

for (const file of pageFiles) {
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf-8');
  
  // Extract text nodes
  const textMatches = html.match(/>([^<]{1,80})</g) || [];
  const tokens = textMatches
    .map(t => t.slice(1, -1).replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim())
    .filter(t => t.length > 0);

  // Search for pet name patterns followed by values, stability, demand
  // In Google Sites tables, rows typically have: [Pet Name, Normal Value, Shiny Value, Demand/Trend/Hatch]
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    // Check if token matches any pet name in our database
    const matchingPet = pets.find(p => p.name.toLowerCase() === token.toLowerCase());
    if (matchingPet) {
      const slice = tokens.slice(i, i + 15);
      
      let baseVal = null;
      let shinyVal = null;
      let trend = null;
      let demand = null;
      let existence = {};

      for (let j = 1; j < slice.length; j++) {
        const item = slice[j];
        
        // Trend checks
        if (item.includes('⬆⬆') || item.toLowerCase().includes('rising fast')) trend = 'Rising Fast';
        else if (item.includes('⬆') || item.toLowerCase() === 'rising') trend = 'Rising';
        else if (item.includes('↔') || item.toLowerCase() === 'stable') trend = 'Stable';
        else if (item.includes('🔄') || item.toLowerCase() === 'unstable') trend = 'Unstable';
        else if (item.includes('⬇⬇') || item.toLowerCase().includes('dropping fast')) trend = 'Dropping Fast';
        else if (item.includes('⬇') || item.toLowerCase() === 'dropping') trend = 'Dropping';

        // Demand checks (e.g. 10/11 or Demand: 9 or 8/10)
        const demMatch = item.match(/(\d{1,2})\s*\/\s*(?:11|10)/);
        if (demMatch) {
          demand = parseInt(demMatch[1], 10);
        }

        // Hatch existence (e.g. 350🥚 or 64✨ or 3⚡)
        if (item.includes('🥚')) existence.normal = parseInt(item.replace(/[^0-9]/g, ''), 10) || item;
        if (item.includes('✨') && !item.includes('✨⚡')) existence.shiny = parseInt(item.replace(/[^0-9]/g, ''), 10) || item;
        if (item.includes('⚡') && !item.includes('✨⚡')) existence.mythic = parseInt(item.replace(/[^0-9]/g, ''), 10) || item;
        if (item.includes('✨⚡')) existence.shinyMythic = parseInt(item.replace(/[^0-9]/g, ''), 10) || item;

        // Numeric values (e.g. 17,500 or 50,000 or 500)
        const numVal = parseInt(item.replace(/,/g, ''), 10);
        if (!isNaN(numVal) && numVal > 0 && !item.includes('🥚') && !item.includes('✨') && !item.includes('⚡') && !item.includes('/')) {
          if (baseVal === null) baseVal = numVal;
          else if (shinyVal === null && numVal > baseVal) shinyVal = numVal;
        }
      }

      const key = norm(matchingPet.name);
      if (!collabDb.has(key)) {
        collabDb.set(key, {
          name: matchingPet.name,
          baseVal,
          shinyVal,
          trend: trend || 'Stable',
          demand,
          existence: Object.keys(existence).length > 0 ? existence : null
        });
      }
    }
  }
}

console.log(`Parsed ${collabDb.size} direct matches from Collab Value List!`);

// Update pets in database
let updatedCount = 0;
for (const p of pets) {
  const key = norm(p.name);
  const collabData = collabDb.get(key);

  if (collabData) {
    if (collabData.baseVal && collabData.baseVal > 0) {
      p.baseValue = collabData.baseVal;
      if (collabData.shinyVal) p.shinyValue = collabData.shinyVal;
    }
    if (collabData.trend) p.status = collabData.trend;
    if (collabData.demand) p.demand = collabData.demand;
    if (collabData.existence) p.existence = collabData.existence;
    updatedCount++;
  } else {
    // Consistency check for unlisted or other pets
    if (p.demand <= 2) p.status = 'Dropping';
    else if (p.demand === 3) p.status = 'Dropping';
    else if (p.demand >= 4 && p.demand <= 6) p.status = 'Stable';
    else if (p.demand >= 7 && p.demand <= 8) p.status = 'Rising';
    else if (p.demand >= 9) p.status = 'Hyped';
  }
}

console.log(`Updated ${updatedCount} items with exact Collab data!`);

fs.writeFileSync('src/data/pets.json', JSON.stringify(pets, null, 2));
fs.writeFileSync('server/data/pets.json', JSON.stringify(pets, null, 2));
console.log('Saved to src/data/pets.json and server/data/pets.json');

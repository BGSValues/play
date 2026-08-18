const fs = require('fs');

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

for (const file of pageFiles) {
  const html = fs.readFileSync(file, 'utf-8');
  const matches = html.match(/>([^<]*Dragon[^<]*)</gi) || [];
  if (matches.length > 0) {
    console.log(`\n=== File: ${file} ===`);
    const unique = [...new Set(matches.map(m => m.slice(1, -1).trim()))];
    console.log(unique);
  }
}

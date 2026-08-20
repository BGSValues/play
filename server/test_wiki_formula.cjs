function calculateWikiStat(baseStat, variant, lvl, enc) {
  if (typeof baseStat !== 'number' || isNaN(baseStat)) return baseStat;
  const variantMultiplier = variant === 'Shiny' ? 2 : variant === 'Mythic' ? 1.5 : (variant === 'ShinyMythic' || variant === 'S.Myth') ? 3 : 1;
  const initialStat = baseStat * variantMultiplier;

  const clampedLvl = Math.min(25, Math.max(1, Number(lvl) || 1));
  const levelBoost = (clampedLvl - 1) / 24 * 1.0;

  const clampedEnc = Math.min(50, Math.max(0, Number(enc) || 0));
  const enchantBoost = (clampedEnc / 40) * 1.0;

  const totalMultiplier = 1 + levelBoost + enchantBoost;
  return Math.floor(initialStat * totalMultiplier);
}

// Test Gingerbread Shard at Level 25, Enchant 50 (Normal)
const gbStats = {
  Bubbles: 29700,
  Coins: 123255,
  Gems: 133650,
  Bells: 32670
};

console.log('--- GINGERBREAD SHARD (Lvl 25, Enc 50, Normal) ---');
console.log('Bubbles:', calculateWikiStat(gbStats.Bubbles, 'Normal', 25, 50), '(Wiki Target: 96,525)');
console.log('Coins:  ', calculateWikiStat(gbStats.Coins, 'Normal', 25, 50), '(Wiki Target: 400,578)');
console.log('Gems:   ', calculateWikiStat(gbStats.Gems, 'Normal', 25, 50), '(Wiki Target: 434,362)');
console.log('Bells:  ', calculateWikiStat(gbStats.Bells, 'Normal', 25, 50), '(Wiki Target: 106,177)');

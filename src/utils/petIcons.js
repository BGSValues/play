// Dynamic SVG Pet Avatar generator for Bubble Gum Simulator pets
export function getPetAvatar(name = 'Pet', rarity = 'Common', originalImage) {
  if (originalImage && originalImage.startsWith('http') && !originalImage.includes('undefined')) {
    return originalImage;
  }

  // Generate deterministic color scheme based on rarity & pet name
  const rarityColors = {
    Secret: { bg1: '#b967ff', bg2: '#ff4081', glow: '#ff4081', emoji: '👑' },
    Mythic: { bg1: '#ff1744', bg2: '#ff9100', glow: '#ff1744', emoji: '🔥' },
    Legendary: { bg1: '#ffcc00', bg2: '#ff9100', glow: '#ffcc00', emoji: '⚡' },
    Epic: { bg1: '#00e5ff', bg2: '#2979ff', glow: '#00e5ff', emoji: '💎' },
    Rare: { bg1: '#00e676', bg2: '#00b0ff', glow: '#00e676', emoji: '🌟' },
    Common: { bg1: '#94a3b8', bg2: '#64748b', glow: '#94a3b8', emoji: '🐾' },
  };

  const scheme = rarityColors[rarity] || rarityColors.Common;
  const initial = name.charAt(0).toUpperCase();

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <linearGradient id="grad-${rarity}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${scheme.bg1}" />
          <stop offset="100%" stop-color="${scheme.bg2}" />
        </linearGradient>
        <filter id="glow-${rarity}">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="${scheme.glow}" flood-opacity="0.6"/>
        </filter>
      </defs>
      <rect x="5" y="5" width="90" height="90" rx="22" fill="url(#grad-${rarity})" filter="url(#glow-${rarity})"/>
      <rect x="8" y="8" width="84" height="84" rx="19" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
      <text x="50" y="46" font-family="Outfit, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${initial}</text>
      <text x="50" y="76" font-size="20" text-anchor="middle">${scheme.emoji}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

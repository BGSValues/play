import React from 'react';

// Official BGS In-Game Stat Icons from MediaWiki Assets
export const BGS_STAT_ICONS = {
  // 1. Bubble (Pink Sphere)
  Bubbles: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/9b/Bubble.png/revision/latest',
  Bubble: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/9b/Bubble.png/revision/latest',

  // 2. Coin (Golden Dollar Coin)
  Coins: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/6/6d/Coin.png/revision/latest',
  Coin: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/6/6d/Coin.png/revision/latest',

  // 3. Gem / Jewel (Purple Diamond)
  Gems: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/c/ca/Jewel.png/revision/latest',
  Gem: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/c/ca/Jewel.png/revision/latest',
  Jewel: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/c/ca/Jewel.png/revision/latest',

  // 4. All Stats (Rainbow Pinwheel Ring)
  All: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/4f/All.png/revision/latest',
  AllStats: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/4f/All.png/revision/latest',

  // Event & World Currencies
  Candy: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/1/1c/Candy.png/revision/latest',
  Blocks: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/f/fc/Blocks.png/revision/latest',
  Stars: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/3/3c/Stars.png/revision/latest',
  Magma: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/f/f9/Magma.png/revision/latest',
  Crystals: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/6/64/Crystals.png/revision/latest',
  Shells: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/0/06/Shell.png/revision/latest',
  Pearls: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/7/73/Pearl.png/revision/latest',
  Treats: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/a/a8/Treat.png/revision/latest',
  Treat: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/a/a8/Treat.png/revision/latest',
  Flowers: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/8d/Flower_Egg.png/revision/latest',
};

// Component to render an official BGS In-Game Stat Icon
export default function BgsStatIcon({ stat, size = 18, style = {}, className = '' }) {
  const iconUrl = BGS_STAT_ICONS[stat] || BGS_STAT_ICONS[stat?.replace(/s$/, '')];

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={stat}
        referrerPolicy="no-referrer"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          display: 'inline-block',
          verticalAlign: 'middle',
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
          ...style,
        }}
        className={className}
      />
    );
  }

  // Fallback Emojis if not a matched key
  const fallbackEmoji = stat === 'Bubbles' || stat === 'Bubble' ? '🫧'
    : stat === 'Coins' || stat === 'Coin' ? '🪙'
    : stat === 'Gems' || stat === 'Gem' ? '💎'
    : stat === 'All' ? '🌈'
    : '⚡';

  return <span style={{ fontSize: `${size * 0.9}px`, lineHeight: 1, ...style }}>{fallbackEmoji}</span>;
}

import React, { useState } from 'react';

const rarityThemes = {
  Secret: { bg: 'linear-gradient(135deg, #b967ff, #ff007f)', glow: 'rgba(185, 103, 255, 0.6)', border: '#ff007f', emoji: '👑' },
  Mythic: { bg: 'linear-gradient(135deg, #ff1744, #ff9100)', glow: 'rgba(255, 23, 68, 0.6)', border: '#ff1744', emoji: '🔥' },
  Legendary: { bg: 'linear-gradient(135deg, #ffcc00, #ff9100)', glow: 'rgba(255, 204, 0, 0.6)', border: '#ffcc00', emoji: '⚡' },
  Epic: { bg: 'linear-gradient(135deg, #00e5ff, #2979ff)', glow: 'rgba(0, 229, 255, 0.6)', border: '#00e5ff', emoji: '💎' },
  Rare: { bg: 'linear-gradient(135deg, #00e676, #00b0ff)', glow: 'rgba(0, 230, 118, 0.5)', border: '#00e676', emoji: '🌟' },
  Common: { bg: 'linear-gradient(135deg, #94a3b8, #64748b)', glow: 'rgba(148, 163, 184, 0.3)', border: '#cbd5e1', emoji: '🐾' },
};

export default function PetAvatar({ name = 'Pet', rarity = 'Common', image = '', size = 110, className = '' }) {
  const [imgError, setImgError] = useState(false);

  const theme = rarityThemes[rarity] || rarityThemes.Common;
  const initial = name.charAt(0).toUpperCase();

  const isRemoteImage = image && typeof image === 'string' && image.startsWith('http') && !imgError;
  const displaySrc = isRemoteImage ? image : image;

  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: `${Math.round(size * 0.22)}px`,
    background: theme.bg,
    border: `3px solid ${theme.border}`,
    boxShadow: `0 8px 24px ${theme.glow}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
    userSelect: 'none',
  };

  return (
    <div className={className} style={containerStyle}>
      {/* Real 3D Pet Image */}
      {isRemoteImage ? (
        <img
          src={displaySrc}
          alt={name}
          loading="lazy"
          referrerPolicy="no-referrer"
          style={{
            width: '82%',
            height: '82%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
            zIndex: 2,
          }}
          onError={() => setImgError(true)}
        />
      ) : (
        /* Fallback Letter ONLY if image is invalid */
        <LetterFallback initial={initial} theme={theme} size={size} />
      )}

      {/* Rarity badge in bottom-right corner */}
      <div
        style={{
          position: 'absolute',
          bottom: '-2px',
          right: '-2px',
          width: `${Math.round(size * 0.32)}px`,
          height: `${Math.round(size * 0.32)}px`,
          borderRadius: '50%',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          fontSize: `${Math.round(size * 0.18)}px`,
          zIndex: 3,
        }}
      >
        {theme.emoji}
      </div>
    </div>
  );
}

function LetterFallback({ initial, theme, size }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 55%)', pointerEvents: 'none' }} />
      <span style={{ fontSize: `${Math.round(size * 0.42)}px`, fontWeight: 900, color: '#fff', textShadow: '0 3px 10px rgba(0,0,0,0.6)', fontFamily: 'Outfit, sans-serif', lineHeight: 1, zIndex: 2 }}>
        {initial}
      </span>
    </div>
  );
}

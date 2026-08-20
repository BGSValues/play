import React, { useState, useEffect } from 'react';

export default function EggAvatar({ egg, size = 110, className = '' }) {
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [egg?.image]);

  if (!egg) return null;

  const rawUrl = egg.image || '';
  const hasImage = Boolean(rawUrl && rawUrl.startsWith('http'));
  const imageSrc = rawUrl;

  const handleError = () => {
    setLoadFailed(true);
  };

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.22)}px`,
        background: 'radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, rgba(124, 58, 237, 0.08) 60%, rgba(10, 11, 16, 0.6) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        padding: '6px',
      }}
    >
      {hasImage && !loadFailed ? (
        <img
          src={imageSrc}
          alt={egg.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          style={{
            width: '85%',
            height: '85%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))',
            transition: 'transform 0.25s ease',
          }}
          onError={handleError}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: `${Math.round(size * 0.45)}px` }}>🥚</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#00e5ff', marginTop: '2px', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {egg.name.replace(/\s*Egg$/i, '')}
          </span>
        </div>
      )}
    </div>
  );
}

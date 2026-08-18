import React from 'react';

export default function BgsLogo({ onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      {/* ━━━━ 3D GLOSSY PINK BUBBLE LOGO SPHERE ━━━━ */}
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
          boxShadow: '0 0 20px rgba(255, 20, 147, 0.6), 0 4px 12px rgba(0, 0, 0, 0.6)',
        }}
      >
        <img
          src="/bgs_bubble_icon.svg"
          alt="BGS Bubble Logo"
          style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'block' }}
        />
      </div>

      {/* ━━━━ TITLE TYPOGRAPHY WITH INLINE BUBBLE ━━━━ */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Top Header: BUBBLE GUM + PINK BUBBLE GEM */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
          }}
        >
          <span
            style={{
              fontSize: '1.35rem',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '0.4px',
              background: 'linear-gradient(90deg, #ffffff 0%, #ff80df 50%, #ff1493 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
              fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            BUBBLE GUM
          </span>

          {/* Inline Pink Bubble Ball beside title */}
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              flexShrink: 0,
              boxShadow: '0 0 10px rgba(255, 20, 147, 0.7)',
              display: 'inline-block',
            }}
          >
            <img
              src="/bgs_bubble_icon.svg"
              alt="bubble"
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>
        </div>

        {/* Bottom Subtitle: VALUES + [2026] */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '2px',
          }}
        >
          <span
            style={{
              fontSize: '0.88rem',
              fontWeight: 900,
              color: '#00e5ff',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            VALUES
          </span>

          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 900,
              color: '#00e5ff',
              border: '1.5px solid #00e5ff',
              padding: '1px 6px',
              borderRadius: '5px',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              lineHeight: 1,
              display: 'inline-block',
            }}
          >
            2026
          </span>
        </div>
      </div>
    </div>
  );
}

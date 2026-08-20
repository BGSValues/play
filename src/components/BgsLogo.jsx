import React from 'react';

function GlossyBubbleSvg({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 20, 147, 0.7))' }}>
      <defs>
        <radialGradient id="bubbleGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ff99e6" />
          <stop offset="40%" stopColor="#ff1493" />
          <stop offset="85%" stopColor="#c70066" />
          <stop offset="100%" stopColor="#7a003c" />
        </radialGradient>
        <radialGradient id="shineGrad" cx="32%" cy="28%" r="42%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Outer 3D Glossy Sphere */}
      <circle cx="50" cy="50" r="46" fill="url(#bubbleGrad)" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2.5" />
      {/* Specular Highlight Gloss */}
      <ellipse cx="36" cy="32" rx="20" ry="12" transform="rotate(-30 36 32)" fill="url(#shineGrad)" />
      {/* Secondary Bottom Rim Reflection */}
      <ellipse cx="64" cy="70" rx="14" ry="6" transform="rotate(-30 64 70)" fill="#ffffff" fillOpacity="0.25" />
      {/* Crisp White Sparkle Dot */}
      <circle cx="31" cy="25" r="4" fill="#ffffff" />
    </svg>
  );
}

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
        <GlossyBubbleSvg size={42} />
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
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <GlossyBubbleSvg size={18} />
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

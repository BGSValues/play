import React from 'react';

export default function BgsLogo({ onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.9rem',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      {/* ━━━━ ACCURATE 3D BUBBLE GUM LOGO ICON ━━━━ */}
      <div
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #ff4081 0%, #ff9100 35%, #ffd600 65%, #00e676 88%, #00e5ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(255, 64, 129, 0.45), 0 4px 15px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          padding: '4px',
          border: '1.5px solid rgba(255, 255, 255, 0.5)',
          flexShrink: 0,
        }}
      >
        {/* SVG with 3 Glossy 3D Bubblegum Pearls */}
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            {/* 3D Glossy Bubble Gradient */}
            <radialGradient id="bubbleGrad1" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#f3e8ff" />
              <stop offset="60%" stopColor="#d8b4fe" />
              <stop offset="85%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#a855f7" />
            </radialGradient>
            <radialGradient id="bubbleGrad2" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#fce7f3" />
              <stop offset="60%" stopColor="#f472b6" />
              <stop offset="85%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#db2777" />
            </radialGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Large Main Glossy Bubble (Top-Right) */}
          <circle cx="62" cy="38" r="26" fill="url(#bubbleGrad1)" />
          {/* Specular Highlight on Large Bubble */}
          <ellipse cx="54" cy="28" rx="8" ry="5" fill="#ffffff" opacity="0.85" transform="rotate(-25 54 28)" />
          <circle cx="68" cy="46" r="3" fill="#ffffff" opacity="0.5" />

          {/* Medium Bubble (Bottom) */}
          <circle cx="50" cy="70" r="18" fill="url(#bubbleGrad2)" />
          <ellipse cx="44" cy="63" rx="5" ry="3.5" fill="#ffffff" opacity="0.8" transform="rotate(-25 44 63)" />

          {/* Small Bubble (Left) */}
          <circle cx="26" cy="52" r="12" fill="url(#bubbleGrad1)" />
          <ellipse cx="22" cy="47" rx="3.5" ry="2.5" fill="#ffffff" opacity="0.8" transform="rotate(-25 22 47)" />
        </svg>
      </div>

      {/* ━━━━ ACCURATE BUBBLE GUM VALUES SIMULATOR TYPOGRAPHY ━━━━ */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Top Text: BUBBLE GUM */}
        <div
          style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '0.5px',
            background: 'linear-gradient(90deg, #fff0e5 0%, #ffaa75 50%, #ff6b4a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          BUBBLE GUM
        </div>

        {/* Bottom Text: VALUES + [SIMULATOR] Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '3px',
          }}
        >
          <span
            style={{
              fontSize: '0.92rem',
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
              fontSize: '0.78rem',
              fontWeight: 900,
              color: '#00e5ff',
              border: '1.5px solid #00e5ff',
              padding: '1.5px 8px',
              borderRadius: '6px',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              lineHeight: 1,
              display: 'inline-block',
            }}
          >
            SIMULATOR
          </span>
        </div>
      </div>
    </div>
  );
}

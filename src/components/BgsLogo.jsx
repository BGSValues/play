import React from 'react';

export default function BgsLogo({ onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      {/* ANIMATED GLOWING BUBBLE ICON */}
      <div
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #ff007f 0%, #ffcc00 50%, #00e5ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 25px rgba(255, 0, 127, 0.6), 0 4px 15px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          animation: 'pulseGlow 3s infinite ease-in-out',
          border: '2px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        <span
          style={{
            fontSize: '1.6rem',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            animation: 'floatSlow 4s infinite ease-in-out',
          }}
        >
          🫧
        </span>
      </div>

      {/* UNIQUE TYPOGRAPHY LOGO */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #ffffff 0%, #ffcc00 50%, #ff4081 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 10px rgba(255, 0, 127, 0.3)',
          }}
        >
          BUBBLE GUM
        </div>
        <div
          style={{
            fontSize: '0.78rem',
            fontWeight: 900,
            color: '#00e5ff',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginTop: '3px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>VALUES</span>
          <span style={{ fontSize: '0.65rem', background: 'rgba(0, 229, 255, 0.2)', color: '#00e5ff', border: '1px solid #00e5ff', padding: '1px 5px', borderRadius: '4px' }}>
            SIMULATOR
          </span>
        </div>
      </div>
    </div>
  );
}

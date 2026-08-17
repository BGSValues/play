import React from 'react';

export default function BubbleParticles() {
  const bubbles = Array.from({ length: 18 });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      {bubbles.map((_, i) => {
        const size = Math.floor(Math.random() * 45) + 20;
        const left = Math.floor(Math.random() * 96) + 2;
        const delay = Math.random() * 8;
        const duration = Math.random() * 12 + 10;
        const colors = [
          'rgba(255, 0, 127, 0.25)',
          'rgba(255, 204, 0, 0.25)',
          'rgba(0, 229, 255, 0.25)',
          'rgba(185, 103, 255, 0.25)',
        ];
        const color = colors[i % colors.length];

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: '-60px',
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.7), ${color})`,
              boxShadow: `0 0 15px ${color}`,
              border: '1px solid rgba(255, 255, 255, 0.4)',
              animation: `floatBubble ${duration}s infinite linear`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}

      <style>{`
        @keyframes floatBubble {
          0% {
            transform: translateY(0) scale(0.8) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          85% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-110vh) scale(1.3) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

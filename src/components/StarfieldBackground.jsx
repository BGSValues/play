import React, { useEffect, useRef } from 'react';

export default function StarfieldBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Generate Stars
    const STAR_COUNT = 65;
    const stars = [];

    const starColors = [
      '#ffcc00', // Gold
      '#ffffff', // Diamond White
      '#00e5ff', // Cyber Cyan
      '#ec4899', // Nebula Pink
      '#a855f7', // Mystic Purple
    ];

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.6,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        alpha: Math.random() * 0.7 + 0.3,
        baseAlpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.1, // Float upward slowly
        isCross: Math.random() > 0.65, // 4-pointed sparkle star
        parallaxFactor: Math.random() * 0.03 + 0.01,
      });
    }

    // Draw 4-point sparkle star
    function drawStar(cx, cy, spikes, outerRadius, innerRadius, color, alpha) {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      let step = Math.PI / spikes;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = outerRadius * 3;
      ctx.shadowColor = color;
      ctx.fill();
      ctx.restore();
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const mouseOffsetX = (mouse.x - width / 2);
      const mouseOffsetY = (mouse.y - height / 2);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Move stars
        star.x += star.vx;
        star.y += star.vy;

        // Wrap boundaries
        if (star.y < -10) star.y = height + 10;
        if (star.x < -10) star.x = width + 10;
        if (star.x > width + 10) star.x = -10;

        // Twinkle calculation
        star.twinklePhase += star.twinkleSpeed;
        const currentAlpha = star.baseAlpha + Math.sin(star.twinklePhase) * 0.35;
        const boundedAlpha = Math.max(0.1, Math.min(1, currentAlpha));

        const renderX = star.x - mouseOffsetX * star.parallaxFactor;
        const renderY = star.y - mouseOffsetY * star.parallaxFactor;

        if (star.isCross && star.size > 1.4) {
          drawStar(renderX, renderY, 4, star.size * 3.5, star.size * 0.6, star.color, boundedAlpha);
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(renderX, renderY, star.size, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = boundedAlpha;
          ctx.shadowBlur = star.size * 4;
          ctx.shadowColor = star.color;
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.85,
      }}
    />
  );
}

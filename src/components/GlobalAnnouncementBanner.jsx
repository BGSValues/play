import React, { useState, useEffect } from 'react';
import { Megaphone, AlertTriangle, Sparkles, RefreshCw, Zap, TrendingUp, Award, Egg, X } from 'lucide-react';

const defaultLiveFeeds = [
  {
    type: 'value',
    badge: 'LIVE VALUE UPDATE',
    icon: Zap,
    color: '#ffcc00',
    title: 'Paragon & Collab Mythics',
    message: '⚡ Paragon (Mythic) set to 100 with GOOD (7/11) Demand • Clockwork (S.Myth) set to 10,000.',
  },
  {
    type: 'sync',
    badge: 'LIVE GAME SYNC',
    icon: RefreshCw,
    color: '#00e5ff',
    title: '1,557 Pets & 144 Eggs Active',
    message: 'Continuous real-time synchronization with official BGS Fandom Wiki API and game Lua modules.',
  },
  {
    type: 'tier',
    badge: 'COLLAB TIERS SYNCED',
    icon: Award,
    color: '#a78bfa',
    title: '330+ Verified Collab Tiers',
    message: '⭐ Tier 3 Secrets (T3), ⚡ Mythic T2/T3, 👑 OG Secrets, and Limited Secrets categorized.',
  },
  {
    type: 'egg',
    badge: 'EGG HATCH UPDATES',
    icon: Egg,
    color: '#10b981',
    title: '144 In-Game Egg Rosters',
    message: 'Alien Egg, Hellish Egg, 1B Egg & all secret hatches verified with exact drop chances and 3D models.',
  },
  {
    type: 'dupe',
    badge: 'ZERO-DUPE STANDARD',
    icon: TrendingUp,
    color: '#ec4899',
    title: '100% Clean Non-Duped Values',
    message: 'Exploited and unverified dupes permanently filtered out to safeguard player trade values.',
  },
];

export default function GlobalAnnouncementBanner({ announcement }) {
  const [dismissed, setDismissed] = useState(false);
  const [feedIndex, setFeedIndex] = useState(0);

  // Auto-rotate the live feed every 7 seconds if no active admin alert
  useEffect(() => {
    if (announcement && announcement.enabled) return;
    const interval = setInterval(() => {
      setFeedIndex((prev) => (prev + 1) % defaultLiveFeeds.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [announcement]);

  if (dismissed) return null;

  // Active admin broadcast takes priority
  if (announcement && announcement.enabled) {
    const isAlert = announcement.type === 'alert' || announcement.type === 'warning';
    const isEvent = announcement.type === 'event';

    const bgColor = isAlert
      ? 'linear-gradient(90deg, #ff1744 0%, #ff5252 50%, #d50000 100%)'
      : isEvent
      ? 'linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)'
      : 'linear-gradient(90deg, #0284c7 0%, #00e5ff 50%, #2563eb 100%)';

    return (
      <div
        style={{
          background: bgColor,
          color: '#fff',
          padding: '0.65rem 1.5rem',
          fontSize: '0.9rem',
          fontWeight: 700,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          position: 'relative',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isAlert ? <AlertTriangle size={14} /> : isEvent ? <Sparkles size={14} /> : <Megaphone size={14} />}
            <span>GLOBAL BROADCAST</span>
          </div>

          {announcement.title && (
            <strong style={{ fontWeight: 900 }}>{announcement.title} —</strong>
          )}

          <span style={{ fontWeight: 600 }}>{announcement.message}</span>
        </div>

        <button
          onClick={() => setDismissed(true)}
          style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.2)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Dismiss announcement"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // Real-time Rotating Live Sync & Collab Updates Stream
  const currentFeed = defaultLiveFeeds[feedIndex];
  const IconComponent = currentFeed.icon;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #090d16 0%, #111827 50%, #090d16 100%)',
        borderBottom: '1px solid rgba(0, 229, 255, 0.25)',
        color: '#e2e8f0',
        padding: '0.55rem 1.25rem',
        fontSize: '0.85rem',
        fontWeight: 600,
        position: 'relative',
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(0, 229, 255, 0.12)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 900,
            color: currentFeed.color,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          <IconComponent size={13} color={currentFeed.color} />
          <span>{currentFeed.badge}</span>
        </div>

        <span style={{ fontWeight: 800, color: '#fff' }}>
          {currentFeed.title}:
        </span>

        <span style={{ color: '#cbd5e1' }}>
          {currentFeed.message}
        </span>
      </div>

      <button
        onClick={() => setDismissed(true)}
        style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.06)',
          border: 'none',
          color: '#94a3b8',
          borderRadius: '50%',
          width: '22px',
          height: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        title="Dismiss banner"
      >
        <X size={13} />
      </button>
    </div>
  );
}


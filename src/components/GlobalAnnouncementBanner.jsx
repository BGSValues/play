import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Zap,
  TrendingUp,
  Award,
  Egg,
  X,
  History,
  Clock,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import defaultLiveUpdates from '../data/liveUpdates.json';

export default function GlobalAnnouncementBanner({ announcement }) {
  const [dismissed, setDismissed] = useState(false);
  const [feedIndex, setFeedIndex] = useState(0);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState(defaultLiveUpdates);

  // Load custom live updates from localStorage if added by Admin
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bgs_live_updates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLiveUpdates(parsed);
        }
      }
    } catch {}
  }, []);

  // Auto-rotate the live feed every 6 seconds if no active admin alert
  useEffect(() => {
    if (announcement && announcement.enabled) return;
    const interval = setInterval(() => {
      setFeedIndex((prev) => (prev + 1) % liveUpdates.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [announcement, liveUpdates]);

  if (dismissed) return null;

  const currentUpdate = liveUpdates[feedIndex] || liveUpdates[0];

  const getUpdateIcon = (type) => {
    switch (type) {
      case 'value_change':
        return <Zap size={13} color="#ffcc00" />;
      case 'egg_added':
        return <Egg size={13} color="#00e5ff" />;
      case 'pet_added':
        return <Sparkles size={13} color="#10b981" />;
      case 'tier_sync':
        return <Award size={13} color="#a78bfa" />;
      default:
        return <RefreshCw size={13} color="#00e5ff" />;
    }
  };

  return (
    <>
      {/* ━━━━ GLOBAL TICKER / BROADCAST BAR ━━━━ */}
      <div
        style={{
          background: announcement && announcement.enabled
            ? (announcement.type === 'alert' || announcement.type === 'warning'
                ? 'linear-gradient(90deg, #ff1744 0%, #ff5252 50%, #d50000 100%)'
                : announcement.type === 'event'
                ? 'linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)'
                : 'linear-gradient(90deg, #0284c7 0%, #00e5ff 50%, #2563eb 100%)')
            : 'linear-gradient(90deg, #060911 0%, #0d1527 50%, #060911 100%)',
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
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '1300px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
          {announcement && announcement.enabled ? (
            /* Admin Global Announcement View */
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>
                <Megaphone size={14} /> <span>OFFICIAL BROADCAST</span>
              </div>
              {announcement.title && <strong style={{ color: '#fff' }}>{announcement.title} —</strong>}
              <span>{announcement.message}</span>
            </div>
          ) : (
            /* Automated Real-Time Live Sync Feed */
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Date & Badge Tag */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(0, 229, 255, 0.12)',
                  border: `1px solid ${currentUpdate.color}44`,
                  padding: '2px 9px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  color: currentUpdate.color,
                  letterSpacing: '0.5px',
                }}
              >
                {getUpdateIcon(currentUpdate.type)}
                <span>[{currentUpdate.date}]</span>
                <span style={{ textTransform: 'uppercase' }}>{currentUpdate.badge}</span>
              </div>

              {/* Message */}
              <span style={{ color: '#fff', fontWeight: 800 }}>
                {currentUpdate.title}:
              </span>
              <span style={{ color: '#cbd5e1' }}>
                {currentUpdate.message}
              </span>

              {/* Open Full Live Log Button */}
              <button
                onClick={() => setIsLogModalOpen(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#00e5ff',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 229, 255, 0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                title="View full history of added pets, eggs & value changes"
              >
                <History size={12} /> Live Sync Log ({liveUpdates.length})
              </button>
            </div>
          )}
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

      {/* ━━━━ LIVE SYNC & PATCH LOG MODAL ━━━━ */}
      {isLogModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1.5rem' }}>
          <div className="glass-card" style={{ maxWidth: '720px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', border: '1px solid rgba(0, 229, 255, 0.4)', borderRadius: '24px', padding: '2rem' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.15)', border: '1px solid rgba(0, 229, 255, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={20} color="#00e5ff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                    Live Game & Value <span style={{ color: '#00e5ff' }}>Changelog</span>
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
                    Real-time chronicle of newly discovered pets, eggs & Collab value adjustments.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Scrollable Updates Stream */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '6px' }}>
              {liveUpdates.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#0a0d16',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px',
                    padding: '1.1rem 1.25rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = item.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          background: `${item.color}1a`,
                          border: `1px solid ${item.color}44`,
                          color: item.color,
                          fontSize: '0.72rem',
                          fontWeight: 900,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.badge}
                      </span>
                      <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{item.title}</strong>
                    </div>

                    <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {item.date} • {item.time}
                    </span>
                  </div>

                  <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
                    {item.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                🟢 Real-time syncing with BGS Fandom Wiki & Collab consensus.
              </span>
              <button className="btn-primary" onClick={() => setIsLogModalOpen(false)} style={{ padding: '0.55rem 1.4rem', fontSize: '0.85rem' }}>
                Close Changelog
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

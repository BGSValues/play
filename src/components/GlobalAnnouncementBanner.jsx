import React, { useState } from 'react';
import { Megaphone, AlertTriangle, Sparkles, Info, X, ShieldAlert } from 'lucide-react';

export default function GlobalAnnouncementBanner({ announcement }) {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || !announcement.enabled || dismissed) return null;

  const isAlert = announcement.type === 'alert' || announcement.type === 'warning';
  const isEvent = announcement.type === 'event';

  const bgColor = isAlert
    ? 'linear-gradient(90deg, #ff1744 0%, #ff5252 50%, #d50000 100%)'
    : isEvent
    ? 'linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)'
    : 'linear-gradient(90deg, #0284c7 0%, #00e5ff 50%, #2563eb 100%)';

  const textColor = '#fff';

  return (
    <div
      style={{
        background: bgColor,
        color: textColor,
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

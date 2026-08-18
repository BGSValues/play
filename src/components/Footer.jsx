import React from 'react';
import BgsLogo from './BgsLogo';

export default function Footer({ onNavigate, socials }) {
  const handleNav = (tab, section) => {
    if (onNavigate) {
      onNavigate(tab, section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const discordUrl = socials?.discord || 'https://discord.gg/';
  const twitterUrl = socials?.twitter || 'https://x.com/';
  const youtubeUrl = socials?.youtube || 'https://youtube.com/';
  const robloxGroupUrl = socials?.robloxGroup || 'https://www.roblox.com/groups/4311180/Rumble-Studios';

  return (
    <footer
      style={{
        background: '#040508',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '4rem 2rem 3rem 2rem',
        color: '#94a3b8',
        fontSize: '0.88rem',
        marginTop: 'auto',
        position: 'relative',
        zIndex: 1,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1.8fr) repeat(4, minmax(130px, 1fr))',
          gap: '3rem 2rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Brand & Disclaimer Column */}
        <div style={{ paddingRight: '1rem' }}>
          <div style={{ marginBottom: '1.25rem', display: 'inline-block' }}>
            <BgsLogo onClick={() => handleNav('values')} />
          </div>

          <p style={{ margin: '0 0 0.75rem 0', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.6 }}>
            © 2026 BGS Values. All rights reserved.
            <br />
            All trademarks and assets are property of their respective owners.
          </p>

          <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', lineHeight: 1.6 }}>
            BGS Values is an independent community trading database and value list. We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with Roblox Corporation or Rumble Studios.
          </p>
        </div>

        {/* Column 1: Pages */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 900, marginBottom: '1.2rem', textTransform: 'capitalize' }}>
            Pages
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <button
                onClick={() => handleNav('values')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#fff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Values List
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('eggs')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#fff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Eggs & Hatches
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('market')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#fff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Marketplace Trades
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('calculator')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#fff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Trade Calculator
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('guides', 'stsc')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#fff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Guides & STSC
              </button>
            </li>
          </ul>
        </div>

        {/* Column 2: Socials (Configurable via Admin Panel) */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 900, marginBottom: '1.2rem', textTransform: 'capitalize' }}>
            Socials
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#5865F2')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Discord
              </a>
            </li>
            <li>
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#fff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                X (Twitter)
              </a>
            </li>
            <li>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#ff0000')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                YouTube
              </a>
            </li>
            <li>
              <a
                href={robloxGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#00e5ff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Roblox Group
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Legal */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 900, marginBottom: '1.2rem', textTransform: 'capitalize' }}>
            Legal
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <button
                onClick={() => handleNav('guides', 'privacy')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#00e5ff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('guides', 'terms')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#a78bfa')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('guides', 'rules')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#ff1744')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Anti-Scam Standards
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('guides', 'dupe')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#ff007f')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Dupe Disclaimer
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Support & Valuation */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 900, marginBottom: '1.2rem', textTransform: 'capitalize' }}>
            Support & Info
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <button
                onClick={() => handleNav('guides', 'methodology')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#a78bfa')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Valuation Methodology
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('guides', 'stsc')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#00e5ff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Demand 0–11 Scale
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('calculator')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#10b981')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Live Trade Calculator
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNav('guides', 'faq')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#ffcc00')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                FAQ & Help
              </button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import BgsLogo from './BgsLogo';

export default function Footer({ onNavigate }) {
  return (
    <footer
      style={{
        background: '#040508',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '4rem 2rem 3rem 2rem',
        color: '#94a3b8',
        fontSize: '0.88rem',
        position: 'relative',
        zIndex: 20,
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
            <BgsLogo />
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
                onClick={() => onNavigate && onNavigate('values')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#fff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Values List
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate && onNavigate('eggs')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#fff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Eggs & Hatches
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate && onNavigate('market')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#fff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Marketplace Trades
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate && onNavigate('calculator')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#fff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Trade Calculator
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate && onNavigate('guides')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#fff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Guides & STSC
              </button>
            </li>
          </ul>
        </div>

        {/* Column 2: Socials */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 900, marginBottom: '1.2rem', textTransform: 'capitalize' }}>
            Socials
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <a
                href="https://discord.gg/"
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
                href="https://x.com/"
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
                href="https://youtube.com/"
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
                href="https://www.roblox.com/groups/4311180/Rumble-Studios"
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
              <span style={{ color: '#94a3b8', cursor: 'pointer' }} onMouseEnter={(e) => (e.target.style.color = '#fff')} onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}>
                Privacy Policy
              </span>
            </li>
            <li>
              <span style={{ color: '#94a3b8', cursor: 'pointer' }} onMouseEnter={(e) => (e.target.style.color = '#fff')} onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}>
                Terms of Service
              </span>
            </li>
            <li>
              <span style={{ color: '#94a3b8', cursor: 'pointer' }} onMouseEnter={(e) => (e.target.style.color = '#fff')} onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}>
                Anti-Scam Standards
              </span>
            </li>
            <li>
              <span style={{ color: '#94a3b8', cursor: 'pointer' }} onMouseEnter={(e) => (e.target.style.color = '#fff')} onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}>
                Dupe Disclaimer
              </span>
            </li>
          </ul>
        </div>

        {/* Column 4: Support & Data */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 900, marginBottom: '1.2rem', textTransform: 'capitalize' }}>
            Support
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <a
                href="https://sites.google.com/view/bgs-collab-value-list/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = 'var(--primary-gold)')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Collab Value List
              </a>
            </li>
            <li>
              <a
                href="https://bubble-gum-simulator.fandom.com/wiki/Bubble_Gum_Simulator_Wiki"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#00e5ff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Fandom Wiki
              </a>
            </li>
            <li>
              <button
                onClick={() => onNavigate && onNavigate('guides')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#fff')}
                onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
              >
                Demand 0-11 Scale
              </button>
            </li>
            <li>
              <span style={{ color: '#94a3b8', cursor: 'pointer' }} onMouseEnter={(e) => (e.target.style.color = '#fff')} onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}>
                FAQ & Help
              </span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

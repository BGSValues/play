import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Award,
  Sparkles,
  HeartHandshake,
  Star,
  Lock,
  FileText,
  AlertOctagon,
  Gamepad2,
  ExternalLink,
  CheckCircle2,
  Shield,
  Zap,
} from 'lucide-react';

export default function AboutUs() {
  const [activeSubTab, setActiveSubTab] = useState('team');

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '1rem 1.5rem 5rem 1.5rem' }}>
      {/* ━━━━ HERO SHOWCASE BANNER ━━━━ */}
      <div
        className="glass-card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '24px',
          background: 'radial-gradient(ellipse at 50% -20%, rgba(255, 204, 0, 0.25) 0%, rgba(124, 58, 237, 0.12) 45%, rgba(6, 7, 11, 0.95) 85%)',
          border: '1px solid rgba(255, 204, 0, 0.35)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(255, 204, 0, 0.15), rgba(124, 58, 237, 0.15))',
            border: '1px solid rgba(255, 204, 0, 0.4)',
            color: '#ffcc00',
            padding: '0.45rem 1.3rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 900,
            marginBottom: '1.25rem',
            letterSpacing: '0.6px',
          }}
        >
          <Sparkles size={16} color="#ffcc00" /> OFFICIAL BUBBLE GUM SIMULATOR COMMUNITY
        </div>

        <h1
          style={{
            fontSize: '2.8rem',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '1rem',
            lineHeight: 1.15,
          }}
        >
          About <span style={{ color: 'var(--primary-gold)' }}>BGS Values</span> Hub
        </h1>

        <p
          style={{
            color: '#94a3b8',
            fontSize: '1.05rem',
            maxWidth: '780px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.6,
          }}
        >
          Built by passionate Bubble Gum Simulator veterans and active traders to deliver the most accurate, real-time, non-duped valuation lists and trading tools in Roblox.
        </p>

        {/* Platform Stat Badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '14px' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#ffcc00' }}>1,575+</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Clean Verified Pets</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '14px' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#00e5ff' }}>144 Eggs</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Complete In-Game Rosters</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '14px' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#10b981' }}>100% Sync</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>BGS Collab Consensus</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '14px' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#ec4899' }}>Zero Dupe</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Anti-Exploit Values</div>
          </div>
        </div>
      </div>

      {/* ━━━━ SUB-NAVIGATION TABS ━━━━ */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <button
          className={`filter-btn ${activeSubTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('team')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.65rem 1.4rem', fontSize: '0.92rem' }}
        >
          <Users size={16} /> Leadership & Staff Roster
        </button>
        <button
          className={`filter-btn ${activeSubTab === 'mission' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('mission')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.65rem 1.4rem', fontSize: '0.92rem' }}
        >
          <Award size={16} /> Mission & Values
        </button>
        <button
          className={`filter-btn ${activeSubTab === 'terms' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('terms')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.65rem 1.4rem', fontSize: '0.92rem' }}
        >
          <FileText size={16} /> Terms & Policies
        </button>
      </div>

      {/* ━━━━ TAB 1: LEADERSHIP & STAFF ROSTER ━━━━ */}
      {activeSubTab === 'team' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 0.4rem 0' }}>
              Meet The <span style={{ color: 'var(--primary-gold)' }}>Leadership & Staff</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
              The verified valuation team managing market pricing, live sync engines, and platform integrity.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
            {/* Owner & Lead Architect */}
            <div className="holo-staff-card" style={{ border: '1px solid rgba(255, 204, 0, 0.4)', padding: '2rem', borderRadius: '18px', background: 'rgba(10, 11, 16, 0.75)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #ffcc00, #ff9100)',
                    color: '#000',
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 25px rgba(255, 204, 0, 0.4)',
                  }}
                >
                  👑
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>Owner_Admin</h3>
                    <span style={{ background: '#ffcc00', color: '#000', fontSize: '0.7rem', fontWeight: 900, padding: '2px 7px', borderRadius: '5px', textTransform: 'uppercase' }}>
                      OWNER
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#ffcc00', fontWeight: 800, marginTop: '2px' }}>
                    Lead Developer & Platform Creator
                  </div>
                </div>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Oversees platform development, live sync architecture, algorithm precision, and core consensus pricing.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '4px 10px', borderRadius: '6px', color: '#94a3b8' }}>
                  🎮 Roblox: <strong>BGS_Owner_Official</strong>
                </span>
                <span style={{ fontSize: '0.78rem', background: 'rgba(255, 204, 0, 0.1)', border: '1px solid rgba(255, 204, 0, 0.3)', padding: '4px 10px', borderRadius: '6px', color: '#ffcc00', fontWeight: 800 }}>
                  👑 Creator
                </span>
              </div>
            </div>

            {/* Staff Moderator */}
            <div className="holo-staff-card" style={{ border: '1px solid rgba(124, 58, 237, 0.4)', padding: '2rem', borderRadius: '18px', background: 'rgba(10, 11, 16, 0.75)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    color: '#fff',
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 25px rgba(124, 58, 237, 0.4)',
                  }}
                >
                  🛡️
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>Staff_Mod</h3>
                    <span style={{ background: '#7c3aed', color: '#fff', fontSize: '0.7rem', fontWeight: 900, padding: '2px 7px', borderRadius: '5px', textTransform: 'uppercase' }}>
                      MODERATOR
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#a78bfa', fontWeight: 800, marginTop: '2px' }}>
                    Head Community Moderator
                  </div>
                </div>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Manages marketplace security, fair trade reviews, user dispute resolutions, and community standards.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '4px 10px', borderRadius: '6px', color: '#94a3b8' }}>
                  🎮 Roblox: <strong>Staff_Mod_Roblox</strong>
                </span>
                <span style={{ fontSize: '0.78rem', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.3)', padding: '4px 10px', borderRadius: '6px', color: '#a78bfa', fontWeight: 800 }}>
                  🛡️ Moderator
                </span>
              </div>
            </div>

            {/* Community Council */}
            <div className="holo-staff-card" style={{ border: '1px solid rgba(0, 229, 255, 0.4)', padding: '2rem', borderRadius: '18px', background: 'rgba(10, 11, 16, 0.75)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #00e5ff, #00b0ff)',
                    color: '#000',
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 25px rgba(0, 229, 255, 0.4)',
                  }}
                >
                  🤝
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>Community Council</h3>
                    <span style={{ background: '#00e5ff', color: '#000', fontSize: '0.7rem', fontWeight: 900, padding: '2px 7px', borderRadius: '5px', textTransform: 'uppercase' }}>
                      COMMUNITY
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#00e5ff', fontWeight: 800, marginTop: '2px' }}>
                    Verified Traders & Price Advisors
                  </div>
                </div>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Senior community traders submitting daily completed trade proof and evaluating real in-game demand trends.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 10px', borderRadius: '6px', color: '#10b981', fontWeight: 800 }}>
                  🟢 Verified Member
                </span>
                <span style={{ fontSize: '0.78rem', background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '4px 10px', borderRadius: '6px', color: '#94a3b8' }}>
                  💬 Community
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━ TAB 2: MISSION & VALUES ━━━━ */}
      {activeSubTab === 'mission' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00e5ff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} /> Transparency & Integrity
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
              We believe every Roblox player deserves accurate, real trading data. We never accept payment to inflate pet values and strictly synchronize every single trade value directly with community consensus and the official BGS Collab Value List.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(255, 0, 127, 0.3)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ff007f', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} /> Zero-Dupe Standard
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
              Exploited and duplicated pets have degraded many market indexes. Our automated verification audit filters out fake entries, unverified duplicates, and scraped artifacts so you always trade with genuine item worth.
            </p>
          </div>
        </div>
      )}

      {/* ━━━━ TAB 3: TERMS & POLICIES ━━━━ */}
      {activeSubTab === 'terms' && (
        <div className="glass-card" style={{ padding: '3rem', border: '1px solid rgba(124, 58, 237, 0.3)', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1.5rem' }}>
            Terms of Service & Privacy Statement
          </h2>
          <div style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p>
              <strong>BGS Values</strong> is an independent community hub built for fans and players of Bubble Gum Simulator. All in-game assets and imagery are property of their respective creators.
            </p>
            <h4 style={{ color: '#00e5ff', fontSize: '1.1rem', fontWeight: 800, margin: '0.5rem 0 0 0' }}>User Security & Account Privacy</h4>
            <p>
              We only store the minimal information needed to enable trade offers (such as your chosen username and Roblox handle). We never ask for, collect, or store Roblox account passwords or sensitive financial credentials.
            </p>
            <h4 style={{ color: '#ffcc00', fontSize: '1.1rem', fontWeight: 800, margin: '0.5rem 0 0 0' }}>Anti-Scam Standards</h4>
            <p>
              Any attempt to use this platform for phishing, misleading trade requests, price manipulation, or prohibited cross-trading will result in permanent suspension and account blacklisting.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

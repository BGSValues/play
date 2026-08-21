import React from 'react';
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
  Radio,
  Layers,
  Scale,
  Compass,
} from 'lucide-react';

export default function AboutUs() {
  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem 1.5rem 5rem 1.5rem' }}>
      {/* ━━━━ HERO SHOWCASE BANNER ━━━━ */}
      <div
        className="glass-card"
        style={{
          padding: '3.5rem 2rem',
          textAlign: 'center',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '28px',
          background: 'radial-gradient(ellipse at 50% -20%, rgba(255, 204, 0, 0.25) 0%, rgba(124, 58, 237, 0.15) 50%, rgba(10, 11, 16, 0.98) 90%)',
          border: '1px solid rgba(255, 204, 0, 0.4)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.85)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(255, 204, 0, 0.18), rgba(124, 58, 237, 0.18))',
            border: '1px solid rgba(255, 204, 0, 0.45)',
            color: '#ffcc00',
            padding: '0.5rem 1.4rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 900,
            marginBottom: '1.5rem',
            letterSpacing: '0.7px',
            boxShadow: '0 0 20px rgba(255, 204, 0, 0.2)',
          }}
        >
          <Sparkles size={16} color="#ffcc00" /> #1 VERIFIED BUBBLE GUM SIMULATOR TRADING NETWORK
        </div>

        <h1
          style={{
            fontSize: '3.2rem',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '1.25rem',
            lineHeight: 1.15,
            letterSpacing: '-0.5px',
          }}
        >
          About <span style={{ color: 'var(--primary-gold)' }}>BGS Values</span> Hub
        </h1>

        <p
          style={{
            color: '#cbd5e1',
            fontSize: '1.15rem',
            maxWidth: '820px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.65,
          }}
        >
          An independent community platform built by long-standing Bubble Gum Simulator collectors, top traders, and game archivists. We provide 100% clean, verified, non-duped valuation lists and automated trading tools.
        </p>

        {/* Live Platform Telemetry Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            maxWidth: '1050px',
            margin: '0 auto',
          }}
        >
          <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255, 204, 0, 0.3)', padding: '1.25rem', borderRadius: '18px' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffcc00' }}>1,557</div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>Clean Canonical Pets</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0, 229, 255, 0.3)', padding: '1.25rem', borderRadius: '18px' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#00e5ff' }}>144 Eggs</div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>3D Wiki Egg Rosters</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1.25rem', borderRadius: '18px' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10b981' }}>330+ Tiers</div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>Collab T3, Mythic T2 & OGs</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '1.25rem', borderRadius: '18px' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ec4899' }}>Zero Dupe</div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>Anti-Exploit Standard</div>
          </div>
        </div>
      </div>

      {/* ━━━━ STAFF & LEADERSHIP ROSTER ━━━━ */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#ffcc00', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
            VERIFIED PLATFORM ADMINISTRATION
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', margin: 0 }}>
            Leadership & <span style={{ color: 'var(--primary-gold)' }}>Staff Roster</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.4rem' }}>
            Meet the dedicated team managing live pricing, Wiki sync engines, and community market safeguards.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          {/* Creator Card */}
          <div
            className="glass-card"
            style={{
              padding: '2.25rem',
              borderRadius: '22px',
              border: '1px solid rgba(255, 204, 0, 0.45)',
              background: 'linear-gradient(135deg, rgba(255, 204, 0, 0.08) 0%, rgba(10, 11, 16, 0.85) 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #ffcc00, #ff9100)',
                  color: '#000',
                  fontSize: '1.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(255, 204, 0, 0.4)',
                }}
              >
                👑
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: 0 }}>Owner_Admin</h3>
                  <span style={{ background: '#ffcc00', color: '#000', fontSize: '0.72rem', fontWeight: 900, padding: '2px 8px', borderRadius: '5px' }}>
                    OWNER
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#ffcc00', fontWeight: 800, marginTop: '2px' }}>
                  Lead Developer & Platform Creator
                </div>
              </div>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Oversees platform architecture, Wiki automated crawlers, Collab sync algorithms, and core site security.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '5px 12px', borderRadius: '8px', color: '#cbd5e1' }}>
                🎮 Roblox: <strong style={{ color: '#00e5ff' }}>BGS_Owner_Official</strong>
              </span>
              <span style={{ fontSize: '0.8rem', background: 'rgba(255, 204, 0, 0.12)', border: '1px solid rgba(255, 204, 0, 0.3)', padding: '5px 12px', borderRadius: '8px', color: '#ffcc00', fontWeight: 800 }}>
                👑 Root Access
              </span>
            </div>
          </div>

          {/* Head Moderator Card */}
          <div
            className="glass-card"
            style={{
              padding: '2.25rem',
              borderRadius: '22px',
              border: '1px solid rgba(124, 58, 237, 0.45)',
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(10, 11, 16, 0.85) 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#fff',
                  fontSize: '1.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
                }}
              >
                🛡️
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: 0 }}>Staff_Mod</h3>
                  <span style={{ background: '#7c3aed', color: '#fff', fontSize: '0.72rem', fontWeight: 900, padding: '2px 8px', borderRadius: '5px' }}>
                    MODERATOR
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#a78bfa', fontWeight: 800, marginTop: '2px' }}>
                  Head Community & Market Moderator
                </div>
              </div>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Manages user verification, marketplace dispute resolutions, scam report audits, and community standards.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '5px 12px', borderRadius: '8px', color: '#cbd5e1' }}>
                🎮 Roblox: <strong style={{ color: '#00e5ff' }}>Staff_Mod_Roblox</strong>
              </span>
              <span style={{ fontSize: '0.8rem', background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.3)', padding: '5px 12px', borderRadius: '8px', color: '#a78bfa', fontWeight: 800 }}>
                🛡️ Staff Mod
              </span>
            </div>
          </div>

          {/* Community Council Card */}
          <div
            className="glass-card"
            style={{
              padding: '2.25rem',
              borderRadius: '22px',
              border: '1px solid rgba(0, 229, 255, 0.45)',
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08) 0%, rgba(10, 11, 16, 0.85) 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #00e5ff, #00b0ff)',
                  color: '#000',
                  fontSize: '1.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(0, 229, 255, 0.4)',
                }}
              >
                🤝
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: 0 }}>Community Council</h3>
                  <span style={{ background: '#00e5ff', color: '#000', fontSize: '0.72rem', fontWeight: 900, padding: '2px 8px', borderRadius: '5px' }}>
                    COUNCIL
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#00e5ff', fontWeight: 800, marginTop: '2px' }}>
                  Top Traders & Market Analysts
                </div>
              </div>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Senior in-game traders providing daily completed trade proof, verifying demand trends, and reviewing price fluctuations.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '5px 12px', borderRadius: '8px', color: '#10b981', fontWeight: 800 }}>
                🟢 Verified Active
              </span>
              <span style={{ fontSize: '0.8rem', background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '5px 12px', borderRadius: '8px', color: '#cbd5e1' }}>
                💬 Community Driven
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━ PLATFORM PILLARS & GUARANTEES ━━━━ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', marginBottom: '3.5rem' }}>
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255, 204, 0, 0.3)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255, 204, 0, 0.12)', border: '1px solid rgba(255, 204, 0, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Zap size={22} color="#ffcc00" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '0.6rem' }}>
            Direct Collab Synchronization
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            Every trade value is directly matched with the BGS Collab Value List. Pets without an official trade listing are strictly marked N/A to prevent fake market inflation.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.12)', border: '1px solid rgba(0, 229, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Compass size={22} color="#00e5ff" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '0.6rem' }}>
            Fandom Wiki & Lua Stat Verification
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            All pet multipliers, bubbles/coins/gems stat formulas, egg hatch probabilities, and official 3D models are verified against the official BGS game code.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236, 72, 153, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <ShieldCheck size={22} color="#ec4899" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '0.6rem' }}>
            Zero-Dupe Integrity Protocol
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            Exploited, cloned, and duplicated items from legacy game vulnerabilities are strictly excluded from our databases to safeguard player trade values.
          </p>
        </div>
      </div>
    </div>
  );
}

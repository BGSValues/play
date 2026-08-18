import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Scale,
  TrendingUp,
  Sparkles,
  Zap,
  Layers,
  ShieldAlert,
  Gamepad2,
  Lock,
  Globe,
  Database,
  HeartHandshake,
  Star,
} from 'lucide-react';
import DemandSystemChart from './DemandSystemChart';

export default function Guides() {
  const [activeSection, setActiveSection] = useState('about'); // 'about' | 'sources' | 'rules' | 'stsc'

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1.5rem 5rem 1.5rem' }}>
      {/* ━━━━ HERO BANNER ━━━━ */}
      <div
        className="glass-card"
        style={{
          padding: '3rem 2.5rem',
          textAlign: 'center',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.25) 0%, rgba(10, 11, 16, 0.95) 75%)',
          border: '1px solid rgba(124, 58, 237, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 229, 255, 0.12)',
            border: '1px solid rgba(0, 229, 255, 0.35)',
            color: '#00e5ff',
            padding: '0.45rem 1.2rem',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: 800,
            marginBottom: '1.25rem',
            letterSpacing: '0.5px',
          }}
        >
          <ShieldCheck size={16} /> #1 OFFICIAL VERIFIED BUBBLE GUM SIMULATOR TRADING HUB
        </div>

        <h1 style={{ fontSize: '2.6rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem', lineHeight: 1.2 }}>
          Trusted By Thousands Of <span style={{ color: 'var(--primary-gold)' }}>BGS Traders</span> Worldwide
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '780px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
          The highest standard for Bubble Gum Simulator item values, real-time demand metrics, hatch counts, and verified player trades — backed directly by the <strong>BGS Collab Value List</strong> and <strong>Official Fandom Wiki</strong>.
        </p>

        {/* TRUST METRICS STRIP */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            maxWidth: '960px',
            margin: '0 auto',
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-gold)' }}>1,530+</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Clean Verified Items</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00e5ff' }}>100%</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Accurate Collab Sync</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>0 – 11</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Official Demand Scale</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ff007f' }}>Zero Dupe</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Anti-Exploit Values</div>
          </div>
        </div>
      </div>

      {/* ━━━━ NAVIGATION TABS ━━━━ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          className="filter-btn"
          onClick={() => setActiveSection('about')}
          style={{
            background: activeSection === 'about' ? 'var(--primary-gold)' : 'rgba(255,255,255,0.03)',
            color: activeSection === 'about' ? '#000' : '#fff',
            fontWeight: 900,
            padding: '0.75rem 1.4rem',
            border: activeSection === 'about' ? '1px solid var(--primary-gold)' : '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Users size={17} /> About Us & Staff Team
        </button>

        <button
          className="filter-btn"
          onClick={() => setActiveSection('sources')}
          style={{
            background: activeSection === 'sources' ? 'var(--primary-gold)' : 'rgba(255,255,255,0.03)',
            color: activeSection === 'sources' ? '#000' : '#fff',
            fontWeight: 900,
            padding: '0.75rem 1.4rem',
            border: activeSection === 'sources' ? '1px solid var(--primary-gold)' : '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Database size={17} /> Trusted Data Sources
        </button>

        <button
          className="filter-btn"
          onClick={() => setActiveSection('stsc')}
          style={{
            background: activeSection === 'stsc' ? 'var(--primary-gold)' : 'rgba(255,255,255,0.03)',
            color: activeSection === 'stsc' ? '#000' : '#fff',
            fontWeight: 900,
            padding: '0.75rem 1.4rem',
            border: activeSection === 'stsc' ? '1px solid var(--primary-gold)' : '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Scale size={17} /> STSC & Demand Guide
        </button>

        <button
          className="filter-btn"
          onClick={() => setActiveSection('rules')}
          style={{
            background: activeSection === 'rules' ? 'var(--primary-gold)' : 'rgba(255,255,255,0.03)',
            color: activeSection === 'rules' ? '#000' : '#fff',
            fontWeight: 900,
            padding: '0.75rem 1.4rem',
            border: activeSection === 'rules' ? '1px solid var(--primary-gold)' : '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldAlert size={17} /> Anti-Scam & Fair Trade
        </button>
      </div>

      {/* ━━━━ SECTION 1: ABOUT US & STAFF TEAM ━━━━ */}
      {activeSection === 'about' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#fff' }}>
              Meet The <span style={{ color: 'var(--primary-gold)' }}>Leadership & Staff</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              The dedicated team managing values, real-time market balances, and platform security.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {/* Owner Profile Card */}
            <div
              className="glass-card"
              style={{
                padding: '2rem',
                border: '1px solid rgba(255, 204, 0, 0.4)',
                background: 'linear-gradient(180deg, rgba(255, 204, 0, 0.08) 0%, rgba(10, 11, 16, 0.95) 100%)',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#ffcc00', color: '#000', padding: '4px 10px', borderRadius: '8px', fontWeight: 900, fontSize: '0.75rem' }}>
                👑 FOUNDER & OWNER
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ffcc00', color: '#000', fontSize: '1.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255,204,0,0.4)' }}>
                  👑
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>Owner_Admin</h3>
                  <div style={{ color: '#ffcc00', fontSize: '0.85rem', fontWeight: 800 }}>Lead Developer & Systems Architect</div>
                </div>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Oversees platform infrastructure, database synchronization, database security protocols, and ensures all trade metrics adhere strictly to true market consensus.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>🎮 Roblox: <strong>BGS_Owner_Official</strong></span>
                <span style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>🛡️ Root Permissions</span>
              </div>
            </div>

            {/* Head Moderator Card */}
            <div
              className="glass-card"
              style={{
                padding: '2rem',
                border: '1px solid rgba(124, 58, 237, 0.4)',
                background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.08) 0%, rgba(10, 11, 16, 0.95) 100%)',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#7c3aed', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontWeight: 900, fontSize: '0.75rem' }}>
                🛡️ HEAD MODERATOR
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#7c3aed', color: '#fff', fontSize: '1.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
                  🛡️
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>Staff_Mod</h3>
                  <div style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 800 }}>Head Value Curator & Safety Lead</div>
                </div>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Manages real-time market reports, verifies trade listings, enforces anti-scam measures, and cross-audits daily pet stability trends across all categories.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>🎮 Roblox: <strong>Staff_Mod_Roblox</strong></span>
                <span style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>⚔️ Trade Moderator</span>
              </div>
            </div>

            {/* Community Traders Tier */}
            <div
              className="glass-card"
              style={{
                padding: '2rem',
                border: '1px solid rgba(0, 229, 255, 0.4)',
                background: 'linear-gradient(180deg, rgba(0, 229, 255, 0.08) 0%, rgba(10, 11, 16, 0.95) 100%)',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#00e5ff', color: '#000', padding: '4px 10px', borderRadius: '8px', fontWeight: 900, fontSize: '0.75rem' }}>
                🌟 VERIFIED TRADERS
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#00e5ff', color: '#000', fontSize: '1.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,229,255,0.4)' }}>
                  🤝
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>Community Council</h3>
                  <div style={{ color: '#00e5ff', fontSize: '0.85rem', fontWeight: 800 }}>Active Players & Market Contributors</div>
                </div>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                All registered and verified players actively trading on our Marketplace and Calculator. Community feedback and real trade proof continuously validate market accuracy.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>✅ Verified Trader Badge</span>
                <span style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>💬 Discord Connected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━ SECTION 2: TRUSTED DATA SOURCES ━━━━ */}
      {activeSection === 'sources' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#fff' }}>
              Official <span style={{ color: '#00e5ff' }}>Data Sources & Integrity</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              How our platform guarantees 100% authentic, non-duped, and mathematically verified values.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem', marginBottom: '3rem' }}>
            {/* Collab Source */}
            <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255, 204, 0, 0.35)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 204, 0, 0.15)', color: '#ffcc00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scale size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0 }}>BGS Collab Value List</h3>
                  <span style={{ color: '#ffcc00', fontSize: '0.8rem', fontWeight: 700 }}>Primary Market Pricing & Demand Authority</span>
                </div>
              </div>

              <ul style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, paddingLeft: '1.2rem', margin: 0 }}>
                <li><strong>Clean Non-Duped Values:</strong> Every listed value is based on authentic, un-duped trade market transactions.</li>
                <li><strong>STSC Secret Standards:</strong> Strict adherence to the standard Secret Pets unit values (The Overlord = 50, Soul Heart = 7,000).</li>
                <li><strong>0 – 11 Demand System:</strong> Real-time demand scores reflecting exact player willingness to trade.</li>
                <li><strong>Verified Hatched Counts:</strong> Precise tracking of Normal (🥚), Shiny (✨), and Mythic (⚡) hatched quantities.</li>
              </ul>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <a
                  href="https://sites.google.com/view/bgs-collab-value-list/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ffcc00', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none' }}
                >
                  <ExternalLink size={15} /> Visit BGS Collab Value List
                </a>
              </div>
            </div>

            {/* Wiki Source */}
            <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(0, 229, 255, 0.35)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0 }}>Bubble Gum Simulator Fandom Wiki</h3>
                  <span style={{ color: '#00e5ff', fontSize: '0.8rem', fontWeight: 700 }}>In-Game Metadata & Technical Multipliers</span>
                </div>
              </div>

              <ul style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, paddingLeft: '1.2rem', margin: 0 }}>
                <li><strong>Lua Game Module Stats:</strong> Accurate Bubble, Coin, Gem, and Star in-game multipliers directly from game files.</li>
                <li><strong>Drop Rates & Odds:</strong> Exact egg hatching percentages (e.g. <em>1 in 15M (0.00000667%)</em> for Godly Shamrock).</li>
                <li><strong>Movement Physics:</strong> Accurate 🦅 Flying vs 🐾 Walking classifications.</li>
                <li><strong>Authentic Renders:</strong> High-resolution transparent PNG artwork for all 1,530+ pets and hats.</li>
              </ul>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <a
                  href="https://bubble-gum-simulator.fandom.com/wiki/Bubble_Gum_Simulator_Wiki"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#00e5ff', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none' }}
                >
                  <ExternalLink size={15} /> Visit Official BGS Fandom Wiki
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━ SECTION 3: STSC & DEMAND GUIDE ━━━━ */}
      {activeSection === 'stsc' && (
        <div>
          {/* Official BGS Demand System Chart Banner */}
          <DemandSystemChart />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {/* Card 1: How STSC Works */}
            <div className="glass-card" style={{ border: '1px solid rgba(0, 229, 255, 0.3)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Scale size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#00e5ff' }}>1. How STSC Works</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                <strong>STSC</strong> = Secret to Shinies Conversions (The Universal BGS Standard):
              </p>
              <ul style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, paddingLeft: '1.2rem', margin: 0 }}>
                <li><strong style={{ color: '#00e5ff' }}>⚡ Secret Value:</strong> Item valuation in Secret Units (e.g. <em>The Overlord = 50</em>, <em>Luminance = 3,000</em>, <em>Soul Heart = 7,000</em>).</li>
                <li><strong style={{ color: '#ffcc00' }}>⭐ Normal Value:</strong> Valuation in regular Shiny Tier-3s or limiteds.</li>
                <li><strong style={{ color: '#a78bfa' }}>Ratio:</strong> 1 Secret Unit roughly equals 200 - 250 in Shiny T3 limited value.</li>
              </ul>
            </div>

            {/* Card 2: 0 - 11 Demand System */}
            <div className="glass-card" style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <TrendingUp size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#10b981' }}>2. Official Demand (0 – 11 Scale)</h3>
              <ul style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, paddingLeft: '1.2rem', margin: 0 }}>
                <li><strong>0 / 11:</strong> Uncirculated or 0 in known existence.</li>
                <li><strong>1 – 3 / 11:</strong> Terrible / Low demand (demands underpays).</li>
                <li><strong>4 – 6 / 11:</strong> Average / Decent market liquidity.</li>
                <li><strong>7 – 9 / 11:</strong> High / Fast-moving demand.</li>
                <li><strong>10 / 11:</strong> Maximum standard trade demand.</li>
                <li><strong>11 / 11:</strong> <span style={{ color: '#ff007f', fontWeight: 900 }}>HYPED</span> (Peak hype new release).</li>
              </ul>
            </div>

            {/* Card 3: Variant Multipliers */}
            <div className="glass-card" style={{ border: '1px solid rgba(185, 103, 255, 0.3)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(185, 103, 255, 0.15)', color: '#b967ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#b967ff' }}>3. Variant Multipliers</h3>
              <ul style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, paddingLeft: '1.2rem', margin: 0 }}>
                <li><strong>Normal Variant:</strong> Base Secret Value (<strong>1.0x</strong>).</li>
                <li><strong>Shiny Variant:</strong> <strong>2.5x</strong> (or exact listed Collab shiny value).</li>
                <li><strong>Mythic Variant:</strong> <strong>10.0x</strong> base value.</li>
                <li><strong>Shiny Mythic (S.Myth):</strong> <strong>25.0x</strong> base value!</li>
                <li><em style={{ color: '#a78bfa' }}>Hats do not have variant multipliers.</em></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━ SECTION 4: ANTI-SCAM & FAIR TRADE RULES ━━━━ */}
      {activeSection === 'rules' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="glass-card" style={{ border: '1px solid rgba(255, 23, 68, 0.35)', padding: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 23, 68, 0.15)', color: '#ff1744', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldAlert size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ff1744', marginBottom: '0.75rem' }}>1. Avoid Dupe Exploits</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Mass-duping occurred in 2022. Our values only track <strong>100% clean items</strong>. Never accept unverified pets or suspicious underpays in public trade servers.
            </p>
          </div>

          <div className="glass-card" style={{ border: '1px solid rgba(0, 229, 255, 0.35)', padding: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <CheckCircle2 size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#00e5ff', marginBottom: '0.75rem' }}>2. Always Double-Check Trade Calculator</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Use our live <strong>Trade Calculator</strong> to simulate both trade sides before accepting. The calculator factors in demand and stability to indicate <strong>Big Win (BW)</strong>, <strong>Fair (F)</strong>, or <strong>Big Lose (BL)</strong>.
            </p>
          </div>

          <div className="glass-card" style={{ border: '1px solid rgba(255, 204, 0, 0.35)', padding: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 204, 0, 0.15)', color: '#ffcc00', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Lock size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffcc00', marginBottom: '0.75rem' }}>3. Verified Account Security</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Keep your Roblox username and Discord tag updated in your <strong>Account Settings</strong>. Never share your password or security PINs with anyone.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

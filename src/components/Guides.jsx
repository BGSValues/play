import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  HelpCircle,
  FileText,
  AlertOctagon,
  BarChart3,
  Cpu,
} from 'lucide-react';
import DemandSystemChart from './DemandSystemChart';

export default function Guides({ initialSection = 'about' }) {
  const [activeSection, setActiveSection] = useState(initialSection || 'about');

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const navTabs = [
    { id: 'about', label: 'Leadership & Staff', icon: Users, color: '#ffcc00' },
    { id: 'changelog', label: 'Live Sync & Patch Notes', icon: Sparkles, color: '#10b981' },
    { id: 'stsc', label: 'STSC & Demand Guide', icon: Scale, color: '#00e5ff' },
    { id: 'methodology', label: 'Valuation Methodology', icon: BarChart3, color: '#a78bfa' },
    { id: 'rules', label: 'Anti-Scam & Fair Trade', icon: ShieldCheck, color: '#10b981' },
    { id: 'faq', label: 'FAQ & Help', icon: HelpCircle, color: '#f472b6' },
    { id: 'privacy', label: 'Privacy Policy', icon: Lock, color: '#38bdf8' },
    { id: 'terms', label: 'Terms of Service', icon: FileText, color: '#fb923c' },
    { id: 'dupe', label: 'Zero-Dupe Policy', icon: AlertOctagon, color: '#ff007f' },
  ];

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '1rem 1.5rem 5rem 1.5rem' }}>
      {/* ━━━━ HERO SHOWCASE BANNER WITH ANIMATED AURA ━━━━ */}
      <div
        className="glass-card"
        style={{
          padding: '3.5rem 2rem',
          textAlign: 'center',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '24px',
          background: 'radial-gradient(ellipse at 50% -20%, rgba(124, 58, 237, 0.35) 0%, rgba(0, 229, 255, 0.1) 45%, rgba(6, 7, 11, 0.95) 85%)',
          border: '1px solid rgba(124, 58, 237, 0.4)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Glowing Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(124, 58, 237, 0.15))',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            color: '#00e5ff',
            padding: '0.5rem 1.4rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 900,
            marginBottom: '1.25rem',
            letterSpacing: '0.6px',
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)',
          }}
        >
          <Sparkles size={16} color="#00e5ff" /> #1 OFFICIAL VERIFIED BUBBLE GUM SIMULATOR PLATFORM
        </div>

        {/* Large Gradient Title */}
        <h1
          style={{
            fontSize: '2.8rem',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '1rem',
            lineHeight: 1.15,
            letterSpacing: '-0.5px',
          }}
        >
          Community <span style={{ color: 'var(--primary-gold)' }}>Guides & Knowledge</span> Hub
        </h1>

        <p
          style={{
            color: '#94a3b8',
            fontSize: '1.05rem',
            maxWidth: '740px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.7,
          }}
        >
          Master the Bubble Gum Simulator economy. Explore verified staff credentials, the official 0–11 demand scale, anti-scam protection protocols, and real-time live market consensus mechanics.
        </p>

        {/* Animated Metrics Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '1.25rem',
            maxWidth: '960px',
            margin: '0 auto',
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 204, 0, 0.3)', borderRadius: '16px', padding: '1.2rem', transition: 'all 0.25s ease' }}>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--primary-gold)' }}>1,530+</div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700, marginTop: '2px' }}>Clean Verified Items</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '16px', padding: '1.2rem', transition: 'all 0.25s ease' }}>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#00e5ff' }}>100%</div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700, marginTop: '2px' }}>Real-Time Consensus</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '1.2rem', transition: 'all 0.25s ease' }}>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#10b981' }}>0 – 11</div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700, marginTop: '2px' }}>Official Demand Scale</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 0, 127, 0.3)', borderRadius: '16px', padding: '1.2rem', transition: 'all 0.25s ease' }}>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#ff007f' }}>Zero Dupe</div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700, marginTop: '2px' }}>Anti-Exploit Values</div>
          </div>
        </div>
      </div>

      {/* ━━━━ SEGMENTED HIGH-TECH DOCK NAVIGATION ━━━━ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.6rem',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
        }}
      >
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              style={{
                background: isActive ? `linear-gradient(135deg, ${tab.color}22, rgba(10, 11, 16, 0.95))` : 'rgba(255, 255, 255, 0.02)',
                color: isActive ? '#fff' : '#94a3b8',
                border: isActive ? `1.5px solid ${tab.color}` : '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '0.65rem 1.15rem',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? `0 8px 25px ${tab.color}33` : 'none',
              }}
            >
              <Icon size={16} color={isActive ? tab.color : '#64748b'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ━━━━ SECTION CONTENT DISPLAY WITH ANIMATED ENTRANCE ━━━━ */}
      <div key={activeSection} className="guide-section-fade">
        {/* ============================================================== */}
        {/* SECTION 1: LEADERSHIP & STAFF ROSTER                          */}
        {/* ============================================================== */}
        {activeSection === 'about' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
                Meet The <span style={{ color: 'var(--primary-gold)' }}>Leadership & Staff</span>
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                The dedicated team managing values, real-time market balances, and platform security.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
              {/* Staff 1: Owner & Lead Architect */}
              <div className="holo-staff-card" style={{ border: '1px solid rgba(255, 204, 0, 0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #ffcc00, #ff9100)',
                      color: '#000',
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(255, 204, 0, 0.35)',
                    }}
                  >
                    👑
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0 }}>Owner_Admin</h3>
                      <span style={{ background: '#ffcc00', color: '#000', fontSize: '0.68rem', fontWeight: 900, padding: '2px 6px', borderRadius: '5px', textTransform: 'uppercase' }}>
                        OWNER
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#ffcc00', fontWeight: 800, marginTop: '2px' }}>
                      Lead Developer & Platform Creator
                    </div>
                  </div>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                  Lead developer and platform creator.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '3px 8px', borderRadius: '6px', color: '#94a3b8' }}>
                    🎮 Roblox: <strong>BGS_Owner_Official</strong>
                  </span>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(255, 204, 0, 0.1)', border: '1px solid rgba(255, 204, 0, 0.3)', padding: '3px 8px', borderRadius: '6px', color: '#ffcc00', fontWeight: 800 }}>
                    👑 Creator
                  </span>
                </div>
              </div>

              {/* Staff 2: Head Moderator & Curator */}
              <div className="holo-staff-card" style={{ border: '1px solid rgba(124, 58, 237, 0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                      color: '#fff',
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(124, 58, 237, 0.35)',
                    }}
                  >
                    🛡️
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0 }}>Staff_Mod</h3>
                      <span style={{ background: '#7c3aed', color: '#fff', fontSize: '0.68rem', fontWeight: 900, padding: '2px 6px', borderRadius: '5px', textTransform: 'uppercase' }}>
                        MODERATOR
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 800, marginTop: '2px' }}>
                      Head Community Moderator
                    </div>
                  </div>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                  Community manager and platform moderator.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '3px 8px', borderRadius: '6px', color: '#94a3b8' }}>
                    🎮 Roblox: <strong>Staff_Mod_Roblox</strong>
                  </span>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.3)', padding: '3px 8px', borderRadius: '6px', color: '#a78bfa', fontWeight: 800 }}>
                    🛡️ Moderator
                  </span>
                </div>
              </div>

              {/* Staff 3: Community Council */}
              <div className="holo-staff-card" style={{ border: '1px solid rgba(0, 229, 255, 0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #00e5ff, #00b0ff)',
                      color: '#000',
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(0, 229, 255, 0.35)',
                    }}
                  >
                    🤝
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0 }}>Community Council</h3>
                      <span style={{ background: '#00e5ff', color: '#000', fontSize: '0.68rem', fontWeight: 900, padding: '2px 6px', borderRadius: '5px', textTransform: 'uppercase' }}>
                        COMMUNITY
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#00e5ff', fontWeight: 800, marginTop: '2px' }}>
                      Verified Community Members
                    </div>
                  </div>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                  Active players and community trading members.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 8px', borderRadius: '6px', color: '#10b981', fontWeight: 800 }}>
                    🟢 Verified Member
                  </span>
                  <span style={{ fontSize: '0.75rem', background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '3px 8px', borderRadius: '6px', color: '#94a3b8' }}>
                    💬 Community
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: LIVE SYNC & PATCH NOTES                               */}
        {/* ============================================================== */}
        {activeSection === 'changelog' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
                Live <span style={{ color: '#10b981' }}>Sync Feed & Patch Notes</span>
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                Continuous automated synchronization logs from the BGS Wiki, Lua Game Data, and Collab Value List.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1000px', margin: '0 auto' }}>
              {/* Event 1: Wiki & Lua Stats Engine */}
              <div className="glass-card" style={{ padding: '1.75rem', border: '1px solid rgba(0, 229, 255, 0.3)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, background: 'rgba(0, 229, 255, 0.12)', border: '1px solid rgba(0, 229, 255, 0.3)', color: '#00e5ff', padding: '3px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                    🔄 REAL-TIME AUTO-SYNC ENGINE
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700 }}>Auto-Refreshing Every 30s</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
                  1,575 In-Game Items & 144 Eggs Active
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  Whenever a new pet or egg is added to Bubble Gum Simulator, our background worker automatically extracts its 3D model, hatch probabilities, and multiplier stats directly from the Fandom Wiki and game Lua modules.
                </p>
              </div>

              {/* Event 2: Collab List Reconciliation */}
              <div className="glass-card" style={{ padding: '1.75rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '3px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                    📈 COLLAB VALUE SYNCHRONIZATION
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700 }}>2026 Trading Consensus</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
                  Strict Collab Pricing Alignment & N/A Flagging
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  All pet prices and demand ratings are matched with genuine entries on the BGS Collab Value List. If a pet does not have an active Collab trade listing, its value is strictly shown as <strong>N/A (—)</strong> to ensure 100% genuine market transparency.
                </p>
              </div>

              {/* Event 3: 144 Official Egg Models */}
              <div className="glass-card" style={{ padding: '1.75rem', border: '1px solid rgba(255, 204, 0, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, background: 'rgba(255, 204, 0, 0.12)', border: '1px solid rgba(255, 204, 0, 0.3)', color: '#ffcc00', padding: '3px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                    🥚 144 IN-GAME EGG ROSTERS
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700 }}>Complete 3D In-Game Models</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
                  Full Secret & Legendary Hatch Manifests
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  Every egg card (Alien Egg, Hellish Egg, 1B Egg, Vacation Egg, Cosmic Egg) now links directly to verified 3D game models and displays all hatchable secrets with exact drop chances.
                </p>
              </div>

              {/* Event 4: Zero Dupe Policy */}
              <div className="glass-card" style={{ padding: '1.75rem', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, background: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236, 72, 153, 0.3)', color: '#ec4899', padding: '3px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                    🛡️ ZERO-DUPE & REPUTATION ENGINE
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700 }}>Clean Economy Standard</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
                  Clean Database Audit
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  Purged scraped wiki table comments, thread artifacts, and duplicate entries. All values reflect clean, un-duped items to preserve true collector worth.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 2: STSC & DEMAND GUIDE                                */}
        {/* ============================================================== */}
        {activeSection === 'stsc' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
                Official <span style={{ color: '#00e5ff' }}>BGS Demand & STSC</span> System
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                Understanding how demand tiers and stability trends dictate fair trade values.
              </p>
            </div>

            {/* Official Demand System Chart Recreated */}
            <div style={{ marginBottom: '2.5rem' }}>
              <DemandSystemChart />
            </div>

            {/* Explanatory Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255, 204, 0, 0.3)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffcc00', marginBottom: '0.75rem' }}>
                  What is STSC?
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7 }}>
                  <strong>STSC</strong> stands for <em>Secret Trade Stability & Consensus</em>. In Bubble Gum Simulator, raw secret values fluctuate according to how easily players can trade them. High-demand pets often trade at significant overpays.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#00e5ff', marginBottom: '0.75rem' }}>
                  The 0–11 Demand Scale
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7 }}>
                  Each item is rated from <strong>1/11 (Garbage)</strong> up to <strong>11/11 (Hyped)</strong>. Items with <strong>10/11 Extreme</strong> or <strong>11/11 Hyped</strong> demand command massive premiums in marketplace deals.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981', marginBottom: '0.75rem' }}>
                  Stability Indicators
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7 }}>
                  <strong>⬆⬆ Rising Fast</strong>, <strong>↔ Stable</strong>, <strong>🔄 Unstable</strong>, and <strong>⬇ Dropping</strong>. Use stability symbols in conjunction with the Trade Calculator to avoid trading for depreciating pets.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 3: VALUATION METHODOLOGY                              */}
        {/* ============================================================== */}
        {activeSection === 'methodology' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
                Proprietary <span style={{ color: '#a78bfa' }}>Valuation Methodology</span>
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                How our automated indexing engine and expert curators maintain 100% accurate market pricing.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2.25rem', border: '1px solid rgba(255, 204, 0, 0.35)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255, 204, 0, 0.15)', color: '#ffcc00', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Cpu size={26} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>1. Real-Time Deal Aggregation</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7 }}>
                  Every completed trade on our Marketplace is indexed. Value ratios between traded secrets, shinies, and mythics are dynamically calculated to reflect current player demand.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2.25rem', border: '1px solid rgba(0, 229, 255, 0.35)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Layers size={26} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>2. Supply & Existence Auditing</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7 }}>
                  Exact egg hatch existence counts for Normal, Shiny, Mythic, and Shiny Mythic variants are cross-referenced to identify genuine scarcity and supply constraints.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2.25rem', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <ShieldCheck size={26} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>3. Expert Curator Consensus</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7 }}>
                  Veteran trading curators review market fluctuations daily. Values are adjusted in real time to prevent artificial inflation and market manipulation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 4: ANTI-SCAM & FAIR TRADE                              */}
        {/* ============================================================== */}
        {activeSection === 'rules' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
                Anti-Scam & <span style={{ color: '#10b981' }}>Fair Trading Protocols</span>
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                Essential guidelines to trade safely and protect your inventory.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              <div className="glass-card" style={{ border: '1px solid rgba(255, 23, 68, 0.35)', padding: '2rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 23, 68, 0.15)', color: '#ff1744', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <ShieldAlert size={26} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ff1744', marginBottom: '0.75rem' }}>1. Avoid Dupe Exploits</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Mass-duping occurred in 2022. Our values only track <strong>100% clean items</strong>. Never accept unverified pets or suspicious underpays in public trade servers.
                </p>
              </div>

              <div className="glass-card" style={{ border: '1px solid rgba(0, 229, 255, 0.35)', padding: '2rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <CheckCircle2 size={26} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#00e5ff', marginBottom: '0.75rem' }}>2. Use Live Trade Calculator</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Use our live <strong>Trade Calculator</strong> to simulate both trade sides before accepting. The calculator factors in demand and stability to indicate <strong>Big Win (BW)</strong>, <strong>Fair (F)</strong>, or <strong>Big Lose (BL)</strong>.
                </p>
              </div>

              <div className="glass-card" style={{ border: '1px solid rgba(255, 204, 0, 0.35)', padding: '2rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 204, 0, 0.15)', color: '#ffcc00', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Lock size={26} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffcc00', marginBottom: '0.75rem' }}>3. Verified Account Security</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Keep your Roblox username and Discord tag updated in your <strong>Account Settings</strong>. Never share your password or security PINs with anyone.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 5: FAQ & HELP CENTER                                  */}
        {/* ============================================================== */}
        {activeSection === 'faq' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
                Frequently Asked <span style={{ color: '#f472b6' }}>Questions</span>
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                Everything you need to know about BGS Values and trading.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255, 204, 0, 0.3)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffcc00', marginBottom: '0.75rem' }}>❓ How are Pet Values Determined?</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  All values are determined through real-time trade aggregation, verified player deal records, and daily market stability reviews by our valuation team.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#00e5ff', marginBottom: '0.75rem' }}>❓ What is the 0–11 Demand System?</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  The demand scale rates how easily an item can be traded from <strong>1 (Garbage)</strong> up to <strong>11 (Hyped)</strong> based on player trade frequency.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10b981', marginBottom: '0.75rem' }}>❓ How Does the Trade Calculator Work?</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Select items for Side A and Side B to see instant value totals, variant multipliers, and fair trade ratings (Win, Fair, Lose).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 6: PRIVACY POLICY                                     */}
        {/* ============================================================== */}
        {activeSection === 'privacy' && (
          <div className="glass-card" style={{ padding: '3rem', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00e5ff', marginBottom: '1rem' }}>Privacy Policy</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Last updated: 2026</p>
            <div style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p>
                At <strong>BGS Values</strong>, your privacy is our top priority. We only collect the minimal information necessary to deliver verified peer-to-peer trading capabilities and value listings.
              </p>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>1. Information We Collect</h4>
              <p>
                When you create an account, we store your chosen username, Roblox handle, optional Discord tag, and trade listing preferences. We never ask for, collect, or store your Roblox passwords or billing details.
              </p>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>2. How Information is Used</h4>
              <p>
                Account data is exclusively used to enable trade offer negotiations, marketplace listing moderation, and account reputation badges. We do not sell or monetize personal user data to third parties.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 7: TERMS OF SERVICE                                   */}
        {/* ============================================================== */}
        {activeSection === 'terms' && (
          <div className="glass-card" style={{ padding: '3rem', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#a78bfa', marginBottom: '1rem' }}>Terms of Service</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Last updated: 2026</p>
            <div style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p>
                By accessing or using <strong>BGS Values</strong>, you agree to comply with all community trading standards and Roblox platform terms.
              </p>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>1. Fair Market Conduct</h4>
              <p>
                Users agree not to engage in phishing, trade scams, price manipulation, cross-trading prohibited by Roblox terms, or posting misleading trade offers.
              </p>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>2. Third-Party Disclaimer</h4>
              <p>
                BGS Values is an independent community platform. All in-game intellectual properties and assets are the property of their respective creators.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 8: ZERO DUPE POLICY                                   */}
        {/* ============================================================== */}
        {activeSection === 'dupe' && (
          <div className="glass-card" style={{ padding: '3rem', border: '1px solid rgba(255, 0, 127, 0.35)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ff007f', marginBottom: '1rem' }}>Clean & Non-Duped Value Policy</h2>
            <div style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p>
                In 2022, mass-duplication exploits affected various legacy pets in Bubble Gum Simulator. <strong>BGS Values maintains a strict zero-dupe valuation standard.</strong>
              </p>
              <p>
                Every trade value, demand tier, and hatch count listed on our platform tracks <strong>100% clean, un-duped items</strong> to protect collectors and active traders from manipulated prices.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

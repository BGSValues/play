import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Scale,
  TrendingUp,
  Sparkles,
  Zap,
  Layers,
  HelpCircle,
  AlertOctagon,
  BarChart3,
  BookOpen,
  ChevronRight,
  Award,
  Activity,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import DemandSystemChart from './DemandSystemChart';

export default function Guides({ initialSection = 'stsc' }) {
  const [activeSection, setActiveSection] = useState(initialSection === 'about' ? 'stsc' : initialSection || 'stsc');

  useEffect(() => {
    if (initialSection && initialSection !== 'about') {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const navTabs = [
    { id: 'stsc', label: 'STSC & Demand System', icon: Scale, color: '#00e5ff', desc: '0–11 trade demand tiers & market velocity' },
    { id: 'methodology', label: 'Valuation Methodology', icon: BarChart3, color: '#a78bfa', desc: 'How prices and multipliers are computed' },
    { id: 'rules', label: 'Anti-Scam & Safety Guide', icon: ShieldCheck, color: '#10b981', desc: 'Protection against trade scams & phishing' },
    { id: 'dupe', label: 'Zero-Dupe Policy', icon: AlertOctagon, color: '#ff007f', desc: '100% clean, non-exploited asset standards' },
    { id: 'changelog', label: 'Live Sync & Patch Notes', icon: Sparkles, color: '#ffcc00', desc: 'Automated 30s game synchronization feed' },
    { id: 'faq', label: 'FAQ & Help', icon: HelpCircle, color: '#f472b6', desc: 'Common questions and trade advice' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 1.5rem 5rem 1.5rem' }}>
      {/* ━━━━ HERO SHOWCASE BANNER ━━━━ */}
      <div
        className="glass-card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '24px',
          background: 'radial-gradient(ellipse at 50% -20%, rgba(0, 229, 255, 0.2) 0%, rgba(124, 58, 237, 0.12) 45%, rgba(6, 7, 11, 0.95) 85%)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(124, 58, 237, 0.15))',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            color: '#00e5ff',
            padding: '0.45rem 1.3rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 900,
            marginBottom: '1.25rem',
            letterSpacing: '0.6px',
          }}
        >
          <BookOpen size={16} color="#00e5ff" /> MASTER THE BGS TRADING ECONOMY
        </div>

        <h1
          style={{
            fontSize: '2.8rem',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '0.75rem',
            lineHeight: 1.15,
          }}
        >
          Trading & Valuation <span style={{ color: '#00e5ff' }}>Guides</span>
        </h1>

        <p
          style={{
            color: '#94a3b8',
            fontSize: '1.05rem',
            maxWidth: '720px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Explore the official 0–11 STSC demand system, transparent valuation models, scam prevention protocols, and real-time live consensus updates.
        </p>
      </div>

      {/* ━━━━ MODERN 2-COLUMN DASHBOARD LAYOUT ━━━━ */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Navigation Sidebar */}
        <div
          className="glass-card"
          style={{
            padding: '1.25rem',
            position: 'sticky',
            top: '90px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            borderRadius: '18px',
            border: '1px solid var(--glass-border)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', padding: '0.5rem 0.75rem', letterSpacing: '0.5px' }}>
            Guide Topics
          </div>

          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: isActive ? `1px solid ${tab.color}` : '1px solid transparent',
                  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: isActive ? '#fff' : '#cbd5e1',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 0 15px ${tab.color}33` : 'none',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: `${tab.color}1a`,
                    border: `1px solid ${tab.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color={tab.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isActive ? '#fff' : '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tab.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tab.desc}
                  </div>
                </div>
                <ChevronRight size={14} color={isActive ? tab.color : '#64748b'} />
              </button>
            );
          })}
        </div>

        {/* Right Dynamic Content Pane */}
        <div>
          {/* ============================================================== */}
          {/* 1. STSC & DEMAND SYSTEM                                        */}
          {/* ============================================================== */}
          {activeSection === 'stsc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <Scale size={26} color="#00e5ff" />
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                    Official STSC & <span style={{ color: '#00e5ff' }}>0–11 Demand System</span>
                  </h2>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.7, margin: '0 0 1.5rem 0' }}>
                  In Bubble Gum Simulator trading, value alone does not tell the full story. Demand dictates how rapidly and easily a pet can be traded at or above its listed price.
                </p>
                <DemandSystemChart />
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. VALUATION METHODOLOGY                                       */}
          {/* ============================================================== */}
          {activeSection === 'methodology' && (
            <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <BarChart3 size={26} color="#a78bfa" />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                  Valuation <span style={{ color: '#a78bfa' }}>Methodology</span>
                </h2>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                All base values on BGS Values strictly sync with community consensus recorded on the BGS Collab Value List.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div style={{ background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '1.25rem', borderRadius: '14px' }}>
                  <h4 style={{ color: '#ffcc00', margin: '0 0 0.5rem 0', fontWeight: 800 }}>Normal Base Value</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>Standard consensus baseline for un-upgraded normal variants.</p>
                </div>
                <div style={{ background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '1.25rem', borderRadius: '14px' }}>
                  <h4 style={{ color: '#00e5ff', margin: '0 0 0.5rem 0', fontWeight: 800 }}>Shiny Multiplier (2.5x)</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>Standard 2.5x trade multiplier applied to base value unless custom Collab pricing exists.</p>
                </div>
                <div style={{ background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '1.25rem', borderRadius: '14px' }}>
                  <h4 style={{ color: '#ec4899', margin: '0 0 0.5rem 0', fontWeight: 800 }}>Mythic & S.Myth Standards</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>Explicit trade values only displayed if listed on the Collab list; otherwise marked N/A.</p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. ANTI-SCAM & SAFETY GUIDE                                    */}
          {/* ============================================================== */}
          {activeSection === 'rules' && (
            <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <ShieldCheck size={26} color="#10b981" />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                  Anti-Scam & <span style={{ color: '#10b981' }}>Safe Trading Guide</span>
                </h2>
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p>Protect your inventory with our 4 golden rules of safe BGS trading:</p>
                <div style={{ background: '#0a0b10', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem 1.25rem', borderRadius: '12px' }}>
                  <strong style={{ color: '#10b981' }}>1. Never Click External Links:</strong> Always initiate trades directly inside Roblox. Never visit third-party login or verification websites.
                </div>
                <div style={{ background: '#0a0b10', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem 1.25rem', borderRadius: '12px' }}>
                  <strong style={{ color: '#10b981' }}>2. Cross-Check Values on Calculator:</strong> Before hitting accept, test both sides on the Live Trade Calculator to verify trade balance.
                </div>
                <div style={{ background: '#0a0b10', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem 1.25rem', borderRadius: '12px' }}>
                  <strong style={{ color: '#10b981' }}>3. Beware of Quick-Swapping:</strong> Watch the trade window carefully before confirming to ensure the other trader does not remove items.
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. ZERO-DUPE POLICY                                            */}
          {/* ============================================================== */}
          {activeSection === 'dupe' && (
            <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(255, 0, 127, 0.35)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <AlertOctagon size={26} color="#ff007f" />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ff007f', margin: 0 }}>
                  Zero-Dupe & Clean Asset Policy
                </h2>
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p>
                  In 2022, mass duplication exploits affected legacy pets in Bubble Gum Simulator. <strong>BGS Values maintains a strict zero-dupe valuation standard.</strong>
                </p>
                <p>
                  Every trade value, demand tier, and hatch count listed on our platform tracks <strong>100% clean, un-duped items</strong> to protect collectors and active traders from manipulated prices.
                </p>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 5. LIVE SYNC & PATCH NOTES                                     */}
          {/* ============================================================== */}
          {activeSection === 'changelog' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255, 204, 0, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, background: 'rgba(255, 204, 0, 0.12)', border: '1px solid rgba(255, 204, 0, 0.3)', color: '#ffcc00', padding: '3px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
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

              <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
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
            </div>
          )}

          {/* ============================================================== */}
          {/* 6. FAQ & HELP                                                  */}
          {/* ============================================================== */}
          {activeSection === 'faq' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255, 204, 0, 0.3)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffcc00', marginBottom: '0.75rem' }}>❓ How are Pet Values Determined?</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  All values are determined through real-time trade aggregation, verified player deal records, and consensus reviews from the official Collab Value List.
                </p>
              </div>
              <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#00e5ff', marginBottom: '0.75rem' }}>❓ What is the 0–11 Demand System?</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  The demand scale rates how easily an item can be traded from <strong>1 (Garbage)</strong> up to <strong>11 (Hyped)</strong> based on player trade frequency.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

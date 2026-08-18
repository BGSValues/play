import React from 'react';
import { TrendingUp, Award, ShieldCheck, Zap } from 'lucide-react';

export default function DemandSystemChart() {
  const demandTiers = [
    { code: '- = N/A', bg: '#9ca3af', text: '#000000' },
    { code: '1 = GARBAGE', bg: '#800080', text: '#ffffff' },
    { code: '2 = TERRIBLE', bg: '#0000ff', text: '#ffffff' },
    { code: '3 = BAD', bg: '#38bdf8', text: '#000000' },
    { code: '4 = LOW', bg: '#00ffff', text: '#000000' },
    { code: '5 = AVERAGE', bg: '#00ff00', text: '#000000' },
    { code: '6 = DECENT', bg: '#ffff00', text: '#000000' },
    { code: '7 = GOOD', bg: '#ff8000', text: '#000000' },
    { code: '8 = HIGH', bg: '#ff0000', text: '#ffffff' },
    { code: '9 = VERY HIGH', bg: '#800000', text: '#ffffff' },
    { code: '10 = EXTREME', bg: '#ff00ff', text: '#000000' },
    { code: '11 = HYPED', bg: '#ffffff', text: '#000000' },
  ];

  const stabilityRules = [
    { symbol: '⬆⬆', label: 'rising fast', color: '#10b981' },
    { symbol: '⬆', label: 'rising', color: '#34d399' },
    { symbol: '↔', label: 'stable', color: '#00e5ff' },
    { symbol: '🔄', label: 'unstable', color: '#f59e0b' },
    { symbol: '⬇', label: 'dropping', color: '#ff4d4d' },
    { symbol: '⬇⬇', label: 'dropping fast', color: '#ff1744' },
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto 3rem auto' }}>
      {/* ━━━━ MAIN OFFICIAL BANNER CONTAINER ━━━━ */}
      <div
        style={{
          border: '4px solid #000',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 229, 255, 0.2)',
          background: '#0a0c14',
          marginBottom: '2rem',
        }}
      >
        {/* Banner Header */}
        <div
          style={{
            background: '#93c5fd',
            borderBottom: '4px solid #000',
            padding: '1.25rem 1rem',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 1000,
              fontFamily: '"Impact", "Arial Black", sans-serif',
              color: '#000',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              margin: 0,
              textShadow: '2px 2px 0px rgba(255,255,255,0.4)',
            }}
          >
            DEMAND SYSTEM
          </h2>
        </div>

        {/* 12-Cell Official Grid matching screenshot */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            background: '#000',
            gap: '3px',
            borderBottom: '4px solid #000',
          }}
        >
          {demandTiers.map((tier, idx) => (
            <div
              key={idx}
              style={{
                background: tier.bg,
                color: tier.text,
                padding: '1.1rem 0.5rem',
                textAlign: 'center',
                fontFamily: '"Impact", "Arial Black", sans-serif',
                fontSize: 'clamp(1rem, 2.2vw, 1.5rem)',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
              }}
            >
              {tier.code}
            </div>
          ))}
        </div>

        {/* Stability & Legend Footer Section */}
        <div
          style={{
            padding: '1.75rem 2rem',
            background: 'linear-gradient(180deg, #111422 0%, #08090f 100%)',
          }}
        >
          {/* Stability Row */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 900,
                color: '#ffcc00',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <TrendingUp size={16} /> Market Stability Scale
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {stabilityRules.map((st, i) => (
                <span
                  key={i}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: st.color,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <strong style={{ fontSize: '1rem' }}>{st.symbol}</strong> = {st.label}
                </span>
              ))}
            </div>
          </div>

          {/* Hatch Indicators Row */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 900,
                color: '#00e5ff',
                textTransform: 'uppercase',
                marginBottom: '0.6rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Zap size={16} /> Verified Hatch Count Indicators
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div><strong style={{ color: '#ffcc00' }}>🥚</strong> Normal Hatch Amount</div>
              <div><strong style={{ color: '#ffcc00' }}>✨</strong> Shiny Hatch Amount</div>
              <div><strong style={{ color: '#00e5ff' }}>⚡</strong> Mythic Hatch Amount</div>
              <div><strong style={{ color: '#ff007f' }}>✨⚡</strong> Shiny Mythic Hatch Amount</div>
            </div>
          </div>

          {/* Clean Values Notice */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'rgba(0, 229, 255, 0.08)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              fontSize: '0.82rem',
              color: '#00e5ff',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShieldCheck size={16} />
            <span>
              <strong>Note:</strong> All platform values are 100% clean and un-duped. 2022 had some big mass duping; exploited or cloned duplicates are strictly excluded from our databases.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

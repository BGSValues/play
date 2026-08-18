import React from 'react';
import { BookOpen, ShieldAlert, Sparkles, TrendingUp, HelpCircle, CheckCircle2, Zap, Scale, Layers } from 'lucide-react';

export default function Guides() {
  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '1rem 1.5rem 4rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '900' }}>
          Official Bubble Gum Simulator <span style={{ color: '#00e5ff' }}>Trading & Value Guide</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.3rem' }}>
          Standard STSC (Secret to Shinies Conversions), demand scale, stability trends, and variant multiplier system.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* GUIDE CARD 1: STSC SYSTEM */}
        <div className="glass-card" style={{ border: '1px solid rgba(0, 229, 255, 0.3)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Scale size={26} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#00e5ff' }}>1. How STSC Works</h3>
          <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginBottom: '0.75rem', fontWeight: 600 }}>
            <strong>STSC</strong> = Secret to Shinies Conversions (Standard BGS Value System):
          </p>
          <ul style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, paddingLeft: '1.2rem' }}>
            <li><strong style={{ color: '#00e5ff' }}>⚡ Cyan / Secrets Value:</strong> What the item is worth in Secret Pets currency (e.g. <em>The Overlord = 50</em>, <em>Soul Heart = 7,000</em>, <em>Eternal Cucumber = 200</em>).</li>
            <li><strong style={{ color: '#ffcc00' }}>⭐ Yellow / Normal Value:</strong> What the item gets in shiny limiteds or non-secrets.</li>
            <li><strong style={{ color: '#a78bfa' }}>Conversion Multiplier:</strong> The exchange ratio between secret value and normal limiteds.</li>
          </ul>
        </div>

        {/* GUIDE CARD 2: DEMAND SYSTEM */}
        <div className="glass-card" style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <TrendingUp size={26} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#10b981' }}>2. Official Demand (0 - 11 Scale)</h3>
          <ul style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, paddingLeft: '1.2rem' }}>
            <li><strong>0 / 11:</strong> Item does not exist or has 0 in circulation.</li>
            <li><strong>1 - 3 / 11:</strong> Terrible / Low demand (hard to trade).</li>
            <li><strong>4 - 6 / 11:</strong> Average / Normal market demand.</li>
            <li><strong>7 - 9 / 11:</strong> High / Rising market demand.</li>
            <li><strong>10 / 11:</strong> Maximum standard high demand.</li>
            <li><strong>11 / 11:</strong> <span style={{ color: '#ff1744', fontWeight: 800 }}>HYPED</span> (Fresh new event item with peak demand).</li>
          </ul>
        </div>

        {/* GUIDE CARD 3: STABILITY TRENDS */}
        <div className="glass-card" style={{ border: '1px solid rgba(255, 204, 0, 0.3)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 204, 0, 0.15)', color: '#ffcc00', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Zap size={26} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffcc00' }}>3. Market Stability Indicators</h3>
          <ul style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, paddingLeft: '1.2rem' }}>
            <li><strong>⬆⬆ Rising Fast:</strong> Pet gaining significant value rapidly.</li>
            <li><strong>⬆ Rising:</strong> Positive upward market movement.</li>
            <li><strong>↔ Stable:</strong> Well-established, consistent trading price.</li>
            <li><strong>🔄 Unstable:</strong> Volatile price fluctuating based on hype.</li>
            <li><strong>⬇ Dropping / ⬇⬇ Dropping Fast:</strong> Value decreasing in market.</li>
          </ul>
        </div>

        {/* GUIDE CARD 4: VARIANT MULTIPLIERS */}
        <div className="glass-card" style={{ border: '1px solid rgba(185, 103, 255, 0.3)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(185, 103, 255, 0.15)', color: '#b967ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Sparkles size={26} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#b967ff' }}>4. Variant Multipliers</h3>
          <ul style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, paddingLeft: '1.2rem' }}>
            <li><strong>Normal Variant:</strong> Base Secret Value (<strong>1.0x</strong>).</li>
            <li><strong>Shiny Variant:</strong> <strong>2.5x</strong> multiplier (or exact listed Collab value).</li>
            <li><strong>Mythic Variant:</strong> <strong>10.0x</strong> base value.</li>
            <li><strong>Shiny Mythic (S.Myth):</strong> <strong>25.0x</strong> base value!</li>
            <li><em style={{ color: '#a78bfa' }}>Note: Hats do not have variant multipliers in Bubble Gum Simulator.</em></li>
          </ul>
        </div>

        {/* GUIDE CARD 5: HATCH NOTATIONS */}
        <div className="glass-card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Layers size={26} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ec4899' }}>5. Hatch & Existence Symbols</h3>
          <ul style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, paddingLeft: '1.2rem' }}>
            <li><strong>🥚 Number:</strong> Normal Hatch Amount in existence.</li>
            <li><strong>✨ Number:</strong> Shiny Hatch Amount in existence.</li>
            <li><strong>⚡ Number:</strong> Mythic Hatch Amount in existence.</li>
            <li><strong>✨⚡ Number:</strong> Shiny Mythic Hatch Amount.</li>
            <li><strong>📦 Number:</strong> Total Unboxed Hats.</li>
            <li><strong>🎉 Number:</strong> Special / Leaderboard existence count.</li>
          </ul>
        </div>

        {/* GUIDE CARD 6: SAFETY & SCAM PREVENTION */}
        <div className="glass-card" style={{ border: '1px solid rgba(255, 23, 68, 0.3)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 23, 68, 0.15)', color: '#ff1744', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <ShieldAlert size={26} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ff1744' }}>6. Trading Safety & Fair Trade Rules</h3>
          <ul style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, paddingLeft: '1.2rem' }}>
            <li><strong>Variant Checking:</strong> Always verify if the pet in trade window is Shiny or Normal before accepting.</li>
            <li><strong>Avoid Duped Items:</strong> We only track 100% clean verified values. Beware of mass-duplicated items.</li>
            <li><strong>Use Trade Calculator:</strong> Always verify total value and demand fairness in our built-in <strong>Trade Calculator</strong>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

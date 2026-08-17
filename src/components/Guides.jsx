import React from 'react';
import { BookOpen, ShieldAlert, Sparkles, TrendingUp, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function Guides() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem 1.5rem 4rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '900' }}>
          Bubble Gum Simulator <span style={{ color: '#ffcc00' }}>Trading Guides</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.3rem' }}>
          Essential tips, value tier lists, and safety practices to trade like a pro trader!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* GUIDE CARD 1 */}
        <div className="glass-card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 23, 68, 0.15)', color: '#ff1744', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <ShieldAlert size={26} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>1. Avoid Trading Scams</h3>
          <ul style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '1.2rem' }}>
            <li><strong>Variant Swapping:</strong> Always verify if a pet is <em>Shiny</em> or <em>Normal</em> before accepting a trade.</li>
            <li><strong>Value Ratio Check:</strong> Always run both sides in our <span style={{ color: '#ffcc00' }}>Trade Calculator</span> to verify fairness score.</li>
            <li><strong>Phantom Items:</strong> Never trade off-platform or trust screenshot edits.</li>
          </ul>
        </div>

        {/* GUIDE CARD 2 */}
        <div className="glass-card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(185, 103, 255, 0.15)', color: '#b967ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Sparkles size={26} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>2. Secret Pets & Multipliers</h3>
          <ul style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '1.2rem' }}>
            <li><strong>Normal Variant:</strong> Base value multiplier (1.0x).</li>
            <li><strong>Shiny Variant:</strong> 3.5x value multiplier.</li>
            <li><strong>Mythic Variant:</strong> 10.0x value multiplier.</li>
            <li><strong>Shiny Mythic:</strong> Highest tier in game (35.0x value boost)!</li>
          </ul>
        </div>

        {/* GUIDE CARD 3 */}
        <div className="glass-card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <TrendingUp size={26} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>3. Market Demand Ratings</h3>
          <ul style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '1.2rem' }}>
            <li><span className="status-pill status-rising">Rising</span> Pets with high demand gaining value fast.</li>
            <li><span className="status-pill status-hyped">🔥 Hyped</span> Highly sought-after event secret pets.</li>
            <li><span className="status-pill status-stable">⚖️ Stable</span> Consistent value with reliable market liquidity.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

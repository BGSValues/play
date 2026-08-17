import React, { useState } from 'react';
import { Sparkles, Calculator, Flame, Percent, RefreshCw } from 'lucide-react';

export default function UpgradeCalculator() {
  const [baseChance, setBaseChance] = useState(10); // 10%
  const [waxBoost, setWaxBoost] = useState(15); // +15%
  const [attempts, setAttempts] = useState(5);

  const totalChance = Math.min(100, Number(baseChance) + Number(waxBoost));
  const failChanceSingle = (100 - totalChance) / 100;
  const overallSuccessProb = (1 - Math.pow(failChanceSingle, Number(attempts))) * 100;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem 1.5rem 4rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '900' }}>
          Wax & Upgrade <span style={{ color: '#ffcc00' }}>Odds Calculator</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.3rem' }}>
          Calculate waxing success odds, upgrade chances, and probability across multiple attempts.
        </p>
      </div>

      <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Base Upgrade Chance (%)</label>
            <input
              type="number"
              className="form-input"
              value={baseChance}
              onChange={(e) => setBaseChance(e.target.value)}
              min="1"
              max="100"
            />
          </div>

          <div className="form-group">
            <label>Wax Type / Boost</label>
            <select className="form-input" value={waxBoost} onChange={(e) => setWaxBoost(Number(e.target.value))}>
              <option value="0">No Wax (+0%)</option>
              <option value="5">Normal Wax (+5%)</option>
              <option value="15">Silver Wax (+15%)</option>
              <option value="30">Golden Wax (+30%)</option>
              <option value="50">Rainbow Wax (+50%)</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label>Number of Upgrade Attempts</label>
          <input
            type="number"
            className="form-input"
            value={attempts}
            onChange={(e) => setAttempts(e.target.value)}
            min="1"
            max="50"
          />
        </div>

        {/* RESULTS CARD */}
        <div style={{ background: 'rgba(255,204,0,0.1)', border: '2px solid #ffcc00', borderRadius: '14px', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            Single Attempt Success Chance
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffcc00', margin: '0.3rem 0' }}>
            {totalChance}%
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cumulative Chance ({attempts} attempts)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00e5ff' }}>
                {overallSuccessProb.toFixed(1)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Average Attempts Needed</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00e676' }}>
                {Math.ceil(100 / Math.max(1, totalChance))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

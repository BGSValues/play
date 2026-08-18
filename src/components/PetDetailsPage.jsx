import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, PlusCircle, Sparkles, TrendingUp, Zap, Award, Activity, ShieldCheck, Heart, Layers, MapPin, DollarSign } from 'lucide-react';
import PetAvatar from './PetAvatar';
import { getPetVariantValue } from './ValueList';

export default function PetDetailsPage({ pet, onBack, onAddToTrade, onSelectPet }) {
  const [selectedVariant, setSelectedVariant] = useState('Normal');

  if (!pet) {
    return (
      <div style={{ maxWidth: '1200px', margin: '2rem auto', textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>No Pet Selected</h2>
        <button className="btn-primary" onClick={onBack} style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Return to Value List
        </button>
      </div>
    );
  }

  const isHat = pet.type === 'hat' || pet.category === 'Hats';
  const currentVal = getPetVariantValue(pet, selectedVariant);

  // Variant stat multiplier for in-game stats: Normal: 1x, Shiny: 2x, Mythic: 5x, ShinyMythic: 10x
  const statMultiplier = selectedVariant === 'Shiny' ? 2 : selectedVariant === 'Mythic' ? 5 : selectedVariant === 'ShinyMythic' || selectedVariant === 'S.Myth' ? 10 : 1;

  const buffs = pet.stats?.buffs || {};
  const eggName = pet.stats?.egg || (pet.description?.includes('Egg') ? pet.description.match(/([a-zA-Z0-9\s]+Egg)/)?.[0] : null);
  const movementType = pet.stats?.movementType || (isHat ? 'Hat Accessory' : 'Walk');

  const wikiUrl = `https://bubble-gum-simulator.fandom.com/wiki/${encodeURIComponent(pet.name.replace(/\s+/g, '_'))}`;

  const formatBuff = (key, val) => {
    if (typeof val !== 'number') return val;
    const multiplied = Math.round(val * statMultiplier);
    if (key === 'Bubbles') return `+${multiplied.toLocaleString()}`;
    return `x${multiplied.toLocaleString()}`;
  };

  const getBuffIcon = (key) => {
    switch (key.toLowerCase()) {
      case 'bubbles': return '🎈';
      case 'coins': return '🪙';
      case 'gems': return '💎';
      case 'stars': return '⭐';
      case 'pearls': return '🦪';
      case 'tickets': return '🎟️';
      case 'candy': return '🍬';
      case 'blocks': return '🧱';
      case 'magma': return '🌋';
      case 'all': return '🌟';
      default: return '⚡';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem 5rem 1.5rem' }}>
      {/* Top Back Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button
          onClick={onBack}
          className="filter-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', fontSize: '0.9rem', color: '#cbd5e1' }}
        >
          <ArrowLeft size={18} /> Back to Value List
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a
            href={wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="filter-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.2rem', fontSize: '0.9rem', textDecoration: 'none', color: '#a78bfa' }}
          >
            <ExternalLink size={16} /> Official Wiki Page
          </a>
        </div>
      </div>

      {/* Main Hero Container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Left Column: 3D Avatar & Identity */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span className={`rarity-badge rarity-${pet.rarity.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '4px 12px' }}>
              {pet.rarity.toUpperCase()}
            </span>
            <span style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', padding: '4px 12px', borderRadius: '8px', color: '#94a3b8', fontWeight: 700 }}>
              {movementType === 'Fly' ? '🦅 Flying' : movementType === 'Walk' ? '🐾 Walking' : movementType}
            </span>
          </div>

          <div
            style={{
              width: '220px',
              height: '220px',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(0, 229, 255, 0.2))',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(124, 58, 237, 0.25)',
              marginBottom: '1.5rem',
            }}
          >
            <PetAvatar name={pet.name} rarity={pet.rarity} image={pet.image} size={180} />
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0' }}>
            {pet.name}
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>
            {isHat ? 'Equippable Cosmetic & Stat Accessory' : 'Companion Pet in Bubble Gum Simulator'}
          </p>

          {/* Action: Add to Calculator */}
          {onAddToTrade && (
            <button
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={() => onAddToTrade(pet, selectedVariant, currentVal)}
            >
              <PlusCircle size={20} /> Add to Trade Calculator
            </button>
          )}
        </div>

        {/* Right Column: Values, Variant Multipliers & Game Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Variant Selector */}
          {!isHat && (
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                Select Variant Multiplier:
              </div>
              <div className="value-multi-select" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {['Normal', 'Shiny', 'Mythic', 'ShinyMythic'].map((v) => (
                  <button
                    key={v}
                    className={`multi-btn ${selectedVariant === v ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                    style={{ padding: '0.6rem 0', fontSize: '0.9rem', textAlign: 'center' }}
                  >
                    {v === 'ShinyMythic' ? 'S.Myth' : v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Market Trading Metrics */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffcc00', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Award size={18} /> Market Trading Data ({selectedVariant})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div style={{ background: '#0a0b10', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Trade Value</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: currentVal ? '#ffcc00' : '#64748b', marginTop: '4px' }}>
                  {currentVal ? `⚡ ${currentVal.toLocaleString()}` : 'N/A'}
                </div>
              </div>

              <div style={{ background: '#0a0b10', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Demand</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
                  {pet.demand ? `${pet.demand} / 11` : '5 / 11'}
                </div>
              </div>

              <div style={{ background: '#0a0b10', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Market Trend</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: pet.status === 'Rising' || pet.status === 'Hyped' ? '#10b981' : pet.status === 'Dropping' ? '#ff1744' : '#00e5ff', marginTop: '4px' }}>
                  {pet.status || 'Stable'}
                </div>
              </div>
            </div>
          </div>

          {/* In-Game Boosts & Multipliers */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#a78bfa', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Activity size={18} /> Official Game Stats ({selectedVariant})
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#00e5ff', fontWeight: 700 }}>
                {selectedVariant === 'Shiny' ? '2x Stat Boost' : selectedVariant === 'Mythic' ? '5x Stat Boost' : selectedVariant === 'ShinyMythic' || selectedVariant === 'S.Myth' ? '10x Stat Boost' : 'Base Stats'}
              </span>
            </div>

            {Object.keys(buffs).length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {Object.entries(buffs).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      background: '#0a0b10',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '12px',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ color: '#cbd5e1', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                      <span style={{ fontSize: '1.1rem' }}>{getBuffIcon(key)}</span> {key}
                    </span>
                    <span style={{ color: '#00e5ff', fontWeight: 900, fontSize: '1.1rem' }}>
                      {formatBuff(key, val)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                In-game multipliers scale with Level and Enchantments.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Egg Origin & Hatch Details */}
      {eggName && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <span>🥚</span> Egg Origin & Hatch Probability
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#0a0b10', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Hatched From</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{eggName}</div>
            </div>

            {pet.stats?.chance && (
              <div style={{ background: '#0a0b10', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Hatch Chance</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#a78bfa', marginTop: '4px' }}>
                  {pet.stats.chance < 0.001 ? `${(pet.stats.chance * 100).toFixed(6)}%` : `${(pet.stats.chance).toFixed(2)}%`}
                </div>
              </div>
            )}

            <div style={{ background: '#0a0b10', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Movement Classification</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#00e5ff', marginTop: '4px' }}>
                {movementType === 'Fly' ? 'Flying Pet' : movementType === 'Walk' ? 'Walking Pet' : movementType}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

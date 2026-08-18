import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, PlusCircle, Sparkles, TrendingUp, Zap, Award, Activity, ShieldCheck, Heart, Layers, MapPin, DollarSign, RotateCcw, Sliders } from 'lucide-react';
import PetAvatar from './PetAvatar';
import { getPetVariantValue } from './ValueList';

export default function PetDetailsPage({ pet, onBack, onAddToTrade, onSelectPet }) {
  const [selectedVariant, setSelectedVariant] = useState('Normal');
  const [level, setLevel] = useState(1);
  const [enchant, setEnchant] = useState(0);
  const [isShadowEnchant, setIsShadowEnchant] = useState(false);

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
  const variantStatMultiplier = selectedVariant === 'Shiny' ? 2 : selectedVariant === 'Mythic' ? 5 : selectedVariant === 'ShinyMythic' || selectedVariant === 'S.Myth' ? 10 : 1;

  // Level multiplier: (1 + (level - 1) * 0.05) -> Level 25 = 2.2x (+120%)
  const levelMultiplier = 1 + (Math.min(25, Math.max(1, level)) - 1) * 0.05;

  // Enchant multiplier: (1 + enchant * 0.02) -> Max 50 = 2.0x (+100%). Shadow Enchant = 2.5x
  const enchantMultiplier = isShadowEnchant ? 2.5 : 1 + Math.min(50, Math.max(0, enchant)) * 0.02;

  const totalStatMultiplier = variantStatMultiplier * levelMultiplier * enchantMultiplier;

  const buffs = pet.stats?.buffs || {};
  const eggName = pet.stats?.egg || (pet.description?.includes('Egg') ? pet.description.match(/([a-zA-Z0-9\s]+Egg)/)?.[0] : null);
  const movementType = pet.stats?.movementType || (isHat ? 'Hat Accessory' : 'Walk');

  const wikiUrl = `https://bubble-gum-simulator.fandom.com/wiki/${encodeURIComponent(pet.name.replace(/\s+/g, '_'))}`;

  const formatBuff = (key, val) => {
    if (typeof val !== 'number') return val;
    const multiplied = Math.round(val * totalStatMultiplier);
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

  const handleMaxLevel = () => setLevel(25);
  const handleMaxEnchant = () => {
    setEnchant(50);
    setIsShadowEnchant(false);
  };
  const handleMaxShadowEnchant = () => {
    setEnchant(40);
    setIsShadowEnchant(true);
  };
  const handleResetStats = () => {
    setLevel(1);
    setEnchant(0);
    setIsShadowEnchant(false);
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

      {/* Main Container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Left Column: 3D Avatar, Identity & Trade Values */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
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
                width: '200px',
                height: '200px',
                borderRadius: '26px',
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(0, 229, 255, 0.2))',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(124, 58, 237, 0.25)',
                marginBottom: '1.25rem',
              }}
            >
              <PetAvatar name={pet.name} rarity={pet.rarity} image={pet.image} size={170} />
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0 0 0.4rem 0' }}>
              {pet.name}
            </h1>

            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 1.25rem 0' }}>
              {isHat ? 'Equippable Cosmetic & Stat Accessory' : 'Companion Pet in Bubble Gum Simulator'}
            </p>

            {onAddToTrade && (
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => onAddToTrade(pet, selectedVariant, currentVal)}
              >
                <PlusCircle size={18} /> Add to Trade Calculator
              </button>
            )}
          </div>

          {/* Market Trading Metrics */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#ffcc00', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
              <Award size={16} /> Market Trading Data ({selectedVariant})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
              <div style={{ background: '#0a0b10', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Trade Value</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: currentVal ? '#ffcc00' : '#64748b', marginTop: '2px' }}>
                  {currentVal ? `⚡ ${currentVal.toLocaleString()}` : 'N/A'}
                </div>
              </div>

              <div style={{ background: '#0a0b10', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Demand</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>
                  {pet.demand ? `${pet.demand} / 11` : '5 / 11'}
                </div>
              </div>

              <div style={{ background: '#0a0b10', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Trend</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: pet.status === 'Rising' || pet.status === 'Hyped' ? '#10b981' : pet.status === 'Dropping' ? '#ff1744' : '#00e5ff', marginTop: '2px' }}>
                  {pet.status || 'Stable'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Level & Enchant Multipliers + Game Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Variant Selector */}
          {!isHat && (
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                Select Pet Variant:
              </div>
              <div className="value-multi-select" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {['Normal', 'Shiny', 'Mythic', 'ShinyMythic'].map((v) => (
                  <button
                    key={v}
                    className={`multi-btn ${selectedVariant === v ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                    style={{ padding: '0.55rem 0', fontSize: '0.88rem', textAlign: 'center' }}
                  >
                    {v === 'ShinyMythic' ? 'S.Myth' : v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INTERACTIVE LEVEL & ENCHANT CALCULATOR */}
          {!isHat && (
            <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(236, 72, 153, 0.3)', background: 'linear-gradient(180deg, rgba(236, 72, 153, 0.05) 0%, rgba(10, 11, 16, 0.95) 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ec4899', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Sliders size={18} /> Level & Enchantment Calculator
                </h3>
                <button
                  onClick={handleResetStats}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: '#94a3b8', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>

              {/* Controls Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {/* Level Control */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                    Level (1 – 25): <span style={{ color: '#ec4899', fontWeight: 900 }}>Lvl {level}</span>
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="number"
                      min="1"
                      max="25"
                      value={level}
                      onChange={(e) => setLevel(Math.min(25, Math.max(1, parseInt(e.target.value) || 1)))}
                      style={{ width: '65px', background: '#000', border: '1px solid var(--glass-border)', color: '#fff', padding: '6px 8px', borderRadius: '8px', fontWeight: 800, textAlign: 'center' }}
                    />
                    <button
                      onClick={handleMaxLevel}
                      style={{ flex: 1, background: '#ec4899', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      👑 MAX LEVEL
                    </button>
                  </div>
                </div>

                {/* Enchant Control */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                    Enchant (0 – 50): <span style={{ color: isShadowEnchant ? '#10b981' : '#a78bfa', fontWeight: 900 }}>{isShadowEnchant ? 'Shadow 40' : `Enc ${enchant}`}</span>
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={enchant}
                      disabled={isShadowEnchant}
                      onChange={(e) => {
                        setIsShadowEnchant(false);
                        setEnchant(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)));
                      }}
                      style={{ width: '65px', background: '#000', border: '1px solid var(--glass-border)', color: '#fff', padding: '6px 8px', borderRadius: '8px', fontWeight: 800, textAlign: 'center', opacity: isShadowEnchant ? 0.5 : 1 }}
                    />
                    <button
                      onClick={handleMaxEnchant}
                      style={{ flex: 1, background: '#a78bfa', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      🧪 MAX ENCHANT
                    </button>
                  </div>
                </div>
              </div>

              {/* Shadow Enchant & Quick Preset Button */}
              <button
                onClick={handleMaxShadowEnchant}
                style={{
                  width: '100%',
                  background: isShadowEnchant ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10b981',
                  color: isShadowEnchant ? '#000' : '#10b981',
                  borderRadius: '8px',
                  padding: '0.55rem',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                👽 MAX SHADOW ENCHANT (+150% BOOST)
              </button>
            </div>
          )}

          {/* IN-GAME BUFFS / STATS DISPLAY */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#a78bfa', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Activity size={18} /> Dynamic In-Game Stats
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#00e5ff', fontWeight: 800 }}>
                {selectedVariant} • Lvl {level} • {isShadowEnchant ? 'Shadow 40' : `Enc ${enchant}`}
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
                    <span style={{ color: '#00e5ff', fontWeight: 900, fontSize: '1.15rem' }}>
                      {formatBuff(key, val)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                In-game multipliers scale dynamically with Level and Enchantments.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Egg Origin & Hatch Details */}
      {eggName && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
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

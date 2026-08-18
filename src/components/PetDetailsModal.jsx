import React, { useState } from 'react';
import { X, ExternalLink, PlusCircle, Sparkles, TrendingUp, Zap, HelpCircle, Activity, Award, ShieldCheck, Heart } from 'lucide-react';
import PetAvatar from './PetAvatar';
import BgsStatIcon from './BgsStatIcon';
import { getPetVariantValue } from './ValueList';

export default function PetDetailsModal({ isOpen, onClose, pet, onAddToTrade }) {
  const [selectedVariant, setSelectedVariant] = useState('Normal');

  if (!isOpen || !pet) return null;

  const isHat = pet.type === 'hat' || pet.category === 'Hats';
  const hasValue = typeof pet.baseValue === 'number' && !isNaN(pet.baseValue) && pet.baseValue > 0;
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
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '94%',
          padding: '1.75rem',
          borderRadius: '20px',
          background: 'linear-gradient(180deg, #0e1017 0%, #08090d 100%)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(124, 58, 237, 0.2)',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <X size={18} />
        </button>

        {/* Header Section: 3D Avatar & Identity */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(0, 229, 255, 0.15))',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              position: 'relative',
            }}
          >
            <PetAvatar name={pet.name} rarity={pet.rarity} image={pet.image} size={100} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <span className={`rarity-badge rarity-${pet.rarity.toLowerCase()}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                {pet.rarity.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', padding: '2px 8px', borderRadius: '6px', color: '#94a3b8', fontWeight: 700 }}>
                {movementType === 'Fly' ? '🦅 Flying' : movementType === 'Walk' ? '🐾 Walking' : movementType}
              </span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 0 0.3rem 0', lineHeight: 1.2 }}>
              {pet.name}
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              {isHat ? 'Equippable Hat Accessory' : 'Official Companion Pet'}
            </p>
          </div>
        </div>

        {/* Variant Multi-Select (For Pets) */}
        {!isHat && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Select Pet Variant:
            </div>
            <div
              className="value-multi-select"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${(pet.variants || (pet.multipliers?.Mythic ? ['Normal', 'Shiny', 'Mythic', 'ShinyMythic'] : ['Normal', 'Shiny'])).length}, 1fr)`,
                gap: '0.4rem',
              }}
            >
              {(pet.variants || (pet.multipliers?.Mythic ? ['Normal', 'Shiny', 'Mythic', 'ShinyMythic'] : ['Normal', 'Shiny'])).map((v) => (
                <button
                  key={v}
                  className={`multi-btn ${selectedVariant === v ? 'active' : ''}`}
                  onClick={() => setSelectedVariant(v)}
                  style={{ padding: '0.45rem 0', textAlign: 'center' }}
                >
                  {v === 'ShinyMythic' ? 'S.Myth' : v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* IN-GAME BUFFS / STATS SECTION */}
        <div style={{ marginBottom: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '14px', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#a78bfa', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} /> In-Game Stats ({selectedVariant})
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {selectedVariant === 'Shiny' ? '2x Stat Boost' : selectedVariant === 'Mythic' ? '5x Stat Boost' : selectedVariant === 'ShinyMythic' || selectedVariant === 'S.Myth' ? '10x Stat Boost' : 'Base Stats'}
            </span>
          </div>

          {Object.keys(buffs).length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
              {Object.entries(buffs).map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '0.5rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                    <BgsStatIcon stat={key} size={20} /> {key}
                  </span>
                  <span style={{ color: '#00e5ff', fontWeight: 800, fontSize: '0.9rem' }}>
                    {formatBuff(key, val)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '0.75rem', color: '#64748b', fontSize: '0.82rem' }}>
              Stats vary by level and enchantments in-game.
            </div>
          )}
        </div>

        {/* MARKET TRADING VALUES & DEMAND */}
        <div style={{ marginBottom: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '14px', padding: '1rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#ffcc00', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
            <Award size={14} /> Market Trading Data
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
            {/* VALUE */}
            <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '0.6rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Trade Value</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: currentVal ? '#ffcc00' : '#64748b', marginTop: '2px' }}>
                {currentVal ? `⚡ ${currentVal.toLocaleString()}` : 'N/A'}
              </div>
            </div>

            {/* DEMAND */}
            <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '0.6rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Demand</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>
                {pet.demand ? `${pet.demand} / 11` : '5 / 11'}
              </div>
            </div>

            {/* TREND */}
            <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '0.6rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Trend</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: pet.status === 'Rising' || pet.status === 'Hyped' ? '#10b981' : pet.status === 'Dropping' ? '#ff1744' : '#00e5ff', marginTop: '2px' }}>
                {pet.status || 'Stable'}
              </div>
            </div>
          </div>
        </div>

        {/* EGG ORIGIN & HATCH DETAILS */}
        {eggName && (
          <div style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '14px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🥚</span>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>OBTAINED FROM</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{eggName}</div>
              </div>
            </div>

            {pet.stats?.chance && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>HATCH CHANCE</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#a78bfa' }}>
                  {pet.stats.chance < 0.001 ? `${(pet.stats.chance * 100).toFixed(6)}%` : `${(pet.stats.chance).toFixed(2)}%`}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn-primary"
            style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={() => {
              if (onAddToTrade) onAddToTrade(pet);
              onClose();
            }}
          >
            <PlusCircle size={18} /> Add to Trade Calculator
          </button>

          <a
            href={wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="filter-btn"
            style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', textDecoration: 'none', color: '#cbd5e1' }}
          >
            <ExternalLink size={16} /> Wiki Page
          </a>
        </div>
      </div>
    </div>
  );
}

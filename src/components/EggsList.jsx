import React, { useState } from 'react';
import { Search, MapPin, Sparkles, ChevronRight, ArrowLeft, PlusCircle, Award, Layers, DollarSign, Egg } from 'lucide-react';
import PetAvatar from './PetAvatar';
import eggsData from '../data/eggs.json';

export default function EggsList({ onSelectPet, onAddToTrade }) {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [selectedEgg, setSelectedEgg] = useState(null);

  // Extract unique locations for filtering
  const locations = ['All', ...new Set(eggsData.map(e => e.location || 'Overworld').filter(Boolean))];

  const filteredEggs = eggsData.filter(egg => {
    const q = search.toLowerCase();
    const matchSearch = !q || egg.name.toLowerCase().includes(q)
      || egg.location?.toLowerCase().includes(q)
      || egg.pets?.some(p => p.name.toLowerCase().includes(q));
    const matchLocation = locationFilter === 'All' || egg.location === locationFilter;
    return matchSearch && matchLocation;
  });

  // If an Egg is selected, render the dedicated Egg Hatch Details Page
  if (selectedEgg) {
    const secretCount = selectedEgg.pets.filter(p => p.rarity === 'Secret').length;
    const legendaryCount = selectedEgg.pets.filter(p => p.rarity === 'Legendary').length;

    return (
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1rem 1.5rem 5rem 1.5rem' }}>
        {/* Back Button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => setSelectedEgg(null)}
            className="filter-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', fontSize: '0.9rem', color: '#cbd5e1' }}
          >
            <ArrowLeft size={18} /> Back to All Eggs
          </button>
        </div>

        {/* Selected Egg Hero Header */}
        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.25), rgba(124, 58, 237, 0.25))',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            🥚
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', padding: '2px 8px', borderRadius: '6px', color: '#00e5ff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> {selectedEgg.location || 'Overworld'}
              </span>
              {selectedEgg.costAmount > 0 ? (
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffcc00', background: 'rgba(255,204,0,0.1)', border: '1px solid rgba(255,204,0,0.3)', padding: '2px 8px', borderRadius: '6px' }}>
                  💰 {selectedEgg.costAmount.toLocaleString()} {selectedEgg.costCurrency}
                </span>
              ) : null}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0 0 0.3rem 0' }}>
              {selectedEgg.name}
            </h1>

            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              Contains <strong>{selectedEgg.pets.length} hatchable pets</strong> ({secretCount} Secrets 👑, {legendaryCount} Legendary ⚡)
            </p>
          </div>
        </div>

        {/* Hatchable Pets Grid (Matching Pet Cards Style) */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#ffcc00" /> Hatchable Pets & Drop Chances
        </h3>

        <div className="pet-grid">
          {selectedEgg.pets.map((pet) => (
            <div
              key={pet.id}
              className="pet-card"
              onClick={() => {
                if (onSelectPet) onSelectPet(pet);
              }}
              style={{ cursor: 'pointer' }}
              title="Click to view full pet in-game stats & details"
            >
              {/* Rarity & Chance Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '0.3rem' }}>
                <span className={`rarity-badge rarity-${pet.rarity.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                  {pet.rarity.toUpperCase()}
                </span>
                {pet.chance ? (
                  <span style={{ fontSize: '0.72rem', color: '#00e5ff', fontWeight: 900 }}>
                    {pet.chance < 0.001 ? `${(pet.chance * 100).toFixed(6)}%` : `${(pet.chance).toFixed(1)}%`}
                  </span>
                ) : null}
              </div>

              {/* Center 3D Avatar */}
              <div className="pet-card-image-wrap">
                <PetAvatar name={pet.name} rarity={pet.rarity} image={pet.image} size={110} />
              </div>

              {/* Pet Name */}
              <h3 className="pet-name">{pet.name}</h3>

              {/* Stats Table */}
              <div className="stats-table" style={{ marginTop: 'auto' }}>
                <div className="stat-row">
                  <span className="stat-label">Trade Value</span>
                  <span className="stat-val-bold">
                    {pet.baseValue ? `⚡ ${pet.baseValue.toLocaleString()}` : <span style={{ color: '#94a3b8' }}>N/A</span>}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Demand</span>
                  <span className="stat-val-green">{pet.demand ? `${pet.demand}/11` : '5/11'}</span>
                </div>
              </div>

              {/* View Details Button */}
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center', marginTop: '0.5rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectPet) onSelectPet(pet);
                }}
              >
                View Pet Stats
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main Compact Egg Cards Grid View (Matching Value List Layout)
  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem 1.5rem 5rem 1.5rem' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '900' }}>
          Bubble Gum Simulator <span style={{ color: '#00e5ff' }}>Egg & Hatch Guide</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.3rem' }}>
          Browse all {eggsData.length} in-game eggs — click any egg to view its hatchable secret & legendary pets!
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="controls-bar" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="search-input-box"
              style={{ paddingLeft: '2.2rem', margin: 0 }}
              placeholder="Search eggs, locations, or pets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="search-input-box"
            style={{ width: '180px', margin: 0 }}
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="All">All Locations ({eggsData.length})</option>
            {locations.filter(l => l !== 'All').slice(0, 20).map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* COMPACT EGG CARDS GRID (Matching Pet Grid Size) */}
      <div className="pet-grid">
        {filteredEggs.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>No eggs found matching "{search}"</p>
          </div>
        ) : (
          filteredEggs.map((egg) => {
            const secretCount = egg.pets.filter(p => p.rarity === 'Secret').length;
            const legendaryCount = egg.pets.filter(p => p.rarity === 'Legendary').length;

            return (
              <div
                key={egg.id}
                className="pet-card"
                onClick={() => setSelectedEgg(egg)}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00e5ff';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title="Click to view all hatchable pets in this egg"
              >
                {/* Top Location Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', padding: '2px 7px', borderRadius: '6px', color: '#00e5ff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={10} /> {egg.location || 'Overworld'}
                  </span>
                  {secretCount > 0 ? (
                    <span className="rarity-badge rarity-secret" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                      👑 {secretCount} Secret{secretCount > 1 ? 's' : ''}
                    </span>
                  ) : null}
                </div>

                {/* Center 3D Egg Icon Wrap */}
                <div
                  className="pet-card-image-wrap"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4.5rem',
                    background: 'radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, rgba(124, 58, 237, 0.05) 70%, transparent 100%)',
                  }}
                >
                  🥚
                </div>

                {/* Egg Name */}
                <h3 className="pet-name">{egg.name}</h3>

                {/* Egg Summary Details */}
                <div className="stats-table" style={{ marginTop: 'auto' }}>
                  <div className="stat-row">
                    <span className="stat-label">Hatchable Pets</span>
                    <span className="stat-val-bold">{egg.pets.length} Pets</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Egg Cost</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffcc00' }}>
                      {egg.costAmount > 0 ? `${egg.costAmount.toLocaleString()} ${egg.costCurrency}` : 'Free / Event'}
                    </span>
                  </div>
                </div>

                {/* View Pets Action Button */}
                <button
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.55rem', fontSize: '0.82rem', justifyContent: 'center', marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>View Pets ({egg.pets.length})</span> <ChevronRight size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

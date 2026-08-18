import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Sparkles, ChevronRight, Filter, PlusCircle, Award, Layers } from 'lucide-react';
import PetAvatar from './PetAvatar';
import eggsData from '../data/eggs.json';

export default function EggsList({ onSelectPet, onAddToTrade }) {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [selectedEggId, setSelectedEggId] = useState(null);

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

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem 1.5rem 5rem 1.5rem' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '900' }}>
          Bubble Gum Simulator <span style={{ color: '#00e5ff' }}>Egg & Hatch Guide</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.3rem' }}>
          Browse all {eggsData.length} in-game eggs, locations, costs, and hatchable secret & legendary pets!
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

      {/* Egg Groups Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {filteredEggs.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>No eggs found matching "{search}"</p>
          </div>
        ) : (
          filteredEggs.map((egg) => {
            const isExpanded = selectedEggId === egg.id;
            const secretCount = egg.pets.filter(p => p.rarity === 'Secret').length;
            const legendaryCount = egg.pets.filter(p => p.rarity === 'Legendary').length;

            return (
              <div
                key={egg.id}
                className="glass-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isExpanded ? '1px solid #7c3aed' : '1px solid var(--glass-border)',
                  boxShadow: isExpanded ? '0 0 25px rgba(124, 58, 237, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Egg Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(124, 58, 237, 0.2))',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}
                    >
                      🥚
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', margin: '0 0 2px 0' }}>
                        {egg.name}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="#00e5ff" /> {egg.location || 'Overworld'}
                      </div>
                    </div>
                  </div>

                  {egg.costAmount > 0 ? (
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffcc00', background: 'rgba(255,204,0,0.1)', border: '1px solid rgba(255,204,0,0.3)', padding: '3px 8px', borderRadius: '8px' }}>
                      {egg.costAmount.toLocaleString()} {egg.costCurrency}
                    </span>
                  ) : null}
                </div>

                {/* Summary Badges */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '2px 8px', borderRadius: '6px', color: '#cbd5e1', fontWeight: 700 }}>
                    {egg.pets.length} Hatchable Pets
                  </span>
                  {secretCount > 0 && (
                    <span className="rarity-badge rarity-secret" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                      👑 {secretCount} Secret{secretCount > 1 ? 's' : ''}
                    </span>
                  )}
                  {legendaryCount > 0 && (
                    <span className="rarity-badge rarity-legendary" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                      ⚡ {legendaryCount} Legendary
                    </span>
                  )}
                </div>

                {/* Pets Preview Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.6rem', marginTop: 'auto' }}>
                  {egg.pets.map((pet) => (
                    <div
                      key={pet.id}
                      onClick={() => {
                        if (onSelectPet) onSelectPet(pet);
                      }}
                      style={{
                        background: '#07080c',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '10px',
                        padding: '0.6rem 0.4rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#7c3aed';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      title="Click to view full pet details & stats"
                    >
                      <PetAvatar name={pet.name} rarity={pet.rarity} image={pet.image} size={50} />
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {pet.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: pet.rarity === 'Secret' ? '#ff007f' : pet.rarity === 'Legendary' ? '#ff9100' : '#a78bfa', fontWeight: 700 }}>
                        {pet.rarity}
                      </div>
                      {pet.chance ? (
                        <div style={{ fontSize: '0.65rem', color: '#00e5ff', fontWeight: 800, marginTop: '2px' }}>
                          {pet.chance < 0.001 ? `${(pet.chance * 100).toFixed(6)}%` : `${(pet.chance).toFixed(1)}%`}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

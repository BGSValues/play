import React, { useState } from 'react';
import { Search, Sparkles, TrendingUp, Star, PlusCircle, Filter, Edit3, Save, ChevronLeft, ChevronRight, ArrowUpDown, HardHat, SlidersHorizontal, Info } from 'lucide-react';
import PetAvatar from './PetAvatar';
import PetDetailsModal from './PetDetailsModal';

const PETS_PER_PAGE = 100;

// Universal BGS Variant Value & Multiplier Helper
export function getPetVariantValue(item, variant) {
  if (!item || typeof item.baseValue !== 'number' || isNaN(item.baseValue) || item.baseValue <= 0) {
    return null;
  }
  const isHat = item.type === 'hat' || item.category === 'Hats';
  if (isHat) return item.baseValue;

  switch (variant) {
    case 'Shiny':
      return item.shinyValue || Math.round(item.baseValue * 2.5);
    case 'Mythic':
      return Math.round(item.baseValue * 10);
    case 'ShinyMythic':
    case 'S.Myth':
      return Math.round((item.shinyValue || (item.baseValue * 2.5)) * 10);
    case 'Normal':
    default:
      return item.baseValue;
  }
}

export function getVariantMultiplier(item, variant) {
  if (item && item.multipliers && item.multipliers[variant]) {
    return item.multipliers[variant];
  }
  switch (variant) {
    case 'Shiny':
      return 2.5;
    case 'Mythic':
      return 10.0;
    case 'ShinyMythic':
    case 'S.Myth':
      return 25.0;
    default:
      return 1.0;
  }
}

export default function ValueList({ pets, currentUser, onAddToTrade, onUpdatePetValue, onSelectPet }) {
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('highest');
  const [selectedVariants, setSelectedVariants] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPetForModal, setSelectedPetForModal] = useState(null);

  // Staff Editing
  const [editingPetId, setEditingPetId] = useState(null);
  const [editForm, setEditForm] = useState({ baseValue: '', demand: 5, status: 'Stable' });

  const isStaff = currentUser && (currentUser.role === 'owner' || currentUser.role === 'mod');

  const handleVariantChange = (petId, variant) => {
    setSelectedVariants((prev) => ({ ...prev, [petId]: variant }));
  };

  const startStaffEdit = (pet) => {
    setEditingPetId(pet.id);
    setEditForm({ baseValue: pet.baseValue, demand: pet.demand, status: pet.status });
  };

  const saveStaffEdit = async (petId) => {
    if (onUpdatePetValue) await onUpdatePetValue(petId, editForm);
    setEditingPetId(null);
  };

  const getRarityBadge = (rarity) => {
    const badges = {
      Secret: <span className="badge badge-secret">SECRET</span>,
      Legendary: <span className="badge badge-legendary">LEGENDARY</span>,
      Unique: <span className="badge badge-unique" style={{ background: '#7c3aed', color: '#fff', border: '1px solid #a78bfa' }}>UNIQUE</span>,
      Epic: <span className="badge badge-epic">EPIC</span>,
      Rare: <span className="badge badge-rare">RARE</span>,
    };
    return badges[rarity] || <span className="badge badge-common">COMMON</span>;
  };

  const getTrendColor = (status) => {
    if (status === 'Rising') return 'stat-val-green';
    if (status === 'Hyped') return 'stat-val-gold';
    if (status === 'Dropping') return 'stat-val-bold';
    return 'stat-label';
  };

  const matchesSearchTerm = (itemName, query) => {
    if (!query) return true;
    const normName = itemName.toLowerCase();
    const normQuery = query.toLowerCase().replace(/overload/g, 'overlord').trim();
    const words = normQuery.split(/\s+/);
    return words.every((w) => normName.includes(w));
  };

  // Filter & Sort
  const filteredPets = pets
    .filter((item) => {
      const isHat = item.type === 'hat' || item.category === 'Hats';
      const matchesSearch = matchesSearchTerm(item.name, search);
      const matchesType = typeFilter === 'All' ? true : typeFilter === 'Hats' ? isHat : !isHat;
      const matchesRarity = rarityFilter === 'All' ? true : item.rarity === rarityFilter;
      return matchesSearch && matchesType && matchesRarity;
    })
    .sort((a, b) => {
      const valA = (typeof a.baseValue === 'number' && !isNaN(a.baseValue) && a.baseValue > 0) ? a.baseValue : -1;
      const valB = (typeof b.baseValue === 'number' && !isNaN(b.baseValue) && b.baseValue > 0) ? b.baseValue : -1;
      if (sortOrder === 'highest') return valB - valA;
      if (sortOrder === 'lowest') return (valA === -1 ? 999999999 : valA) - (valB === -1 ? 999999999 : valB);
      if (sortOrder === 'name') return a.name.localeCompare(b.name);
      return valB - valA;
    });

  // Pagination
  const totalPages = Math.ceil(filteredPets.length / PETS_PER_PAGE);
  const startIdx = (currentPage - 1) * PETS_PER_PAGE;
  const paginatedPets = filteredPets.slice(startIdx, startIdx + PETS_PER_PAGE);

  const handleSearchChange = (val) => { setSearch(val); setCurrentPage(1); };
  const handleRarityChange = (val) => { setRarityFilter(val); setCurrentPage(1); };
  const handleTypeChange = (val) => { setTypeFilter(val); setCurrentPage(1); };
  const handleSortChange = (val) => { setSortOrder(val); setCurrentPage(1); };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <PetDetailsModal
        isOpen={!!selectedPetForModal}
        onClose={() => setSelectedPetForModal(null)}
        pet={selectedPetForModal}
        onAddToTrade={onAddToTrade}
      />

      {/* SEARCH AND FILTERS */}

      {/* Controls Bar */}
      <div className="controls-bar">
        <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="search-input-box"
            style={{ paddingLeft: '2.6rem', margin: 0 }}
            placeholder={`Search ${pets.length.toLocaleString()} items...`}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* TYPE FILTER */}
        <div className="filter-group">
          {['All', 'Pets', 'Hats'].map((t) => (
            <button
              key={t}
              className={`filter-btn ${typeFilter === t ? 'active' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onClick={() => handleTypeChange(t)}
            >
              {t === 'Hats' && <HardHat size={14} />} {t}
            </button>
          ))}
        </div>

        {/* RARITY FILTER */}
        <div className="filter-group">
          {['All', 'Secret', 'Legendary', 'Unique', 'Epic', 'Rare', 'Common'].map((r) => (
            <button
              key={r}
              className={`filter-btn ${rarityFilter === r ? 'active' : ''}`}
              onClick={() => handleRarityChange(r)}
            >
              {r}
            </button>
          ))}
        </div>

        {/* SORT DROPDOWN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            className="filter-btn"
            style={{ padding: '0.5rem 0.8rem', fontWeight: 800, color: '#a78bfa' }}
            value={sortOrder}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="highest">⚡ Highest Value</option>
            <option value="lowest">⚡ Lowest Value</option>
            <option value="name">🔤 Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ maxWidth: '1440px', margin: '0 auto 1rem auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
          <strong style={{ color: '#f8fafc' }}>{filteredPets.length.toLocaleString()}</strong> items found
          {' • '}Page <strong style={{ color: '#f8fafc' }}>{currentPage}</strong> of <strong>{totalPages}</strong>
          {' • '}Showing {startIdx + 1}–{Math.min(startIdx + PETS_PER_PAGE, filteredPets.length)}
        </span>
      </div>

      {/* CLASSIC PREMIUM BLACK ITEM GRID */}
      <div className="pet-grid">
        {paginatedPets.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>No items found matching "{search}"</p>
          </div>
        ) : (
          paginatedPets.map((item) => {
            const isHat = item.type === 'hat' || item.category === 'Hats';
            const currentVariant = selectedVariants[item.id] || 'Normal';
            const calculatedValue = getPetVariantValue(item, currentVariant);

            return (
              <div key={item.id} className="pet-card">
                {/* Top Right Badge */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '0.2rem' }}>
                  {getRarityBadge(item.rarity)}
                </div>

                {/* Center 3D Avatar (Clickable to view full stats on dedicated page) */}
                <div
                  className="pet-card-image-wrap"
                  onClick={() => {
                    if (onSelectPet) onSelectPet(item);
                    else setSelectedPetForModal(item);
                  }}
                  style={{ cursor: 'pointer' }}
                  title="Click to view full in-game stats & details"
                >
                  <PetAvatar name={item.name} rarity={item.rarity} image={item.image} size={110} />
                </div>

                {/* Item Name (Clickable) */}
                <h3
                  className="pet-name"
                  onClick={() => {
                    if (onSelectPet) onSelectPet(item);
                    else setSelectedPetForModal(item);
                  }}
                  style={{ cursor: 'pointer' }}
                  title="Click to view full in-game stats & details"
                >
                  {item.name}
                </h3>

                {/* Variant Selector (Pets only - Hats don't have Shiny/Mythic variants) */}
                {!isHat ? (
                  <div className="value-multi-select">
                    {['Normal', 'Shiny', 'Mythic', 'ShinyMythic'].map((v) => (
                      <button key={v} className={`multi-btn ${currentVariant === v ? 'active' : ''}`} onClick={() => handleVariantChange(item.id, v)}>
                        {v === 'ShinyMythic' ? 'S.Myth' : v}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>HAT ITEM</span>
                  </div>
                )}

                {/* Key Stats Table */}
                <div className="stats-table">
                  <div className="stat-row">
                    <span className="stat-label">Value</span>
                    <span className="stat-val-bold">
                      {calculatedValue !== null ? `⚡ ${calculatedValue.toLocaleString()}` : <span style={{ color: '#94a3b8' }}>N/A</span>}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Trend</span>
                    <span className={getTrendColor(item.status)}>{item.status}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Demand</span>
                    <span className="stat-val-green">{item.demand}/11</span>
                  </div>
                  {item.existence && (item.existence.normal || item.existence.shiny || item.existence.hats) && (
                    <div className="stat-row">
                      <span className="stat-label">Hatched</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffcc00' }}>
                        {item.existence.normal ? `🥚 ${item.existence.normal}` : ''} {item.existence.shiny ? `✨ ${item.existence.shiny}` : ''} {item.existence.hats ? `📦 ${item.existence.hats}` : ''}
                      </span>
                    </div>
                  )}
                </div>


                {/* Add to Trade Button */}
                {onAddToTrade && (
                  <button
                    style={{ width: '100%', padding: '0.55rem', justifyContent: 'center', fontSize: '0.82rem', background: '#14151f', border: '1px solid var(--glass-border)', color: '#f8fafc', borderRadius: '9px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px', marginTop: 'auto', transition: 'all 0.2s ease' }}
                    onClick={() => onAddToTrade(item, currentVariant, calculatedValue)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.borderColor = '#7c3aed'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#14151f'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                  >
                    <PlusCircle size={15} /> Add to Trade
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* PAGE NAVIGATION */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', padding: '2.5rem 1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={currentPage === 1}
            style={{
              background: currentPage === 1 ? '#0c0d12' : '#14151f',
              border: '1px solid var(--glass-border)',
              color: currentPage === 1 ? '#475569' : '#f8fafc',
              padding: '0.55rem 0.95rem',
              borderRadius: '9px',
              cursor: currentPage === 1 ? 'default' : 'pointer',
              fontFamily: 'inherit',
              fontWeight: 800,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ChevronLeft size={16} /> Prev
          </button>

          {getPageNumbers().map((page, i) => (
            page === '...' ? (
              <span key={`dot-${i}`} style={{ color: '#64748b', padding: '0 0.3rem', fontSize: '0.88rem' }}>…</span>
            ) : (
              <button
                key={page}
                onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{
                  background: page === currentPage ? '#7c3aed' : '#0c0d12',
                  color: '#ffffff',
                  border: page === currentPage ? '1px solid #7c3aed' : '1px solid var(--glass-border)',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '9px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: page === currentPage ? 900 : 700,
                  fontSize: '0.88rem',
                  minWidth: '38px',
                }}
              >
                {page}
              </button>
            )
          ))}

          <button
            onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={currentPage === totalPages}
            style={{
              background: currentPage === totalPages ? '#0c0d12' : '#14151f',
              border: '1px solid var(--glass-border)',
              color: currentPage === totalPages ? '#475569' : '#f8fafc',
              padding: '0.55rem 0.95rem',
              borderRadius: '9px',
              cursor: currentPage === totalPages ? 'default' : 'pointer',
              fontFamily: 'inherit',
              fontWeight: 800,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

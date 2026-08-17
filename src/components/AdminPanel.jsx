import React, { useState, useMemo } from 'react';
import { PlusCircle, RefreshCw, Trash2, Edit3, Save, Database, Download, ShieldCheck, Award, Search, Filter, BarChart3, X, ChevronLeft, ChevronRight, Image } from 'lucide-react';
import PetAvatar from './PetAvatar';

export default function AdminPanel({ pets, currentUser, onRefreshPets }) {
  const [formData, setFormData] = useState({
    name: '', rarity: 'Legendary', baseValue: '', demand: 5, status: 'Stable', image: '',
  });

  const [staffUsername, setStaffUsername] = useState('');
  const [staffRoblox, setStaffRoblox] = useState('');
  const [staffRank, setStaffRank] = useState('Value Editor');
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [msg, setMsg] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Optimized search, filter, pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const isOwner = currentUser && currentUser.role === 'owner';

  // Database Stats (memoized)
  const dbStats = useMemo(() => {
    const counts = {};
    let totalValue = 0;
    let withImages = 0;
    pets.forEach(p => {
      counts[p.rarity] = (counts[p.rarity] || 0) + 1;
      totalValue += p.baseValue || 0;
      if (p.image && p.image.startsWith('http')) withImages++;
    });
    return { counts, totalValue, withImages, total: pets.length };
  }, [pets]);

  // Filtered & sorted pets (memoized)
  const filteredPets = useMemo(() => {
    let result = [...pets];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }

    if (filterRarity !== 'all') {
      result = result.filter(p => p.rarity === filterRarity);
    }

    result.sort((a, b) => {
      let va, vb;
      if (sortField === 'name') { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
      else if (sortField === 'value') { va = a.baseValue; vb = b.baseValue; }
      else if (sortField === 'demand') { va = a.demand; vb = b.demand; }
      else if (sortField === 'rarity') { va = a.rarity; vb = b.rarity; }
      else { va = a.name; vb = b.name; }

      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [pets, searchQuery, filterRarity, sortField, sortDir]);

  const totalPages = Math.ceil(filteredPets.length / pageSize);
  const paginatedPets = filteredPets.slice((page - 1) * pageSize, page * pageSize);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignStaffRank = async (e) => {
    e.preventDefault();
    if (!staffUsername || !staffRank) return;
    try {
      const res = await fetch('/api/staff', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: staffUsername, robloxUsername: staffRoblox, rank: staffRank }),
      });
      const data = await res.json();
      setMsg(data.success ? { type: 'success', text: data.message } : { type: 'error', text: data.error });
      if (data.success) { setStaffUsername(''); setStaffRoblox(''); }
    } catch { setMsg({ type: 'error', text: 'Failed to assign staff rank.' }); }
  };

  const handleCreatePet = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.baseValue) {
      setMsg({ type: 'error', text: 'Pet Name and Base Value are required.' }); return;
    }
    setLoading(true); setMsg(null);
    try {
      const res = await fetch('/api/pets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: `Added "${data.pet.name}"!` });
        setFormData({ name: '', rarity: 'Legendary', baseValue: '', demand: 5, status: 'Stable', image: '' });
        if (onRefreshPets) onRefreshPets();
      } else { setMsg({ type: 'error', text: data.error }); }
    } catch (err) { setMsg({ type: 'error', text: 'Failed: ' + err.message }); }
    finally { setLoading(false); }
  };

  const handleScrapeWiki = async () => {
    setScraping(true); setMsg(null);
    try {
      const res = await fetch('/api/scrape', { method: 'POST' });
      const data = await res.json();
      setMsg(data.success
        ? { type: 'success', text: `Scraped! Added ${data.added} new pets. Total: ${data.total}.` }
        : { type: 'error', text: data.error });
      if (data.success && onRefreshPets) onRefreshPets();
    } catch (err) { setMsg({ type: 'error', text: 'Scraper failed: ' + err.message }); }
    finally { setScraping(false); }
  };

  const handleDeletePet = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/pets/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { setMsg({ type: 'success', text: `Deleted "${name}".` }); if (onRefreshPets) onRefreshPets(); }
    } catch { setMsg({ type: 'error', text: 'Failed to delete pet.' }); }
  };

  const startEdit = (pet) => {
    setEditingId(pet.id);
    setEditValues({ baseValue: pet.baseValue, demand: pet.demand, status: pet.status || 'Stable', rarity: pet.rarity, image: pet.image || '' });
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`/api/pets/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });
      const data = await res.json();
      if (data.success) { setEditingId(null); if (onRefreshPets) onRefreshPets(); }
    } catch { setMsg({ type: 'error', text: 'Failed to update pet.' }); }
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const rarityColor = { Secret: '#b967ff', Legendary: '#ffcc00', Epic: '#00e5ff', Rare: '#00e676', Common: '#94a3b8', Unique: '#ff9100' };

  return (
    <div style={{ paddingBottom: '4rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '900' }}>
          Admin <span style={{ color: '#ffcc00' }}>Control Panel</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.3rem' }}>
          Manage pets, staff ranks, sync wiki data, and monitor database health.
        </p>
      </div>

      {msg && (
        <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', background: msg.type === 'success' ? 'rgba(0,230,118,0.12)' : 'rgba(255,23,68,0.12)', border: `1px solid ${msg.type === 'success' ? '#00e676' : '#ff1744'}`, color: msg.type === 'success' ? '#00e676' : '#ff1744', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {msg.text}
          <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} onClick={() => setMsg(null)}>✕</button>
        </div>
      )}

      {/* DATABASE STATS DASHBOARD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{dbStats.total}</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>Total Pets</div>
        </div>
        {Object.entries(dbStats.counts).sort((a,b) => b[1]-a[1]).map(([rarity, count]) => (
          <div key={rarity} className="glass-card" style={{ padding: '1rem', textAlign: 'center', borderTop: `3px solid ${rarityColor[rarity] || '#94a3b8'}` }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: rarityColor[rarity] || '#fff' }}>{count}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>{rarity}</div>
          </div>
        ))}
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center', borderTop: '3px solid #10b981' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>{dbStats.withImages}</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>With Images</div>
        </div>
      </div>

      {/* ACTION CARDS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        {/* WIKI SCRAPER */}
        <div className="glass-card" style={{ borderLeft: '4px solid #ffcc00' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Download size={18} color="#ffcc00" /> Sync Fandom Wiki
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
            Pull latest pets from the official BGS Wiki (Category:Pets).
          </p>
          <button className="btn-primary" onClick={handleScrapeWiki} disabled={scraping} style={{ width: '100%', justifyContent: 'center' }}>
            <RefreshCw size={15} className={scraping ? 'spin' : ''} />
            {scraping ? 'Syncing...' : 'Run Wiki Sync'}
          </button>
        </div>

        {/* STAFF RANK (Owner Only) */}
        {isOwner && (
          <div className="glass-card" style={{ borderLeft: '4px solid #b967ff' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Award size={18} color="#b967ff" /> Assign Staff Rank
            </h3>
            <form onSubmit={handleAssignStaffRank}>
              <input type="text" className="form-input" placeholder="Username" value={staffUsername} onChange={(e) => setStaffUsername(e.target.value)} required style={{ marginBottom: '0.4rem' }} />
              <input type="text" className="form-input" placeholder="Roblox Handle" value={staffRoblox} onChange={(e) => setStaffRoblox(e.target.value)} style={{ marginBottom: '0.4rem' }} />
              <select className="form-input" value={staffRank} onChange={(e) => setStaffRank(e.target.value)} style={{ marginBottom: '0.5rem' }}>
                <option value="Head Moderator">Head Moderator</option>
                <option value="Value Editor">Value Editor</option>
                <option value="Junior Moderator">Junior Moderator</option>
              </select>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #b967ff, #ff4081)' }}>
                Assign Rank
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ADD PET FORM (Collapsible) */}
      <details className="glass-card" style={{ marginBottom: '2rem' }}>
        <summary style={{ fontSize: '1.15rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00e5ff' }}>
          <PlusCircle size={20} /> Add New Pet Manually
        </summary>
        <form onSubmit={handleCreatePet} style={{ marginTop: '1rem' }}>
          <div className="form-grid">
            <div className="form-group">
              <label>Pet Name *</label>
              <input type="text" name="name" className="form-input" placeholder="e.g. Overlord Dragon" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Base Value (⚡) *</label>
              <input type="number" name="baseValue" className="form-input" placeholder="e.g. 150000" value={formData.baseValue} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Rarity</label>
              <select name="rarity" className="form-input" value={formData.rarity} onChange={handleInputChange}>
                <option value="Secret">Secret</option>
                <option value="Legendary">Legendary</option>
                <option value="Unique">Unique</option>
                <option value="Epic">Epic</option>
                <option value="Rare">Rare</option>
                <option value="Common">Common</option>
              </select>
            </div>
            <div className="form-group">
              <label>Demand (1-10)</label>
              <input type="number" name="demand" min="1" max="10" className="form-input" value={formData.demand} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Trend</label>
              <select name="status" className="form-input" value={formData.status} onChange={handleInputChange}>
                <option value="Rising">Rising</option>
                <option value="Hyped">Hyped</option>
                <option value="Stable">Stable</option>
                <option value="Dropping">Dropping</option>
              </select>
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input type="url" name="image" className="form-input" placeholder="https://static.wikia.nocookie.net/..." value={formData.image} onChange={handleInputChange} />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Adding...' : 'Save New Pet'}
          </button>
        </form>
      </details>

      {/* PET DATABASE TABLE WITH SEARCH/FILTER/SORT/PAGINATION */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Database size={20} color="#b967ff" /> Pet Database ({filteredPets.length}/{pets.length})
          </h3>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input type="text" className="search-input-box" placeholder="Search pets..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} style={{ paddingLeft: '2rem', margin: 0, width: '200px', fontSize: '0.85rem' }} />
            </div>
            <select className="search-input-box" value={filterRarity} onChange={(e) => { setFilterRarity(e.target.value); setPage(1); }} style={{ margin: 0, width: '130px', fontSize: '0.85rem' }}>
              <option value="all">All Rarity</option>
              <option value="Secret">Secret ({dbStats.counts.Secret || 0})</option>
              <option value="Legendary">Legendary ({dbStats.counts.Legendary || 0})</option>
              <option value="Unique">Unique ({dbStats.counts.Unique || 0})</option>
              <option value="Epic">Epic ({dbStats.counts.Epic || 0})</option>
              <option value="Rare">Rare ({dbStats.counts.Rare || 0})</option>
              <option value="Common">Common ({dbStats.counts.Common || 0})</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--glass-border)', color: '#94a3b8' }}>
                <th style={{ padding: '0.6rem', cursor: 'pointer' }} onClick={() => handleSort('name')}>Pet {sortField === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th style={{ padding: '0.6rem', cursor: 'pointer' }} onClick={() => handleSort('rarity')}>Rarity {sortField === 'rarity' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th style={{ padding: '0.6rem', cursor: 'pointer' }} onClick={() => handleSort('value')}>Value {sortField === 'value' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th style={{ padding: '0.6rem', cursor: 'pointer' }} onClick={() => handleSort('demand')}>Demand {sortField === 'demand' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th style={{ padding: '0.6rem' }}>Image</th>
                <th style={{ padding: '0.6rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPets.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(124,58,237,0.08)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <PetAvatar name={p.name} rarity={p.rarity} image={p.image} size={30} />
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.6rem' }}>
                    {editingId === p.id ? (
                      <select style={{ background: '#0a0b10', color: '#fff', border: '1px solid #7c3aed', padding: '3px 6px', borderRadius: '6px', fontSize: '0.82rem' }}
                        value={editValues.rarity} onChange={(e) => setEditValues({ ...editValues, rarity: e.target.value })}>
                        <option>Secret</option><option>Legendary</option><option>Unique</option><option>Epic</option><option>Rare</option><option>Common</option>
                      </select>
                    ) : (
                      <span style={{ color: rarityColor[p.rarity] || '#fff', fontWeight: 800, fontSize: '0.82rem' }}>{p.rarity}</span>
                    )}
                  </td>
                  <td style={{ padding: '0.6rem', color: '#ffcc00', fontWeight: 700 }}>
                    {editingId === p.id ? (
                      <input type="number" style={{ width: '90px', background: '#0a0b10', color: '#ffcc00', border: '1px solid #ffcc00', padding: '3px 6px', borderRadius: '6px', fontSize: '0.82rem' }}
                        value={editValues.baseValue} onChange={(e) => setEditValues({ ...editValues, baseValue: Number(e.target.value) })} />
                    ) : (
                      `⚡ ${(p.baseValue || 0).toLocaleString()}`
                    )}
                  </td>
                  <td style={{ padding: '0.6rem' }}>
                    {editingId === p.id ? (
                      <input type="number" min="1" max="10" style={{ width: '55px', background: '#0a0b10', color: '#fff', border: '1px solid #7c3aed', padding: '3px 6px', borderRadius: '6px', fontSize: '0.82rem' }}
                        value={editValues.demand} onChange={(e) => setEditValues({ ...editValues, demand: Number(e.target.value) })} />
                    ) : (
                      <span style={{ fontWeight: 700 }}>{p.demand}/10</span>
                    )}
                  </td>
                  <td style={{ padding: '0.6rem' }}>
                    {p.image && p.image.startsWith('http')
                      ? <span style={{ color: '#10b981', fontSize: '0.78rem', fontWeight: 700 }}>✓ Yes</span>
                      : <span style={{ color: '#ff1744', fontSize: '0.78rem', fontWeight: 700 }}>✗ Missing</span>}
                  </td>
                  <td style={{ padding: '0.6rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {editingId === p.id ? (
                      <>
                        <button style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', marginRight: '6px' }} onClick={() => saveEdit(p.id)} title="Save"><Save size={15} /></button>
                        <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={() => setEditingId(null)} title="Cancel"><X size={15} /></button>
                      </>
                    ) : (
                      <>
                        <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginRight: '6px' }} onClick={() => startEdit(p)} title="Edit"><Edit3 size={15} /></button>
                        <button style={{ background: 'none', border: 'none', color: '#ff1744', cursor: 'pointer' }} onClick={() => handleDeletePet(p.id, p.name)} title="Delete"><Trash2 size={15} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem', padding: '0.75rem 0' }}>
            <button className="filter-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ padding: '0.4rem 0.75rem' }}>
              <ChevronLeft size={16} /> Prev
            </button>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#a78bfa' }}>
              Page {page} of {totalPages}
            </span>
            <button className="filter-btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ padding: '0.4rem 0.75rem' }}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

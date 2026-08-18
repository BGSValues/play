import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle,
  RefreshCw,
  Trash2,
  Edit3,
  Save,
  Database,
  Download,
  ShieldCheck,
  ShieldAlert,
  Award,
  Search,
  Filter,
  BarChart3,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  UserX,
  UserCheck,
  LogOut,
  AlertTriangle,
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  Zap,
  Tag,
} from 'lucide-react';
import PetAvatar from './PetAvatar';

export default function AdminPanel({ pets, currentUser, onRefreshPets, onOpenLogin, onBackToValues }) {
  const [adminTab, setAdminTab] = useState('pets'); // 'pets' or 'users'
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Detailed Pet / Hat Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = create new, item = edit existing
  const [itemForm, setItemForm] = useState({
    type: 'pet', // 'pet' or 'hat'
    name: '',
    rarity: 'Legendary',
    category: 'Legendary Pets',
    baseValue: '',
    shinyValue: '',
    mythicValue: '',
    demand: 5,
    status: 'Stable',
    image: '',
    description: '',
    movementType: 'Fly',
    egg: '',
    chance: '',
    buffBubbles: '',
    buffCoins: '',
    buffGems: '',
    buffAll: '',
    buffSpecialKey: '',
    buffSpecialVal: '',
    existNormal: '',
    existShiny: '',
    existMythic: '',
    existShinyMythic: '',
    existHats: '',
    existSpecial: '',
    existNote: '',
  });

  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [msg, setMsg] = useState(null);

  // Pet search, filter, pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all', 'pet', 'hat'
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const isStaff = currentUser && (currentUser.role === 'owner' || currentUser.role === 'mod');
  const isOwner = currentUser && currentUser.role === 'owner';

  // Fetch Users List
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.users) {
          setUsersList(data.users);
        }
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff) {
      fetchUsers();
    }
  }, [isStaff]);

  // Open Detailed Item Creator
  const handleOpenCreateModal = (type = 'pet') => {
    setEditingItem(null);
    setItemForm({
      type,
      name: '',
      rarity: type === 'hat' ? 'Unique' : 'Legendary',
      category: type === 'hat' ? 'Hats' : 'Legendary Pets',
      baseValue: '',
      shinyValue: '',
      mythicValue: '',
      demand: 5,
      status: 'Stable',
      image: '',
      description: type === 'hat' ? 'Equippable Hat Accessory in Bubble Gum Simulator.' : 'Companion Pet in Bubble Gum Simulator.',
      movementType: type === 'hat' ? 'Hat' : 'Fly',
      egg: '',
      chance: '',
      buffBubbles: '100',
      buffCoins: '250',
      buffGems: '200',
      buffAll: '',
      buffSpecialKey: '',
      buffSpecialVal: '',
      existNormal: '',
      existShiny: '',
      existMythic: '',
      existShinyMythic: '',
      existHats: '',
      existSpecial: '',
      existNote: '',
    });
    setIsEditorOpen(true);
  };

  // Open Detailed Item Editor for Existing Pet/Hat
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    const buffs = item.stats?.buffs || {};
    const existence = item.existence || {};
    const isHat = item.type === 'hat' || item.category?.toLowerCase().includes('hat');

    setItemForm({
      type: isHat ? 'hat' : 'pet',
      name: item.name || '',
      rarity: item.rarity || 'Legendary',
      category: item.category || (isHat ? 'Hats' : `${item.rarity} Pets`),
      baseValue: item.baseValue !== null && item.baseValue !== undefined ? String(item.baseValue) : '',
      shinyValue: item.customValues?.shiny ? String(item.customValues.shiny) : '',
      mythicValue: item.customValues?.mythic ? String(item.customValues.mythic) : '',
      demand: item.demand !== undefined ? item.demand : 5,
      status: item.status || 'Stable',
      image: item.image || '',
      description: item.description || '',
      movementType: item.stats?.movementType || (isHat ? 'Hat' : 'Walk'),
      egg: item.stats?.egg || existence.eggOrigin || '',
      chance: item.stats?.chance ? String(item.stats.chance) : existence.hatchRate || '',
      buffBubbles: buffs.Bubbles ? String(buffs.Bubbles) : '',
      buffCoins: buffs.Coins ? String(buffs.Coins) : '',
      buffGems: buffs.Gems ? String(buffs.Gems) : '',
      buffAll: buffs.All ? String(buffs.All) : '',
      buffSpecialKey: Object.keys(buffs).find((k) => !['Bubbles', 'Coins', 'Gems', 'All'].includes(k)) || '',
      buffSpecialVal: Object.entries(buffs).find(([k]) => !['Bubbles', 'Coins', 'Gems', 'All'].includes(k))?.[1] ? String(Object.entries(buffs).find(([k]) => !['Bubbles', 'Coins', 'Gems', 'All'].includes(k))[1]) : '',
      existNormal: existence.normal || '',
      existShiny: existence.shiny || '',
      existMythic: existence.mythic || '',
      existShinyMythic: existence.shinyMythic || '',
      existHats: existence.hats || '',
      existSpecial: existence.special || '',
      existNote: existence.note || '',
    });
    setIsEditorOpen(true);
  };

  // Save Pet/Hat Changes
  const handleSaveItemForm = async (e) => {
    e.preventDefault();
    if (!itemForm.name.trim()) {
      setMsg({ type: 'error', text: 'Item Name is required.' });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const isHat = itemForm.type === 'hat';
      const buffs = {};
      if (itemForm.buffBubbles) buffs.Bubbles = Number(itemForm.buffBubbles);
      if (itemForm.buffCoins) buffs.Coins = Number(itemForm.buffCoins);
      if (itemForm.buffGems) buffs.Gems = Number(itemForm.buffGems);
      if (itemForm.buffAll) buffs.All = Number(itemForm.buffAll);
      if (itemForm.buffSpecialKey && itemForm.buffSpecialVal) {
        buffs[itemForm.buffSpecialKey] = Number(itemForm.buffSpecialVal);
      }

      const existence = {};
      if (itemForm.existNormal) existence.normal = itemForm.existNormal;
      if (itemForm.existShiny) existence.shiny = itemForm.existShiny;
      if (itemForm.existMythic) existence.mythic = itemForm.existMythic;
      if (itemForm.existShinyMythic) existence.shinyMythic = itemForm.existShinyMythic;
      if (itemForm.existHats) existence.hats = itemForm.existHats;
      if (itemForm.existSpecial) existence.special = itemForm.existSpecial;
      if (itemForm.existNote) existence.note = itemForm.existNote;
      if (itemForm.egg) existence.eggOrigin = itemForm.egg;
      if (itemForm.chance) existence.hatchRate = itemForm.chance;

      const payload = {
        name: itemForm.name.trim(),
        type: isHat ? 'hat' : 'pet',
        rarity: itemForm.rarity,
        category: itemForm.category || (isHat ? 'Hats' : `${itemForm.rarity} Pets`),
        baseValue: itemForm.baseValue !== '' ? Number(itemForm.baseValue) : null,
        demand: Number(itemForm.demand) || 5,
        status: itemForm.status,
        image: itemForm.image.trim(),
        description: itemForm.description.trim(),
        stats: isHat
          ? null
          : {
              buffs,
              movementType: itemForm.movementType,
              egg: itemForm.egg || null,
              chance: itemForm.chance ? parseFloat(itemForm.chance) : null,
            },
        existence,
      };

      if (itemForm.shinyValue || itemForm.mythicValue) {
        payload.customValues = {
          shiny: itemForm.shinyValue ? Number(itemForm.shinyValue) : null,
          mythic: itemForm.mythicValue ? Number(itemForm.mythicValue) : null,
        };
      }

      let res;
      if (editingItem) {
        res = await fetch(`/api/pets/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/pets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: `Successfully saved "${itemForm.name}"!` });
        setIsEditorOpen(false);
        if (onRefreshPets) onRefreshPets();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to save item.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Server error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  // Filtered & Sorted Pets
  const filteredPets = useMemo(() => {
    let result = [...pets];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (filterRarity !== 'all') {
      result = result.filter((p) => p.rarity === filterRarity);
    }

    if (filterType !== 'all') {
      if (filterType === 'hat') {
        result = result.filter((p) => p.type === 'hat' || p.category?.toLowerCase().includes('hat'));
      } else if (filterType === 'pet') {
        result = result.filter((p) => p.type !== 'hat' && !p.category?.toLowerCase().includes('hat'));
      }
    }

    result.sort((a, b) => {
      let va, vb;
      if (sortField === 'name') {
        va = a.name.toLowerCase();
        vb = b.name.toLowerCase();
      } else if (sortField === 'value') {
        va = a.baseValue || 0;
        vb = b.baseValue || 0;
      } else if (sortField === 'demand') {
        va = a.demand || 0;
        vb = b.demand || 0;
      } else if (sortField === 'rarity') {
        va = a.rarity || '';
        vb = b.rarity || '';
      } else {
        va = a.name;
        vb = b.name;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [pets, searchQuery, filterRarity, filterType, sortField, sortDir]);

  const totalPages = Math.ceil(filteredPets.length / pageSize);
  const paginatedPets = filteredPets.slice((page - 1) * pageSize, page * pageSize);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const q = userSearch.toLowerCase();
      const matchSearch =
        !q ||
        u.username.toLowerCase().includes(q) ||
        u.robloxUsername?.toLowerCase().includes(q) ||
        u.discord?.toLowerCase().includes(q);
      const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [usersList, userSearch, userRoleFilter, userStatusFilter]);

  // ---------------- USER MODERATION ACTIONS ----------------
  const handleBanUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to BAN @${username}? Their listings will be removed.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        fetchUsers();
      } else {
        setMsg({ type: 'error', text: data.error });
      }
    } catch {
      setMsg({ type: 'error', text: 'Failed to ban user.' });
    }
  };

  const handleUnbanUser = async (userId, username) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/unban`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        fetchUsers();
      }
    } catch {
      setMsg({ type: 'error', text: 'Failed to unban user.' });
    }
  };

  const handleKickUser = async (userId, username) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/kick`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        fetchUsers();
      }
    } catch {
      setMsg({ type: 'error', text: 'Failed to kick user.' });
    }
  };

  const handleToggleRole = async (user) => {
    const nextRole = user.role === 'mod' ? 'member' : 'mod';
    const nextRank = nextRole === 'mod' ? 'Head Moderator' : 'Verified Trader';
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole, rank: nextRank }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        fetchUsers();
      }
    } catch {
      setMsg({ type: 'error', text: 'Failed to update role.' });
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Permanently delete @${username}'s account? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        fetchUsers();
      }
    } catch {
      setMsg({ type: 'error', text: 'Failed to delete user.' });
    }
  };

  const handleSyncWiki = async () => {
    setScraping(true);
    setMsg(null);
    try {
      const res = await fetch('/api/pets/scrape', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: `Sync complete! Added ${data.added} pets. Total: ${data.total}` });
        if (onRefreshPets) onRefreshPets();
      } else {
        setMsg({ type: 'error', text: data.error || 'Scrape failed' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Server error during Wiki sync.' });
    } finally {
      setScraping(false);
    }
  };

  const handleDeletePet = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from database?`)) return;
    try {
      const res = await fetch(`/api/pets/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: `Deleted "${name}"` });
        if (onRefreshPets) onRefreshPets();
      }
    } catch {
      setMsg({ type: 'error', text: 'Failed to delete pet.' });
    }
  };

  // ---------------- STRICT AUTHENTICATION GUARD ----------------
  if (!isStaff) {
    return (
      <div style={{ maxWidth: '620px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div
          className="glass-card"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            border: '1px solid #ff1744',
            boxShadow: '0 20px 60px rgba(255, 23, 68, 0.15)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'rgba(255, 23, 68, 0.15)',
              border: '1px solid rgba(255, 23, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
            }}
          >
            <Lock size={36} color="#ff1744" />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '0.6rem' }}>
            Admin Access Restricted
          </h2>

          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            The Admin Control Panel is strictly reserved for authorized Lead Developers and Head Staff Moderators.
            Please sign in with your staff credentials.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              className="btn-primary"
              onClick={onOpenLogin}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.85rem 1.6rem' }}
            >
              <ShieldCheck size={18} /> Staff Sign In
            </button>
            <button
              className="filter-btn"
              onClick={onBackToValues}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.85rem 1.4rem' }}
            >
              Return to Value List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- AUTHENTICATED ADMIN PANEL ----------------
  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem 1.5rem 5rem 1.5rem' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff' }}>
          Admin & Moderation <span style={{ color: 'var(--primary-gold)' }}>Control Center</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.3rem' }}>
          Add & edit new pets and hats, set custom images, adjust in-game stats, manage user sessions, and sync Wiki updates.
        </p>
      </div>

      {/* Toast Alert */}
      {msg && (
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto 1.5rem auto',
            padding: '0.85rem 1.2rem',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 23, 68, 0.15)',
            border: msg.type === 'success' ? '1px solid #10b981' : '1px solid #ff1744',
            color: msg.type === 'success' ? '#10b981' : '#ff1744',
          }}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Admin Navigation Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          className={`filter-btn ${adminTab === 'pets' ? 'active' : ''}`}
          onClick={() => setAdminTab('pets')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.8rem', fontSize: '1rem', fontWeight: 900 }}
        >
          <Database size={18} /> Pet & Hat Database Studio ({pets.length})
        </button>

        <button
          className={`filter-btn ${adminTab === 'users' ? 'active' : ''}`}
          onClick={() => setAdminTab('users')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.8rem', fontSize: '1rem', fontWeight: 900 }}
        >
          <Users size={18} /> User Moderation & Live Sessions ({usersList.length})
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: PET & HAT DATABASE STUDIO (DETAILED MANAGEMENT)         */}
      {/* ============================================================== */}
      {adminTab === 'pets' && (
        <div>
          {/* Quick Actions & Add Item Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* Create Actions */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlusCircle size={20} color="#10b981" /> Add New Item to Database
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                  Add a brand new Pet or Hat with custom image URLs, in-game multipliers, trading values, drop rates, and existence serials.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  onClick={() => handleOpenCreateModal('pet')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.8rem 1rem', fontSize: '0.9rem' }}
                >
                  <Sparkles size={16} /> Add Companion Pet
                </button>
                <button
                  className="filter-btn"
                  onClick={() => handleOpenCreateModal('hat')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.8rem 1rem', fontSize: '0.9rem', borderColor: '#a78bfa', color: '#a78bfa' }}
                >
                  <Award size={16} /> Add Hat Accessory
                </button>
              </div>
            </div>

            {/* Sync Wiki Card */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={20} color="#00e5ff" /> Sync with Official Fandom Wiki
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                  Automatically pull the newest pets, transparent 3D asset renders, and base statistics from the BGS MediaWiki API.
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={handleSyncWiki}
                disabled={scraping}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.8rem', background: 'linear-gradient(135deg, #00e5ff, #0284c7)' }}
              >
                <RefreshCw size={16} className={scraping ? 'spin' : ''} /> {scraping ? 'Syncing MediaWiki...' : 'Run Wiki Scraper Sync'}
              </button>
            </div>
          </div>

          {/* Database Items Table */}
          <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={18} color="var(--primary-gold)" /> Pet & Hat Database ({filteredPets.length} / {pets.length})
              </h3>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search database..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', background: '#000', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.45rem 0.6rem 0.45rem 2rem', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{ background: '#000', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.45rem 0.6rem', borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  <option value="all">All Types</option>
                  <option value="pet">🐾 Pets Only</option>
                  <option value="hat">🎩 Hats Only</option>
                </select>

                <select
                  value={filterRarity}
                  onChange={(e) => setFilterRarity(e.target.value)}
                  style={{ background: '#000', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.45rem 0.6rem', borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  <option value="all">All Rarities</option>
                  <option value="Secret">Secret 👑</option>
                  <option value="Legendary">Legendary ⚡</option>
                  <option value="Unique">Unique</option>
                  <option value="Epic">Epic</option>
                  <option value="Rare">Rare</option>
                  <option value="Common">Common</option>
                </select>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 0.8rem' }}>Item & Image</th>
                  <th style={{ padding: '0.75rem 0.8rem' }}>Rarity & Type</th>
                  <th style={{ padding: '0.75rem 0.8rem' }}>Trade Value</th>
                  <th style={{ padding: '0.75rem 0.8rem' }}>Demand / Trend</th>
                  <th style={{ padding: '0.75rem 0.8rem' }}>In-Game Stats</th>
                  <th style={{ padding: '0.75rem 0.8rem' }}>Hatched / Exist</th>
                  <th style={{ padding: '0.75rem 0.8rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPets.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.7rem 0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <PetAvatar name={p.name} rarity={p.rarity} image={p.image} size={36} />
                        <div>
                          <div style={{ fontWeight: 800, color: '#fff' }}>{p.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ID: {p.id}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '0.7rem 0.8rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className={`rarity-badge rarity-${p.rarity.toLowerCase()}`} style={{ fontSize: '0.68rem', padding: '2px 6px', width: 'fit-content' }}>
                          {p.rarity}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {p.type === 'hat' || p.category?.toLowerCase().includes('hat') ? '🎩 Hat Accessory' : `🐾 ${p.stats?.movementType || 'Walk'}`}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '0.7rem 0.8rem', fontWeight: 800, color: '#ffcc00' }}>
                      {p.baseValue !== null && p.baseValue !== undefined ? `⚡ ${p.baseValue.toLocaleString()}` : <span style={{ color: '#64748b' }}>Unvalued (N/A)</span>}
                    </td>

                    <td style={{ padding: '0.7rem 0.8rem' }}>
                      <div style={{ color: '#10b981', fontWeight: 800 }}>{p.demand || 5} / 11</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.status || 'Stable'}</div>
                    </td>

                    <td style={{ padding: '0.7rem 0.8rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                      {p.stats?.buffs && Object.keys(p.stats.buffs).length > 0 ? (
                        <div>
                          {p.stats.buffs.Bubbles ? `🎈 +${p.stats.buffs.Bubbles.toLocaleString()} ` : ''}
                          {p.stats.buffs.Coins ? `🪙 x${p.stats.buffs.Coins.toLocaleString()} ` : ''}
                          {p.stats.buffs.Gems ? `💎 x${p.stats.buffs.Gems.toLocaleString()} ` : ''}
                          {p.stats.buffs.All ? `🌟 x${p.stats.buffs.All.toLocaleString()}` : ''}
                        </div>
                      ) : (
                        <span style={{ color: '#64748b' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '0.7rem 0.8rem', fontSize: '0.75rem', color: '#ffcc00' }}>
                      {p.existence?.special
                        ? `🎉 ${p.existence.special}`
                        : p.existence?.normal
                        ? `🥚 ${p.existence.normal}`
                        : p.existence?.hats
                        ? `📦 ${p.existence.hats}`
                        : p.stats?.chance
                        ? `🎯 ${p.stats.chance}%`
                        : <span style={{ color: '#64748b' }}>—</span>}
                    </td>

                    <td style={{ padding: '0.7rem 0.8rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid #7c3aed', color: '#a78bfa', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, fontSize: '0.75rem' }}
                          title="Open Detailed Editor"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeletePet(p.id, p.name)}
                          style={{ background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.3)', color: '#ff1744', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                          title="Delete Item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.25rem' }}>
                <button className="filter-btn" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft size={14} /> Prev
                </button>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </span>
                <button className="filter-btn" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: USER MANAGEMENT & MODERATION CENTER                     */}
      {/* ============================================================== */}
      {adminTab === 'users' && (
        <div>
          {/* User Metrics Banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total Registered Users</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00e5ff', marginTop: '4px' }}>{usersList.length}</div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Active Traders</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
                {usersList.filter((u) => u.status !== 'banned').length}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Banned Accounts</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ff1744', marginTop: '4px' }}>
                {usersList.filter((u) => u.status === 'banned').length}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Staff Moderators</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffcc00', marginTop: '4px' }}>
                {usersList.filter((u) => u.role === 'owner' || u.role === 'mod').length}
              </div>
            </div>
          </div>

          {/* User Controls & Filter Bar */}
          <div className="controls-bar" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="search-input-box"
                  style={{ paddingLeft: '2.2rem', margin: 0 }}
                  placeholder="Search username, Roblox ID, or Discord..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <select className="search-input-box" style={{ width: '150px', margin: 0 }} value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                <option value="all">All Roles</option>
                <option value="owner">Owners 👑</option>
                <option value="mod">Staff Mods 🛡️</option>
                <option value="member">Traders</option>
              </select>

              <select className="search-input-box" style={{ width: '150px', margin: 0 }} value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="active">Active 🟢</option>
                <option value="banned">Banned 🔴</option>
                <option value="kicked">Kicked 🟡</option>
              </select>

              <button className="filter-btn" onClick={fetchUsers} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={14} className={usersLoading ? 'spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* Users Moderation Table */}
          <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User Profile</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Roblox & Discord</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role & Rank</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Last Active</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Trades</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No users found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: user.role === 'owner' ? '#ffcc00' : user.role === 'mod' ? '#7c3aed' : 'rgba(255,255,255,0.1)',
                              color: user.role === 'owner' ? '#000' : '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                            }}
                          >
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#fff' }}>{user.username}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ID: {user.id}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ color: '#cbd5e1', fontWeight: 600 }}>🎮 {user.robloxUsername || 'Not set'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>💬 {user.discord || 'None'}</div>
                      </td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: user.role === 'owner' ? 'rgba(255,204,0,0.15)' : user.role === 'mod' ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)',
                            color: user.role === 'owner' ? '#ffcc00' : user.role === 'mod' ? '#a78bfa' : '#94a3b8',
                            border: user.role === 'owner' ? '1px solid rgba(255,204,0,0.4)' : user.role === 'mod' ? '1px solid rgba(124,58,237,0.4)' : '1px solid var(--glass-border)',
                          }}
                        >
                          {user.role === 'owner' ? '👑 Owner' : user.role === 'mod' ? '🛡️ Moderator' : 'Trader'}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: user.status === 'banned' ? 'rgba(255,23,68,0.15)' : user.status === 'kicked' ? 'rgba(234,179,8,0.15)' : 'rgba(16,185,129,0.15)',
                            color: user.status === 'banned' ? '#ff1744' : user.status === 'kicked' ? '#eab308' : '#10b981',
                          }}
                        >
                          {user.status === 'banned' ? '🔴 Banned' : user.status === 'kicked' ? '🟡 Kicked' : '🟢 Active'}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.78rem' }}>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </td>

                      <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#fff' }}>
                        {user.listingsCount || 0}
                      </td>

                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {user.status === 'banned' ? (
                            <button
                              onClick={() => handleUnbanUser(user.id, user.username)}
                              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#10b981', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                              title="Unban Account"
                            >
                              <UserCheck size={14} /> Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanUser(user.id, user.username)}
                              style={{ background: 'rgba(255,23,68,0.15)', border: '1px solid #ff1744', color: '#ff1744', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                              title="Ban and delete trades"
                            >
                              <UserX size={14} /> Ban
                            </button>
                          )}

                          <button
                            onClick={() => handleKickUser(user.id, user.username)}
                            style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid #eab308', color: '#eab308', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                            title="Force Logout / Kick Session"
                          >
                            <LogOut size={14} /> Kick
                          </button>

                          {isOwner && user.role !== 'owner' && (
                            <button
                              onClick={() => handleToggleRole(user)}
                              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid #7c3aed', color: '#a78bfa', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                              title={user.role === 'mod' ? 'Demote to Member' : 'Promote to Moderator'}
                            >
                              {user.role === 'mod' ? 'Demote' : 'Promote Mod'}
                            </button>
                          )}

                          {isOwner && user.role !== 'owner' && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: '#64748b', padding: '4px 6px', borderRadius: '6px', cursor: 'pointer' }}
                              title="Delete Account"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* COMPREHENSIVE DETAILED ITEM & HAT EDITOR MODAL                 */}
      {/* ============================================================== */}
      {isEditorOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
            overflowY: 'auto',
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '860px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              border: '1px solid rgba(124, 58, 237, 0.4)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {editingItem ? <Edit3 size={20} color="var(--primary-gold)" /> : <PlusCircle size={20} color="#10b981" />}
                  {editingItem ? `Edit: ${editingItem.name}` : `Add New ${itemForm.type === 'hat' ? 'Hat Accessory' : 'Companion Pet'}`}
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Configure identity, image asset, in-game stat scaling, trading values, and existence serials.
                </span>
              </div>
              <button onClick={() => setIsEditorOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItemForm}>
              {/* SECTION 1: IDENTITY & TYPE */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#a78bfa', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={16} /> 1. Item Identity & Category
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Item Type</label>
                    <select
                      value={itemForm.type}
                      onChange={(e) => setItemForm({ ...itemForm, type: e.target.value, category: e.target.value === 'hat' ? 'Hats' : `${itemForm.rarity} Pets` })}
                      style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                    >
                      <option value="pet">🐾 Companion Pet</option>
                      <option value="hat">🎩 Hat Accessory</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Item Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Almighty Dragon, Festive Top Hat"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Rarity</label>
                    <select
                      value={itemForm.rarity}
                      onChange={(e) => setItemForm({ ...itemForm, rarity: e.target.value })}
                      style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                    >
                      {['Common', 'Rare', 'Epic', 'Unique', 'Legendary', 'Secret'].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Movement Type</label>
                    <select
                      value={itemForm.movementType}
                      onChange={(e) => setItemForm({ ...itemForm, movementType: e.target.value })}
                      style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                    >
                      <option value="Fly">🦅 Flying</option>
                      <option value="Walk">🐾 Walking</option>
                      <option value="Hat">🎩 Hat Accessory</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: IMAGE CONFIGURATION & LIVE PREVIEW */}
              <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#00e5ff', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={16} /> 2. Image Asset URL & Preview
                </h4>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Image URL / Wiki Image Path</label>
                    <input
                      type="text"
                      placeholder="https://static.wikia.nocookie.net/... or /eggs/..."
                      value={itemForm.image}
                      onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                      style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                      Leave blank to auto-fetch from official BGS Wiki assets by item name.
                    </span>
                  </div>

                  {/* Live Avatar Preview */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0a0b10', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                    <PetAvatar name={itemForm.name || 'Preview'} rarity={itemForm.rarity} image={itemForm.image} size={48} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>LIVE PREVIEW</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{itemForm.name || 'Item Name'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: MARKET & TRADING VALUES */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffcc00', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={16} /> 3. Market Trading Values & Demand
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Base Normal Value (⚡)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={itemForm.baseValue}
                      onChange={(e) => setItemForm({ ...itemForm, baseValue: e.target.value })}
                      style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Custom Shiny Value (⚡)</label>
                    <input
                      type="number"
                      placeholder="Auto (2.5x)"
                      value={itemForm.shinyValue}
                      onChange={(e) => setItemForm({ ...itemForm, shinyValue: e.target.value })}
                      style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Demand (0 - 11)</label>
                    <select
                      value={itemForm.demand}
                      onChange={(e) => setItemForm({ ...itemForm, demand: Number(e.target.value) })}
                      style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((d) => (
                        <option key={d} value={d}>{d} / 11</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Market Trend</label>
                    <select
                      value={itemForm.status}
                      onChange={(e) => setItemForm({ ...itemForm, status: e.target.value })}
                      style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                    >
                      <option value="Rising Fast">Rising Fast 🔥</option>
                      <option value="Rising">Rising ⬆</option>
                      <option value="Stable">Stable ↔</option>
                      <option value="Unstable">Unstable 🔄</option>
                      <option value="Dropping">Dropping ⬇</option>
                      <option value="Dropping Fast">Dropping Fast ⬇⬇</option>
                      <option value="Hyped">Hyped 🚀</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 4: IN-GAME BASE MULTIPLIERS (PETS ONLY) */}
              {itemForm.type !== 'hat' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BarChart3 size={16} /> 4. In-Game Multipliers & Stat Buffs
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>🎈 Bubbles (+amount)</label>
                      <input
                        type="number"
                        placeholder="e.g. 995"
                        value={itemForm.buffBubbles}
                        onChange={(e) => setItemForm({ ...itemForm, buffBubbles: e.target.value })}
                        style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>🪙 Coins (x multiplier)</label>
                      <input
                        type="number"
                        placeholder="e.g. 3250"
                        value={itemForm.buffCoins}
                        onChange={(e) => setItemForm({ ...itemForm, buffCoins: e.target.value })}
                        style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>💎 Gems (x multiplier)</label>
                      <input
                        type="number"
                        placeholder="e.g. 2760"
                        value={itemForm.buffGems}
                        onChange={(e) => setItemForm({ ...itemForm, buffGems: e.target.value })}
                        style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>🌟 All Stats (x multiplier)</label>
                      <input
                        type="number"
                        placeholder="Optional"
                        value={itemForm.buffAll}
                        onChange={(e) => setItemForm({ ...itemForm, buffAll: e.target.value })}
                        style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: HATCH ORIGIN & VERIFIED EXISTENCE COUNTS */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ff007f', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={16} /> 5. Egg Origin & Verified Existence Counts
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>🥚 Hatched From Egg</label>
                    <input
                      type="text"
                      placeholder="e.g. Cosmic Egg"
                      value={itemForm.egg}
                      onChange={(e) => setItemForm({ ...itemForm, egg: e.target.value })}
                      style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>🎯 Hatch Chance (%)</label>
                    <input
                      type="text"
                      placeholder="e.g. 0.000016%"
                      value={itemForm.chance}
                      onChange={(e) => setItemForm({ ...itemForm, chance: e.target.value })}
                      style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>🥚 Normal Hatched Exist</label>
                    <input
                      type="text"
                      placeholder="e.g. 608"
                      value={itemForm.existNormal}
                      onChange={(e) => setItemForm({ ...itemForm, existNormal: e.target.value })}
                      style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>✨ Shiny Hatched Exist</label>
                    <input
                      type="text"
                      placeholder="e.g. 5"
                      value={itemForm.existShiny}
                      onChange={(e) => setItemForm({ ...itemForm, existShiny: e.target.value })}
                      style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>🎉 Event / Serial Cap</label>
                    <input
                      type="text"
                      placeholder="e.g. 25 (Dementor)"
                      value={itemForm.existSpecial}
                      onChange={(e) => setItemForm({ ...itemForm, existSpecial: e.target.value })}
                      style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>📦 Hats Unboxed Exist</label>
                    <input
                      type="text"
                      placeholder="e.g. 2,228"
                      value={itemForm.existHats}
                      onChange={(e) => setItemForm({ ...itemForm, existHats: e.target.value })}
                      style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Event Origin Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Exclusive 2020 Easter Egg Hunt Reward"
                    value={itemForm.existNote}
                    onChange={(e) => setItemForm({ ...itemForm, existNote: e.target.value })}
                    style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  className="filter-btn"
                  onClick={() => setIsEditorOpen(false)}
                  style={{ padding: '0.7rem 1.4rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.7rem 1.8rem' }}
                >
                  <Save size={16} /> {loading ? 'Saving Changes...' : editingItem ? 'Save Item Changes' : 'Create & Publish Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

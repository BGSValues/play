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

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all', 'pet', 'hat'
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [sysSettings, setSysSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: '',
    freezeMarketplace: false,
    freezeTradingCalculator: false,
    announcement: {
      enabled: true,
      type: 'event',
      title: '',
      message: '',
    },
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetch('/api/system/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSysSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSafeguards = async (e) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/system/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser?.id },
        body: JSON.stringify(sysSettings),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: 'System safeguards & global announcement updated successfully!' });
      } else {
        setMsg({ type: 'error', text: data.error });
      }
    } catch {
      setMsg({ type: 'error', text: 'Failed to save system safeguards.' });
    } finally {
      setSavingSettings(false);
    }
  };

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
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'x-user-id': currentUser?.id || '' },
      });
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
      const res = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'POST',
        headers: { 'x-user-id': currentUser?.id || '' },
      });
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
      const res = await fetch(`/api/admin/users/${userId}/kick`, {
        method: 'POST',
        headers: { 'x-user-id': currentUser?.id || '' },
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        fetchUsers();
      } else {
        setMsg({ type: 'error', text: data.error });
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
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser?.id || '' },
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
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser?.id || '' },
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        fetchUsers();
      } else {
        setMsg({ type: 'error', text: data.error });
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
        setMsg({ type: 'success', text: `Sync complete! Synced ${data.total} items (${data.updatedRarities || 0} rarities verified, values preserved).` });
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

  // ---------------- STRICT AUTHENTICATION GUARD & DEDICATED STAFF PORTAL ----------------
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthError, setAdminAuthError] = useState(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);

  const handleAdminStaffLogin = async (e) => {
    e.preventDefault();
    setAdminAuthError(null);
    setAdminAuthLoading(true);

    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword,
          pin: adminPassword,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        if (onOpenLogin) {
          // Parent login handler
        }
        localStorage.setItem('bgs_user', JSON.stringify(data.user));
        window.location.reload();
      } else {
        setAdminAuthError(data.error || 'Access Denied: Invalid Staff Credentials.');
      }
    } catch (err) {
      setAdminAuthError('Server authentication error: ' + err.message);
    } finally {
      setAdminAuthLoading(false);
    }
  };

  if (!isStaff) {
    return (
      <div style={{ maxWidth: '520px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div
          className="glass-card"
          style={{
            padding: '2.5rem 2rem',
            border: '1px solid rgba(255, 204, 0, 0.4)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9)',
            position: 'relative',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '18px',
                background: 'rgba(255, 204, 0, 0.12)',
                border: '1px solid rgba(255, 204, 0, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                boxShadow: '0 0 30px rgba(255, 204, 0, 0.2)',
              }}
            >
              <Lock size={32} color="var(--primary-gold)" />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginBottom: '0.4rem' }}>
              Staff Security <span style={{ color: 'var(--primary-gold)' }}>Gateway</span>
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
              Authorized Lead Developers & Head Moderators only. Sign in with database credentials.
            </p>
          </div>

          {adminAuthError && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 800,
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 23, 68, 0.15)',
                border: '1px solid #ff1744',
                color: '#ff1744',
              }}
            >
              <AlertTriangle size={16} />
              <span>{adminAuthError}</span>
            </div>
          )}

          <form onSubmit={handleAdminStaffLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>
                Staff Security ID / Username
              </label>
              <input
                type="text"
                required
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="e.g. Owner_Admin or Staff_Mod"
                style={{
                  width: '100%',
                  background: '#0a0b10',
                  border: '1px solid var(--glass-border)',
                  color: '#fff',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>
                Master Password or Staff PIN
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter Staff Password or PIN"
                style={{
                  width: '100%',
                  background: '#0a0b10',
                  border: '1px solid var(--glass-border)',
                  color: '#fff',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={adminAuthLoading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '1rem',
              }}
            >
              <ShieldCheck size={18} /> {adminAuthLoading ? 'Verifying Security...' : 'Authenticate Staff Access'}
            </button>

            <button
              type="button"
              className="filter-btn"
              onClick={onBackToValues}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.88rem',
                justifyContent: 'center',
              }}
            >
              Return to Public Trading Hub
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------- AUTHENTICATED ADMIN PANEL ----------------
  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem 1.5rem 5rem 1.5rem' }}>
      {/* ━━━━ COMMAND CENTER TELEMETRY & HERO HEADER ━━━━ */}
      <div
        className="glass-card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 204, 0, 0.35)',
          background: 'linear-gradient(135deg, rgba(255, 204, 0, 0.06) 0%, rgba(124, 58, 237, 0.08) 50%, rgba(10, 11, 16, 0.95) 100%)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          {/* Staff Identity Block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: currentUser.role === 'owner' ? 'linear-gradient(135deg, #ffcc00, #ff9100)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: currentUser.role === 'owner' ? '#000' : '#fff',
                fontSize: '1.5rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: currentUser.role === 'owner' ? '0 0 25px rgba(255,204,0,0.4)' : '0 0 25px rgba(124,58,237,0.4)',
              }}
            >
              {currentUser.role === 'owner' ? '👑' : '🛡️'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                  Admin & Moderation <span style={{ color: 'var(--primary-gold)' }}>Command Center</span>
                </h1>
                <span
                  style={{
                    background: currentUser.role === 'owner' ? 'rgba(255,204,0,0.2)' : 'rgba(124,58,237,0.2)',
                    border: currentUser.role === 'owner' ? '1px solid #ffcc00' : '1px solid #7c3aed',
                    color: currentUser.role === 'owner' ? '#ffcc00' : '#a78bfa',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                  }}
                >
                  {currentUser.role === 'owner' ? 'Root Owner' : 'Staff Moderator'}
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Logged in as <strong style={{ color: '#fff' }}>{currentUser.username}</strong> • Roblox: <strong style={{ color: '#00e5ff' }}>{currentUser.robloxUsername || 'Official'}</strong>
              </p>
            </div>
          </div>

          {/* Telemetry Status Strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sysSettings.maintenanceMode ? '#ff1744' : '#10b981', boxShadow: sysSettings.maintenanceMode ? '0 0 10px #ff1744' : '0 0 10px #10b981' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: sysSettings.maintenanceMode ? '#ff1744' : '#10b981' }}>
                {sysSettings.maintenanceMode ? 'Maintenance Mode Active' : 'All Systems Live'}
              </span>
            </div>

            <div style={{ background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.8rem', color: '#94a3b8' }}>
              Database: <strong style={{ color: 'var(--primary-gold)' }}>{pets.length} Items</strong>
            </div>

            <button
              onClick={onBackToValues}
              className="filter-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', fontSize: '0.82rem' }}
            >
              Public Hub
            </button>
          </div>
        </div>
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

      {/* ━━━━ HIGH-TECH SEGMENTED COMMAND TAB DOCK ━━━━ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Tab 1: Database Studio */}
        <button
          onClick={() => setAdminTab('pets')}
          style={{
            background: adminTab === 'pets'
              ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(79, 70, 229, 0.15))'
              : 'rgba(255, 255, 255, 0.02)',
            border: adminTab === 'pets' ? '1px solid #7c3aed' : '1px solid var(--glass-border)',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'all 0.25s ease',
            boxShadow: adminTab === 'pets' ? '0 10px 30px rgba(124, 58, 237, 0.25)' : 'none',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: adminTab === 'pets' ? '#7c3aed' : 'rgba(255, 255, 255, 0.05)',
              color: adminTab === 'pets' ? '#fff' : '#a78bfa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Database size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Pet & Hat Studio</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              {pets.length} items • Multipliers & Stats
            </div>
          </div>
        </button>

        {/* Tab 2: User Moderation */}
        <button
          onClick={() => setAdminTab('users')}
          style={{
            background: adminTab === 'users'
              ? 'linear-gradient(135deg, rgba(255, 204, 0, 0.25), rgba(255, 145, 0, 0.15))'
              : 'rgba(255, 255, 255, 0.02)',
            border: adminTab === 'users' ? '1px solid #ffcc00' : '1px solid var(--glass-border)',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'all 0.25s ease',
            boxShadow: adminTab === 'users' ? '0 10px 30px rgba(255, 204, 0, 0.25)' : 'none',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: adminTab === 'users' ? '#ffcc00' : 'rgba(255, 255, 255, 0.05)',
              color: adminTab === 'users' ? '#000' : '#ffcc00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>User Moderation</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              {usersList.length} accounts • Ban & Kick Center
            </div>
          </div>
        </button>

        {/* Tab 3: Safeguards & Maintenance */}
        <button
          onClick={() => setAdminTab('safeguards')}
          style={{
            background: adminTab === 'safeguards'
              ? 'linear-gradient(135deg, rgba(255, 23, 68, 0.25), rgba(220, 38, 38, 0.15))'
              : 'rgba(255, 255, 255, 0.02)',
            border: adminTab === 'safeguards' ? '1px solid #ff1744' : '1px solid var(--glass-border)',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'all 0.25s ease',
            boxShadow: adminTab === 'safeguards' ? '0 10px 30px rgba(255, 23, 68, 0.25)' : 'none',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: adminTab === 'safeguards' ? '#ff1744' : 'rgba(255, 255, 255, 0.05)',
              color: adminTab === 'safeguards' ? '#fff' : '#ff1744',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Safeguards & Broadcast</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              Global Banners • Maintenance Lockdown
            </div>
          </div>
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
                        {user.role === 'owner' ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffcc00', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,204,0,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,204,0,0.3)' }}>
                            🛡️ Protected Owner
                          </span>
                        ) : user.id === currentUser?.id ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00e5ff', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(0,229,255,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(0,229,255,0.3)' }}>
                            👤 You (Active)
                          </span>
                        ) : (
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
                        )}
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
      {/* TAB 3: GLOBAL SAFEGUARDS & MAINTENANCE BROADCAST CENTER       */}
      {/* ============================================================== */}
      {adminTab === 'safeguards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {/* Card A: Global Announcement Studio */}
          <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(124, 58, 237, 0.4)', background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.08) 0%, rgba(10, 11, 16, 0.95) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid #7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                <Sparkles size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0 }}>Global Announcement Studio</h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Broadcast banner message across the entire website</span>
              </div>
            </div>

            <form onSubmit={handleSaveSafeguards}>
              {/* Enable Switch */}
              <div style={{ background: '#0a0b10', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>Enable Global Broadcast Banner</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Show message at top of all pages for every visitor</div>
                </div>
                <input
                  type="checkbox"
                  checked={sysSettings.announcement?.enabled}
                  onChange={(e) =>
                    setSysSettings({
                      ...sysSettings,
                      announcement: { ...sysSettings.announcement, enabled: e.target.checked },
                    })
                  }
                  style={{ width: '22px', height: '22px', accentColor: '#7c3aed', cursor: 'pointer' }}
                />
              </div>

              {/* Type Select */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>
                  Broadcast Style / Category
                </label>
                <select
                  value={sysSettings.announcement?.type || 'event'}
                  onChange={(e) =>
                    setSysSettings({
                      ...sysSettings,
                      announcement: { ...sysSettings.announcement, type: e.target.value },
                    })
                  }
                  style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.65rem', borderRadius: '8px', fontSize: '0.9rem' }}
                >
                  <option value="event">🌟 Event / Hype Release (Purple & Pink Glow)</option>
                  <option value="alert">🚨 Security Alert / Anti-Dupe Warning (Red Glow)</option>
                  <option value="info">ℹ️ Market / Value Update Notice (Neon Cyan Glow)</option>
                </select>
              </div>

              {/* Headline */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>
                  Announcement Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🌟 Official Market Synchronization Complete"
                  value={sysSettings.announcement?.title || ''}
                  onChange={(e) =>
                    setSysSettings({
                      ...sysSettings,
                      announcement: { ...sysSettings.announcement, title: e.target.value },
                    })
                  }
                  style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.65rem', borderRadius: '8px', fontSize: '0.9rem' }}
                />
              </div>

              {/* Full Message */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>
                  Broadcast Message Body
                </label>
                <textarea
                  rows="3"
                  placeholder="Enter the message you want all active traders to see..."
                  value={sysSettings.announcement?.message || ''}
                  onChange={(e) =>
                    setSysSettings({
                      ...sysSettings,
                      announcement: { ...sysSettings.announcement, message: e.target.value },
                    })
                  }
                  style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.65rem', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="btn-primary"
                style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 900 }}
              >
                <Save size={16} /> {savingSettings ? 'Deploying Broadcast...' : 'Deploy Global Announcement'}
              </button>
            </form>
          </div>

          {/* Card B: Safeguards & Maintenance Lockdown */}
          <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255, 23, 68, 0.4)', background: 'linear-gradient(180deg, rgba(255, 23, 68, 0.08) 0%, rgba(10, 11, 16, 0.95) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255, 23, 68, 0.2)', border: '1px solid #ff1744', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff1744' }}>
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0 }}>System Safeguards & Maintenance</h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Protect values, freeze markets, or lock platform</span>
              </div>
            </div>

            <form onSubmit={handleSaveSafeguards}>
              {/* Full Maintenance Mode Switch */}
              <div style={{ background: '#0a0b10', padding: '0.85rem 1rem', borderRadius: '10px', border: sysSettings.maintenanceMode ? '1px solid #ff1744' : '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontWeight: 800, color: sysSettings.maintenanceMode ? '#ff1744' : '#fff', fontSize: '0.95rem' }}>
                    🚨 Website Maintenance Mode
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Locks regular visitors to safeguard screen (Staff still access /admin)
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sysSettings.maintenanceMode}
                  onChange={(e) => setSysSettings({ ...sysSettings, maintenanceMode: e.target.checked })}
                  style={{ width: '22px', height: '22px', accentColor: '#ff1744', cursor: 'pointer' }}
                />
              </div>

              {/* Maintenance Reason Message */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>
                  Maintenance Banner Notice
                </label>
                <textarea
                  rows="2"
                  placeholder="Reason for maintenance shown to users..."
                  value={sysSettings.maintenanceMessage || ''}
                  onChange={(e) => setSysSettings({ ...sysSettings, maintenanceMessage: e.target.value })}
                  style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.65rem', borderRadius: '8px', fontSize: '0.9rem' }}
                />
              </div>

              {/* Freeze Marketplace */}
              <div style={{ background: '#0a0b10', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>Freeze Marketplace Listings</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Temporarily block new trade postings during market volatility</div>
                </div>
                <input
                  type="checkbox"
                  checked={sysSettings.freezeMarketplace}
                  onChange={(e) => setSysSettings({ ...sysSettings, freezeMarketplace: e.target.checked })}
                  style={{ width: '20px', height: '20px', accentColor: '#ffcc00', cursor: 'pointer' }}
                />
              </div>

              {/* Freeze Trade Calculator */}
              <div style={{ background: '#0a0b10', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>Freeze Trade Calculator</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Temporarily pause trade calculations during major value updates</div>
                </div>
                <input
                  type="checkbox"
                  checked={sysSettings.freezeTradingCalculator}
                  onChange={(e) => setSysSettings({ ...sysSettings, freezeTradingCalculator: e.target.checked })}
                  style={{ width: '20px', height: '20px', accentColor: '#ffcc00', cursor: 'pointer' }}
                />
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="btn-primary"
                style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 900, background: '#ff1744', borderColor: '#ff1744' }}
              >
                <Save size={16} /> {savingSettings ? 'Deploying Safeguards...' : 'Save & Deploy Safeguards'}
              </button>
            </form>
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

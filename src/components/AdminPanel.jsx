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
} from 'lucide-react';
import PetAvatar from './PetAvatar';

export default function AdminPanel({ pets, currentUser, onRefreshPets, onOpenLogin, onBackToValues }) {
  const [adminTab, setAdminTab] = useState('users'); // 'users' or 'pets'
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Pet database form state
  const [formData, setFormData] = useState({
    name: '',
    rarity: 'Legendary',
    baseValue: '',
    demand: 5,
    status: 'Stable',
    image: '',
  });

  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [msg, setMsg] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Pet search, filter, pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
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

  // Database Stats
  const dbStats = useMemo(() => {
    const counts = {};
    let totalValue = 0;
    let withImages = 0;
    pets.forEach((p) => {
      counts[p.rarity] = (counts[p.rarity] || 0) + 1;
      totalValue += p.baseValue || 0;
      if (p.image && p.image.startsWith('http')) withImages++;
    });
    return { counts, totalValue, withImages, total: pets.length };
  }, [pets]);

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
    result.sort((a, b) => {
      let va, vb;
      if (sortField === 'name') {
        va = a.name.toLowerCase();
        vb = b.name.toLowerCase();
      } else if (sortField === 'value') {
        va = a.baseValue;
        vb = b.baseValue;
      } else if (sortField === 'demand') {
        va = a.demand;
        vb = b.demand;
      } else if (sortField === 'rarity') {
        va = a.rarity;
        vb = b.rarity;
      } else {
        va = a.name;
        vb = b.name;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [pets, searchQuery, filterRarity, sortField, sortDir]);

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

  // ---------------- PET MANAGEMENT ACTIONS ----------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatePet = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.baseValue) {
      setMsg({ type: 'error', text: 'Pet Name and Base Value are required.' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          rarity: formData.rarity,
          baseValue: Number(formData.baseValue),
          demand: Number(formData.demand),
          status: formData.status,
          image: formData.image,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: `Created pet: ${formData.name}` });
        setFormData({ name: '', rarity: 'Legendary', baseValue: '', demand: 5, status: 'Stable', image: '' });
        if (onRefreshPets) onRefreshPets();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to create pet' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Server error while creating pet.' });
    } finally {
      setLoading(false);
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

  const handleStartEdit = (pet) => {
    setEditingId(pet.id);
    setEditValues({
      baseValue: pet.baseValue,
      demand: pet.demand,
      status: pet.status,
      rarity: pet.rarity,
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await fetch(`/api/pets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });
      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        setMsg({ type: 'success', text: 'Pet updated successfully.' });
        if (onRefreshPets) onRefreshPets();
      }
    } catch {
      setMsg({ type: 'error', text: 'Failed to update pet.' });
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
          Manage user sessions, active trades, database values, and server security.
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
          className={`filter-btn ${adminTab === 'users' ? 'active' : ''}`}
          onClick={() => setAdminTab('users')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.8rem', fontSize: '1rem', fontWeight: 900 }}
        >
          <Users size={18} /> User Moderation & Live Sessions ({usersList.length})
        </button>

        <button
          className={`filter-btn ${adminTab === 'pets' ? 'active' : ''}`}
          onClick={() => setAdminTab('pets')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.8rem', fontSize: '1rem', fontWeight: 900 }}
        >
          <Database size={18} /> Pet Database & Wiki Sync ({pets.length})
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: USER MANAGEMENT & MODERATION CENTER                     */}
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
                          {/* Ban / Unban Button */}
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

                          {/* Kick Button */}
                          <button
                            onClick={() => handleKickUser(user.id, user.username)}
                            style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid #eab308', color: '#eab308', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                            title="Force Logout / Kick Session"
                          >
                            <LogOut size={14} /> Kick
                          </button>

                          {/* Promote/Demote Role (Owner only) */}
                          {isOwner && user.role !== 'owner' && (
                            <button
                              onClick={() => handleToggleRole(user)}
                              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid #7c3aed', color: '#a78bfa', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                              title={user.role === 'mod' ? 'Demote to Member' : 'Promote to Moderator'}
                            >
                              {user.role === 'mod' ? 'Demote' : 'Promote Mod'}
                            </button>
                          )}

                          {/* Delete Account (Owner only) */}
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
      {/* TAB 2: PET DATABASE & WIKI SYNC                                */}
      {/* ============================================================== */}
      {adminTab === 'pets' && (
        <div>
          {/* Quick Actions & Wiki Sync Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={18} color="#00e5ff" /> Sync with Official Fandom Wiki
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                  Extract latest pets, images, and base statistics from the BGS MediaWiki API.
                </p>
              </div>
              <button className="btn-primary" onClick={handleSyncWiki} disabled={scraping} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.75rem' }}>
                <RefreshCw size={16} className={scraping ? 'spin' : ''} /> {scraping ? 'Syncing Wiki Data...' : 'Run Wiki Sync'}
              </button>
            </div>

            {/* Create Pet Form */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: '0 0 0.85rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={18} color="#10b981" /> Add New Item Manually
              </h3>
              <form onSubmit={handleCreatePet} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Pet Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{ gridColumn: '1 / -1', background: '#000', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem' }}
                />
                <select
                  name="rarity"
                  value={formData.rarity}
                  onChange={handleInputChange}
                  style={{ background: '#000', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  {['Common', 'Unique', 'Rare', 'Epic', 'Legendary', 'Secret'].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <input
                  type="number"
                  name="baseValue"
                  placeholder="Value (e.g. 500)"
                  value={formData.baseValue}
                  onChange={handleInputChange}
                  style={{ background: '#000', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem' }}
                />
                <button type="submit" disabled={loading} className="btn-primary" style={{ gridColumn: '1 / -1', padding: '0.6rem', fontSize: '0.85rem' }}>
                  {loading ? 'Adding...' : 'Create Item'}
                </button>
              </form>
            </div>
          </div>

          {/* Database Items Table */}
          <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                Pet Database ({filteredPets.length} / {pets.length})
              </h3>
              <input
                type="text"
                placeholder="Search database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: '#000', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', width: '220px' }}
              />
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.6rem 0.8rem' }}>Item</th>
                  <th style={{ padding: '0.6rem 0.8rem' }}>Rarity</th>
                  <th style={{ padding: '0.6rem 0.8rem' }}>Value</th>
                  <th style={{ padding: '0.6rem 0.8rem' }}>Demand</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPets.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.6rem 0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PetAvatar name={p.name} rarity={p.rarity} image={p.image} size={30} />
                        <span style={{ fontWeight: 800, color: '#fff' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem' }}>
                      <span className={`rarity-badge rarity-${p.rarity.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                        {p.rarity}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 800, color: '#ffcc00' }}>
                      {editingId === p.id ? (
                        <input
                          type="number"
                          value={editValues.baseValue || ''}
                          onChange={(e) => setEditValues({ ...editValues, baseValue: Number(e.target.value) })}
                          style={{ width: '80px', background: '#000', color: '#fff', border: '1px solid #7c3aed', padding: '2px 4px', borderRadius: '4px' }}
                        />
                      ) : (
                        p.baseValue !== null ? `⚡ ${p.baseValue.toLocaleString()}` : 'N/A'
                      )}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#10b981', fontWeight: 800 }}>
                      {editingId === p.id ? (
                        <select
                          value={editValues.demand || 5}
                          onChange={(e) => setEditValues({ ...editValues, demand: Number(e.target.value) })}
                          style={{ background: '#000', color: '#fff', border: '1px solid #7c3aed', padding: '2px' }}
                        >
                          {[1,2,3,4,5,6,7,8,9,10,11].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      ) : (
                        `${p.demand || 5} / 11`
                      )}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>
                      {editingId === p.id ? (
                        <button onClick={() => handleSaveEdit(p.id)} style={{ background: '#10b981', color: '#000', border: 'none', padding: '4px 8px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
                          Save
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleStartEdit(p)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: '4px' }}>
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDeletePet(p.id, p.name)} style={{ background: 'none', border: 'none', color: '#ff1744', cursor: 'pointer', padding: '4px' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
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
    </div>
  );
}

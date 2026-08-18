import React, { useState } from 'react';
import {
  Settings,
  User,
  Gamepad2,
  MessageSquare,
  Key,
  ShieldCheck,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function UserSettingsModal({ isOpen, onClose, currentUser, onUpdateUser }) {
  const [robloxUsername, setRobloxUsername] = useState(currentUser?.robloxUsername || '');
  const [discord, setDiscord] = useState(currentUser?.discord || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword && !password) {
      setMsg({ type: 'error', text: 'Current password is required to set a new password.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({
          id: currentUser.id,
          robloxUsername: robloxUsername.trim(),
          discord: discord.trim(),
          bio: bio.trim(),
          password,
          newPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        if (onUpdateUser) onUpdateUser(data.user);
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '2rem',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.15)', border: '1px solid rgba(0, 229, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={22} color="#00e5ff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>Trader Account Settings</h2>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Update your profile, Discord handle, and security</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Message Alert */}
        {msg && (
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
              background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 23, 68, 0.15)',
              border: msg.type === 'success' ? '1px solid #10b981' : '1px solid #ff1744',
              color: msg.type === 'success' ? '#10b981' : '#ff1744',
            }}
          >
            {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Account Profile Header */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--glass-border)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: currentUser.role === 'owner' ? '#ffcc00' : currentUser.role === 'mod' ? '#7c3aed' : '#00e5ff', color: '#000', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {currentUser.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>{currentUser.username}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ID: {currentUser.id}</div>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', border: '1px solid rgba(0, 229, 255, 0.4)' }}>
              {currentUser.badge || 'Verified Trader ✓'}
            </span>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Gamepad2 size={13} color="#00e5ff" /> Roblox Username
              </label>
              <input
                type="text"
                value={robloxUsername}
                onChange={(e) => setRobloxUsername(e.target.value)}
                placeholder="Roblox Username"
                style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MessageSquare size={13} color="#a78bfa" /> Discord Handle / Tag
              </label>
              <input
                type="text"
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder="e.g. Trader#1234 or @handle"
                style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FileText size={13} color="#ffcc00" /> Trading Goal / Bio
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Looking for Secret pets & high demand items!"
              style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.55rem', borderRadius: '8px', marginTop: '4px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Change Password Sub-section */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--glass-border)', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#a78bfa', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Key size={13} /> Change Account Password (Optional)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
              <input
                type="password"
                placeholder="Current Pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.45rem', borderRadius: '6px', fontSize: '0.8rem' }}
              />
              <input
                type="password"
                placeholder="New Pass"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.45rem', borderRadius: '6px', fontSize: '0.8rem' }}
              />
              <input
                type="password"
                placeholder="Confirm Pass"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', background: '#0a0b10', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.45rem', borderRadius: '6px', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="filter-btn" onClick={onClose} style={{ padding: '0.65rem 1.2rem' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.65rem 1.5rem' }}>
              <Save size={15} /> {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

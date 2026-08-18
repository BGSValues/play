import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Key, Lock, UserPlus, LogIn, CheckCircle2, AlertCircle, Gamepad2, MessageSquare } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, currentUser, onLogin, onLogout }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [robloxUsername, setRobloxUsername] = useState('');
  const [discord, setDiscord] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, robloxUsername, discord, password }),
      });

      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
        onClose();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
        onClose();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Login connection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem 2rem',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '1.5rem',
            cursor: 'pointer',
          }}
        >
          &times;
        </button>

        {currentUser ? (
          /* Profile Details View */
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: currentUser.role === 'owner' ? '#ffcc00' : currentUser.role === 'mod' ? '#7c3aed' : 'var(--primary-gold)',
                color: '#000',
                fontSize: '1.8rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem' }}>
              {currentUser.username}
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Roblox: <strong style={{ color: '#fff' }}>{currentUser.robloxUsername}</strong>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0, 229, 255, 0.15)',
                border: '1px solid rgba(0, 229, 255, 0.4)',
                color: '#00e5ff',
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                fontWeight: 800,
                fontSize: '0.85rem',
                marginBottom: '2rem',
              }}
            >
              <CheckCircle2 size={16} /> {currentUser.badge || currentUser.rank || 'Verified Trader ✓'}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                className="filter-btn"
                style={{ width: '100%', borderColor: '#ff1744', color: '#ff1744' }}
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Register Forms */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fff', marginBottom: '0.3rem' }}>
                BGS Trading <span style={{ color: 'var(--primary-gold)' }}>Hub</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Create trades, verify your inventory values, and connect with players.
              </p>
            </div>

            {/* Switch Tabs */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '10px',
                padding: '4px',
                marginBottom: '1.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(null); }}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: activeTab === 'login' ? 'var(--primary-gold)' : 'transparent',
                  color: activeTab === 'login' ? '#000' : 'var(--text-muted)',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <LogIn size={15} /> Sign In
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError(null); }}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: activeTab === 'register' ? 'var(--primary-gold)' : 'transparent',
                  color: activeTab === 'register' ? '#000' : 'var(--text-muted)',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <UserPlus size={15} /> Create Account
              </button>
            </div>

            {error && (
              <div
                style={{
                  background: 'rgba(255, 23, 68, 0.15)',
                  border: '1px solid rgba(255, 23, 68, 0.4)',
                  color: '#ff1744',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                }}
              >
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* TRADER LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--glass-border)',
                      color: '#fff',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--glass-border)',
                      color: '#fff',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '1rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In as Trader'}
                </button>
              </form>
            )}

            {/* TRADER REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit}>
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>
                    Desired Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. SecretTrader99"
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--glass-border)',
                      color: '#fff',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>
                    🎮 Roblox Username
                  </label>
                  <input
                    type="text"
                    required
                    value={robloxUsername}
                    onChange={(e) => setRobloxUsername(e.target.value)}
                    placeholder="Roblox profile username"
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--glass-border)',
                      color: '#fff',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>
                    💬 Discord Handle (Optional)
                  </label>
                  <input
                    type="text"
                    value={discord}
                    onChange={(e) => setDiscord(e.target.value)}
                    placeholder="e.g. User#1234 or @handle"
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--glass-border)',
                      color: '#fff',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--glass-border)',
                      color: '#fff',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '1rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <UserPlus size={18} /> {loading ? 'Creating Profile...' : 'Complete Trader Registration'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

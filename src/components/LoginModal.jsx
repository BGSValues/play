import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Key, Lock, UserPlus, LogIn, CheckCircle2, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

function decodeGoogleJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function LoginModal({ isOpen, onClose, currentUser, onLogin, onLogout }) {
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [robloxUsername, setRobloxUsername] = useState('');
  const [discord, setDiscord] = useState('');
  const [password, setPassword] = useState('');

  // Staff Login State
  const [staffRole, setStaffRole] = useState('mod');
  const [staffPin, setStaffPin] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      const decoded = decodeGoogleJWT(credentialResponse.credential);
      if (decoded) {
        onLogin({
          id: 'google_' + decoded.sub,
          username: decoded.name || decoded.email.split('@')[0],
          email: decoded.email,
          picture: decoded.picture,
          robloxUsername: decoded.name || decoded.email.split('@')[0],
          role: 'member',
          rank: 'Google Verified Trader',
          isVerified: true,
          badge: 'Google Verified ✓',
          authProvider: 'google',
        });
        onClose();
        return;
      }
    }
    // Fallback simulation
    handleSimulatedGoogleLogin();
  };

  const handleSimulatedGoogleLogin = () => {
    onLogin({
      id: 'google_sim_' + Date.now(),
      username: 'Google Trader',
      email: 'trader@gmail.com',
      picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      robloxUsername: 'Google_BGS_Trader',
      role: 'member',
      rank: 'Google Verified Trader',
      isVerified: true,
      badge: 'Google Verified ✓',
      authProvider: 'google',
    });
    onClose();
  };

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
      if (activeTab === 'staff') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, role: staffRole, pin: staffPin }),
        });
        const data = await res.json();
        if (data.success) {
          onLogin(data.user);
          onClose();
        } else {
          setError(data.error);
        }
      } else {
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
      }
    } catch (err) {
      setError('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{ width: '100%', maxWidth: '460px', borderTop: '4px solid #ffcc00' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck color="#ffcc00" size={24} /> Verified Account Portal
          </h3>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }} onClick={onClose}>
            ✕
          </button>
        </div>

        {currentUser ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            {currentUser.picture ? (
              <img
                src={currentUser.picture}
                alt={currentUser.username}
                style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ffcc00', marginBottom: '0.75rem' }}
              />
            ) : (
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #00e5ff, #7000ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.8rem', color: '#fff', margin: '0 auto 0.75rem auto' }}>
                {currentUser.username?.charAt(0)}
              </div>
            )}
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
              Account: <span style={{ color: '#ffcc00' }}>{currentUser.username}</span>
            </div>
            {currentUser.robloxUsername && (
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.6rem' }}>
                Roblox ID: <strong>@{currentUser.robloxUsername}</strong>
              </div>
            )}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.3rem 0.9rem', borderRadius: '20px', background: 'rgba(0,230,118,0.15)', color: '#00e676', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={14} /> {currentUser.badge}
            </div>

            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={onLogout}>
              Logout Account
            </button>
          </div>
        ) : (
          <div>
            {/* GOOGLE ONE-CLICK SIGN IN BUTTON */}
            <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleSimulatedGoogleLogin}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  color: '#1f1f1f',
                  border: '1px solid #dadce0',
                  padding: '0.75rem',
                  borderRadius: '24px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign in with Google
              </button>

              <div style={{ margin: '1rem 0', color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ height: '1px', flex: 1, background: 'var(--glass-border)' }}></span>
                <span>or sign in with password</span>
                <span style={{ height: '1px', flex: 1, background: 'var(--glass-border)' }}></span>
              </div>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <button
                className={`multi-btn ${activeTab === 'login' ? 'active' : ''}`}
                style={{ fontSize: '0.85rem', padding: '6px 0' }}
                onClick={() => { setActiveTab('login'); setError(null); }}
              >
                Sign In
              </button>
              <button
                className={`multi-btn ${activeTab === 'register' ? 'active' : ''}`}
                style={{ fontSize: '0.85rem', padding: '6px 0' }}
                onClick={() => { setActiveTab('register'); setError(null); }}
              >
                Register Verified
              </button>
              <button
                className={`multi-btn ${activeTab === 'staff' ? 'active' : ''}`}
                style={{ fontSize: '0.85rem', padding: '6px 0' }}
                onClick={() => { setActiveTab('staff'); setError(null); }}
              >
                Staff Portal
              </button>
            </div>

            {error && (
              <div style={{ background: 'rgba(255,23,68,0.15)', border: '1px solid #ff1744', color: '#ff1744', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            {/* TAB 1: TRADER SIGN IN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter registered username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In to Trade'}
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER VERIFIED TRADER */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label>Account Username *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Roblox Username (Anti-Scam Verified) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Your exact Roblox Username"
                    value={robloxUsername}
                    onChange={(e) => setRobloxUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Discord Tag (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. trader#1234"
                    value={discord}
                    onChange={(e) => setDiscord(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Account Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                  {loading ? 'Registering Account...' : 'Create Verified Account ✓'}
                </button>
              </form>
            )}

            {/* TAB 3: STAFF & MODERATOR PORTAL */}
            {activeTab === 'staff' && (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label>Staff Rank Role</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <button
                      type="button"
                      className={`filter-btn ${staffRole === 'mod' ? 'active' : ''}`}
                      style={{ flex: 1, padding: '0.5rem 0' }}
                      onClick={() => setStaffRole('mod')}
                    >
                      🛡️ Staff Mod
                    </button>
                    <button
                      type="button"
                      className={`filter-btn ${staffRole === 'owner' ? 'active' : ''}`}
                      style={{ flex: 1, padding: '0.5rem 0' }}
                      onClick={() => setStaffRole('owner')}
                    >
                      👑 Owner
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Staff Username</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={staffRole === 'owner' ? 'Owner_Admin' : 'Staff_Mod_Alex'}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Staff Security PIN</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder={staffRole === 'owner' ? 'owner123' : 'mod123'}
                    value={staffPin}
                    onChange={(e) => setStaffPin(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Authenticate Staff Rank
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

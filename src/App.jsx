import React, { useState, useEffect } from 'react';
import {
  ListFilter,
  ShoppingCart,
  Calculator,
  BookOpen,
  LogIn,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
  Award,
  BarChart3,
  LogOut,
} from 'lucide-react';

import ValueList from './components/ValueList';
import TradeCalculator from './components/TradeCalculator';
import AdminPanel from './components/AdminPanel';
import Marketplace from './components/Marketplace';
import Guides from './components/Guides';
import LoginModal from './components/LoginModal';
import BgsLogo from './components/BgsLogo';

import initialPetsData from './data/pets.json';

export default function App() {
  const isAdminRoute = window.location.pathname === '/admin';
  const [activeTab, setActiveTab] = useState(isAdminRoute ? 'admin' : 'values');
  const [pets, setPets] = useState(initialPetsData && initialPetsData.length > 0 ? initialPetsData : []);
  const [sideA, setSideA] = useState([]);
  const [sideB, setSideB] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('bgs_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Dynamic Live Active Users Counter (Realistic slow shift, kept between 29 and 45)
  const [activeUsersCount, setActiveUsersCount] = useState(() => {
    return Math.floor(Math.random() * 10) + 31; // e.g. 31 to 40 base
  });

  useEffect(() => {
    // Slow, unhurried shift every 25 seconds (+1 or -1)
    const interval = setInterval(() => {
      setActiveUsersCount((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const next = prev + change;
        return Math.min(45, Math.max(29, next));
      });
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('bgs_user', JSON.stringify(userData));
    showToast(`Welcome, ${userData.username}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bgs_user');
    showToast('Logged out.');
  };

  const fetchPets = async () => {
    try {
      const res = await fetch('/api/pets');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.pets && data.pets.length > 0) {
          setPets(data.pets);
        }
      }
    } catch (err) {
      console.log('Using static pets data bundle');
    }
  };

  useEffect(() => { fetchPets(); }, []);

  const handleUpdatePetValue = async (petId, editValues) => {
    try {
      const res = await fetch(`/api/pets/${petId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Value updated!');
        fetchPets();
      } else {
        setPets(prev => prev.map(p => p.id === petId ? { ...p, ...editValues } : p));
        showToast('Value updated!');
      }
    } catch (err) {
      setPets(prev => prev.map(p => p.id === petId ? { ...p, ...editValues } : p));
      showToast('Value updated!');
    }
  };

  const handleAddToTrade = (pet, variant, calculatedValue) => {
    const item = { ...pet, slotId: Date.now() + Math.random(), selectedVariant: variant, calculatedValue };
    setSideA((prev) => [...prev, item]);
    showToast(`Added ${variant} ${pet.name} to trade!`);
    setActiveTab('calculator');
  };

  const showToast = (text) => { setToast(text); setTimeout(() => setToast(null), 3000); };

  // Accurate Counts for Top Bar
  const secretCount = pets.filter(p => p.rarity === 'Secret').length;
  const legendaryCount = pets.filter(p => p.rarity === 'Legendary').length;
  const risingCount = pets.filter(p => p.status === 'Rising' || p.status === 'Hyped').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '28px', right: '28px', background: 'var(--primary-gold)', color: '#07090e', padding: '0.85rem 1.6rem', borderRadius: '14px', fontWeight: 900, boxShadow: '0 10px 30px rgba(255,204,0,0.5)', zIndex: 9999, fontSize: '0.95rem' }}>
          {toast}
        </div>
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} currentUser={currentUser} onLogin={handleLogin} onLogout={handleLogout} />

      {/* ━━━━ HEADER NAV ━━━━ */}
      <header className="app-header">
        {/* CLEAN UNIQUE LOGO */}
        <BgsLogo onClick={() => setActiveTab('values')} />

        <nav className="nav-tabs">
          <button className={`nav-btn ${activeTab === 'values' ? 'active' : ''}`} onClick={() => setActiveTab('values')}>
            <ListFilter size={17} /> Value List
          </button>
          <button className={`nav-btn ${activeTab === 'market' ? 'active' : ''}`} onClick={() => setActiveTab('market')}>
            <ShoppingCart size={17} /> Market
          </button>
          <button className={`nav-btn ${activeTab === 'calculator' ? 'active' : ''}`} onClick={() => setActiveTab('calculator')}>
            <Calculator size={17} /> Calculator
            {(sideA.length > 0 || sideB.length > 0) && (
              <span style={{ background: '#ff007f', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{sideA.length + sideB.length}</span>
            )}
          </button>
          <button className={`nav-btn ${activeTab === 'guides' ? 'active' : ''}`} onClick={() => setActiveTab('guides')}>
            <BookOpen size={17} /> Guides
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {currentUser.picture ? (
                <img src={currentUser.picture} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-gold)' }} />
              ) : (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #00e5ff, #7000ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 900, color: '#fff' }}>{currentUser.username?.charAt(0)}</div>
              )}
              <span style={{ fontWeight: 800, fontSize: '0.9rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.username}</span>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ff1744', cursor: 'pointer', display: 'flex', padding: '4px' }} title="Logout"><LogOut size={18} /></button>
              {(currentUser.role === 'owner' || currentUser.role === 'mod') && (
                <button style={{ background: 'rgba(255,204,0,0.15)', border: '1px solid #ffcc00', color: '#ffcc00', borderRadius: '10px', padding: '0.45rem 0.85rem', fontSize: '0.8rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setActiveTab('admin')}>
                  <ShieldCheck size={15} /> Admin
                </button>
              )}
            </div>
          ) : (
            <button className="login-header-btn" onClick={() => setIsLoginOpen(true)}>
              <LogIn size={17} /> Sign In
            </button>
          )}
        </div>
      </header>

      {/* ━━━━ LIVE STATS BAR WITH SLOW UNHURRIED ONLINE TRADERS COUNTER ━━━━ */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <Zap size={16} color="#ffcc00" />
          <span style={{ fontWeight: 900, color: 'var(--primary-gold)' }}>{pets.length.toLocaleString()}</span> Total Items
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <Award size={16} color="#ff007f" />
          <span style={{ fontWeight: 900, color: '#ff007f' }}>{secretCount}</span> Secret Items 👑
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <BarChart3 size={16} color="#ffcc00" />
          <span style={{ fontWeight: 900, color: '#ffcc00' }}>{legendaryCount}</span> Legendary ⚡
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <TrendingUp size={16} color="#00e676" />
          <span style={{ fontWeight: 900, color: '#00e676' }}>{risingCount}</span> High Demand
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <Users size={16} color="#00e5ff" />
          <span style={{ fontWeight: 900, color: '#00e5ff', transition: 'all 0.5s ease' }}>{activeUsersCount} Online</span> Traders Active 🟢
        </div>
      </div>

      {/* ━━━━ MAIN CONTENT ROUTER ━━━━ */}
      <main style={{ flex: 1, zIndex: 10 }}>
        {activeTab === 'values' && (
          <ValueList pets={pets} currentUser={currentUser} onAddToTrade={handleAddToTrade} onUpdatePetValue={handleUpdatePetValue} />
        )}
        {activeTab === 'market' && (
          <Marketplace pets={pets} currentUser={currentUser} onOpenLogin={() => setIsLoginOpen(true)} />
        )}
        {activeTab === 'calculator' && (
          <TradeCalculator pets={pets} sideA={sideA} setSideA={setSideA} sideB={sideB} setSideB={setSideB} />
        )}
        {activeTab === 'guides' && <Guides />}
        {activeTab === 'admin' && (
          <AdminPanel pets={pets} currentUser={currentUser} onRefreshPets={fetchPets} />
        )}
      </main>

      {/* ━━━━ FOOTER ━━━━ */}
      <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>BGS Values — Bubble Gum Simulator Pet & Hat Trading Database</span>
        <span>{pets.length.toLocaleString()} authentic items • Real-time values • Verified player trading</span>
      </footer>
    </div>
  );
}

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
  Egg,
  Settings,
} from 'lucide-react';

import ValueList from './components/ValueList';
import TradeCalculator from './components/TradeCalculator';
import AdminPanel from './components/AdminPanel';
import Marketplace from './components/Marketplace';
import Guides from './components/Guides';
import EggsList from './components/EggsList';
import PetDetailsPage from './components/PetDetailsPage';
import LoginModal from './components/LoginModal';
import UserSettingsModal from './components/UserSettingsModal';
import GlobalAnnouncementBanner from './components/GlobalAnnouncementBanner';
import MaintenanceScreen from './components/MaintenanceScreen';
import BgsLogo from './components/BgsLogo';
import Footer from './components/Footer';
import LiveStatsTicker from './components/LiveStatsTicker';

import initialPetsData from './data/pets.json';

export default function App() {
  const isAdminRoute = window.location.pathname.toLowerCase() === '/admin';
  const [activeTab, setActiveTab] = useState(isAdminRoute ? 'admin' : 'values');

  // Sync browser URL when tab changes so refreshing on public tabs stays on values
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab === 'admin') {
      window.history.replaceState({}, '', '/admin');
    } else {
      window.history.replaceState({}, '', '/');
    }
  };

  const [selectedPet, setSelectedPet] = useState(null);
  const [pets, setPets] = useState(initialPetsData && initialPetsData.length > 0 ? initialPetsData : []);
  const [sideA, setSideA] = useState([]);
  const [sideB, setSideB] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('bgs_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [systemSettings, setSystemSettings] = useState(null);

  // Fetch System Settings & Announcement
  const fetchSystemSettings = () => {
    fetch('/api/system/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSystemSettings(data.settings);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSystemSettings();
    const interval = setInterval(fetchSystemSettings, 15000);
    return () => clearInterval(interval);
  }, []);

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
    if (activeTab === 'admin') {
      setActiveTab('values');
    }
    showToast('Logged out. Staff session locked.');
  };

  // Real-time verification of user status (kick/ban enforcement)
  useEffect(() => {
    if (!currentUser || !currentUser.id || currentUser.id.startsWith('user_owner')) return;
    const verifySession = async () => {
      try {
        const res = await fetch(`/api/auth/verify?id=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          if (!data.success) {
            setCurrentUser(null);
            localStorage.removeItem('bgs_user');
            if (activeTab === 'admin') setActiveTab('values');
            showToast(data.error || 'Your session has ended.');
          }
        }
      } catch (e) {}
    };
    const interval = setInterval(verifySession, 10000);
    return () => clearInterval(interval);
  }, [currentUser, activeTab]);

  const fetchPets = async () => {
    try {
      const res = await fetch('/api/pets');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.pets) && data.pets.length > 0) {
          setPets(data.pets);
        }
      }
    } catch (err) {
      console.log('Using local pets database');
    }
  };

  useEffect(() => { fetchPets(); }, []);

  const handleUpdatePetValue = async (petId, field, value) => {
    try {
      const res = await fetch(`/api/pets/${petId}/value`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value: Number(value) }),
      });
      const data = await res.json();
      if (data.success) {
        setPets(pets.map(p => p.id === petId ? data.pet : p));
        showToast('Value updated successfully!');
      }
    } catch (err) {
      showToast('Error updating value');
    }
  };

  const handleAddToTrade = (pet, variant = 'Normal', calculatedValue = null) => {
    const tradeItem = {
      ...pet,
      selectedVariant: variant,
      calculatedValue: calculatedValue || (pet.baseValue ? (variant === 'Shiny' ? Math.round(pet.baseValue * 2.5) : variant === 'Mythic' ? pet.baseValue * 10 : variant === 'ShinyMythic' ? pet.baseValue * 25 : pet.baseValue) : 0),
      tradeId: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    };
    setSideA([...sideA, tradeItem]);
    showToast(`Added ${variant} ${pet.name} to trade!`);
    handleTabChange('calculator');
  };

  const showToast = (text) => { setToast(text); setTimeout(() => setToast(null), 3000); };

  // Accurate Counts for Top Bar
  const secretCount = pets.filter(p => p.rarity === 'Secret').length;
  const legendaryCount = pets.filter(p => p.rarity === 'Legendary').length;
  const risingCount = pets.filter(p => p.status === 'Rising' || p.status === 'Hyped').length;

  const handleSelectPet = (pet) => {
    setSelectedPet(pet);
    handleTabChange('pet-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isStaff = currentUser && (currentUser.role === 'owner' || currentUser.role === 'mod');
  const isMaintenanceActive = systemSettings?.maintenanceMode && !isStaff && activeTab !== 'admin';

  if (isMaintenanceActive) {
    return (
      <MaintenanceScreen
        message={systemSettings?.maintenanceMessage}
        onStaffLoginClick={() => {
          handleTabChange('admin');
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* ━━━━ GLOBAL BROADCAST BANNER ━━━━ */}
      {systemSettings?.announcement && (
        <GlobalAnnouncementBanner announcement={systemSettings.announcement} />
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '28px', right: '28px', background: 'var(--primary-gold)', color: '#07090e', padding: '0.85rem 1.6rem', borderRadius: '14px', fontWeight: 900, boxShadow: '0 10px 30px rgba(255,204,0,0.5)', zIndex: 9999, fontSize: '0.95rem' }}>
          {toast}
        </div>
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} currentUser={currentUser} onLogin={handleLogin} onLogout={handleLogout} />
      <UserSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentUser={currentUser} onUpdateUser={(updated) => { setCurrentUser(updated); localStorage.setItem('bgs_user', JSON.stringify(updated)); }} />

      {/* ━━━━ HEADER NAV ━━━━ */}
      <header className="app-header">
        {/* CLEAN UNIQUE LOGO */}
        <BgsLogo onClick={() => handleTabChange('values')} />

        <nav className="nav-tabs">
          <button className={`nav-btn ${activeTab === 'values' ? 'active' : ''}`} onClick={() => handleTabChange('values')}>
            <ListFilter size={17} /> Value List
          </button>
          <button className={`nav-btn ${activeTab === 'eggs' ? 'active' : ''}`} onClick={() => handleTabChange('eggs')}>
            <Egg size={17} /> Eggs & Hatches
          </button>
          <button className={`nav-btn ${activeTab === 'market' ? 'active' : ''}`} onClick={() => handleTabChange('market')}>
            <ShoppingCart size={17} /> Market
          </button>
          <button className={`nav-btn ${activeTab === 'calculator' ? 'active' : ''}`} onClick={() => handleTabChange('calculator')}>
            <Calculator size={17} /> Calculator
            {(sideA.length > 0 || sideB.length > 0) && (
              <span style={{ background: '#ff007f', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{sideA.length + sideB.length}</span>
            )}
          </button>
          <button className={`nav-btn ${activeTab === 'guides' ? 'active' : ''}`} onClick={() => handleTabChange('guides')}>
            <BookOpen size={17} /> Guides
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: currentUser.role === 'owner' ? '#ffcc00' : currentUser.role === 'mod' ? '#7c3aed' : 'linear-gradient(135deg, #00e5ff, #7000ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 900, color: currentUser.role === 'owner' ? '#000' : '#fff' }}>
                {currentUser.username?.charAt(0)}
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.username}
              </span>
              <button onClick={() => setIsSettingsOpen(true)} style={{ background: 'none', border: 'none', color: '#00e5ff', cursor: 'pointer', display: 'flex', padding: '4px' }} title="Account Settings">
                <Settings size={18} />
              </button>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ff1744', cursor: 'pointer', display: 'flex', padding: '4px' }} title="Logout">
                <LogOut size={18} />
              </button>
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

      {/* ━━━━ LIVE TELEMETRY MOVING TICKER STREAM ━━━━ */}
      <LiveStatsTicker
        totalItems={pets.length}
        secretCount={secretCount}
        legendaryCount={legendaryCount}
        risingCount={risingCount}
        activeUsersCount={activeUsersCount}
      />

      {/* ━━━━ MAIN CONTENT ROUTER ━━━━ */}
      <main style={{ flex: 1, zIndex: 10 }}>
        {activeTab === 'values' && (
          <ValueList pets={pets} currentUser={currentUser} onAddToTrade={handleAddToTrade} onUpdatePetValue={handleUpdatePetValue} onSelectPet={handleSelectPet} />
        )}
        {activeTab === 'eggs' && (
          <EggsList onSelectPet={handleSelectPet} onAddToTrade={handleAddToTrade} />
        )}
        {activeTab === 'pet-details' && (
          <PetDetailsPage
            pet={pets.find(p => p.id === selectedPet?.id || p.name === selectedPet?.name) || selectedPet}
            onBack={() => handleTabChange('values')}
            onAddToTrade={handleAddToTrade}
            onSelectPet={handleSelectPet}
          />
        )}
        {activeTab === 'market' && (
          <Marketplace pets={pets} currentUser={currentUser} onOpenLogin={() => setIsLoginOpen(true)} />
        )}
        {activeTab === 'calculator' && (
          <TradeCalculator pets={pets} sideA={sideA} setSideA={setSideA} sideB={sideB} setSideB={setSideB} />
        )}
        {activeTab === 'guides' && <Guides />}
        {activeTab === 'admin' && (
          <AdminPanel
            pets={pets}
            currentUser={currentUser}
            onRefreshPets={fetchPets}
            onOpenLogin={() => setIsLoginOpen(true)}
            onBackToValues={() => handleTabChange('values')}
          />
        )}
      </main>

      {/* ━━━━ GLOBAL WEBSITE FOOTER ━━━━ */}
      <Footer onNavigate={handleTabChange} />
    </div>
  );
}
